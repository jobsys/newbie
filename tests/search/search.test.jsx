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

	it("输入框的值会同步到查询条件", async () => {
		const wrapper = mountSearch({
			filterableColumns: [{ key: "name", title: "姓名", type: "input" }],
		});
		await nextTick();

		await wrapper.find(".newbie-search-mask").trigger("click");
		await nextTick();

		await wrapper.find(".newbie-search-popup-panel input").setValue("张三");
		await nextTick();

		expect(wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.name).toEqual({
			condition: "equal",
			type: "input",
			value: "张三",
		});

		wrapper.unmount();
	});

	it.each(["null", "notNull"])("条件为 %s 时不展示 mask 里的残留值", async condition => {
		const wrapper = mountSearch({
			filterableColumns: [
				{
					key: "name",
					title: "姓名",
					type: "input",
					defaultValue: "张三",
					defaultCondition: condition,
				},
			],
		});
		await nextTick();

		expect(wrapper.find(".newbie-search-mask-value").text()).toBe("");
		expect(wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.name).toEqual({
			condition,
			type: "input",
			value: null,
		});

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
		expect(toggle.find(".newbie-search-toggle-icon").exists()).toBe(true);
		expect(toggle.find(".newbie-search-toggle-count").text()).toBe("3");
		expect(toggle.attributes("aria-expanded")).toBe("false");
		const collapsedText = toggle.text();
		expect(collapsedText).not.toBe("");

		await toggle.trigger("click");
		await nextTick();

		const expandedToggle = wrapper.find(".newbie-search-toggle");
		expect(expandedToggle.classes()).toContain("is-expanded");
		expect(expandedToggle.find(".newbie-search-toggle-count").exists()).toBe(false);
		expect(expandedToggle.attributes("aria-expanded")).toBe("true");
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

const findOption = (wrapper, label) =>
	wrapper.findAll(".newbie-search-expand-option").find(tag => tag.text() === label);

describe("NewbieSearch 展开式搜索项", () => {
	it("单选：点击选项立即写入 queryForm 并显示选中态，再次点击取消", async () => {
		const wrapper = mountSearch({
			filterableColumns: [
				{
					key: "role",
					title: "用户角色",
					expandable: true,
					options: [
						{ value: "admin", label: "超级管理员" },
						{ value: "counselor", label: "辅导员" },
					],
				},
			],
		});
		await nextTick();

		const admin = findOption(wrapper, "超级管理员");
		expect(admin.classes()).not.toContain("ant-tag-checkable-checked");
		await admin.trigger("click");
		await nextTick();

		expect(admin.classes()).toContain("ant-tag-checkable-checked");
		expect(wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.role).toEqual({
			condition: "equal",
			type: "select",
			value: "admin",
		});

		// 单选语义：点另一个选项时旧值被替换
		await findOption(wrapper, "辅导员").trigger("click");
		await nextTick();

		expect(wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.role.value).toBe(
			"counselor"
		);
		expect(findOption(wrapper, "超级管理员").classes()).not.toContain(
			"ant-tag-checkable-checked"
		);

		// 点击当前选项取消选中
		await findOption(wrapper, "辅导员").trigger("click");
		await nextTick();

		expect(wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.role).toBeUndefined();

		wrapper.unmount();
	});

	it("多选：include 条件、可取消单项，行内清除只清空当前项", async () => {
		const wrapper = mountSearch({
			filterableColumns: [
				{ key: "name", title: "姓名", type: "input" },
				{
					key: "tags",
					title: "标签",
					expandable: "multiple",
					options: ["重点", "跟进", "已归档"],
				},
			],
		});
		await nextTick();

		await findOption(wrapper, "重点").trigger("click");
		await findOption(wrapper, "跟进").trigger("click");
		await nextTick();

		const vm = wrapper.findComponent(NewbieSearch).vm;
		expect(vm.getSearch().newbieQuery.tags).toEqual({
			condition: "include",
			type: "select",
			value: ["重点", "跟进"],
		});
		expect(wrapper.find(".newbie-search-expand-item-selected-count").text()).toBe("已选 2 项");

		// 取消其中一个选项
		await findOption(wrapper, "重点").trigger("click");
		await nextTick();
		expect(vm.getSearch().newbieQuery.tags.value).toEqual(["跟进"]);

		// 行内清除只影响当前项，其他搜索项不受波及
		await wrapper.find(".newbie-search-expand-item-clear").trigger("click");
		await nextTick();
		expect(vm.getSearch().newbieQuery.tags).toBeUndefined();
		expect(vm.getSearch().newbieQuery.name).toBeUndefined();

		wrapper.unmount();
	});

	it("选项超过阈值时折叠展示，已选中的隐藏选项保持可见，可展开收起", async () => {
		const options = Array.from({ length: 26 }, (_, index) => ({
			value: index,
			label: `角色${index}`,
		}));
		const wrapper = mountSearch({
			filterableColumns: [
				{
					key: "role",
					title: "用户角色",
					expandable: "multiple",
					defaultValue: [25],
					options,
				},
			],
		});
		await nextTick();

		// 默认折叠：16 个选项 + 默认选中的末位选项补在末尾
		expect(wrapper.findAll(".newbie-search-expand-option").length).toBe(17);
		const hiddenSelected = findOption(wrapper, "角色25");
		expect(hiddenSelected.classes()).toContain("ant-tag-checkable-checked");
		const toggle = wrapper.find(".newbie-search-expand-toggle");
		expect(toggle.text()).toContain("26");
		expect(toggle.attributes("aria-expanded")).toBe("false");

		// 展开显示全部
		await toggle.trigger("click");
		await nextTick();
		expect(wrapper.findAll(".newbie-search-expand-option").length).toBe(26);
		expect(wrapper.find(".newbie-search-expand-toggle").attributes("aria-expanded")).toBe(
			"true"
		);

		// 收起后回到折叠视图，选中项仍然可见
		await wrapper.find(".newbie-search-expand-toggle").trigger("click");
		await nextTick();
		expect(wrapper.findAll(".newbie-search-expand-option").length).toBe(17);
		expect(findOption(wrapper, "角色25").classes()).toContain("ant-tag-checkable-checked");

		wrapper.unmount();
	});
});
