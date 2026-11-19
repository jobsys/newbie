import { describe, expect, it, vi, afterEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import NewbieTable from "../../components/table/NewbieTable.jsx";
import {
	renderTableActions,
	renderTableFile,
	renderTableImage,
	useTableActions,
	useTableFile,
	useTableImage,
} from "../../components/table/helpers.jsx";

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

const mountTable = (props = {}) => mount(NewbieTable, { props: { filterable: false, ...props } });

afterEach(() => {
	getMock.mockReset();
	postMock.mockReset();
});

describe("components/table/helpers.jsx 导出契约", () => {
	it("导出 render* 新名字，并保留 use* 别名", () => {
		expect(typeof renderTableActions).toBe("function");
		expect(typeof renderTableImage).toBe("function");
		expect(typeof renderTableFile).toBe("function");
		expect(useTableActions).toBe(renderTableActions);
		expect(useTableImage).toBe(renderTableImage);
		expect(useTableFile).toBe(renderTableFile);
	});
});

describe("NewbieTable 回归（F-013 afterFetched）", () => {
	it("未提供 afterFetched 时给出明确 console.error，而不是抛 TypeError", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		getMock.mockResolvedValue({ status: "SUCCESS", result: { data: [] } });

		const wrapper = mountTable({ url: "/api/users" });
		await nextTick();
		await flushPromises();

		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("[NewbieTable]"));
		expect(wrapper.vm.getData()).toEqual([]);
		errorSpy.mockRestore();
	});

	it("提供 afterFetched 时正常解析数据", async () => {
		getMock.mockResolvedValue({ status: "SUCCESS", result: { data: [{ id: 1 }], total: 1 } });

		const wrapper = mountTable({
			url: "/api/users",
			afterFetched: res => ({ items: res.result.data, totalSize: res.result.total }),
		});
		await nextTick();
		await flushPromises();

		expect(wrapper.vm.getData()).toEqual([{ id: 1 }]);
	});
});

describe("NewbieTable 回归（F-014 rowKey 为函数）", () => {
	it("按 rowKey 返回值区分行，只有目标行进入编辑态", async () => {
		const wrapper = mountTable({
			editable: true,
			rowKey: record => record.uid,
			columns: [{ title: "名称", dataIndex: "name", key: "name", editable: true }],
			dataSource: [
				{ uid: 1, name: "甲" },
				{ uid: 2, name: "乙" },
			],
		});
		await nextTick();

		const editIcons = wrapper.findAll(".edit-icon");
		expect(editIcons.length).toBe(2);

		await editIcons[1].trigger("click");
		await nextTick();

		const inputs = wrapper.findAll("input.ant-input");
		expect(inputs.length).toBe(1);
		expect(inputs[0].element.value).toBe("乙");
	});
});

describe("NewbieTable 回归（F-021 列配置只读）", () => {
	it("不改写调用方传入的 columns（无 key / RC_TABLE_INTERNAL_COL_DEFINE / width）", async () => {
		const columns = [{ title: "名称", dataIndex: "name", minWidth: 120 }];
		mountTable({ columns });
		await nextTick();

		expect(columns[0]).not.toHaveProperty("key");
		expect(columns[0]).not.toHaveProperty("RC_TABLE_INTERNAL_COL_DEFINE");
		expect(columns[0].width).toBeUndefined();
	});
});

describe("NewbieTable 回归（F-015 请求竞态）", () => {
	it("旧请求晚回来时不会覆盖最新请求的数据", async () => {		const resolvers = [];
		getMock.mockImplementation(() => new Promise(resolve => resolvers.push(resolve)));

		const wrapper = mountTable({
			url: "/api/users",
			afterFetched: res => res.result,
		});
		await nextTick();
		await nextTick();
		expect(resolvers.length).toBe(1);

		const secondFetch = wrapper.vm.doFetch();
		await nextTick();
		expect(resolvers.length).toBe(2);

		// 第二次请求还在途中时，第一次请求先回来：属于过期响应，必须丢弃
		resolvers[0]({ status: "SUCCESS", result: { items: [{ id: 1 }], totalSize: 1 } });
		await flushPromises();
		expect(wrapper.vm.getData()).toEqual([]);
		expect(wrapper.vm.getPagination().totalSize).toBe(0);

		// 最新请求返回后才更新数据
		resolvers[1]({ status: "SUCCESS", result: { items: [{ id: 2 }], totalSize: 2 } });
		await flushPromises();
		await secondFetch;

		expect(wrapper.vm.getData()).toEqual([{ id: 2 }]);
		expect(wrapper.vm.getPagination().totalSize).toBe(2);
	});

	it("afterFetched 返回值非法时输出明确错误，不抛 TypeError", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		getMock.mockResolvedValue({ status: "SUCCESS", result: { data: [] } });

		const wrapper = mountTable({
			url: "/api/users",
			afterFetched: () => undefined,
		});
		await nextTick();
		await flushPromises();

		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("afterFetched"));
		expect(wrapper.vm.getData()).toEqual([]);
		errorSpy.mockRestore();
	});
});

describe("NewbieTable 状态分段列", () => {
	it("isOnlyForQuery 列配置 type: 'segmented' 时渲染状态栏并透传计数接口", async () => {
		const countRequest = vi.fn(async () => ({ total: 5, counts: { paid: 2 } }));

		const wrapper = mountTable({
			filterable: true,
			columns: [
				{ title: "名称", dataIndex: "name", filterable: { type: "input" } },
				{ title: "状态", dataIndex: "status", width: 120 },
				{
					title: "状态",
					key: "status",
					isOnlyForQuery: true,
					filterable: {
						type: "segmented",
						span: 2,
						options: [
							{ label: "全部", value: "" },
							{ label: "已支付", value: "paid" },
						],
						countRequest,
					},
				},
			],
			dataSource: [],
		});
		await nextTick();
		await nextTick();
		await flushPromises();

		const status = wrapper.find(".newbie-search-status");
		expect(status.exists()).toBe(true);
		expect(status.text()).toContain("5");
		expect(status.text()).toContain("2");

		// segmented 列不再作为普通搜索项出现
		expect(wrapper.findAll(".newbie-search-item").length).toBe(1);
		expect(countRequest).toHaveBeenCalledTimes(1);

		await wrapper.vm.refreshStatusCounts();
		await flushPromises();
		expect(countRequest).toHaveBeenCalledTimes(2);

		wrapper.unmount();
	});
});

describe("NewbieTable 列宽拖拽", () => {
	it("默认给叶子列开启 resizable，支持按 resizable: false 关闭，且分组表头不开启", async () => {
		const wrapper = mountTable({
			columns: [
				{ title: "名称", dataIndex: "name", width: 120 },
				{
					title: "详情",
					children: [
						{ title: "年龄", dataIndex: "age", width: 80 },
						{ title: "操作", key: "actions", width: 100, resizable: false },
					],
				},
			],
			dataSource: [{ id: 1, name: "甲", age: 18 }],
		});
		await nextTick();
		await nextTick();

		const headers = wrapper.findAll("th.ant-table-cell");
		const findHeader = title => headers.find(h => h.text().includes(title));

		expect(findHeader("名称").find(".ant-table-resize-handle").exists()).toBe(true);
		expect(findHeader("年龄").find(".ant-table-resize-handle").exists()).toBe(true);
		expect(findHeader("详情").find(".ant-table-resize-handle").exists()).toBe(false);
		expect(findHeader("操作").find(".ant-table-resize-handle").exists()).toBe(false);

		wrapper.unmount();
	});

	it("拖动列宽手柄会更新列宽并触发 tableProps.onResizeColumn", async () => {
		const onResizeColumn = vi.fn();
		const wrapper = mountTable({
			columns: [
				{ title: "名称", dataIndex: "name", width: 120 },
				{ title: "状态", dataIndex: "status", width: 100 },
			],
			dataSource: [{ id: 1, name: "甲", status: "正常" }],
			tableProps: { onResizeColumn },
		});
		await nextTick();
		await nextTick();

		const nameHeader = wrapper.findAll("th.ant-table-cell").find(h => h.text().includes("名称"));
		const handle = nameHeader.find(".ant-table-resize-handle");
		expect(handle.exists()).toBe(true);

		// jsdom 中 getBoundingClientRect 默认全 0，给表头模拟初始宽度 120px
		vi.spyOn(nameHeader.element, "getBoundingClientRect").mockReturnValue({
			width: 120,
			height: 40,
			top: 0,
			left: 0,
			right: 120,
			bottom: 40,
			x: 0,
			y: 0,
			toJSON: () => {},
		});

		await handle.trigger("mousedown", { button: 0, clientX: 120 });
		document.dispatchEvent(new MouseEvent("mousemove", { clientX: 180, bubbles: true }));
		document.dispatchEvent(new MouseEvent("mouseup", { clientX: 180, bubbles: true }));
		await nextTick();

		expect(onResizeColumn).toHaveBeenCalledTimes(1);
		expect(onResizeColumn.mock.calls[0][0]).toBe(180);

		wrapper.unmount();
	});
});
