export default {
	slug: "provider",
	component: "NewbieProvider",
	title: "Provider 全局配置",
	description:
		"以命名空间覆盖包的形式向所有组件提供全局默认值。组件默认值 < 全局配置 < 实例 props，支持响应式异步配置。",
	category: "global",
	since: "4.0.0",
	whenToUse: [
		"项目需要统一修改表格分页参数、上传地址、表单格式等默认行为。",
		"配置需要从接口异步加载，并在到达后自动生效。",
		"希望新增组件时不再修改 Provider 的参数清单。",
	],
	demos: [
		{
			id: "config",
			title: "覆盖组件默认值",
			description:
				"这里的 table.pageSize 改为 4、pageSizeKey 改为 page_size，只影响 Provider 子树内的表格。",
			file: "provider/config.vue",
		},
	],
	guide: {
		id: "priority",
		title: "优先级与合并规则",
		content:
			'```\n组件默认值（components/<组件>/config.js）\n        ↓ 被覆盖\nNewbieProvider 的 config[命名空间]\n        ↓ 被覆盖\n组件实例 props\n```\n\n- 普通对象递归合并，数组、函数、null、标量整体替换。\n- `undefined` 视为未传，不会覆盖已有值。\n- 实例 props 整体覆盖全局值，不做深合并。\n- 配置是响应式的：初始化后异步替换 `config`，组件会自动生效。\n\n```vue\n<template>\n  <NewbieProvider :config="config">\n    <App />\n  </NewbieProvider>\n</template>\n\n<script setup>\nimport { reactive } from "vue";\n\nconst config = reactive({});\n\nfetch("/api/ui-config")\n  .then(res => res.json())\n  .then(data => Object.assign(config, data));\n</script>\n```',
	},
	api: {
		props: [
			{
				name: "config",
				description: "任意命名空间的覆盖包，key 由组件自己定义",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "locale",
				description: "vue-i18n 语言；留空表示不修改宿主语言",
				type: "`string`",
				default: '`""`',
			},
			{
				name: "table / uploader / form / search / editor",
				description: "旧版顶层配置，仍可用一个版本，会输出弃用警告；新代码请使用 config",
				type: "`object`",
				default: "`undefined`",
			},
		],
		events: [],
		slots: [{ name: "default", description: "应用内容" }],
		methods: [],
		types: [
			{
				id: "namespaces",
				title: "内置命名空间",
				description: "完整配置项见各组件文档的“全局配置”章节。",
				columns: ["命名空间", "对应组件", "常用配置"],
				rows: [
					[
						"table",
						"NewbieTable",
						"`pageSize`、`pageKey`、`pageSizeKey`、`afterFetched`、`persistence`",
					],
					[
						"uploader",
						"NewbieUploader / 表单 uploader 字段",
						"`uploadUrl`、`defaultFileItem`、`defaultPreview`",
					],
					["form", "NewbieForm", "`format`、`afterFetched`、`columns`"],
					["search", "NewbieSearch", "`maskClass`、`inputClass`、`valueFormatter`"],
					["editor", "NewbieEditor", "`uploadUrl`"],
					["theme", "NewbieThemeProvider", "由 Theme Provider 单独处理，见主题文档"],
				],
			},
		],
	},
	faq: [
		{
			title: "旧写法还能用吗？",
			content:
				'`<NewbieProvider :table="{ pageSize: 50 }">` 仍然可用一个版本，但会输出弃用警告；`config` 优先于旧 props。迁移时改为 `:config="{ table: { pageSize: 50 } }"`。',
		},
		{
			title: "为什么 locale 默认不生效？",
			content:
				'4.0 起 `locale` 默认是空字符串，不会覆盖宿主应用的语言。只有显式传入时才同步到 vue-i18n，例如 `locale="en_US"`。',
		},
		{
			title: "新增组件需要改 Provider 吗？",
			content:
				"不需要。组件在自己的 `config.js` 中声明默认值，并通过 `useNewbieConfig(namespace, defaults)` 读取；Provider 只负责合并任意命名空间。",
		},
		{
			title: "Provider 和主题要一起用吗？",
			content:
				"不需要手动嵌套。`NewbieApp` 已经把 `StyleProvider`、`ConfigProvider`、`NewbieProvider` 和 antdv-next 的 `<a-app>` 组合好，直接在根组件包一层即可；主题细节见 [THEME.md](./THEME.md)。",
		},
	],
};
