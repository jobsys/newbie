import { describe, expect, it, vi } from "vitest";
import {
	OPERATORS,
	clearHiddenValues,
	computeVisibility,
	evaluateRule,
} from "../../components/form/utils/rule-engine.js";

describe("rule-engine 操作符矩阵", () => {
	it("equals / notEquals 使用宽松相等", () => {
		expect(OPERATORS.equals(1, "1")).toBe(true);
		expect(OPERATORS.equals(null, undefined)).toBe(true);
		expect(OPERATORS.equals("a", "b")).toBe(false);
		expect(OPERATORS.notEquals("a", "b")).toBe(true);
		expect(OPERATORS.notEquals(1, "1")).toBe(false);
	});

	it("isEmpty / isNotEmpty 只把 null / undefined / 空串视为空", () => {
		expect(OPERATORS.isEmpty(null)).toBe(true);
		expect(OPERATORS.isEmpty(undefined)).toBe(true);
		expect(OPERATORS.isEmpty("")).toBe(true);
		expect(OPERATORS.isEmpty(0)).toBe(false);
		expect(OPERATORS.isEmpty([])).toBe(false);
		expect(OPERATORS.isNotEmpty("x")).toBe(true);
		expect(OPERATORS.isNotEmpty("")).toBe(false);
	});

	it("gt / lt / gte / lte 按数值比较，字符串数字也参与计算", () => {
		expect(OPERATORS.gt("10", 2)).toBe(true);
		expect(OPERATORS.gt(2, "10")).toBe(false);
		expect(OPERATORS.lt("2", 10)).toBe(true);
		expect(OPERATORS.gte(3, 3)).toBe(true);
		expect(OPERATORS.lte(3, 3)).toBe(true);
		expect(OPERATORS.lte(4, 3)).toBe(false);
	});

	it("contains / notContains 基于字符串包含", () => {
		expect(OPERATORS.contains("abcdef", "bcd")).toBe(true);
		expect(OPERATORS.contains("abcdef", "xyz")).toBe(false);
		expect(OPERATORS.contains(123, 2)).toBe(true);
		expect(OPERATORS.notContains("abc", "z")).toBe(true);
	});

	it("startsWith / endsWith 判断前后缀", () => {
		expect(OPERATORS.startsWith("newbie", "new")).toBe(true);
		expect(OPERATORS.startsWith("newbie", "bie")).toBe(false);
		expect(OPERATORS.endsWith("newbie", "bie")).toBe(true);
		expect(OPERATORS.endsWith("newbie", "new")).toBe(false);
	});

	it("in / notIn 只对数组生效", () => {
		expect(OPERATORS.in(["a", "b"], "a")).toBe(true);
		expect(OPERATORS.in(["a", "b"], "c")).toBe(false);
		expect(OPERATORS.in("a", "a")).toBe(false);
		expect(OPERATORS.notIn(["a", "b"], "c")).toBe(true);
		expect(OPERATORS.notIn(["a", "b"], "a")).toBe(false);
		expect(OPERATORS.notIn("a", "a")).toBe(true);
	});
});

describe("rule-engine 单条规则评估", () => {
	it("无规则 / 空条件直接返回 false", () => {
		expect(evaluateRule(null, { a: 1 })).toBe(false);
		expect(evaluateRule({}, { a: 1 })).toBe(false);
		expect(evaluateRule({ conditions: [] }, { a: 1 })).toBe(false);
	});

	it("and 逻辑门要求全部条件成立", () => {
		const rule = {
			targetField: "b",
			action: "show",
			logicGate: "and",
			conditions: [
				{ field: "a", operator: "equals", value: 1 },
				{ field: "c", operator: "gt", value: 10 },
			],
		};

		expect(evaluateRule(rule, { a: 1, c: 20 })).toBe(true);
		expect(evaluateRule(rule, { a: 1, c: 5 })).toBe(false);
	});

	it("or 逻辑门只需一个条件成立，且大小写不敏感", () => {
		const base = {
			targetField: "b",
			action: "hide",
			conditions: [
				{ field: "a", operator: "equals", value: 1 },
				{ field: "c", operator: "equals", value: "x" },
			],
		};

		expect(evaluateRule({ ...base, logicGate: "or" }, { a: 0, c: "x" })).toBe(true);
		expect(evaluateRule({ ...base, logicGate: "OR" }, { a: 0, c: "y" })).toBe(false);
	});

	it("缺省 logicGate 时按 and 处理", () => {
		const rule = {
			targetField: "b",
			action: "show",
			conditions: [
				{ field: "a", operator: "isEmpty" },
				{ field: "c", operator: "isNotEmpty" },
			],
		};

		expect(evaluateRule(rule, { c: 1 })).toBe(true);
		expect(evaluateRule(rule, { a: 1, c: 1 })).toBe(false);
	});

	it("未知操作符告警并视为条件不成立", () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const result = evaluateRule(
			{ conditions: [{ field: "a", operator: "unknownOp", value: 1 }] },
			{ a: 1 }
		);

		expect(result).toBe(false);
		expect(warnSpy).toHaveBeenCalledWith("未知操作符: unknownOp");

		warnSpy.mockRestore();
	});

	it("一元操作符不依赖 value 字段", () => {
		expect(
			evaluateRule({ conditions: [{ field: "a", operator: "isEmpty" }] }, {})
		).toBe(true);
		expect(
			evaluateRule({ conditions: [{ field: "a", operator: "isNotEmpty" }] }, { a: 0 })
		).toBe(true);
	});
});

describe("rule-engine 字段可见性", () => {
	it("没有规则时返回空映射", () => {
		expect(computeVisibility([], { a: 1 })).toEqual({});
		expect(computeVisibility(undefined, {})).toEqual({});
	});

	it("show 规则满足时显示，hide 规则满足时隐藏", () => {
		const rules = [
			{
				targetField: "a",
				action: "show",
				conditions: [{ field: "toggle", operator: "equals", value: 1 }],
			},
			{
				targetField: "b",
				action: "hide",
				conditions: [{ field: "toggle", operator: "equals", value: 1 }],
			},
		];

		expect(computeVisibility(rules, { toggle: 1 })).toEqual({ a: true, b: false });
	});

	it("规则未命中时保持默认显示", () => {
		const rules = [
			{
				targetField: "a",
				action: "hide",
				conditions: [{ field: "toggle", operator: "equals", value: 1 }],
			},
		];

		expect(computeVisibility(rules, { toggle: 0 })).toEqual({ a: true });
	});

	it("show 与 hide 同时命中时 show 优先（显示）", () => {
		const rules = [
			{
				targetField: "a",
				action: "hide",
				conditions: [{ field: "toggle", operator: "equals", value: 1 }],
			},
			{
				targetField: "a",
				action: "show",
				conditions: [{ field: "other", operator: "equals", value: "y" }],
			},
		];

		expect(computeVisibility(rules, { toggle: 1, other: "y" })).toEqual({ a: true });
	});

	it("多个 show 规则任一命中即显示", () => {
		const rules = [
			{
				targetField: "a",
				action: "show",
				conditions: [{ field: "x", operator: "equals", value: 1 }],
			},
			{
				targetField: "a",
				action: "show",
				conditions: [{ field: "y", operator: "equals", value: 1 }],
			},
		];

		expect(computeVisibility(rules, { x: 0, y: 1 })).toEqual({ a: true });
		expect(computeVisibility(rules, { x: 1, y: 0 })).toEqual({ a: true });
	});

	it("只有 show 规则且全部未命中时，仍按默认值显示（当前实现）", () => {
		const rules = [
			{
				targetField: "a",
				action: "show",
				conditions: [{ field: "x", operator: "equals", value: 1 }],
			},
		];

		// 记录现状：show 规则不满足并不会隐藏字段，字段在无 hide 命中时始终可见
		expect(computeVisibility(rules, { x: 0 })).toEqual({ a: true });
	});

	it("没有 targetField 的规则不产生受控字段", () => {
		const rules = [
			{
				action: "hide",
				conditions: [{ field: "toggle", operator: "equals", value: 1 }],
			},
		];

		expect(computeVisibility(rules, { toggle: 1 })).toEqual({});
	});
});

describe("rule-engine 隐藏字段清值", () => {
	it("把不可见字段置为 null，并返回新对象", () => {
		const formData = { a: 1, b: 2, c: 3 };
		const hidden = new Map([
			["a", false],
			["b", true],
		]);

		const result = clearHiddenValues(hidden, formData);

		expect(result).toEqual({ a: null, b: 2, c: 3 });
		expect(result).not.toBe(formData);
		expect(formData).toEqual({ a: 1, b: 2, c: 3 });
	});

	it("非 Map 入参直接返回浅拷贝", () => {
		const formData = { a: 1 };
		const result = clearHiddenValues({ a: false }, formData);

		expect(result).toEqual({ a: 1 });
		expect(result).not.toBe(formData);
		expect(clearHiddenValues(null, formData)).toEqual({ a: 1 });
	});

	it("缺省 formData 时返回空对象", () => {
		expect(clearHiddenValues(new Map([["a", false]]))).toEqual({ a: null });
		expect(clearHiddenValues(new Map())).toEqual({});
	});
});
