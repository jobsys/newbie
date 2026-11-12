import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import { ConfigProvider, theme as antdTheme } from "antdv-next";
import { NewbieFormDesigner } from "../../components/form-designer/index.js";

const LESS_PATH = resolve(process.cwd(), "components/form-designer/index.less");

const mountDesigner = scheme =>
	mount(ConfigProvider, {
		props: {
			theme: {
				algorithm: scheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
			},
		},
		slots: {
			default: () => h(NewbieFormDesigner, { formItems: [] }),
		},
	});

const rootStyle = wrapper => wrapper.find("style").text();

describe("FormDesigner 暗色模式", () => {
	it("把主题变量写到 :root，teleport 到 body 的弹窗/抽屉也能继承", () => {
		const style = rootStyle(mountDesigner("dark"));
		expect(style).toContain(":root{");
		expect(style).toContain("--newbie-color-bg-container:#141414");
		expect(style).toContain("--newbie-color-bg-layout:#000000");
	});

	it("暗色模式下语义色、阴影同样跟随 token", () => {
		const style = rootStyle(mountDesigner("dark"));
		expect(style).toContain("--newbie-color-error:");
		expect(style).toContain("--newbie-color-success:");
		expect(style).toContain("--newbie-color-text-light-solid:#fff");
		expect(style).toContain("--newbie-box-shadow-tertiary:");
	});

	it("浅色模式使用浅色 token", () => {
		const style = rootStyle(mountDesigner("light"));
		expect(style).toContain("--newbie-color-bg-container:#ffffff");
		expect(style).toContain("--newbie-color-bg-layout:#f5f5f5");
	});

	it("设计器样式不再写死颜色（除 var() 兜底值外）", () => {
		const less = readFileSync(LESS_PATH, "utf-8");
		// 去掉 var(--xxx, #fff) 里的兜底值，剩下的十六进制颜色都是写死的
		const withoutFallback = less.replace(/var\([^)]*\)/g, "");
		const hardCoded = withoutFallback.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
		expect(hardCoded).toEqual([]);
	});
});
