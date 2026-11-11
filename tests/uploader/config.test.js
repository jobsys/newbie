import { describe, expect, it } from "vitest";
import { mergeConfig } from "../../components/provider/config.js";
import { uploaderDefaults } from "../../components/uploader/config.js";

describe("uploader 配置", () => {
	it("只覆盖 url 时保留其它文件字段", () => {
		const merged = mergeConfig(uploaderDefaults, {
			defaultFileItem: { url: "fileUrl" },
		});

		expect(merged.defaultFileItem).toEqual({
			id: "id",
			name: "name",
			url: "fileUrl",
			path: "path",
			thumbUrl: "thumbUrl",
		});
	});
});
