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
	it("旧请求晚回来时不会覆盖最新请求的数据", async () => {
		const resolvers = [];
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
