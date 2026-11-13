import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

import {
	parsePersistenceConfig,
	usePersistence,
	usePersistenceScope,
} from "../../hooks/usePersistence.js";

const unique = prefix => `${prefix}-${Math.random().toString(36).slice(2)}`;

beforeEach(() => {
	window.localStorage.clear();
});

describe("usePersistence 统一读写", () => {
	it("内存层读写，read 在无数据时返回默认值", () => {
		const store = usePersistence(unique("memory"));

		expect(store.read("state", { empty: true })).toEqual({ empty: true });

		store.write("state", { page: 2 });
		expect(store.read("state")).toEqual({ page: 2 });
		expect(store.has("state")).toBe(true);
	});

	it("冷存储写入后，新实例可直接读取（内存 → localStorage 回填）", () => {
		const namespace = unique("cold");
		usePersistence(namespace, { storage: "local" }).write("state", { page: 3 });

		// 新实例的内存层是空的，必须从 localStorage 恢复
		const fresh = usePersistence(namespace, { storage: "local" });
		expect(fresh.read("state")).toEqual({ page: 3 });
		expect(fresh.hasCold("state")).toBe(true);
	});

	it("数据损坏时忽略冷数据并返回默认值，不中断调用方", () => {
		const namespace = unique("broken");
		window.localStorage.setItem(
			`nbp_v2_${namespace}_state`,
			"{ this is not json"
		);

		const store = usePersistence(namespace, { storage: "local" });
		expect(store.read("state", { safe: true })).toEqual({ safe: true });
		expect(store.hasCold("state")).toBe(false);
	});

	it("clear 解构调用也能同时清除两层（不再依赖 this）", () => {
		const namespace = unique("clear");
		const store = usePersistence(namespace, { storage: "local" });
		store.write("state", { page: 1 });

		const { clear } = store;
		clear(["state"]);

		expect(store.read("state")).toBeUndefined();
		expect(store.hasCold("state")).toBe(false);
	});

	it("clear 不传参时清掉本实例访问过的所有 key", () => {
		const namespace = unique("clear-all");
		const store = usePersistence(namespace, { storage: "local" });
		store.write("state", { page: 1 });
		store.write("other", { page: 2 });

		const { clear } = store;
		clear();

		expect(store.has("state")).toBe(false);
		expect(store.has("other")).toBe(false);
		expect(store.hasCold("state")).toBe(false);
		expect(store.hasCold("other")).toBe(false);
	});

	it("内存模式不写 localStorage", () => {
		const namespace = unique("memory-only");
		usePersistence(namespace).write("state", { page: 1 });

		expect(window.localStorage.getItem(`nbp_v2_${namespace}_state`)).toBeNull();
	});

	it("存储键带版本前缀，结构升级后旧数据不会被读到", () => {
		const namespace = unique("version");
		window.localStorage.setItem(`nbp_${namespace}_state`, JSON.stringify({ page: 9 }));

		const store = usePersistence(namespace, { storage: "local" });
		expect(store.read("state")).toBeUndefined();
	});
});

describe("parsePersistenceConfig", () => {
	it("解析布尔、字符串与对象三种写法", () => {
		expect(parsePersistenceConfig(false)).toMatchObject({ enabled: false });
		expect(parsePersistenceConfig(true)).toMatchObject({
			enabled: true,
			storage: "memory",
			key: null,
			restore: null,
		});
		expect(parsePersistenceConfig("order")).toMatchObject({
			enabled: true,
			key: "order",
		});
		expect(
			parsePersistenceConfig({ key: "order", storage: "local", restore: "manual" })
		).toMatchObject({
			enabled: true,
			key: "order",
			storage: "local",
			restore: "manual",
		});
	});

	it("非法 restore 值不会被透传", () => {
		expect(parsePersistenceConfig({ restore: "sometimes" }).restore).toBeNull();
	});
});

describe("usePersistenceScope", () => {
	it("按 key 生成稳定且隔离的命名空间", async () => {
		const a = usePersistenceScope("search", { key: "list" });
		const b = usePersistenceScope("table", { key: "list" });

		expect(a.namespace.value).toMatch(/^search_/);
		expect(b.namespace.value).toMatch(/^table_/);
		expect(a.namespace.value).not.toBe(b.namespace.value);

		await nextTick();
		expect(a.store.value).toBeTruthy();
	});

	it("关闭持久化时没有命名空间与实例", () => {
		const scope = usePersistenceScope("search", false);
		expect(scope.namespace.value).toBeNull();
		expect(scope.store.value).toBeNull();
	});

	it("搜索冷存储默认手动恢复，表格默认自动恢复", () => {
		expect(
			usePersistenceScope("search", { storage: "local" }).restore.value
		).toBe("manual");
		expect(
			usePersistenceScope("table", { storage: "local" }).restore.value
		).toBe("auto");
		expect(
			usePersistenceScope("search", { storage: "local", restore: "auto" }).restore.value
		).toBe("auto");
	});
});
