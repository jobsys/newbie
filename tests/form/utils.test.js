import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import dayjs from "dayjs";
import {
	applyRangeKeys,
	initItemDefaultValue,
	isOptionalChecked,
	placeholder,
} from "../../components/form/utils.js";

const uploaderProvider = {
	defaultFileItem: { id: "id", name: "name", url: "url", path: "path", thumbUrl: "thumbUrl" },
};

const provider = { uploaderProvider };

const initValue = (item, existingData = {}, submitForm = {}) =>
	initItemDefaultValue(item, existingData, submitForm, provider);

describe("form/utils initItemDefaultValue 取值来源", () => {
	it("existingData 优先于 defaultValue", () => {
		const item = { key: "name", type: "input", defaultValue: "默认值" };

		expect(initValue(item, { name: "张三" })).toBe("张三");
		expect(initValue(item)).toBe("默认值");
		expect(initValue({ key: "remark", type: "input" })).toBe("");
	});

	it("existingData 里的 undefined 视为未传值", () => {
		expect(initValue({ key: "name", type: "input", defaultValue: "默认值" }, { name: undefined })).toBe(
			"默认值"
		);
	});

	it("defaultValue 为函数时接收 { submitForm, existingData }", () => {
		const submitForm = { a: 1 };
		const existingData = { b: 2 };

		const value = initItemDefaultValue(
			{
				key: "total",
				type: "input",
				defaultValue: ctx => `${ctx.submitForm.a}-${ctx.existingData.b}`,
			},
			existingData,
			submitForm,
			provider
		);

		expect(value).toBe("1-2");
	});

	it("item.init 最后执行，可以覆盖前面的结果", () => {
		const item = {
			key: "name",
			type: "input",
			defaultValue: "默认值",
			init: ({ value, submitForm, existingData }) => {
				expect(value).toBe("默认值");
				expect(submitForm).toEqual({});
				expect(existingData).toEqual({});
				return "init 之后";
			},
		};

		expect(initValue(item)).toBe("init 之后");
	});
});

describe("form/utils initItemDefaultValue 各类型", () => {
	it("number / slider / rate 经过精度安全的数值处理", () => {
		expect(initValue({ key: "n", type: "number" }, { n: "12.345" })).toBe(12.35);
		expect(initValue({ key: "s", type: "slider" }, { s: "abc" })).toBe(0);
		expect(initValue({ key: "r", type: "rate" }, { r: 4 })).toBe(4);
	});

	it("select / remote 的空值按单选与多选分别处理", () => {
		expect(initValue({ key: "s", type: "select" })).toBeUndefined();
		expect(initValue({ key: "s", type: "select", defaultProps: { mode: "multiple" } })).toEqual(
			[]
		);
		expect(initValue({ key: "s", type: "select", defaultProps: { mode: "tags" } })).toEqual([]);
		expect(
			initValue({ key: "r", type: "remote", defaultProps: { mode: "multiple" } }, { r: ["a"] })
		).toEqual(["a"]);
	});

	it("tree-select 按 multiple / treeCheckable 决定默认值", () => {
		expect(initValue({ key: "t", type: "tree-select" })).toBeUndefined();
		expect(initValue({ key: "t", type: "tree-select", defaultProps: { multiple: true } })).toEqual(
			[]
		);
		expect(
			initValue({ key: "t", type: "tree-select", defaultProps: { treeCheckable: true } })
		).toEqual([]);
	});

	it("date / time 转成 dayjs，区间值转成数组", () => {
		const date = initValue(
			{ key: "d", type: "date" },
			{ d: "2024-03-05T12:00:00" }
		);
		expect(dayjs.isDayjs(date)).toBe(true);
		expect(date.format("YYYY-MM-DD")).toBe("2024-03-05");

		const time = initValue({ key: "t", type: "time" }, { t: "08:00" });
		expect(dayjs.isDayjs(time)).toBe(true);
		expect(time.format("HH:mm")).toBe("08:00");

		const range = initValue(
			{ key: "r", type: "date", defaultProps: { type: "range" } },
			{ r: ["2024-01-01T00:00:00", "2024-01-31T00:00:00"] }
		);
		expect(range).toHaveLength(2);
		expect(range[0].format("YYYY-MM-DD")).toBe("2024-01-01");
		expect(range[1].format("YYYY-MM-DD")).toBe("2024-01-31");

		const emptyRange = initValue({ key: "r", type: "date", defaultProps: { type: "range" } });
		expect(emptyRange).toEqual([]);
	});

	it("address 默认空数组，编码会展开成层级数组", () => {
		expect(initValue({ key: "a", type: "address" })).toEqual([]);
		expect(initValue({ key: "a", type: "address" }, { a: "110101" })).toEqual([
			"110000",
			"110100",
			"110101",
		]);
		expect(initValue({ key: "a", type: "address" }, { a: ["110000"] })).toEqual(["110000"]);
	});

	it("uploader 单文件按 defaultFileItem 生成空对象，多文件生成数组", () => {
		expect(initValue({ key: "u", type: "uploader" })).toEqual({ path: "", url: "" });

		const renamedProvider = {
			uploaderProvider: { defaultFileItem: { path: "filePath", url: "fileUrl" } },
		};
		expect(
			initItemDefaultValue({ key: "u", type: "uploader" }, {}, {}, renamedProvider)
		).toEqual({ filePath: "", fileUrl: "" });

		expect(
			initValue({ key: "u", type: "uploader", defaultProps: { maxNum: 3 } })
		).toEqual([]);
	});

	it("矩阵类型默认空对象，多选类默认空数组", () => {
		expect(initValue({ key: "m", type: "matrix-checkbox" })).toEqual({});
		expect(initValue({ key: "m", type: "matrix-radio" })).toEqual({});
		expect(initValue({ key: "m", type: "matrix-scale" })).toEqual({});
		expect(initValue({ key: "m", type: "rate-radio" })).toEqual({});
		expect(initValue({ key: "g", type: "group" })).toEqual([]);
		expect(initValue({ key: "g", type: "tag" })).toEqual([]);
		expect(initValue({ key: "g", type: "checkbox" })).toEqual([]);
		expect(initValue({ key: "g", type: "rate-checkbox" })).toEqual([]);
	});

	it("rangeKeys 配置的区间字段会从两个来源字段合并成区间值", () => {
		const item = {
			key: "period",
			type: "date",
			defaultProps: { type: "range" },
			rangeKeys: ["started_at", "ended_at"],
		};

		const value = initValue(item, {
			started_at: "2024-01-01T00:00:00",
			ended_at: "2024-01-31T00:00:00",
		});

		expect(value).toHaveLength(2);
		expect(value[0].format("YYYY-MM-DD")).toBe("2024-01-01");
		expect(value[1].format("YYYY-MM-DD")).toBe("2024-01-31");
	});

	it("rangeKeys 两端都没有值时保持空区间，不覆盖 defaultValue", () => {
		const item = {
			key: "period",
			type: "date",
			defaultValue: "默认值",
			defaultProps: { type: "range" },
			rangeKeys: ["started_at", "ended_at"],
		};

		expect(initValue(item, {})).toEqual([]);
	});
});

describe("form/utils applyRangeKeys", () => {
	const item = {
		key: "period",
		type: "date",
		defaultProps: { type: "range", format: "YYYY-MM-DD" },
		rangeKeys: ["started_at", "ended_at"],
	};

	it("把区间值拆到 rangeKeys 指定字段，并删除原字段", () => {
		const form = {
			period: [dayjs("2024-01-01"), dayjs("2024-01-31")],
		};

		const result = applyRangeKeys(form, [item]);

		expect(result).toEqual({ started_at: "2024-01-01", ended_at: "2024-01-31" });
		expect(result).not.toHaveProperty("period");
	});

	it("time 类型未配置 format 时按 HH:mm:ss 拆分", () => {
		const form = {
			work: [dayjs("2000-01-01 08:00:00"), dayjs("2000-01-01 18:30:00")],
		};

		const result = applyRangeKeys(form, [
			{
				key: "work",
				type: "time",
				defaultProps: { type: "range" },
				rangeKeys: ["work_start", "work_end"],
			},
		]);

		expect(result).toEqual({ work_start: "08:00:00", work_end: "18:30:00" });
	});

	it("null 与空数组会把两个字段一并置空", () => {
		expect(applyRangeKeys({ period: null }, [item])).toEqual({
			started_at: null,
			ended_at: null,
		});
		expect(applyRangeKeys({ period: [] }, [item])).toEqual({
			started_at: null,
			ended_at: null,
		});
	});

	it("值为 undefined 时跳过，交给 item.beforeSubmit 处理", () => {
		const form = { period: undefined };

		applyRangeKeys(form, [item]);

		expect(form).toEqual({ period: undefined });
	});

	it("非数组值（已被 beforeSubmit 转换）原样保留", () => {
		const form = { period: "2024-01" };

		applyRangeKeys(form, [item]);

		expect(form).toEqual({ period: "2024-01" });
	});

	it("非区间配置的表单项不做处理", () => {
		const form = { single: dayjs("2024-01-01"), plain: "x" };

		applyRangeKeys(form, [
			{ key: "single", type: "date" },
			{ key: "plain", type: "input" },
			{
				key: "period",
				type: "date",
				defaultProps: { type: "range" },
				rangeKeys: ["only_one"],
			},
		]);

		expect(dayjs.isDayjs(form.single)).toBe(true);
		expect(form.plain).toBe("x");
		expect(form).not.toHaveProperty("only_one");
	});
});

const checkOptional = value => isOptionalChecked({ key: "a" }, { a: value });

const renderPlaceholder = (item, type) => {
	let result;
	mount(
		defineComponent({
			setup() {
				result = placeholder(item, type);
				return () => null;
			},
		})
	);
	return result;
};

describe("form/utils isOptionalChecked", () => {
	it("空对象 / 空数组 / 空串 / false / null / 0 都视为未填写", () => {
		expect(checkOptional({})).toBe(false);
		expect(checkOptional([])).toBe(false);
		expect(checkOptional("")).toBe(false);
		expect(checkOptional(false)).toBe(false);
		expect(checkOptional(null)).toBe(false);
		expect(checkOptional(undefined)).toBe(false);
		expect(checkOptional(0)).toBe(false);
	});

	it("有内容的值视为已填写", () => {
		expect(checkOptional("x")).toBe(true);
		expect(checkOptional(1)).toBe(true);
		expect(checkOptional([1])).toBe(true);
		expect(checkOptional({ a: 1 })).toBe(true);
	});
});

describe("form/utils placeholder", () => {

	it("按场景返回中文占位文案，并带上标题", () => {
		expect(renderPlaceholder({ key: "name", title: "姓名" })).toBe("请填写姓名");
		expect(renderPlaceholder({ key: "city", title: "城市" }, "select")).toBe("请选择城市");
		expect(renderPlaceholder({ key: "file", title: "附件" }, "upload")).toBe("请上传附件");
	});

	it("item.placeholder 优先于内置文案", () => {
		expect(renderPlaceholder({ key: "name", title: "姓名", placeholder: "请输入" })).toBe(
			"请输入"
		);
	});
});
