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

	const presetAlgorithms = Array.isArray(preset.algorithm) ? preset.algorithm : [preset.algorithm];
	const mergedAlgorithms =
		scheme === "dark"
			? [antdTheme.darkAlgorithm, ...presetAlgorithms.filter(item => item !== antdTheme.defaultAlgorithm)]
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
