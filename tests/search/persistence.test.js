import { describe, expect, it } from "vitest";
import dayjs from "dayjs";

import {
	applySearchSnapshot,
	createSearchSnapshot,
	isSearchSnapshot,
	readSearchSort,
	SEARCH_SNAPSHOT_VERSION,
} from "../../components/search/persistence.js";
import {
	createTableSnapshot,
	readTableSnapshot,
	TABLE_SNAPSHOT_VERSION,
	toPositiveInt,
} from "../../components/table/persistence.js";

describe("search 快照", () => {
	it("只保存有值的搜索项，并保留表单态结构", () => {
		const snapshot = createSearchSnapshot(
			{
				name: { condition: "include", type: "input", value: "张三" },
				status: { condition: "equal", type: "select", value: ["pass"] },
				empty: { condition: "equal", type: "input", value: "" },
				none: { condition: "null", type: "input", value: null },
			},
			{ created_at: "desc" }
		);

		expect(Object.keys(snapshot.form).toSorted()).toEqual(["name", "none", "status"]);
		// 存储的是表单值：select 单选的数组形态被原样保留
		expect(snapshot.form.status.value).toEqual(["pass"]);
		// 为空条件本身是有效搜索
		expect(snapshot.form.none).toEqual({ condition: "null", type: "input", value: null });
		expect(snapshot.sort).toEqual({ created_at: "desc" });
	});

	it("日期转 ISO 字符串，恢复时还原为 dayjs", () => {
		const date = dayjs("2024-05-06");
		const snapshot = createSearchSnapshot(
			{ created_at: { condition: "between", type: "date", value: [date, null] } },
			{}
		);

		expect(snapshot.form.created_at.value[0]).toBe(date.toISOString());
		expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);

		const form = { created_at: { condition: "equal", type: "date", value: [null, null] } };
		expect(applySearchSnapshot(snapshot, form)).toBe(true);
		expect(dayjs.isDayjs(form.created_at.value[0])).toBe(true);
		expect(form.created_at.value[0].format("YYYY-MM-DD")).toBe("2024-05-06");
		expect(form.created_at.value[1]).toBeNull();
		expect(form.created_at.condition).toBe("between");
	});

	it("switch / 多选直接按表单值恢复，不再做布尔与数组猜测", () => {
		const source = {
			enabled: { condition: "equal", type: "switch", value: "unchecked" },
			tags: { condition: "include", type: "select", value: ["a", "b"] },
		};
		const snapshot = createSearchSnapshot(source, {});

		const form = {
			enabled: { condition: "equal", type: "switch", value: undefined },
			tags: { condition: "equal", type: "select", value: [] },
		};
		applySearchSnapshot(snapshot, form);

		expect(form.enabled.value).toBe("unchecked");
		expect(form.tags.value).toEqual(["a", "b"]);
		expect(form.tags.condition).toBe("include");
	});

	it("值为 undefined 时不落盘，内存层与 JSON 结构保持一致", () => {
		const snapshot = createSearchSnapshot(
			{
				enabled: { condition: "null", type: "switch", value: undefined },
				amount: { condition: "between", type: "number", value: [5, undefined] },
			},
			{}
		);

		expect(snapshot.form.enabled).not.toHaveProperty("value");
		expect(snapshot.form.amount.value).toEqual([5, null]);
		expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
	});

	it("自定义对象值逐层编码，不写入响应式引用", () => {
		const value = { tags: ["a"], at: dayjs("2024-01-01"), empty: undefined };
		const snapshot = createSearchSnapshot(
			{ custom: { condition: "equal", type: "input", value } },
			{}
		);

		expect(snapshot.form.custom.value).toEqual({
			tags: ["a"],
			at: dayjs("2024-01-01").toISOString(),
		});
		expect(snapshot.form.custom.value).not.toBe(value);
		expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
	});

	it("忽略快照中已不存在的搜索项", () => {
		const snapshot = createSearchSnapshot(
			{ removed: { condition: "equal", type: "input", value: "旧值" } },
			{}
		);
		const form = { name: { condition: "equal", type: "input", value: "" } };

		expect(applySearchSnapshot(snapshot, form)).toBe(true);
		expect(form).toEqual({ name: { condition: "equal", type: "input", value: "" } });
	});

	it("版本不符的快照按无数据处理", () => {
		const legacy = {
			version: SEARCH_SNAPSHOT_VERSION - 1,
			form: { name: { condition: "equal", type: "input", value: "x" } },
		};
		const form = { name: { condition: "equal", type: "input", value: "" } };

		expect(isSearchSnapshot(legacy)).toBe(false);
		expect(applySearchSnapshot(legacy, form)).toBe(false);
		expect(form.name.value).toBe("");
		expect(readSearchSort(legacy)).toEqual({});
	});

	it("读取排序时过滤非法方向", () => {
		const snapshot = createSearchSnapshot({}, { a: "asc", b: "up", c: "desc" });
		expect(readSearchSort(snapshot)).toEqual({ a: "asc", c: "desc" });
	});
});

describe("table 快照", () => {
	it("只保存页码/页大小与列显隐，不保存 totalSize", () => {
		const snapshot = createTableSnapshot({
			pagination: { currentPage: 3, pageSize: 20, totalSize: 999 },
			columnKey: { name: true, email: false, broken: "yes" },
		});

		expect(snapshot).toEqual({
			version: TABLE_SNAPSHOT_VERSION,
			pagination: { currentPage: 3, pageSize: 20 },
			columnKey: { name: true, email: false },
		});
	});

	it("缺省的 pageSize 不写入快照，内存与 JSON 结构一致", () => {
		const snapshot = createTableSnapshot({ pagination: { currentPage: 2 } });

		expect(snapshot.pagination).toEqual({ currentPage: 2 });
		expect(JSON.parse(JSON.stringify(snapshot))).toEqual(snapshot);
	});

	it("恢复时校正非法分页数据", () => {
		expect(toPositiveInt(3, 1)).toBe(3);
		expect(toPositiveInt("5", 1)).toBe(5);
		expect(toPositiveInt(0, 1)).toBe(1);
		expect(toPositiveInt(-2, 1)).toBe(1);
		expect(toPositiveInt("abc", 1)).toBe(1);
		expect(toPositiveInt(1.5, 1)).toBe(1);

		expect(readTableSnapshot({ version: 99 })).toBeNull();
		expect(readTableSnapshot(null)).toBeNull();
		expect(readTableSnapshot({ version: TABLE_SNAPSHOT_VERSION })).toEqual({
			pagination: {},
			columnKey: {},
		});
	});
});
