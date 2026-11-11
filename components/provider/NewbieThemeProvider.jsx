import { computed, defineComponent } from "vue";
import { ConfigProvider, StyleProvider, theme as antdTheme } from "antdv-next";
import { createNewbieTheme } from "./theme.js";
import withInstall from "../../utils/withInstall";

/**
 * 把 antdv-next 当前主题的 token 暴露成 --newbie-* CSS 变量，
 * 让组件库自己的 less（表格容器、搜索栏等）也能跟随密度/主色/暗色主题。
 *
 * display: contents 不产生额外布局盒，只负责传递 CSS 变量。
 */
const ThemeVariables = defineComponent({
	name: "NewbieThemeVariables",
	props: {
		variables: { type: Object, default: () => ({}) },
	},
	setup(props, { slots }) {
		const { token } = antdTheme.useToken();

		return () => (
			<div
				class="newbie-theme"
				style={{
					display: "contents",
					...props.variables,
					"--newbie-color-bg-container": token.value.colorBgContainer,
					"--newbie-color-border-secondary": token.value.colorBorderSecondary,
					"--newbie-color-border": token.value.colorBorder,
					"--newbie-color-fill-alter": token.value.colorFillAlter,
					"--newbie-color-text": token.value.colorText,
					"--newbie-color-text-secondary": token.value.colorTextSecondary,
					"--newbie-color-text-tertiary": token.value.colorTextTertiary,
					"--newbie-color-primary": token.value.colorPrimary,
					"--newbie-color-primary-bg": token.value.colorPrimaryBg,
				}}
			>
				{slots.default?.()}
			</div>
		);
	},
});

/**
 * 主题算法是通过函数引用的（如 [antdTheme.defaultAlgorithm]），
 * JSON.stringify 会把函数序列化成 null，导致 themeKey 不随算法切换变化。
 * 对函数取名称/源码作为稳定标识，数组则逐项序列化。
 */
const serializeThemeValue = value => {
	if (typeof value === "function") {
		return value.name || String(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map(serializeThemeValue).join(",")}]`;
	}
	return JSON.stringify(value ?? null);
};

/**
 * 统一主题入口
 *
 * 把密度、主色、Tag 间距等视觉决策收敛到 antdv-next 的 Design Token，
 * 业务侧只需要切换 `density` / `colorPrimary`，不需要再写 px 或覆盖 `.ant-*`。
 *
 * 如果项目已经有自己的 ConfigProvider，也可以直接用 `createNewbieTheme()`
 * 返回的 `{ theme, config }`，把 theme 传给 ConfigProvider、config 展开即可。
 */
const NewbieThemeProvider = defineComponent({
	name: "NewbieThemeProvider",
	props: {
		/**
		 * 密度：compact / default / loose
		 */
		density: { type: String, default: "default" },

		/**
		 * 品牌主色
		 */
		colorPrimary: { type: String, default: "" },

		/**
		 * 额外的 theme 配置，会与密度预设合并
		 */
		theme: { type: Object, default: () => ({}) },

		/**
		 * antdv-next 的 locale 对象
		 */
		locale: { type: Object, default: null },

		/**
		 * 明暗模式：light / dark
		 */
		scheme: { type: String, default: "light" },

		/**
		 * 是否启用 CSS 变量；默认启用，便于业务侧用 var(--ant-*) 做主题适配
		 */
		cssVar: { type: [Object, Boolean], default: null },

		/**
		 * Tag 之间的间距；不传则跟随密度预设
		 */
		tagGap: { type: Number, default: null },

		/**
		 * 使用 @layer 降低 antd 样式优先级
		 */
		layer: { type: Boolean, default: false },

		/**
		 * 是否用 :where 降低选择器优先级，默认 low
		 */
		hashPriority: { type: String, default: "low" },
	},
	setup(props, { slots }) {
		const resolved = computed(() => {
			const base = props.theme || {};
			return createNewbieTheme({
				...base,
				density: props.density || base.density,
				colorPrimary: props.colorPrimary || base.colorPrimary,
				scheme: props.scheme || base.scheme,
				tagGap: props.tagGap ?? base.tagGap,
				cssVar: props.cssVar ?? base.cssVar ?? { key: "newbie" },
			});
		});

		// antdv-next 1.8.1 的 ConfigProvider 在主题对象变化后不会重新生成组件样式，
		// 用 themeKey 触发 ConfigProvider 重挂载，保证密度/主色可以运行时切换。
		// 注意：切换主题会重建子树（业务状态会重置），建议在设置页或应用初始化时切换。
		const themeKey = computed(() => {
			const { theme } = resolved.value;
			return [
				props.density,
				props.colorPrimary,
				props.scheme,
				JSON.stringify(theme.token || {}),
				JSON.stringify(theme.components || {}),
				serializeThemeValue(theme.algorithm),
			].join("|");
		});

		return () => (
			<StyleProvider layer={props.layer} hashPriority={props.hashPriority}>
				<ConfigProvider
					key={themeKey.value}
					theme={resolved.value.theme}
					locale={props.locale || undefined}
					tag={resolved.value.config.tag}
				>
					<ThemeVariables variables={resolved.value.cssVariables}>
						{slots.default?.()}
					</ThemeVariables>
				</ConfigProvider>
			</StyleProvider>
		);
	},
});

export default withInstall(NewbieThemeProvider);
