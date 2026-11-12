import { computed, defineComponent, onUnmounted, provide, watchEffect } from "vue";
import { ConfigProvider, StyleProvider, theme as antdTheme } from "antdv-next";
import { applyThemeVariables, createNewbieTheme, createThemeVariables } from "./theme.js";
import { NEWBIE_THEME_CONTEXT } from "./useNewbieTheme.js";
import withInstall from "../../utils/withInstall";

/**
 * 把 antdv-next 当前主题的 token 暴露成 --newbie-* CSS 变量，
 * 让组件库自己的 less（表格容器、搜索栏等）也能跟随密度/主色/暗色主题。
 *
 * 同时向子树提供主题上下文（density / scheme / colorPrimary / token / theme），
 * 业务组件可以通过 useNewbieTheme() 读取当前主题。
 *
 * display: contents 不产生额外布局盒，只负责传递 CSS 变量。
 *
 * 变量同时写到 :root：dropdown / popover / modal 等弹层默认 teleport 到 body，
 * 只挂在 Provider 子树上的话弹层拿不到变量，less 会回落到写死的浅色兜底值。
 */
const ThemeVariables = defineComponent({
	name: "NewbieThemeVariables",
	props: {
		/**
		 * 密度预设产生的 CSS 变量
		 */
		variables: { type: Object, default: () => ({}) },

		/**
		 * 当前密度
		 */
		density: { type: String, default: "default" },

		/**
		 * 当前明暗模式
		 */
		scheme: { type: String, default: "light" },

		/**
		 * 传入的品牌主色
		 */
		colorPrimary: { type: String, default: "" },

		/**
		 * 传给 ConfigProvider 的 theme 配置
		 */
		theme: { type: Object, default: () => ({}) },
	},
	setup(props, { slots }) {
		const { token } = antdTheme.useToken();

		const themeVariables = computed(() => ({
			...props.variables,
			...createThemeVariables(token.value),
		}));

		const appliedNames = new Set();

		watchEffect(() => {
			if (typeof document === "undefined") {
				return;
			}
			applyThemeVariables(document.documentElement, themeVariables.value);
			Object.keys(themeVariables.value).forEach(name => appliedNames.add(name));
		});

		onUnmounted(() => {
			if (typeof document === "undefined") {
				return;
			}
			appliedNames.forEach(name => document.documentElement.style.removeProperty(name));
			appliedNames.clear();
		});

		provide(NEWBIE_THEME_CONTEXT, {
			get density() {
				return props.density;
			},
			get scheme() {
				return props.scheme;
			},
			get colorPrimary() {
				return token.value.colorPrimary || props.colorPrimary;
			},
			get token() {
				return token.value;
			},
			get theme() {
				return props.theme;
			},
		});

		return () => (
			<div
				class="newbie-theme"
				style={{
					display: "contents",
					...themeVariables.value,
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
 *
 * ## 主题切换的两种模式
 *
 * - 默认（`remount` 为 false）：不传 key，交给 antdv-next 的 cssVar 机制热更新。
 *   切换密度 / 主色 / 暗色不会重建子树，业务状态（表单内容、展开状态等）得以保留。
 * - `remount` 为 true：给 ConfigProvider 传 key，主题变化时重建整棵子树。
 *   这是 antdv-next 1.8.1 下样式一定刷新的兜底手段，代价是子树内的业务状态会被重置，
 *   只适合在应用初始化或设置页切换。
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

		/**
		 * 主题变化时是否用 key 重建整棵子树。
		 *
		 * 默认 false：走 cssVar 热更新，子树内的业务状态不会重置。
		 * 设为 true 时重建子树，可保证 antdv-next 1.8.1 下样式一定刷新，
		 * 但子树内的表单内容、展开状态等业务状态会被清空。
		 */
		remount: { type: Boolean, default: false },
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
		// 只有显式开启 remount 时才使用，避免默认重建子树导致业务状态被重置。
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

		const configProviderProps = computed(() => ({
			...(props.remount ? { key: themeKey.value } : {}),
			theme: resolved.value.theme,
			locale: props.locale || undefined,
			tag: resolved.value.config.tag,
		}));

		return () => (
			<StyleProvider layer={props.layer} hashPriority={props.hashPriority}>
				<ConfigProvider {...configProviderProps.value}>
					<ThemeVariables
						variables={resolved.value.cssVariables}
						density={props.density}
						scheme={props.scheme}
						colorPrimary={props.colorPrimary}
						theme={resolved.value.theme}
					>
						{slots.default?.()}
					</ThemeVariables>
				</ConfigProvider>
			</StyleProvider>
		);
	},
});

export default withInstall(NewbieThemeProvider);
