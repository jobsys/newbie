import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import NewbiePagination from "../../components/pagination/NewbiePagination.jsx";
import NewbieSearch from "../../components/search/NewbieSearch.jsx";

const { getMock, postMock } = vi.hoisted(() => ({
	getMock: vi.fn(),
	postMock: vi.fn(),
}));

vi.mock("axios", () => ({
	default: {
		get: getMock,
		post: postMock,
	},
}));

const dataSource = [
	{ id: 1, name: "张三" },
	{ id: 2, name: "李四" },
	{ id: 3, name: "王五" },
];

const mountPagination = (props = {}, slots = {}) =>
	mount(NewbiePagination, {
		props: { filterable: false, ...props },
		slots: {
			item: ({ item }) => <div class="demo-item">{item.name}</div>,
			...slots,
		},
	});

const okResult = (items, total) => ({
	status: "SUCCESS",
	result: { items, total },
});

afterEach(() => {
	getMock.mockReset();
	postMock.mockReset();
});

describe("NewbiePagination 取数", () => {
	it("未传 url 时默认查询参数为 page/pageSize，渲染 dataSource 并触发 fetch", async () => {
		const wrapper = mountPagination({ dataSource });
		await nextTick();

		expect(wrapper.vm.getQueryData()).toEqual({ page: 1, pageSize: 20 });
		expect(wrapper.findAll(".demo-item")).toHaveLength(3);
		expect(wrapper.emitted().fetch).toBeTruthy();
	});

	it("url + afterFetched 正常解析数据并渲染分页", async () => {
		getMock.mockResolvedValue(okResult([{ id: 1, name: "张三" }], 45));

		const wrapper = mountPagination({
			url: "/api/users",
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});
		await flushPromises();

		expect(getMock).toHaveBeenCalledWith("/api/users", { params: { page: 1, pageSize: 20 } });
		expect(wrapper.vm.getData()).toEqual([{ id: 1, name: "张三" }]);
		expect(wrapper.vm.getPagination().totalSize).toBe(45);
		expect(wrapper.find(".ant-pagination").exists()).toBe(true);
		expect(wrapper.findAll(".demo-item")).toHaveLength(1);
	});

	it("未提供 afterFetched 时给出明确 console.error，而不是抛 TypeError", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		getMock.mockResolvedValue({ status: "SUCCESS", result: { data: [] } });

		const wrapper = mountPagination({ url: "/api/users" });
		await flushPromises();

		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[NewbiePagination]"));
		expect(wrapper.vm.getData()).toEqual([]);
		errorSpy.mockRestore();
	});

	it("afterFetched 返回非数组 items 时同样给出明确报错", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		getMock.mockResolvedValue({ status: "SUCCESS", result: {} });

		const wrapper = mountPagination({
			url: "/api/users",
			afterFetched: () => ({ items: null, totalSize: 0 }),
		});
		await flushPromises();

		expect(errorSpy).toHaveBeenCalledWith(
			expect.stringContaining("afterFetched 必须返回 { items, totalSize }")
		);
		expect(wrapper.vm.getData()).toEqual([]);
		errorSpy.mockRestore();
	});

	it("method 为 post 时分页参数放入请求体", async () => {
		postMock.mockResolvedValue(okResult(dataSource, 3));

		const wrapper = mountPagination({
			url: "/api/users",
			method: "post",
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});
		await flushPromises();

		expect(postMock).toHaveBeenCalledWith("/api/users", { page: 1, pageSize: 20 }, {});
		expect(wrapper.vm.getData()).toEqual(dataSource);
	});

	it("空数据时渲染内置空状态且不显示分页", async () => {
		getMock.mockResolvedValue(okResult([], 0));

		const wrapper = mountPagination({
			url: "/api/users",
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});
		await flushPromises();

		expect(wrapper.find(".ant-empty").exists()).toBe(true);
		expect(wrapper.find(".ant-pagination").exists()).toBe(false);
	});

	it("搜索栏触发 search 后条件并入查询参数", async () => {
		getMock.mockResolvedValue(okResult(dataSource, 3));

		const wrapper = mountPagination(
			{
				url: "/api/users",
				filterable: true,
				filterableColumns: [{ key: "name", title: "姓名", type: "input" }],
				afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
			},
			{}
		);
		await flushPromises();

		wrapper
			.findComponent(NewbieSearch)
			.vm.$emit("search", { newbieQuery: { name: { condition: "equal", value: "张三" } } });
		await flushPromises();

		expect(getMock).toHaveBeenCalledTimes(2);
		expect(getMock.mock.calls[1][1].params.newbieQuery.name.value).toBe("张三");
	});
});

describe("NewbiePagination 选择", () => {
	it("rowSelection 开启后可 toggle 并触发 selectionChange / onChange", () => {
		const onChange = vi.fn();
		const wrapper = mountPagination({ dataSource, rowSelection: { onChange } });

		wrapper.vm.toggleSelection(dataSource[1]);
		expect(wrapper.vm.getSelection()).toEqual([dataSource[1]]);

		const events = wrapper.emitted("selectionChange");
		expect(events.at(-1)[0]).toEqual({
			selectedItems: [dataSource[1]],
			selectedKeys: [2],
		});
		expect(onChange).toHaveBeenCalledWith([dataSource[1]], [2]);

		wrapper.vm.toggleSelection(dataSource[1]);
		expect(wrapper.vm.getSelection()).toEqual([]);
		expect(onChange).toHaveBeenCalledTimes(2);
	});

	it("disabled 项不可选，toggleAllSelection 只作用于可选项且可再切换回全不选", () => {
		const items = [
			{ id: 1, name: "张三" },
			{ id: 2, name: "李四", disabled: true },
			{ id: 3, name: "王五" },
		];
		const wrapper = mountPagination({
			dataSource: items,
			rowSelection: { disabled: ({ item }) => item.disabled },
		});

		wrapper.vm.toggleSelection(items[1]);
		expect(wrapper.vm.getSelection()).toEqual([]);

		wrapper.vm.toggleAllSelection();
		expect(wrapper.vm.getSelection()).toEqual([items[0], items[2]]);

		wrapper.vm.toggleAllSelection();
		expect(wrapper.vm.getSelection()).toEqual([]);
	});

	it("item 作用域暴露 selected / toggleSelect，选中状态驱动重渲染", async () => {
		const wrapper = mountPagination(
			{ dataSource, rowSelection: true },
			{
				item: ({ item, selected, selectionDisabled, toggleSelect }) => (
					<div
						class={{
							"demo-item": true,
							"is-selected": selected,
							"is-disabled": selectionDisabled,
						}}
						onClick={toggleSelect}
					>
						{item.name}
					</div>
				),
			}
		);
		await nextTick();

		const cards = wrapper.findAll(".demo-item");
		expect(cards[1].classes()).not.toContain("is-selected");

		await cards[1].trigger("click");
		expect(wrapper.vm.getSelection()).toEqual([dataSource[1]]);
		expect(wrapper.findAll(".demo-item")[1].classes()).toContain("is-selected");
	});

	it("prepend 作用域携带选中集合与 clearSelection", async () => {
		const wrapper = mountPagination(
			{ dataSource, rowSelection: true },
			{
				prepend: ({ selectedItems, clearSelection }) => (
					<button class="demo-clear" onClick={() => clearSelection()}>
						clear {selectedItems.length}
					</button>
				),
			}
		);

		wrapper.vm.toggleSelection(dataSource[0]);
		await nextTick();

		expect(wrapper.find(".demo-clear").text()).toBe("clear 1");

		await wrapper.find(".demo-clear").trigger("click");
		expect(wrapper.vm.getSelection()).toEqual([]);
	});

	it("functional 作用域携带选中集合与 toggleAllSelection / clearSelection", async () => {
		const wrapper = mountPagination(
			{ dataSource, rowSelection: true },
			{
				functional: ({
					selectedItems,
					selectedKeys,
					clearSelection,
					toggleAllSelection,
				}) => (
					<div class="demo-functional">
						<button class="demo-toggle-all" onClick={() => toggleAllSelection()}>
							all {selectedItems.length}/{selectedKeys.length}
						</button>
						<button class="demo-clear" onClick={() => clearSelection()}>
							clear
						</button>
					</div>
				),
			}
		);

		expect(wrapper.find(".demo-functional").exists()).toBe(true);

		await wrapper.find(".demo-toggle-all").trigger("click");
		expect(wrapper.vm.getSelection()).toHaveLength(3);

		await wrapper.find(".demo-clear").trigger("click");
		expect(wrapper.vm.getSelection()).toEqual([]);
	});

	it("setSelection 整体替换选中项", () => {
		const wrapper = mountPagination({ dataSource, rowSelection: true });

		wrapper.vm.setSelection([dataSource[0], dataSource[2]]);
		expect(wrapper.vm.getSelection()).toEqual([dataSource[0], dataSource[2]]);

		const events = wrapper.emitted("selectionChange");
		expect(events.at(-1)[0].selectedKeys).toEqual([1, 3]);
	});

	it("取数后默认清空选中，preserveSelectedKeys 时保留", async () => {
		getMock.mockResolvedValue(okResult(dataSource, 3));

		const clearing = mountPagination({
			url: "/api/users",
			rowSelection: true,
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});
		await flushPromises();

		clearing.vm.toggleSelection(dataSource[0]);
		expect(clearing.vm.getSelection()).toHaveLength(1);

		await clearing.vm.doFetch();
		expect(clearing.vm.getSelection()).toEqual([]);

		const preserving = mountPagination({
			url: "/api/users",
			rowSelection: { preserveSelectedKeys: true },
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});
		await flushPromises();

		preserving.vm.toggleSelection(dataSource[0]);
		await preserving.vm.doFetch();
		expect(preserving.vm.getSelection()).toEqual([dataSource[0]]);
	});
});

describe("NewbiePagination 客户端分页", () => {
	const items = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `用户${i + 1}` }));

	it("本地数据由组件切片分页，翻页切换展示内容", async () => {
		const wrapper = mountPagination({ dataSource: items, pagination: { pageSize: 3 } });
		await nextTick();

		// 分页条按数据总量渲染；totalSize 保持 0（组件没有接管它）
		expect(wrapper.find(".ant-pagination").exists()).toBe(true);
		expect(wrapper.vm.getPagination().totalSize).toBe(0);

		const names = () => wrapper.findAll(".demo-item").map(node => node.text());
		expect(names()).toEqual(["用户1", "用户2", "用户3"]);

		// 翻到第 2 页：纯前端切片切换
		wrapper.vm.setPagination(undefined, 2);
		await nextTick();
		expect(names()).toEqual(["用户4", "用户5", "用户6"]);

		// 末页不足一页时只渲染剩余项
		wrapper.vm.setPagination(undefined, 3);
		await nextTick();
		expect(names()).toEqual(["用户7", "用户8"]);
	});

	it("本地数据替换后页码越界回落到最后一页，doFetch(true) 回到第一页", async () => {
		const wrapper = mountPagination({ dataSource: items, pagination: { pageSize: 3 } });
		await nextTick();

		// 换成 3 条数据：第 3 页越界，回落到第 1 页
		wrapper.vm.setPagination(undefined, 3);
		wrapper.vm.setData(items.slice(0, 3));
		await nextTick();
		expect(wrapper.vm.getPagination().currentPage).toBe(1);

		wrapper.vm.setPagination(undefined, 2);
		await wrapper.vm.doFetch(true);
		expect(wrapper.vm.getPagination().currentPage).toBe(1);
	});

	it("客户端分页时全选只作用于当前页", async () => {
		const wrapper = mountPagination({
			dataSource: items,
			pagination: { pageSize: 3 },
			rowSelection: true,
		});
		await nextTick();

		wrapper.vm.toggleAllSelection();
		expect(wrapper.vm.getSelection()).toEqual(items.slice(0, 3));
	});

	it("业务通过 setPagination 接管总数后不再做客户端切片", async () => {
		const pageItems = Array.from({ length: 20 }, (_, i) => ({
			id: i + 1,
			name: `用户${i + 1}`,
		}));
		const wrapper = mountPagination({ pagination: { pageSize: 10 } });
		await nextTick();

		// 手动模式：fetch 事件里由业务 setData + setPagination 提供当页数据与总数
		wrapper.vm.setData(pageItems);
		wrapper.vm.setPagination(100, 1, 10);
		await nextTick();

		expect(wrapper.findAll(".demo-item")).toHaveLength(20);
		expect(wrapper.vm.getQueryData()).toEqual({ page: 1, pageSize: 10 });
	});
});
