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

	it("搜索项与操作区放在同一个自适应网格中", async () => {
		const wrapper = mountSearch();
		await nextTick();

		const grid = wrapper.find(".newbie-search-form-wrapper");
		expect(grid.exists()).toBe(true);
		expect(grid.element.style.gridTemplateColumns).toContain("repeat(4");

		const operation = wrapper.find(".newbie-search-operation");
		expect(operation.exists()).toBe(true);
		expect(operation.element.parentElement).toBe(grid.element);
		expect(grid.element.querySelectorAll(".newbie-search-item").length).toBe(2);

		wrapper.unmount();
	});

	it("搜索条件标签使用主题色而不是固定蓝色", async () => {
		const wrapper = mountSearch();
		await nextTick();

		await wrapper.find(".newbie-search-operation .ant-btn-primary").trigger("click");
		await nextTick();

		const tag = wrapper.find(".newbie-search-label-tag");
		expect(tag.exists()).toBe(true);
		expect(tag.classes()).not.toContain("ant-tag-blue");

		wrapper.unmount();
	});

	it("更多/收起按钮使用统一的文字 + 图标并切换", async () => {
		const wrapper = mountSearch({
			filterableColumns: Array.from({ length: 5 }, (_, index) => ({
				key: `field-${index}`,
				title: `字段${index}`,
				type: "input",
			})),
		});
		await nextTick();
		await nextTick();

		const toggle = wrapper.find(".newbie-search-toggle");
		expect(toggle.exists()).toBe(true);
		expect(toggle.find(".anticon-down").exists()).toBe(true);
		const collapsedText = toggle.text();
		expect(collapsedText).not.toBe("");

		await toggle.trigger("click");
		await nextTick();

		const expandedToggle = wrapper.find(".newbie-search-toggle");
		expect(expandedToggle.find(".anticon-up").exists()).toBe(true);
		expect(expandedToggle.text()).not.toBe(collapsedText);

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
