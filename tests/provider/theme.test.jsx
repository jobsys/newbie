import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import NewbieApp from "../../components/provider/NewbieApp.jsx";
import NewbieThemeProvider from "../../components/provider/NewbieThemeProvider.jsx";
import { useNewbieTheme } from "../../components/provider/useNewbieTheme.js";
import {
	applyThemeVariables,
	createThemeVariables,
	NEWBIE_THEME_VARIABLES,
} from "../../components/provider/theme.js";

const ThemeProbe = defineComponent({
	setup() {
		const theme = useNewbieTheme();
		return () => h("div", { class: "probe" }, JSON.stringify(theme.density));
	},
});

describe("NewbieThemeProvider 的 remount", () => {
	it("默认不传 key，切换密度时子树状态保留", async () => {
		const density = ref("default");
		const mounted = { count: 0 };

		const Stateful = defineComponent({
			setup() {
				mounted.count += 1;
				const value = ref("kept");
				return () => h("span", { class: "state" }, value.value);
			},
		});

		const Host = defineComponent({
			setup: () => () =>
				h(NewbieThemeProvider, { density: density.value }, { default: () => h(Stateful) }),
		});

		const wrapper = mount(Host);
		expect(mounted.count).toBe(1);

		density.value = "compact";
		await nextTick();

		// 子树没有被重建，组件实例仍然是同一个
		expect(mounted.count).toBe(1);
		expect(wrapper.find(".state").text()).toBe("kept");
	});

	it("remount 为 true 时切换密度会重建子树", async () => {
		const density = ref("default");
		const mounted = { count: 0 };

		const Stateful = defineComponent({
			setup() {
				mounted.count += 1;
				return () => h("span", { class: "state" }, "ok");
			},
		});

		const Host = defineComponent({
			setup: () => () =>
				h(
					NewbieThemeProvider,
					{ density: density.value, remount: true },
					{ default: () => h(Stateful) }
				),
		});

		const wrapper = mount(Host);
		expect(mounted.count).toBe(1);

		density.value = "compact";
		await nextTick();

		// key 变化触发重建，组件被重新挂载
		expect(mounted.count).toBe(2);
		expect(wrapper.find(".state").text()).toBe("ok");
	});
});

describe("createThemeVariables", () => {
	it("覆盖表面 / 填充 / 文字 / 边框 / 主色 / 尺寸 / 阴影", () => {
		const token = {
			colorBgLayout: "#f5f5f5",
			colorBgContainer: "#ffffff",
			colorBgElevated: "#ffffff",
			colorBgSpotlight: "rgba(0,0,0,0.85)",
			colorFill: "rgba(0,0,0,0.15)",
			colorFillSecondary: "rgba(0,0,0,0.06)",
			colorFillTertiary: "rgba(0,0,0,0.04)",
			colorFillQuaternary: "rgba(0,0,0,0.02)",
			colorText: "rgba(0,0,0,0.88)",
			colorTextSecondary: "rgba(0,0,0,0.65)",
			colorTextTertiary: "rgba(0,0,0,0.45)",
			colorTextQuaternary: "rgba(0,0,0,0.25)",
			colorBorder: "#d9d9d9",
			colorBorderSecondary: "#f0f0f0",
			colorSplit: "rgba(5,5,5,0.06)",
			colorPrimary: "#1677ff",
			colorPrimaryHover: "#4096ff",
			colorPrimaryActive: "#0958d9",
			colorPrimaryBg: "#e6f4ff",
			colorPrimaryBorder: "#91caff",
			borderRadius: 6,
			borderRadiusLG: 8,
			controlHeight: 32,
			fontSize: 14,
			boxShadow: "0 6px 16px 0 rgba(0,0,0,0.08)",
			boxShadowSecondary: "0 6px 16px 0 rgba(0,0,0,0.08)",
		};

		const variables = createThemeVariables(token);

		expect(variables["--newbie-color-bg-layout"]).toBe("#f5f5f5");
		expect(variables["--newbie-color-bg-container"]).toBe("#ffffff");
		expect(variables["--newbie-color-bg-elevated"]).toBe("#ffffff");
		expect(variables["--newbie-color-bg-spotlight"]).toBe("rgba(0,0,0,0.85)");
		expect(variables["--newbie-color-fill"]).toBe("rgba(0,0,0,0.15)");
		expect(variables["--newbie-color-fill-secondary"]).toBe("rgba(0,0,0,0.06)");
		expect(variables["--newbie-color-fill-tertiary"]).toBe("rgba(0,0,0,0.04)");
		expect(variables["--newbie-color-fill-quaternary"]).toBe("rgba(0,0,0,0.02)");
		expect(variables["--newbie-color-text"]).toBe("rgba(0,0,0,0.88)");
		expect(variables["--newbie-color-text-secondary"]).toBe("rgba(0,0,0,0.65)");
		expect(variables["--newbie-color-text-tertiary"]).toBe("rgba(0,0,0,0.45)");
		expect(variables["--newbie-color-text-quaternary"]).toBe("rgba(0,0,0,0.25)");
		expect(variables["--newbie-color-border"]).toBe("#d9d9d9");
		expect(variables["--newbie-color-border-secondary"]).toBe("#f0f0f0");
		expect(variables["--newbie-color-split"]).toBe("rgba(5,5,5,0.06)");
		expect(variables["--newbie-color-primary"]).toBe("#1677ff");
		expect(variables["--newbie-color-primary-hover"]).toBe("#4096ff");
		expect(variables["--newbie-color-primary-active"]).toBe("#0958d9");
		expect(variables["--newbie-color-primary-bg"]).toBe("#e6f4ff");
		expect(variables["--newbie-color-primary-border"]).toBe("#91caff");
		expect(variables["--newbie-border-radius"]).toBe("6px");
		expect(variables["--newbie-border-radius-lg"]).toBe("8px");
		expect(variables["--newbie-control-height"]).toBe("32px");
		expect(variables["--newbie-font-size"]).toBe("14px");
		expect(variables["--newbie-box-shadow"]).toBe("0 6px 16px 0 rgba(0,0,0,0.08)");
		expect(variables["--newbie-box-shadow-secondary"]).toBe("0 6px 16px 0 rgba(0,0,0,0.08)");
	});

	it("保留旧的 --newbie-color-* 变量名", () => {
		expect(NEWBIE_THEME_VARIABLES["--newbie-color-bg-container"]).toBe("colorBgContainer");
		expect(NEWBIE_THEME_VARIABLES["--newbie-color-fill-alter"]).toBe("colorFillAlter");
		expect(NEWBIE_THEME_VARIABLES["--newbie-color-text-secondary"]).toBe("colorTextSecondary");
		expect(NEWBIE_THEME_VARIABLES["--newbie-color-primary-bg"]).toBe("colorPrimaryBg");
	});

	it("token 为空时返回空对象", () => {
		expect(createThemeVariables()).toEqual({});
	});
});

describe("applyThemeVariables", () => {
	it("把变量写到目标元素上", () => {
		const target = document.createElement("div");
		applyThemeVariables(target, {
			"--newbie-color-primary": "#1677ff",
			"--newbie-border-radius": "6px",
		});

		expect(target.style.getPropertyValue("--newbie-color-primary")).toBe("#1677ff");
		expect(target.style.getPropertyValue("--newbie-border-radius")).toBe("6px");
	});

	it("variables 为空时不做任何事", () => {
		const target = document.createElement("div");
		applyThemeVariables(target, {});
		applyThemeVariables(target, undefined);
		expect(target.getAttribute("style")).toBeFalsy();
	});

	it("目标元素不存在时不会抛异常", () => {
		expect(() => applyThemeVariables(null, { "--a": "b" })).not.toThrow();
	});
});

describe("NewbieThemeProvider 的 :root CSS 变量", () => {
	it("变量同时写到 :root，卸载后移除", async () => {
		const Host = defineComponent({
			setup: () => () => h(NewbieThemeProvider, null, { default: () => h("span", "ok") }),
		});

		const wrapper = mount(Host);
		await nextTick();

		// teleport 到 body 的弹层读不到 Provider 子树，必须依赖 :root 上的副本
		const root = document.documentElement;
		expect(root.style.getPropertyValue("--newbie-color-bg-elevated")).toBeTruthy();
		expect(root.style.getPropertyValue("--newbie-tag-gap")).toBeTruthy();

		wrapper.unmount();
		expect(root.style.getPropertyValue("--newbie-color-bg-elevated")).toBe("");
	});
});

describe("useNewbieTheme", () => {
	it("没有 Provider 时返回安全默认值", () => {
		const wrapper = mount(ThemeProbe);
		expect(wrapper.find(".probe").text()).toBe('"default"');
	});

	it("Provider 内读到当前密度与主色", () => {
		let captured = null;

		const Capture = defineComponent({
			setup() {
				captured = useNewbieTheme();
				return () => h("span", { class: "capture" }, "ok");
			},
		});

		const Host = defineComponent({
			setup: () => () =>
				h(
					NewbieThemeProvider,
					{ density: "compact", colorPrimary: "#c2410c" },
					{ default: () => h(Capture) }
				),
		});

		mount(Host);
		expect(captured.density).toBe("compact");
		expect(captured.scheme).toBe("light");
		expect(captured.colorPrimary).toBe("#c2410c");
		expect(captured.token.colorPrimary).toBe("#c2410c");
		expect(captured.theme.token).toBeTruthy();
	});

	it("返回只读对象", () => {
		let captured = null;

		const Capture = defineComponent({
			setup() {
				captured = useNewbieTheme();
				return () => h("span", { class: "capture" }, "ok");
			},
		});

		const Host = defineComponent({
			setup: () => () => h(NewbieThemeProvider, null, { default: () => h(Capture) }),
		});

		mount(Host);
		expect(captured).toBeTruthy();
		expect(captured.density).toBe("default");
		// readonly 写入只会告警，值保持不变
		captured.density = "compact";
		expect(captured.density).toBe("default");
	});
});

describe("NewbieApp", () => {
	it("组合主题、配置与 antdv-next App 并渲染内容", () => {
		const wrapper = mount(NewbieApp, {
			props: { density: "compact", colorPrimary: "#c2410c" },
			slots: { default: () => h("span", { class: "content" }, "hello") },
		});

		expect(wrapper.find(".content").text()).toBe("hello");
		// antdv-next 的 App 会渲染 ant-app 容器
		expect(wrapper.find(".ant-app").exists()).toBe(true);
	});

	it("内部提供主题上下文", () => {
		const wrapper = mount(NewbieApp, {
			props: { density: "loose" },
			slots: { default: () => h(ThemeProbe) },
		});

		expect(wrapper.find(".probe").text()).toBe('"loose"');
	});
});
