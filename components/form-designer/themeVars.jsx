import { computed, defineComponent } from "vue";
import { theme as antdTheme } from "antdv-next";

/**
 * 表单设计器用到的 CSS 变量 -> antdv-next token 名。
 *
 * 设计器不依赖 NewbieThemeProvider 一定提供某几个变量：
 * 这里直接从当前 ConfigProvider 的 token 生成，保证
 * - 只包了 antd ConfigProvider（scheme=dark）时也能变暗；
 * - 没有包任何 Provider 时回落到 antd 默认浅色；
 * - 变量值与 Provider 生成的 --newbie-* 完全一致，不会互相打架。
 */
export const DESIGNER_THEME_VARIABLES = {
	// 背景层级
	"--newbie-color-bg-layout": "colorBgLayout",
	"--newbie-color-bg-container": "colorBgContainer",
	"--newbie-color-bg-elevated": "colorBgElevated",
	"--newbie-color-bg-spotlight": "colorBgSpotlight",
	// 边框
	"--newbie-color-border": "colorBorder",
	"--newbie-color-border-secondary": "colorBorderSecondary",
	// 填充层级
	"--newbie-color-fill": "colorFill",
	"--newbie-color-fill-secondary": "colorFillSecondary",
	"--newbie-color-fill-tertiary": "colorFillTertiary",
	"--newbie-color-fill-alter": "colorFillAlter",
	// 文本层级
	"--newbie-color-text": "colorText",
	"--newbie-color-text-secondary": "colorTextSecondary",
	"--newbie-color-text-tertiary": "colorTextTertiary",
	"--newbie-color-text-quaternary": "colorTextQuaternary",
	"--newbie-color-text-light-solid": "colorTextLightSolid",
	// 主色
	"--newbie-color-primary": "colorPrimary",
	"--newbie-color-primary-bg": "colorPrimaryBg",
	"--newbie-color-primary-border": "colorPrimaryBorder",
	// 语义色
	"--newbie-color-error": "colorError",
	"--newbie-color-error-bg": "colorErrorBg",
	"--newbie-color-error-border": "colorErrorBorder",
	"--newbie-color-success": "colorSuccess",
	"--newbie-color-success-bg": "colorSuccessBg",
	"--newbie-color-warning": "colorWarning",
	"--newbie-color-warning-bg": "colorWarningBg",
	"--newbie-color-info-bg": "colorInfoBg",
	"--newbie-color-info-border": "colorInfoBorder",
	// 阴影
	"--newbie-box-shadow-tertiary": "boxShadowTertiary",
	"--newbie-box-shadow-card": "boxShadowCard",
};

/**
 * 把 antdv-next 的 token 转成设计器使用的 CSS 变量表。
 *
 * @param {Object} token antdv-next 的 token 对象
 * @return {Object} CSS 变量名 -> 取值
 */
export function createDesignerThemeVars(token) {
	const variables = {};
	if (!token) {
		return variables;
	}
	for (const [name, tokenName] of Object.entries(DESIGNER_THEME_VARIABLES)) {
		const value = token[tokenName];
		if (value !== undefined && value !== null) {
			variables[name] = value;
		}
	}
	return variables;
}

/**
 * 把变量表转成一段 CSS 声明。
 *
 * @param {Object} variables CSS 变量表
 * @return {String}
 */
export function themeVarsToCss(variables) {
	return Object.entries(variables)
		.map(([name, value]) => `${name}:${value};`)
		.join("");
}

/**
 * 设计器主题作用域。
 *
 * 变量同时写到 :root 和设计器根节点上：
 * - 根节点：保证设计器内部（含属性面板）拿到当前主题；
 * - :root：Modal / Drawer 会 teleport 到 body，只有写在 :root 上才能被它们继承，
 *   否则「设置选项」「表单逻辑」「公式帮助」等弹层在暗色模式下仍是浅色。
 */
export const DesignerThemeScope = defineComponent({
	name: "DesignerThemeScope",
	setup(_, { slots }) {
		const { token } = antdTheme.useToken();

		const variables = computed(() => createDesignerThemeVars(token.value));
		const rootStyle = computed(() => `:root{${themeVarsToCss(variables.value)}}`);

		return () => (
			<>
				<style>{rootStyle.value}</style>
				{slots.default?.()}
			</>
		);
	},
});
