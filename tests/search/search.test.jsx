import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import NewbieSearch from "../../components/search/NewbieSearch.jsx";

const columns = [
	{ key: "name", title: "姓名", type: "input" },
	{
		key: "status",
		title: "状态",
		type: "select",
		defaultValue: ["pass"],
		options: [
			{ value: "pass", label: "通过" },
			{ value: "deny", label: "未通过" },
		],
	},
];

const mountSearch = (props = {}) =>
	mount(NewbieSearch, {
		props: {
			filterableColumns: columns,
			...props,
		},
	});

describe("NewbieSearch 回归", () => {
	it("expandable + 函数式 options 可正常挂载（F-002）", async () => {
		const wrapper = mountSearch({
			filterableColumns: [
				{
					key: "tag",
					title: "标签",
					expandable: true,
					options: () => [{ value: 1, label: "一" }],
				},
			],
		});
		await nextTick();

		expect(wrapper.find(".newbie-search-expand").exists()).toBe(true);
		expect(wrapper.text()).toContain("一");

		wrapper.unmount();
	});

	it("getSearch 与 search 事件结构一致（F-023）", async () => {
		const wrapper = mountSearch();
		await nextTick();

		const vm = wrapper.findComponent(NewbieSearch).vm;
		const before = vm.getSearch();

		expect(Object.keys(before).toSorted()).toEqual(["newbieQuery", "newbieSort"]);
		expect(before.newbieQuery.status).toEqual({
			condition: "equal",
			type: "select",
			value: "pass",
		});

		const operation = wrapper.find(".newbie-search-operation");
		await operation.findAll("button").at(-1).trigger("click");
		await nextTick();

		const events = wrapper.emitted("search");
		expect(events).toBeTruthy();

		const payload = events.at(-1)[0];
		expect(Object.keys(payload).toSorted()).toEqual(["newbieQuery", "newbieSort"]);
		expect(payload).toEqual(before);

		wrapper.unmount();
	});

	it("没有搜索条件时也返回完整结构", async () => {
		const wrapper = mountSearch({ filterableColumns: [] });
		await nextTick();

		const vm = wrapper.findComponent(NewbieSearch).vm;
		expect(vm.getSearch()).toEqual({ newbieQuery: {}, newbieSort: {} });

		wrapper.unmount();
	});

	it("搜索项列表变化后重建条件监听并正常取值（F-050）", async () => {
		const wrapper = mountSearch({
			filterableColumns: [{ key: "name", title: "姓名", type: "input" }],
		});
		await nextTick();

		await wrapper.setProps({
			filterableColumns: [
				{ key: "name", title: "姓名", type: "input" },
				{ key: "code", title: "编号", type: "input" },
			],
		});
		await nextTick();

		expect(wrapper.findAll(".newbie-search-item").length).toBe(2);
		expect(wrapper.findComponent(NewbieSearch).vm.getSearch()).toEqual({
			newbieQuery: {},
			newbieSort: {},
		});

		// 清空同样会重建搜索项与监听
		await wrapper.findAll(".newbie-search-operation button").at(0).trigger("click");
		await nextTick();
		expect(wrapper.findComponent(NewbieSearch).vm.getSearch()).toEqual({
			newbieQuery: {},
			newbieSort: {},
		});

		wrapper.unmount();
	});

	it("条件变化时由 setup 中注册的 watcher 规整值（F-050）", async () => {
		let queryFormRef;

		const wrapper = mountSearch({
			filterableColumns: [
				{
					key: "s",
					title: "S",
					type: "select",
					options: ["a", "b"],
					customRender: ({ queryForm }) => {
						queryFormRef = queryForm;
						return {
							conditions: [
								{ label: "等于", value: "equal" },
								{ label: "包含", value: "include" },
							],
							Component: <span />,
							displayValue: null,
							onComponentOpen: null,
						};
					},
				},
			],
		});
		await nextTick();

		queryFormRef.s.value = ["a", "b"];
		queryFormRef.s.condition = "include";
		await nextTick();

		queryFormRef.s.condition = "equal";
		await nextTick();
		expect(queryFormRef.s.value).toEqual(["a"]);

		wrapper.unmount();
	});

	it("autoQuery 在条件变化后防抖触发搜索（F-016）", async () => {
		const wrapper = mountSearch({
			autoQuery: true,
			filterableColumns: [{ key: "name", title: "姓名", type: "input" }],
		});
		await nextTick();
		await nextTick();

		// 初始化和默认值不应触发自动搜索
		expect(wrapper.emitted("search")).toBeFalsy();

		await wrapper.find(".newbie-search-mask").trigger("click");
		await nextTick();

		const input = wrapper.find(".newbie-search-input-container input");
		expect(input.exists()).toBe(true);
		await input.setValue("abc");

		await new Promise(resolve => setTimeout(resolve, 400));
		await nextTick();

		const events = wrapper.emitted("search");
		expect(events).toBeTruthy();
		expect(events.at(-1)[0].newbieQuery.name.value).toBe("abc");

		wrapper.unmount();
	});
});
