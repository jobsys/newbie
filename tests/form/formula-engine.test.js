import { describe, expect, it } from "vitest";
import {
	calcFormula,
	evaluate,
	getFieldRefs,
	hasSelfReference,
	parse,
	tokenize,
} from "../../components/form/utils/formula-engine.js";

const calc = (dsl, formData) => calcFormula(dsl, formData);

describe("formula-engine 词法分析", () => {
	it("把字段引用、函数、数字、字符串拆成 token", () => {
		const tokens = tokenize('IF([a], 12, "x")');

		expect(tokens.map(token => token.type)).toEqual([
			"FUNCTION",
			"LPAREN",
			"FIELD_REF",
			"COMMA",
			"NUMBER",
			"COMMA",
			"STRING",
			"RPAREN",
		]);
		expect(tokens[2].value).toBe("a");
		expect(tokens[4].value).toBe(12);
		expect(tokens[6].value).toBe("x");
	});

	it("非函数标识符按字段引用处理（兼容写法）", () => {
		expect(tokenize("price * 2")).toEqual([
			{ type: "FIELD_REF", value: "price" },
			{ type: "OPERATOR", value: "*" },
			{ type: "NUMBER", value: 2 },
		]);
	});

	it("操作数之后的减号是二元运算符，而不是负号", () => {
		expect(tokenize("10 - 4")).toEqual([
			{ type: "NUMBER", value: 10 },
			{ type: "OPERATOR", value: "-" },
			{ type: "NUMBER", value: 4 },
		]);
	});

	it("支持双字符比较运算符", () => {
		expect(tokenize("a >= 1").map(token => token.value)).toEqual(["a", ">=", 1]);
	});

	it("未闭合的字段引用直接报错", () => {
		expect(() => tokenize("[abc")).toThrow("未闭合的字段引用");
	});

	it("未闭合的字符串字面量直接报错", () => {
		expect(() => tokenize('"abc')).toThrow("未闭合的字符串字面量");
	});

	it("未知字符直接报错", () => {
		expect(() => tokenize("1 @ 2")).toThrow("未知字符");
	});
});

describe("formula-engine 语法分析", () => {
	it("乘除优先级高于加减", () => {
		const ast = parse(tokenize("1 + 2 * 3"));

		expect(ast).toMatchObject({ type: "BinaryOp", operator: "+" });
		expect(ast.left).toMatchObject({ type: "NumberLiteral", value: 1 });
		expect(ast.right).toMatchObject({ type: "BinaryOp", operator: "*" });
		expect(ast.right.right).toMatchObject({ type: "NumberLiteral", value: 3 });
	});

	it("括号改变结合顺序", () => {
		const ast = parse(tokenize("(1 + 2) * 3"));

		expect(ast).toMatchObject({ type: "BinaryOp", operator: "*" });
		expect(ast.left).toMatchObject({ type: "BinaryOp", operator: "+" });
	});

	it("空表达式与缺少右括号都会报错", () => {
		expect(() => parse(tokenize(""))).toThrow("空的公式表达式");
		expect(() => parse(tokenize("(1 + 2"))).toThrow("缺少右括号");
	});

	it("表达式结尾是运算符时报错", () => {
		expect(() => parse(tokenize("1 +"))).toThrow("意外的表达式结尾");
	});
});

describe("formula-engine 求值", () => {
	it("四则运算与取模", () => {
		expect(calc("1 + 2 * 3")).toBe(7);
		expect(calc("(1 + 2) * 3")).toBe(9);
		expect(calc("10 - 4")).toBe(6);
		expect(calc("10 / 4")).toBe(2.5);
		expect(calc("10 % 3")).toBe(1);
	});

	it("除零与取模 0 返回可读的错误对象", () => {
		expect(calc("10 / 0")).toEqual({ error: "除零错误" });
		expect(calc("10 % 0")).toEqual({ error: "除零错误" });
	});

	it("任一操作数是字符串时 + 做拼接", () => {
		expect(calc('"a" + "b"')).toBe("ab");
		expect(calc('[price] + "元"', { price: 5 })).toBe("5元");
	});

	it("字段引用从 formData 取值，缺失时按 null 处理", () => {
		expect(calc("[price] * [qty]", { price: 10, qty: 3 })).toBe(30);
		expect(calc("[missing]")).toBeNull();
		expect(calc("[missing] + 1")).toBe(1);
	});

	it("比较运算返回 1 / 0，并做宽松相等", () => {
		expect(calc("2 > 1")).toBe(1);
		expect(calc("2 < 1")).toBe(0);
		expect(calc("3 >= 3")).toBe(1);
		expect(calc("3 <= 2")).toBe(0);
		expect(calc('1 == "1"')).toBe(1);
		expect(calc('1 != "1"')).toBe(0);
		expect(calc('[name] == "张三"', { name: "张三" })).toBe(1);
	});

	it("IF 按条件选择分支，参数不足时报错误对象", () => {
		expect(calc('IF([score] >= 60, "及格", "不及格")', { score: 80 })).toBe("及格");
		expect(calc('IF([score] >= 60, "及格", "不及格")', { score: 59 })).toBe("不及格");
		expect(calc("IF(1, 2)")).toEqual({ error: "IF 函数需要 3 个参数" });
	});

	it("聚合函数 SUM / AVG / MAX / MIN", () => {
		expect(calc("SUM(1, 2, 3)")).toBe(6);
		expect(calc("AVG(1, 2, 3, 4)")).toBe(2.5);
		expect(calc("MAX(1, 9, 4)")).toBe(9);
		expect(calc("MIN(1, 9, 4)")).toBe(1);
		expect(calc("AVG()")).toEqual({ error: "AVG 函数至少需要 1 个参数" });
	});

	it("数值函数 ABS / ROUND / COUNT / PERCENT", () => {
		expect(calc("ABS(0 - 5)")).toBe(5);
		expect(calc("ROUND(3.14159, 2)")).toBe(3.14);
		expect(calc("ROUND(2.5)")).toBe(3);
		expect(calc("COUNT(1, 2, 3)")).toBe(3);
		expect(calc("PERCENT(30, 60)")).toBe(50);
		expect(calc("PERCENT(1, 0)")).toEqual({ error: "PERCENT 函数除零错误" });
	});

	it("字符串函数 CONCAT / LEN / UPPER / LOWER", () => {
		expect(calc('CONCAT("a", 1, "b")')).toBe("a1b");
		expect(calc('LEN("你好")')).toBe(2);
		expect(calc('UPPER("ab")')).toBe("AB");
		expect(calc('LOWER("AB")')).toBe("ab");
		expect(calc('LEN("a", "b")')).toEqual({ error: "LEN 函数需要 1 个参数" });
	});

	it("数学函数 MOD / POWER / SQRT 及其错误分支", () => {
		expect(calc("MOD(10, 3)")).toBe(1);
		expect(calc("MOD(10, 0)")).toEqual({ error: "MOD 函数除零错误" });
		expect(calc("POWER(2, 10)")).toBe(1024);
		expect(calc("SQRT(9)")).toBe(3);
		expect(calc("SQRT(0 - 1)")).toEqual({ error: "SQRT 函数参数不能为负数" });
	});

	it("逻辑函数 AND / OR / NOT / XOR", () => {
		expect(calc("AND(1, 1, 0)")).toBe(0);
		expect(calc("AND(1, 1)")).toBe(1);
		expect(calc("OR(0, 1)")).toBe(1);
		expect(calc("OR(0, 0)")).toBe(0);
		expect(calc("NOT(0)")).toBe(1);
		expect(calc("NOT(2)")).toBe(0);
		expect(calc("XOR(1, 1, 0)")).toBe(0);
		expect(calc("XOR(1, 0)")).toBe(1);
		expect(calc("AND()")).toEqual({ error: "AND 函数至少需要 1 个参数" });
	});

	it("日期函数按本地时间拆分年月日，DATEDIF 支持 Y / M 单位", () => {
		expect(calc('YEAR("2024-03-05T12:00:00")')).toBe(2024);
		expect(calc('MONTH("2024-03-05T12:00:00")')).toBe(3);
		expect(calc('DAY("2024-03-05T12:00:00")')).toBe(5);
		expect(
			calc('DATEDIF("2023-01-15T00:00:00", "2024-03-20T00:00:00", "Y")')
		).toBe(1);
		expect(
			calc('DATEDIF("2023-01-15T00:00:00", "2024-03-20T00:00:00", "M")')
		).toBe(14);
		expect(calc('DATEDIF("2023-01-15", "2024-03-20", "W")')).toEqual({
			error: 'DATEDIF 单位应为 "Y"、"M" 或 "D"',
		});
		expect(calc("TODAY()")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it("未知函数与参数不足返回错误对象，而不是抛异常", () => {
		expect(calc("FOO(1)")).toEqual({ error: "未知函数: FOO" });
		expect(calc("SQRT(1, 2)")).toEqual({ error: "SQRT 函数需要 1 个参数" });
		expect(calc("[a")).toEqual({ error: "未闭合的字段引用，位置 0" });
		expect(calc("")).toEqual({ error: "空的公式表达式" });
	});

	it("evaluate 对空 AST 与未知节点类型分别返回 null / 抛错", () => {
		expect(evaluate(null, {})).toBeNull();
		expect(() => evaluate({ type: "Unknown" }, {})).toThrow("未知的 AST 节点类型");
	});
});

describe("formula-engine 字段依赖", () => {
	it("getFieldRefs 收集表达式与函数参数里的字段（去重）", () => {
		const ast = parse(tokenize('IF([a] > [b], [a] + 1, SUM([c], 2))'));
		const refs = getFieldRefs(ast);

		expect(refs).toBeInstanceOf(Set);
		expect([...refs].toSorted()).toEqual(["a", "b", "c"]);
		expect(getFieldRefs(null).size).toBe(0);
	});

	it("hasSelfReference 能识别自引用，并对非法公式返回 false", () => {
		expect(hasSelfReference("[total] + [tax]", "total")).toBe(true);
		expect(hasSelfReference("SUM([total], [tax])", "total")).toBe(true);
		expect(hasSelfReference("[total] + [tax]", "other")).toBe(false);
		expect(hasSelfReference("", "total")).toBe(false);
		expect(hasSelfReference("[total", "total")).toBe(false);
	});

	it("相同公式命中 AST 缓存，求值结果保持一致", () => {
		const dsl = "[price] * [qty]";
		expect(calc(dsl, { price: 2, qty: 3 })).toBe(6);
		expect(calc(dsl, { price: 4, qty: 5 })).toBe(20);
	});
});

describe("formula-engine 负数与日期边界", () => {
	it("支持一元负号，且 tokenize 不会死循环", () => {
		expect(calc("-5")).toBe(-5);
		expect(calc("1 + -2")).toBe(-1);
		expect(calc("(-3) * 2")).toBe(-6);
		expect(tokenize("-5").map(token => token.value)).toEqual([-5]);
	});

	it("DATE 使用本地日期，不因时区偏移差一天", () => {
		expect(calc("DATE(2024, 1, 15)")).toBe("2024-01-15");
		expect(calc("DATE(2024, 12, 31)")).toBe("2024-12-31");

		const today = new Date();
		const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
			today.getDate()
		).padStart(2, "0")}`;
		expect(calc("TODAY()")).toBe(expected);
	});
});
