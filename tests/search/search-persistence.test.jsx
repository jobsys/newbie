import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";

import NewbieSearch from "../../components/search/NewbieSearch.jsx";
import { SEARCH_SNAPSHOT_VERSION } from "../../components/search/persistence.js";
import { useSm3 } from "../../hooks/cipher.js";

const columns = [{ key: "name", title: "姓名", type: "input" }];

const mountSearch = props =>
	mount(NewbieSearch, {
		props: {
			filterableColumns: columns,
			...props,
		},
	});

const runSearch = async (wrapper, text) => {
	await wrapper.find(".newbie-search-mask").trigger("click");
	await nextTick();
	await wrapper.find(".newbie-search-input-container input").setValue(text);
	await wrapper.find(".newbie-search-operation .ant-btn-primary").trigger("click");
	await nextTick();
};

beforeEach(() => {
	window.localStorage.clear();
});

describe("NewbieSearch 持久化", () => {
	it("内存模式重新挂载后恢复上次执行的条件（读写键一致）", async () => {
		const props = { persistence: { key: `memory-${Date.now()}` } };

		const first = mountSearch(props);
		await nextTick();
		await runSearch(first, "张三");
		expect(first.emitted("search").at(-1)[0].newbieQuery.name.value).toBe("张三");
		first.unmount();

		const second = mountSearch(props);
		await nextTick();

		expect(second.find(".newbie-search-mask-value").text()).toContain("张三");
		expect(second.emitted("search").at(-1)[0].newbieQuery.name.value).toBe("张三");
		second.unmount();
	});

	it("冷存储默认不自动套用，通过恢复入口应用", async () => {
		const key = `manual-${Date.now()}`;
		// 模拟"上次会话"：只写 localStorage，内存层保持为空
		const namespace = `search_${useSm3(location.pathname + "_" + key)}`;
		window.localStorage.setItem(
			`nbp_v2_${namespace}_state`,
			JSON.stringify({
				version: SEARCH_SNAPSHOT_VERSION,
				form: { name: { condition: "equal", type: "input", value: "李四" } },
				sort: {},
			})
		);

		const second = mountSearch({
			persistence: { key, storage: "local" },
		});
		await nextTick();

		// 手动恢复：首屏仍是默认值，不会被上次的条件影响
		expect(second.find(".newbie-search-mask-value").text()).not.toContain("李四");

		const restoreTag = second.find(".newbie-search-label .ant-tag-orange");
		expect(restoreTag.exists()).toBe(true);

		await restoreTag.trigger("click");
		await nextTick();

		expect(second.find(".newbie-search-mask-value").text()).toContain("李四");
		expect(second.emitted("search").at(-1)[0].newbieQuery.name.value).toBe("李四");
		second.unmount();
	});

	it("restore: manual 只影响冷数据，内存状态仍自动恢复", async () => {
		const props = {
			persistence: { key: `manual-memory-${Date.now()}`, restore: "manual" },
		};

		const first = mountSearch(props);
		await nextTick();
		await runSearch(first, "赵六");
		first.unmount();

		const second = mountSearch(props);
		await nextTick();

		expect(second.find(".newbie-search-mask-value").text()).toContain("赵六");
		expect(second.find(".ant-tag-orange").exists()).toBe(false);
		second.unmount();
	});

	it("同一会话内已恢复内存状态时不再显示恢复入口", async () => {
		const props = {
			persistence: { key: `session-${Date.now()}`, storage: "local" },
		};

		const first = mountSearch(props);
		await nextTick();
		await runSearch(first, "钱七");
		first.unmount();

		const second = mountSearch(props);
		await nextTick();

		expect(second.find(".newbie-search-mask-value").text()).toContain("钱七");
		expect(second.find(".ant-tag-orange").exists()).toBe(false);
		second.unmount();
	});

	it("空的冷快照不显示恢复入口", async () => {
		const key = `empty-${Date.now()}`;
		const namespace = `search_${useSm3(location.pathname + "_" + key)}`;
		window.localStorage.setItem(
			`nbp_v2_${namespace}_state`,
			JSON.stringify({ version: SEARCH_SNAPSHOT_VERSION, form: {}, sort: {} })
		);

		const wrapper = mountSearch({ persistence: { key, storage: "local" } });
		await nextTick();

		expect(wrapper.find(".newbie-search-mask-value").text()).toBe("");
		expect(wrapper.find(".ant-tag-orange").exists()).toBe(false);
		wrapper.unmount();
	});

	it("清除按钮会同时清掉两层存储", async () => {
		const props = {
			persistence: { key: `clear-${Date.now()}`, storage: "local" },
		};

		const first = mountSearch(props);
		await nextTick();
		await runSearch(first, "王五");

		const clearButton = first
			.findAll(".newbie-search-operation button")
			.find(button => button.find(".anticon-clear").exists());
		expect(clearButton).toBeTruthy();
		await clearButton.trigger("click");
		await nextTick();
		first.unmount();

		const second = mountSearch(props);
		await nextTick();

		expect(second.find(".newbie-search-mask-value").text()).toBe("");
		expect(second.find(".newbie-search-label .ant-tag").exists()).toBe(false);
		second.unmount();
	});
});
