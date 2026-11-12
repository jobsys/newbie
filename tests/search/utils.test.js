import { describe, expect, it, vi } from "vitest";
import { normalizeConditionValue, normalizeOptions } from "../../components/search/utils.js";

describe("normalizeOptions", () => {
	it("函数式 options 只调用一次", () => {
		const factory = vi.fn(() => [{ value: 1, label: "A" }]);
		const options = normalizeOptions(factory);

		expect(factory).toHaveBeenCalledTimes(1);
		expect(options).toEqual([{ value: 1, label: "A" }]);
	});

	it("非数组返回空数组", () => {
		expect(normalizeOptions()).toEqual([]);
		expect(normalizeOptions(null)).toEqual([]);
		expect(normalizeOptions("abc")).toEqual([]);
		expect(normalizeOptions(() => null)).toEqual([]);
	});

	it("字符串与数字项归一化为 { value, label }", () => {
		expect(normalizeOptions(["A", 1, { value: "b", label: "B" }])).toEqual([
			{ value: "A", label: "A" },
			{ value: 1, label: 1 },
			{ value: "b", label: "B" },
		]);
	});

	it("对象项原样返回", () => {
		const option = { value: "a", label: "A", extra: true };
		expect(normalizeOptions([option])[0]).toBe(option);
	});
});

describe("normalizeConditionValue", () => {
	const selectItem = { key: "status", type: "select" };
	const cascadeItem = { key: "area", type: "cascade" };
	const inputItem = { key: "name", type: "input" };

	it("select 的 equal / notEqual 只保留首值", () => {
		const form = { status: { condition: "equal", value: ["a", "b"] } };
		normalizeConditionValue(selectItem, form);
		expect(form.status.value).toEqual(["a"]);

		form.status.condition = "notEqual";
		form.status.value = [];
		normalizeConditionValue(selectItem, form);
		expect(form.status.value).toEqual([]);
	});

	it("select 的 null / notNull 清空值", () => {
		const form = { status: { condition: "null", value: ["a"] } };
		normalizeConditionValue(selectItem, form);
		expect(form.status.value).toEqual([]);

		form.status.condition = "notNull";
		form.status.value = ["b"];
		normalizeConditionValue(selectItem, form);
		expect(form.status.value).toEqual([]);
	});

	it("select 的其它条件过滤 null / undefined", () => {
		const form = { status: { condition: "include", value: [null, "a", undefined, "b"] } };
		normalizeConditionValue(selectItem, form);
		expect(form.status.value).toEqual(["a", "b"]);
	});

	it("cascade 的 equal 保留完整路径，只处理 null 条件", () => {
		const form = { area: { condition: "equal", value: ["zhejiang", "hangzhou"] } };
		normalizeConditionValue(cascadeItem, form);
		expect(form.area.value).toEqual(["zhejiang", "hangzhou"]);

		form.area.condition = "null";
		normalizeConditionValue(cascadeItem, form);
		expect(form.area.value).toEqual([]);
	});

	it("非数组值类型不做处理", () => {
		const form = { name: { condition: "equal", value: "abc" } };
		normalizeConditionValue(inputItem, form);
		expect(form.name.value).toBe("abc");

		form.name.condition = "null";
		normalizeConditionValue(inputItem, form);
		expect(form.name.value).toBe("abc");
	});

	it("缺少字段时安全返回", () => {
		expect(normalizeConditionValue(selectItem, {})).toBeUndefined();
		expect(normalizeConditionValue(selectItem, undefined)).toBeUndefined();
	});
});
