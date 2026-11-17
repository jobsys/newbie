import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import NewbieSearch from "../../components/search/NewbieSearch.jsx";

const columns = [{ key: "name", title: "姓名", type: "input" }];

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "已发送", value: "sent", count: 96 },
	{ label: "草稿", value: "draft", count: 18 },
];

const mountSearch = (props = {}) =>
	mount(NewbieSearch, {
		props: {
			filterableColumns: columns,
			...props,
		},
	});

const clickStatus = async (wrapper, label) => {
	const item = wrapper
		.findAll(".ant-segmented-item")
		.find(candidate => candidate.text().includes(label));
	expect(item).toBeTruthy();
	await item.find("input").setValue();
	await nextTick();
};

beforeEach(() => {
	window.localStorage.clear();
});

describe("NewbieSearch 状态分段筛选", () => {
	it("statusFilter 渲染分段、计数，并只在非全部时输出查询", async () => {
		const wrapper = mountSearch({
			statusFilter: {
				key: "status",
				span: 2,
				options: statusOptions,
				// counts 优先于 option.count
				counts: { sent: 98 },
			},
		});
		await nextTick();

		const status = wrapper.find(".newbie-search-status");
		expect(status.exists()).toBe(true);
		expect(status.element.style.gridColumn).toBe("span 2");
		expect(status.text()).toContain("全部");
		expect(status.text()).toContain("98");

		// 状态栏不进入普通搜索项网格，也不产生条件标签
		expect(wrapper.findAll(".newbie-search-item").length).toBe(1);
		expect(wrapper.find(".newbie-search-label").exists()).toBe(false);

		const vm = wrapper.findComponent(NewbieSearch).vm;
		expect(vm.getSearch().newbieQuery.status).toBeUndefined();

		await clickStatus(wrapper, "已发送");

		expect(vm.getSearch().newbieQuery.status).toEqual({
			condition: "equal",
			type: "select",
			value: "sent",
		});

		// 点击状态立即搜索
		expect(wrapper.emitted("search").at(-1)[0].newbieQuery.status.value).toBe("sent");
		wrapper.unmount();
	});

	it("isOnlyForQuery 列通过 filterable.type: 'segmented' 提供状态栏", async () => {
		const wrapper = mountSearch({
			filterableColumns: [
				{ key: "name", title: "姓名", type: "input" },
				{
					key: "status",
					title: "状态",
					type: "segmented",
					span: 1,
					options: [
						{ label: "全部", value: "" },
						{ label: "已支付", value: "paid" },
					],
				},
			],
		});
		await nextTick();

		expect(wrapper.find(".newbie-search-status").exists()).toBe(true);
		expect(wrapper.find(".newbie-search-status").element.style.gridColumn).toBe("span 1");

		// segmented 列不再渲染成普通搜索项
		expect(wrapper.findAll(".newbie-search-item").length).toBe(1);

		const vm = wrapper.findComponent(NewbieSearch).vm;
		await clickStatus(wrapper, "已支付");
		expect(vm.getSearch().newbieQuery.status.value).toBe("paid");

		wrapper.unmount();
	});

	it("countRequest 只在挂载和状态之外的查询变化时请求", async () => {
		const countRequest = vi.fn(async () => ({
			total: 128,
			counts: { sent: 96, draft: 18 },
		}));

		const wrapper = mountSearch({
			statusFilter: {
				key: "status",
				options: statusOptions,
				countRequest,
			},
		});
		await nextTick();
		await flushPromises();

		expect(countRequest).toHaveBeenCalledTimes(1);
		expect(countRequest.mock.calls[0][0].query).toEqual({});
		expect(countRequest.mock.calls[0][0].statusKey).toBe("status");
		expect(wrapper.find(".newbie-search-status").text()).toContain("128");
		expect(wrapper.find(".newbie-search-status").text()).toContain("96");

		// 状态本身不参与计数：切换状态只有搜索，不重复计数请求
		await clickStatus(wrapper, "已发送");
		await flushPromises();
		expect(countRequest).toHaveBeenCalledTimes(1);

		// 其他条件变化并搜索后，用排除 status 的 query 重新请求
		const vm = wrapper.findComponent(NewbieSearch).vm;
		vm.setQueryForm({ name: "abc" });
		await nextTick();
		await wrapper.find(".newbie-search-operation .ant-btn-primary").trigger("click");
		await flushPromises();

		expect(countRequest).toHaveBeenCalledTimes(2);
		expect(countRequest.mock.calls[1][0].query.name).toEqual({
			condition: "equal",
			type: "input",
			value: "abc",
		});
		expect(countRequest.mock.calls[1][0].query.status).toBeUndefined();

		wrapper.unmount();
	});

	it("countRequest 支持数组结构，失败时保留上一次计数", async () => {
		const countRequest = vi
			.fn()
			.mockResolvedValueOnce([
				{ value: "", count: 12 },
				{ value: "sent", count: 3 },
			])
			.mockRejectedValueOnce(new Error("network"));

		const onCountError = vi.fn();

		const wrapper = mountSearch({
			statusFilter: {
				key: "status",
				options: statusOptions,
				countRequest,
				onCountError,
			},
		});
		await nextTick();
		await flushPromises();

		const status = wrapper.find(".newbie-search-status");
		expect(status.text()).toContain("12");
		expect(status.text()).toContain("3");

		await wrapper.findComponent(NewbieSearch).vm.refreshStatusCounts();
		await flushPromises();

		expect(onCountError).toHaveBeenCalledTimes(1);
		expect(wrapper.find(".newbie-search-status").text()).toContain("12");

		wrapper.unmount();
	});

	it("immediate: false 时只改值，等用户点击搜索", async () => {
		const wrapper = mountSearch({
			statusFilter: {
				key: "status",
				options: statusOptions,
				immediate: false,
			},
		});
		await nextTick();

		await clickStatus(wrapper, "草稿");
		expect(wrapper.emitted("search")).toBeFalsy();

		await wrapper.find(".newbie-search-operation .ant-btn-primary").trigger("click");
		await nextTick();

		expect(wrapper.emitted("search").at(-1)[0].newbieQuery.status.value).toBe("draft");
		wrapper.unmount();
	});

	it("状态栏与操作区占满首行时，折叠显示下一整行搜索项", async () => {
		const wrapper = mountSearch({
			statusFilter: {
				key: "status",
				span: 2,
				options: statusOptions,
			},
			filterableColumns: Array.from({ length: 5 }, (_, index) => ({
				key: `field-${index}`,
				title: `字段${index}`,
				type: "input",
			})),
		});
		await nextTick();
		await nextTick();

		// jsdom 无容器宽度，默认 4 列；span 2 + 操作区 2 占满首行
		expect(wrapper.find(".newbie-search-status").element.style.gridColumn).toBe("span 2");
		expect(wrapper.findAll(".newbie-search-item:not(.hidden)").length).toBe(4);
		expect(wrapper.findAll(".newbie-search-item.hidden").length).toBe(1);
		expect(wrapper.find(".newbie-search-toggle").exists()).toBe(true);

		wrapper.unmount();
	});

	it("清空后回到默认的全部状态", async () => {
		const wrapper = mountSearch({
			statusFilter: {
				key: "status",
				options: statusOptions,
			},
		});
		await nextTick();

		await clickStatus(wrapper, "已发送");
		expect(wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.status).toBeTruthy();

		const clearButton = wrapper
			.findAll(".newbie-search-operation button")
			.find(button => button.find(".anticon-clear").exists());
		await clearButton.trigger("click");
		await nextTick();

		expect(
			wrapper.findComponent(NewbieSearch).vm.getSearch().newbieQuery.status
		).toBeUndefined();
		expect(wrapper.find(".ant-segmented-item-selected").text()).toContain("全部");

		wrapper.unmount();
	});

	it("状态值参与持久化并在重新挂载后恢复", async () => {
		const props = {
			persistence: { key: `status-${Date.now()}` },
			statusFilter: {
				key: "status",
				options: statusOptions,
			},
		};

		const first = mountSearch(props);
		await nextTick();
		await clickStatus(first, "已发送");
		expect(first.emitted("search").at(-1)[0].newbieQuery.status.value).toBe("sent");
		first.unmount();

		const second = mountSearch(props);
		await nextTick();

		expect(second.find(".ant-segmented-item-selected").text()).toContain("已发送");
		expect(second.findComponent(NewbieSearch).vm.getSearch().newbieQuery.status).toEqual({
			condition: "equal",
			type: "select",
			value: "sent",
		});
		second.unmount();
	});
});
