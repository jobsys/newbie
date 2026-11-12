export default {
	slug: "search",
	component: "NewbieSearch",
	title: "Search 搜索栏",
	description:
		"把表格列配置直接变成搜索条件，支持条件运算、展开单选/多选、排序设置、持久化和自定义渲染。",
	category: "data-entry",
	since: "1.0.0",
	whenToUse: [
		"列表页需要一套统一风格的搜索栏。",
		"搜索条件来自表格列配置，希望减少重复定义。",
		"需要展开条件、多选、排序或保存上次查询。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description:
				"filterableColumns 定义搜索项，type 决定输入控件。点击搜索后通过 search 事件拿到 newbieQuery。",
			file: "search/basic.vue",
		},
		{
			id: "expandable",
			title: "展开单选与多选",
			description:
				"expandable 为 true 时展开单选，为 \"multiple\" 时展开多选；多选条件的值会自动使用 include。",
			file: "search/expandable.vue",
		},
		{
			id: "sortable",
			title: "排序设置",
			description:
				"sortableColumns 会生成排序设置入口，搜索时通过 newbieSort 返回字段与方向。",
			file: "search/sortable.vue",
		},
		{
			id: "custom",
			title: "自定义搜索项",
			description:
				"customRender 返回 displayValue 等展示信息，配合以 item.key 命名的插槽渲染真正的输入组件。",
			file: "search/custom.vue",
		},
		{
			id: "persistence",
			title: "持久化",
			description:
				"persistence 支持内存与 localStorage 两种存储，保存搜索条件与排序；localStorage 模式会提供“恢复上次查询”入口。",
			file: "search/persistence.vue",
		},
	],
	api: {
		props: [
			{
				name: "filterableColumns",
				description: "搜索项配置",
				type: "`SearchItemConfig[]` | `() => SearchItemConfig[]`",
				default: "`[]`",
			},
			{
				name: "sortableColumns",
				description: "可排序的字段配置，通常与 filterableColumns 相同",
				type: "`SearchItemConfig[]` | `() => SearchItemConfig[]`",
				default: "`[]`",
			},
			{
				name: "disableConditions",
				description: "是否全局禁用条件选择",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "autoQuery",
				description: "条件变化后是否自动搜索（约 300ms 防抖，初始化与 `setQueryForm` 不会触发）",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "gutter",
				description: "搜索项间距",
				type: "`number` | `string`",
				default: "`16`",
			},
			{
				name: "persistence",
				description: "持久化配置，支持布尔、字符串 key 或 { key, storage }",
				type: "`boolean` | `string` | `{ key?: string; storage?: 'memory' | 'local' }`",
				default: "`false`",
			},
		],
		events: [
			{
				name: "search",
				description:
					"点击搜索或 autoQuery 自动触发时触发，始终包含 `newbieQuery` 与 `newbieSort` 两个字段（空对象也保留）",
				params: "`({ newbieQuery: object; newbieSort: object }) => void`",
			},
		],
		slots: [
			{
				name: "<item.key>",
				description: "以搜索项的 key 命名，用于自定义渲染该搜索项",
			},
		],
		methods: [
			{
				name: "getQueryForm",
				description: "获取当前搜索条件，格式为 { key: { condition, type, value } }",
				params: "`(skipSave?: boolean) => object`",
			},
			{
				name: "setQueryForm",
				description: "设置搜索项的值",
				params: "`(fields: Record<string, any>) => void`",
			},
			{
				name: "getSortForm",
				description: "获取排序结果，格式为 { key: 'asc' | 'desc' }",
				params: "`(skipSave?: boolean) => object`",
			},
			{
				name: "getSearch",
				description:
					"获取可直接提交给后端的 { newbieQuery, newbieSort }，始终包含这两个字段（空对象也保留）",
				params: "`() => { newbieQuery: object; newbieSort: object }`",
			},
		],
		types: [
			{
				id: "search-item",
				title: "SearchItemConfig",
				description: "搜索项配置。",
				columns: ["字段", "说明", "类型", "默认值"],
				rows: [
					["key", "搜索项的字段名", "`string`", "-"],
					["title", "搜索项标题", "`string`", "-"],
					[
						"type",
						"控件类型",
						"`input` | `textarea` | `number` | `select` | `cascade` | `date` | `switch`",
						"`input`",
					],
					["sortOrder", "默认排序，数字越大越靠前", "`number`", "`0`"],
					["expandable", "展开单选或多选", "`boolean` | `\"multiple\"`", "`false`"],
					["options", "选项，支持字符串、数字或 { label, value }", "`array` | `() => array`", "`[]`"],
					["inputProps", "透传给输入控件的属性", "`object`", "`{}`"],
					["disableConditions", "是否禁用条件选择", "`boolean`", "`false`"],
					["conditions", "允许的条件白名单", "`string[]`", "`[]`"],
					["defaultValue", "默认值", "`any`", "-"],
					["defaultCondition", "默认条件", "`string`", "`equal`"],
					[
						"customRender",
						"自定义渲染，返回 { conditions, Component, displayValue, onComponentOpen }",
						"`Function`",
						"-",
					],
					[
						"collectItem",
						"自定义收集值，返回 { value, searchLabel }",
						"`Function`",
						"-",
					],
				],
			},
			{
				id: "conditions",
				title: "内置条件",
				description: "不同控件支持的条件不同，可通过 conditions 进一步筛选。",
				columns: ["控件类型", "支持的条件"],
				rows: [
					["input", "`equal`、`notEqual`、`include`、`exclude`、`null`、`notNull`"],
					["textarea", "`equal`、`exclude`"],
					["number", "`equal`、`notEqual`、`lessThan`、`greaterThan`、`between`"],
					["select", "`equal`、`notEqual`、`include`、`exclude`、`null`、`notNull`"],
					["cascade", "`equal`、`notEqual`、`include`、`null`"],
					["date", "`equal`、`lessThan`、`greaterThan`、`between`、`null`、`notNull`"],
					["switch", "`equal`"],
				],
			},
		],
	},
	provider: [
		{
			namespace: "search",
			description: "搜索栏样式类与值格式化。",
			rows: [
				["maskClass", "搜索项外层的额外类名", "`string`", "`\"\"`"],
				["inputClass", "弹层中输入框的额外类名", "`string`", "`\"\"`"],
				[
					"valueFormatter",
					"按搜索项类型索引的格式化函数，如 { date: value => value.format('YYYY-MM-DD') }",
					"`object`",
					"`null`",
				],
			],
		},
	],
	faq: [
		{
			title: "日期搜索如何格式化成字符串？",
			content:
				"通过 `NewbieProvider` 配置 `search.valueFormatter`：\n\n```js\n<NewbieProvider :config=\"{\n  search: {\n    valueFormatter: {\n      date: value => value.format('YYYY-MM-DD'),\n    },\n  },\n}\" />\n```\n\n格式化只影响 `getQueryForm` / `getSearch` 返回给业务的值，界面仍使用 dayjs 对象。",
		},
		{
			title: "搜索事件里的参数为什么不是 queryForm？",
			content:
				"迁移到 4.0 后，`search` 事件统一返回 `{ newbieQuery, newbieSort }`，可以直接提交给后端。仍可以通过 ref 调用 `getQueryForm()` 获取旧的按 key 索引结构。",
		},
		{
			title: "持久化的 key 如何生成？",
			content:
				"不传 key 时使用当前 URL hash 的 SM3 摘要；传字符串时使用 `location.pathname + key` 的摘要，避免不同页面互相覆盖。",
		},
	],
};
