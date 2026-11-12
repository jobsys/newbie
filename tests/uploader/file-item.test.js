import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { defaultFileItem } from "../../components/uploader/config.js";
import { toActualNames } from "../../components/uploader/utils.js";
import NewbieUploader from "../../components/uploader/NewbieUploader.jsx";

const NEWBIE_CONFIG = Symbol.for("jobsys-newbie.config");

describe("uploader 文件字段映射", () => {
	it("默认映射保持标准字段名不变", () => {
		const source = {
			id: 1,
			name: "a.png",
			url: "https://x/a.png",
			path: "p/a.png",
			thumbUrl: "https://x/a.png?thumb",
		};

		const result = toActualNames(source);
		expect(result).toEqual({ ...source });
		expect(result).not.toBe(source);
	});

	it("跳过未定义的标准字段", () => {
		expect(toActualNames({ url: "https://x/a.png" }, defaultFileItem)).toEqual({
			url: "https://x/a.png",
		});
	});

	it("改名为 fileUrl 后只写实际字段名", () => {
		const result = toActualNames(
			{ url: "https://x/a.png", name: "a.png" },
			{ url: "fileUrl" }
		);

		expect(result).toEqual({ fileUrl: "https://x/a.png" });
		expect(result).not.toHaveProperty("url");
	});
});

describe("NewbieUploader 文件字段映射", () => {
	it("Provider 改名后 update:value 带实际字段名", async () => {
		const wrapper = mount(NewbieUploader, {
			props: {
				value: { url: "https://x/a.png", name: "a.png", path: "p/a.png" },
			},
			global: {
				provide: {
					[NEWBIE_CONFIG]: {
						uploader: { defaultFileItem: { url: "fileUrl" } },
					},
				},
			},
		});
		await nextTick();

		const emitted = wrapper.emitted("update:value");
		expect(emitted).toBeTruthy();

		const payload = emitted.at(-1)[0];
		expect(payload).toMatchObject({
			fileUrl: "https://x/a.png",
			name: "a.png",
			path: "p/a.png",
			_type: "file",
		});
		expect(payload).not.toHaveProperty("url");

		wrapper.unmount();
	});

	it("传入实际字段名时同样保留 fileUrl", async () => {
		const wrapper = mount(NewbieUploader, {
			props: {
				value: { fileUrl: "https://x/b.png", name: "b.png", path: "p/b.png" },
			},
			global: {
				provide: {
					[NEWBIE_CONFIG]: {
						uploader: { defaultFileItem: { url: "fileUrl" } },
					},
				},
			},
		});
		await nextTick();

		const payload = wrapper.emitted("update:value").at(-1)[0];
		expect(payload.fileUrl).toBe("https://x/b.png");

		wrapper.unmount();
	});
});
