import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import NewbieTable from "../../components/table/NewbieTable.jsx";
import { useSm3 } from "../../hooks/cipher.js";

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

const columns = [
	{ title: "姓名", dataIndex: "name", key: "name" },
	{ title: "邮箱", dataIndex: "email", key: "email" },
];

const dataSource = [
	{ id: 1, name: "张三", email: "a@example.com" },
	{ id: 2, name: "李四", email: "b@example.com" },
];

const mountTable = (props = {}) =>
	mount(NewbieTable, {
		props: {
			filterable: false,
			columns,
			dataSource,
			...props,
		},
	});

const seedSnapshot = (key, snapshot) => {
	const namespace = `table_${useSm3(location.pathname + "_" + key)}`;
	window.localStorage.setItem(
		`nbp_v2_${namespace}_state`,
		JSON.stringify(snapshot)
	);
};

beforeEach(() => {
	window.localStorage.clear();
});

afterEach(() => {
	getMock.mockReset();
	postMock.mockReset();
});

describe("NewbieTable 持久化", () => {
	it("内存模式恢复页码与每页条数", async () => {
		const props = { persistence: { key: `page-${Date.now()}` } };

		const first = mountTable(props);
		await nextTick();
		first.vm.setPagination(100, 3, 20);
		await first.vm.doFetch();
		expect(first.vm.getPagination().currentPage).toBe(3);
		first.unmount();

		const second = mountTable(props);
		await nextTick();

		expect(second.vm.getPagination()).toMatchObject({ currentPage: 3, pageSize: 20 });
		second.unmount();
	});

	it("冷存储的列显隐在挂载时恢复", async () => {
		const key = `columns-${Date.now()}`;
		seedSnapshot(key, {
			version: 1,
			pagination: { currentPage: 2, pageSize: 10 },
			columnKey: { name: false, email: true },
		});

		const wrapper = mountTable({ persistence: { key, storage: "local" } });
		await nextTick();
		await nextTick();

		const header = wrapper.find(".ant-table-thead").text();
		expect(header).toContain("邮箱");
		expect(header).not.toContain("姓名");
		wrapper.unmount();
	});

	it("恢复的页码超出实际页数时回落到最后一页", async () => {
		const props = { persistence: { key: `clamp-${Date.now()}` } };

		// 先把"第 3 页"写进内存快照
		const first = mountTable(props);
		await nextTick();
		first.vm.setPagination(100, 3, 20);
		await first.vm.doFetch();
		first.unmount();

		// 数据变少后重新挂载：total=5，20 条/页 -> 只有 1 页
		getMock.mockResolvedValue({
			status: "SUCCESS",
			result: { items: [{ id: 1 }], total: 5 },
		});

		const second = mountTable({
			...props,
			url: "/api/users",
			pagination: { pageSize: 20 },
			afterFetched: res => ({
				items: res.result.items,
				totalSize: res.result.total,
			}),
		});

		await nextTick();
		await flushPromises();
		await nextTick();

		expect(second.vm.getPagination().currentPage).toBe(1);
		expect(getMock.mock.calls.length).toBeGreaterThanOrEqual(2);
		second.unmount();
	});
});
