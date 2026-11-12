import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";
import NewbieList from "../../components/list/NewbieList.jsx";

const ok = data => ({
	status: "SUCCESS",
	result: { data, last_page: 1, total: data.length },
});

describe("NewbieList", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("未挂载时不发请求", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(ok([]));
		const show = ref(false);
		const Host = defineComponent({
			setup: () => () =>
				show.value ? <NewbieList url="/api/list" /> : <div class="placeholder" />,
		});

		mount(Host);
		await flushPromises();

		expect(get).not.toHaveBeenCalled();
	});

	it("autoLoad 为 false 时挂载后不自动请求，手动调用 loadMore 才请求", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(ok([{ id: 1 }]));
		const wrapper = mount(NewbieList, { props: { url: "/api/list", autoLoad: false } });

		await flushPromises();
		expect(get).not.toHaveBeenCalled();

		await wrapper.vm.loadMore();
		expect(get).toHaveBeenCalledTimes(1);
		expect(wrapper.vm.pagination.items).toEqual([{ id: 1 }]);
	});

	it("挂载后自动加载第一页，url 变化时清空数据并重新加载", async () => {
		let resolveSecond;
		const secondResponse = new Promise(resolve => {
			resolveSecond = resolve;
		});
		const get = vi
			.spyOn(axios, "get")
			.mockResolvedValueOnce(ok([{ id: 1 }, { id: 2 }]))
			.mockReturnValueOnce(secondResponse);

		const wrapper = mount(NewbieList, { props: { url: "/api/a" } });

		expect(get).toHaveBeenCalledTimes(1);
		expect(get.mock.calls[0][0]).toBe("/api/a");

		await flushPromises();
		expect(wrapper.vm.pagination.items).toHaveLength(2);

		await wrapper.setProps({ url: "/api/b" });

		expect(get).toHaveBeenCalledTimes(2);
		expect(get.mock.calls[1][0]).toBe("/api/b");
		// 重置时先清空已有数据，再等待新请求返回
		expect(wrapper.vm.pagination.items).toEqual([]);
		expect(wrapper.vm.pagination.uri).toBe("/api/b");

		resolveSecond(ok([{ id: 3 }]));
		await flushPromises();

		expect(wrapper.vm.pagination.items).toEqual([{ id: 3 }]);
	});
});
