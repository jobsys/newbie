export default {
	slug: "theme",
	component: "NewbieThemeProvider",
	title: "Theme 主题",
	description:
		"把密度、品牌主色、明暗模式映射到 antdv-next Design Token，并把当前 token 暴露成 --newbie-* CSS 变量，组件库自身的面板也会跟随。",
	category: "global",
	since: "4.0.0",
	notice: "antdv-next 1.8.1 的 ConfigProvider 在 theme 变化后不会重新生成组件样式，ThemeProvider 内部通过 key 重建子树；运行时切换主题会重置子树内的组件状态，建议在应用初始化或设置页切换。",
	whenToUse: [
		"需要统一控制紧凑 / 默认 / 宽松三种密度。",
		"需要品牌主色、暗色模式与组件库面板保持一致。",
		"已有自己的 ConfigProvider，只想复用主题计算逻辑。",
	],
	demos: [
		{
			id: "theme",
			title: "密度、主色与暗色",
			description:
				"外层控制 density / color-primary / scheme，内层 ThemeProvider 包裹一段组件，切换后所有 token 与组件库样式同步更新。",
			file: "provider/theme.vue",
		},
	],
	guide: {
		id: "factory",
		title: "只使用主题工厂",
		content:
			"如果项目已有自己的 `ConfigProvider`，可以直接使用 `createNewbieTheme()`：\n\n```js\nimport { createNewbieTheme } from \"jobsys-newbie\";\n\nconst { theme, config, cssVariables } = createNewbieTheme({\n  density: \"compact\",\n  colorPrimary: \"#c2410c\",\n  scheme: \"dark\",\n});\n```\n\n```vue\n<ConfigProvider :theme=\"theme\" v-bind=\"config\">\n  <div :style=\"{ display: 'contents', ...cssVariables }\">\n    <App />\n  </div>\n</ConfigProvider>\n```\n\n`createNewbieTheme` 返回的 `preset` 是当前密度预设，可用于调试。",
	},
	api: {
		props: [
			{
				name: "density",
				description: "密度预设",
				type: "`compact` | `default` | `loose`",
				default: "`default`",
			},
			{
				name: "colorPrimary",
				description: "品牌主色，其余梯度由算法派生",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "theme",
				description: "额外的 antdv-next theme 配置，与密度预设合并",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "locale",
				description: "antdv-next locale 对象",
				type: "`object`",
				default: "`null`",
			},
			{
				name: "scheme",
				description: "明暗模式",
				type: "`light` | `dark`",
				default: "`light`",
			},
			{
				name: "cssVar",
				description: "是否启用 CSS 变量，默认 { key: 'newbie' }",
				type: "`object` | `boolean`",
				default: "`null`",
			},
			{
				name: "tagGap",
				description: "Tag 间距，不传时跟随密度",
				type: "`number`",
				default: "`null`",
			},
			{
				name: "layer",
				description: "是否使用 @layer 降低 antd 样式优先级",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "hashPriority",
				description: "选择器优先级",
				type: "`string`",
				default: "`low`",
			},
		],
		events: [],
		slots: [{ name: "default", description: "应用内容" }],
		methods: [],
		types: [
			{
				id: "factory-options",
				title: "createNewbieTheme(options)",
				description: "主题工厂参数。",
				columns: ["参数", "说明", "类型", "默认值"],
				rows: [
					["density", "密度预设", "`compact` | `default` | `loose`", "`default`"],
					["colorPrimary", "品牌主色", "`string`", "-"],
					["token", "额外 token，优先级最高", "`object`", "-"],
					["components", "额外组件 token", "`object`", "-"],
					["algorithm", "覆盖密度预设的算法", "`array` | `Function`", "-"],
					["scheme", "明暗模式", "`light` | `dark`", "`light`"],
					["cssVar", "是否启用 CSS 变量", "`object` | `false`", "`{ key: 'newbie' }`"],
					["tagGap", "Tag 间距", "`number`", "跟随密度"],
				],
			},
			{
				id: "css-variables",
				title: "CSS 变量",
				description: "ThemeProvider 会把当前主题 token 与密度预设写成 CSS 变量。",
				columns: ["变量", "含义"],
				rows: [
					["`--newbie-padding-sm` / `--newbie-padding` / `--newbie-padding-lg`", "小 / 中 / 大间距"],
					["`--newbie-radius`", "圆角"],
					["`--newbie-control-height-sm`", "小号控件高度"],
					["`--newbie-table-pagination-height`", "分页行高"],
					["`--newbie-tag-gap`", "Tag 间距"],
					["`--newbie-color-bg-container`", "容器背景"],
					["`--newbie-color-border` / `--newbie-color-border-secondary`", "边框色"],
					["`--newbie-color-fill-alter`", "填充色"],
					["`--newbie-color-text` / `--newbie-color-text-secondary` / `--newbie-color-text-tertiary`", "文本层级"],
					["`--newbie-color-primary` / `--newbie-color-primary-bg`", "主色与主色浅背景"],
				],
			},
		],
	},
	faq: [
		{
			title: "切换主题后表单内容为什么被重置？",
			content:
				"这是 antdv-next 1.8.1 的限制：ConfigProvider 不会在 theme 变化后重新生成样式。ThemeProvider 用 key 重建子树来保证样式更新，因此子树内的组件状态会重置。建议在设置页或应用初始化时切换。",
		},
		{
			title: "密度预设具体改了什么？",
			content:
				"`compact` 使用 compactAlgorithm 并收敛 Table 单元格 padding；`default` 使用默认算法；`loose` 放大 `controlHeight`、字号、padding、圆角与 Table padding。主色与暗色由 antdv-next 算法派生。",
		},
		{
			title: "如何只改某个组件的 token？",
			content:
				"可以给 ThemeProvider 传 `:theme=\"{ components: { Table: { headerBg: '#fafafa' } } }\"`，或直接使用 `createNewbieTheme({ components: ... })`。密度预设中的 Table padding 会与自定义值合并。",
		},
	],
};
