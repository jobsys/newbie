import { defineComponent } from "vue";
import { App as AntdApp } from "antdv-next";
import NewbieProvider from "./NewbieProvider.jsx";
import NewbieThemeProvider from "./NewbieThemeProvider.jsx";
import withInstall from "../../utils/withInstall";

/**
 * 应用外壳
 *
 * 把「样式层 + 主题 + 全局配置 + antdv-next App」一次性组合好，
 * 业务侧只需要在根组件包一层：
 *
 * ```vue
 * <NewbieApp :config="providerConfig" density="compact" color-primary="#c2410c">
 *   <RouterView />
 * </NewbieApp>
 * ```
 *
 * 各层职责：
 * - StyleProvider：@layer 与选择器优先级
 * - ConfigProvider：密度、主色、明暗模式与 antdv-next locale
 * - NewbieProvider：组件库的全局配置与 vue-i18n 语言
 * - a-app：antdv-next 的运行时样式容器（message / notification / modal 的挂载点）
 *
 * 不额外包一层有布局意义的 div，主题变量由 display: contents 的节点承载。
 */
const NewbieApp = defineComponent({
	name: "NewbieApp",
	props: {
		/**
		 * 密度预设：compact / default / loose
		 */
		density: { type: String, default: "default" },

		/**
		 * 品牌主色
		 */
		colorPrimary: { type: String, default: "" },

		/**
		 * 明暗模式：light / dark
		 */
		scheme: { type: String, default: "light" },

		/**
		 * 额外的 theme 配置，会与密度预设合并
		 */
		theme: { type: Object, default: () => ({}) },

		/**
		 * antdv-next 的 locale 对象
		 */
		locale: { type: Object, default: null },

		/**
		 * 组件库内部 i18n 的语言；留空表示不修改宿主语言
		 */
		configLocale: { type: String, default: "" },

		/**
		 * 传给 NewbieProvider 的全局配置
		 */
		config: { type: Object, default: () => ({}) },

		/**
		 * 使用 @layer 降低 antd 样式优先级
		 */
		layer: { type: Boolean, default: false },

		/**
		 * 是否用 :where 降低选择器优先级，默认 low
		 */
		hashPriority: { type: String, default: "low" },

		/**
		 * 主题变化时是否用 key 重建整棵子树，默认走 cssVar 热更新
		 */
		remount: { type: Boolean, default: false },
	},
	setup(props, { slots }) {
		return () => (
			<NewbieThemeProvider
				density={props.density}
				colorPrimary={props.colorPrimary}
				scheme={props.scheme}
				theme={props.theme}
				locale={props.locale}
				layer={props.layer}
				hashPriority={props.hashPriority}
				remount={props.remount}
			>
				<NewbieProvider config={props.config} locale={props.configLocale}>
					<AntdApp>{slots.default?.()}</AntdApp>
				</NewbieProvider>
			</NewbieThemeProvider>
		);
	},
});

export default withInstall(NewbieApp);
