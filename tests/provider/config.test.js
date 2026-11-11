import { describe, expect, it } from "vitest";
import { mergeConfig } from "../../components/provider/config.js";

const defaults = {
	uploader: {
		uploadUrl: "",
		defaultFileItem: { id: "id", name: "name", url: "url", path: "path" },
	},
	form: {
		format: { date: true, boolean: false },
		columns: { switch: { defaultProps: { size: "small" } } },
	},
	table: { pageSize: 20, autoQuery: false },
};

describe("mergeConfig", () => {
	it("深合并 defaultFileItem，只覆盖传入的字段", () => {
		const result = mergeConfig(defaults, {
			uploader: { defaultFileItem: { url: "fileUrl" } },
		});

		expect(result.uploader.defaultFileItem).toEqual({
			id: "id",
			name: "name",
			url: "fileUrl",
			path: "path",
		});
	});

	it("深合并 form.columns，保留未覆盖的类型", () => {
		const result = mergeConfig(defaults, {
			form: { columns: { switch: { defaultProps: { size: "default" } } } },
		});

		expect(result.form.columns.switch.defaultProps.size).toBe("default");
	});

	it("数组与函数整体替换", () => {
		const fn = () => 1;
		const result = mergeConfig(
			{ search: { valueFormatter: null, options: [1, 2] } },
			{ search: { valueFormatter: fn, options: [3] } }
		);

		expect(result.search.valueFormatter).toBe(fn);
		expect(result.search.options).toEqual([3]);
	});

	it("保留 false、0 与空字符串", () => {
		const result = mergeConfig(defaults, {
			table: { pageSize: 0, autoQuery: false },
		});

		expect(result.table.pageSize).toBe(0);
		expect(result.table.autoQuery).toBe(false);
	});

	it("忽略 undefined，不覆盖已有默认值", () => {
		const result = mergeConfig(defaults, {
			table: { pageSize: undefined },
			uploader: { defaultFileItem: { url: "fileUrl", path: undefined } },
		});

		expect(result.table.pageSize).toBe(20);
		expect(result.uploader.defaultFileItem.path).toBe("path");
		expect(result.uploader.defaultFileItem.url).toBe("fileUrl");
	});

	it("不修改传入对象", () => {
		const input = { table: { pageSize: 50 } };
		mergeConfig(defaults, input);
		expect(defaults.table.pageSize).toBe(20);
		expect(input).toEqual({ table: { pageSize: 50 } });
	});
});
