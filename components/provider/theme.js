import { merge } from "lodash-es";
import { theme as antdTheme } from "antdv-next";

/**
 * 新必（newbie）的密度预设。
 *
 * 目标：把「紧凑 / 默认 / 宽松」以及主色等视觉决策收敛到 antdv-next 的
 * Design Token 体系里，而不是在各个组件里写死 px。
 *
 * - compact：使用 antd 的 compactAlgorithm，并收敛 Table 单元格 padding
 * - default：antd 默认算法
 * - loose：在默认算法上放大控件高度、间距、圆角
 */
export const NEWBIE_DENSITIES = ["compact", "default", "loose"];

export const NEWBIE_DENSITY_PRESETS = {
	compact: {
		algorithm: [antdTheme.compactAlgorithm],
		token: {
			controlHeight: 28,
			fontSize: 14,
		},
		table: {
			cellPaddingBlock: 8,
			cellPaddingInline: 8,
			cellPaddingBlockMD: 8,
			cellPaddingInlineMD: 8,
		},
		tagGap: 6,
		spaceSM: 8,
		spaceMD: 12,
		radius: 6,
		controlHeightSM: 22,
	},
	default: {
		algorithm: [antdTheme.defaultAlgorithm],
		token: {},
		table: {
			cellPaddingBlock: 12,
			cellPaddingInline: 12,
			cellPaddingBlockMD: 12,
			cellPaddingInlineMD: 12,
		},
		tagGap: 8,
		spaceSM: 12,
		spaceMD: 16,
		radius: 8,
		controlHeightSM: 24,
	},
	loose: {
		algorithm: [antdTheme.defaultAlgorithm],
		token: {
			controlHeight: 40,
			controlHeightLG: 48,
			controlHeightSM: 32,
			fontSize: 15,
			padding: 24,
			paddingLG: 32,
			paddingSM: 16,
			margin: 24,
			borderRadius: 10,
		},
		table: {
			cellPaddingBlock: 18,
			cellPaddingInline: 16,
			cellPaddingBlockMD: 18,
			cellPaddingInlineMD: 16,
		},
		tagGap: 10,
		spaceSM: 16,
		spaceMD: 24,
		radius: 10,
		controlHeightSM: 32,
	},
};

/**
 * 对外暴露的 CSS 变量清单：变量名 -> antdv-next token 名。
 *
 * - 名称统一使用 --newbie-* 前缀，与组件库自身 less 里引用的变量一致。
 * - 旧的 --newbie-color-* 变量名保留，避免既有样式失效。
 * - 取值全部来自 antdv-next 的 token，暗色模式由算法自动派生，不需要写死颜色。
 */
export const NEWBIE_THEME_VARIABLES = {
	// 表面
	"--newbie-color-bg-layout": "colorBgLayout",
	"--newbie-color-bg-container": "colorBgContainer",
	"--newbie-color-bg-elevated": "colorBgElevated",
	"--newbie-color-bg-spotlight": "colorBgSpotlight",
	// 填充
	"--newbie-color-fill": "colorFill",
	"--newbie-color-fill-secondary": "colorFillSecondary",
	"--newbie-color-fill-tertiary": "colorFillTertiary",
	"--newbie-color-fill-quaternary": "colorFillQuaternary",
	// 兼容旧变量名
	"--newbie-color-fill-alter": "colorFillAlter",
	// 文字
	"--newbie-color-text": "colorText",
	"--newbie-color-text-secondary": "colorTextSecondary",
	"--newbie-color-text-tertiary": "colorTextTertiary",
	"--newbie-color-text-quaternary": "colorTextQuaternary",
	// 边框
	"--newbie-color-border": "colorBorder",
	"--newbie-color-border-secondary": "colorBorderSecondary",
	"--newbie-color-split": "colorSplit",
	// 主色
	"--newbie-color-primary": "colorPrimary",
	"--newbie-color-primary-hover": "colorPrimaryHover",
	"--newbie-color-primary-active": "colorPrimaryActive",
	"--newbie-color-primary-bg": "colorPrimaryBg",
	"--newbie-color-primary-bg-hover": "colorPrimaryBgHover",
	"--newbie-color-primary-border": "colorPrimaryBorder",
	// 尺寸
	"--newbie-border-radius": "borderRadius",
	"--newbie-border-radius-lg": "borderRadiusLG",
	"--newbie-control-height": "controlHeight",
	"--newbie-font-size": "fontSize",
	// 阴影
	"--newbie-box-shadow": "boxShadow",
	"--newbie-box-shadow-secondary": "boxShadowSecondary",
};

/**
 * 把 antdv-next 的 token 转成 --newbie-* CSS 变量表。
 *
 * @param {Object} [token] antdv-next 的 token 对象
 * @return {Object} CSS 变量名 -> 值
 */
export function createThemeVariables(token) {
	const variables = {};
	if (!token) {
		return variables;
	}
	for (const [name, tokenName] of Object.entries(NEWBIE_THEME_VARIABLES)) {
		const value = token[tokenName];
		if (value === undefined || value === null) {
			continue;
		}
		// token 里的尺寸类字段是数字，CSS 变量需要带单位
		variables[name] = typeof value === "number" ? `${value}px` : String(value);
	}
	return variables;
}

/**
 * 把 CSS 变量写入指定的 DOM 元素。
 *
 * ThemeProvider 内的变量只作用于 ConfigProvider 子树；需要让变量作用到
 * :root 或任意容器时，用这个函数把变量挂到对应元素上。
 *
 * @param {HTMLElement} [target] 目标 DOM 元素，如 document.documentElement
 * @param {Object} [variables] CSS 变量名 -> 值
 * @return {void}
 */
export function applyThemeVariables(target, variables) {
	if (!target || !target.style || !variables) {
		return;
	}
	for (const [name, value] of Object.entries(variables)) {
		if (value === undefined || value === null) {
			continue;
		}
		target.style.setProperty(name, String(value));
	}
}

/**
 * 生成 antdv-next 的 theme 配置，以及需要挂到 ConfigProvider 上的组件级配置
 *
 * @param {Object} [options]
 * @param {"compact"|"default"|"loose"} [options.density="default"]
 * @param {String} [options.colorPrimary] 品牌主色
 * @param {Object} [options.token] 额外 token，优先级最高
 * @param {Object} [options.components] 额外组件 token，会和密度预设合并
 * @param {Array|Function} [options.algorithm] 覆盖密度预设的算法
 * @param {Object|false} [options.cssVar={key: "newbie"}] 是否启用 CSS 变量
 * @param {Number} [options.tagGap] Tag 之间的间距，默认跟随密度
 * @return {{ theme: Object, config: Object, preset: Object }}
 */
export function createNewbieTheme(options = {}) {
	const {
		density = "default",
		colorPrimary,
		token,
		components,
		algorithm,
		scheme = "light",
		cssVar = { key: "newbie" },
		tagGap,
	} = options;

	const preset = NEWBIE_DENSITY_PRESETS[density] || NEWBIE_DENSITY_PRESETS.default;

	const presetAlgorithms = Array.isArray(preset.algorithm)
		? preset.algorithm
		: [preset.algorithm];
	const mergedAlgorithms =
		scheme === "dark"
			? [
					antdTheme.darkAlgorithm,
					...presetAlgorithms.filter(item => item !== antdTheme.defaultAlgorithm),
				]
			: presetAlgorithms;

	const theme = {
		algorithm: algorithm || mergedAlgorithms,
		token: {
			...preset.token,
			...(colorPrimary ? { colorPrimary } : {}),
			...token,
		},
		components: merge({ Table: preset.table }, components || {}),
	};

	if (cssVar) {
		theme.cssVar = cssVar;
	}

	const cssVariables = {
		"--newbie-padding-sm": `${preset.spaceSM}px`,
		"--newbie-padding": `${preset.spaceMD}px`,
		"--newbie-padding-lg": `${preset.spaceMD + preset.spaceSM}px`,
		"--newbie-radius": `${preset.radius}px`,
		"--newbie-control-height-sm": `${preset.controlHeightSM}px`,
		"--newbie-table-pagination-height": `calc(${preset.controlHeightSM}px + 26px)`,
		"--newbie-tag-gap": `${tagGap ?? preset.tagGap}px`,
	};

	return {
		theme,
		config: {
			tag: {
				styles: {
					root: {
						marginInlineEnd: `${tagGap ?? preset.tagGap}px`,
					},
				},
			},
		},
		cssVariables,
		preset,
	};
}
