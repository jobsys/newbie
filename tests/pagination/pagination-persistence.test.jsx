import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";

import NewbiePagination from "../../components/pagination/NewbiePagination.jsx";
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

const mountPagination = (props = {}) =>
	mount(NewbiePagination, {
		props: { filterable: false, ...props },
		slots: { item: ({ item }) => <div class="demo-item">{item.name}</div> },
	});

const seedSnapshot = (key, snapshot) => {
	const namespace = `pagination_${useSm3(location.pathname + "_" + key)}`;
	window.localStorage.setItem(`nbp_v2_${namespace}_state`, JSON.stringify(snapshot));
};

beforeEach(() => {
	window.localStorage.clear();
});

afterEach(() => {
	getMock.mockReset();
	postMock.mockReset();
});

describe("NewbiePagination 持久化", () => {
	it("内存模式恢复页码与每页条数", async () => {
		const props = { persistence: { key: `page-${Date.now()}` } };

		const first = mountPagination(props);
		await nextTick();
		first.vm.setPagination(100, 3, 20);
		await first.vm.doFetch();
		expect(first.vm.getPagination().currentPage).toBe(3);
		first.unmount();

		const second = mountPagination(props);
		await nextTick();

		expect(second.vm.getPagination()).toMatchObject({ currentPage: 3, pageSize: 20 });
		second.unmount();
	});

	it("冷存储的分页状态在挂载时恢复并按恢复值请求", async () => {
		const key = `columns-${Date.now()}`;
		seedSnapshot(key, { version: 1, pagination: { currentPage: 2, pageSize: 10 } });

		getMock.mockResolvedValue({
			status: "SUCCESS",
			result: { items: [{ id: 1, name: "张三" }], total: 30 },
		});

		const wrapper = mountPagination({
			url: "/api/users",
			persistence: { key, storage: "local" },
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});

		await nextTick();
		await flushPromises();

		expect(getMock.mock.calls[0][1].params).toMatchObject({ page: 2, pageSize: 10 });
		expect(wrapper.vm.getPagination()).toMatchObject({ currentPage: 2, pageSize: 10 });
		wrapper.unmount();
	});

	it("恢复的页码超出实际页数时回落到最后一页", async () => {
		const props = { persistence: { key: `clamp-${Date.now()}` } };

		// 先把“第 3 页”写进内存快照
		const first = mountPagination(props);
		await nextTick();
		first.vm.setPagination(100, 3, 20);
		await first.vm.doFetch();
		first.unmount();

		// 数据变少后重新挂载：total=5，20 条/页 -> 只有 1 页
		getMock.mockResolvedValue({
			status: "SUCCESS",
			result: { items: [{ id: 1, name: "张三" }], total: 5 },
		});

		const second = mountPagination({
			...props,
			url: "/api/users",
			pagination: { pageSize: 20 },
			afterFetched: res => ({ items: res.result.items, totalSize: res.result.total }),
		});

		await nextTick();
		await flushPromises();

		expect(second.vm.getPagination().currentPage).toBe(1);
		expect(getMock.mock.calls.length).toBeGreaterThanOrEqual(2);
		second.unmount();
	});
});
