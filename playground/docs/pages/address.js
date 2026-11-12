export default {
	slug: "address",
	component: "NewbieAddress",
	title: "Address 地址选择",
	description:
		"基于 Cascader 的省市区选择器，内置本地行政区划数据，也支持远程接口和自定义数据源。",
	category: "data-entry",
	since: "1.0.0",
	whenToUse: [
		"需要录入省、市、区三级行政区划。",
		"希望开箱即用，不额外维护一份地区数据。",
		"已有地区接口，需要按统一格式接入。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description: "v-model:value 绑定选中的地区编码数组，默认使用组件内置的完整省市区数据。",
			file: "address/basic.vue",
		},
		{
			id: "level",
			title: "选择层级",
			description:
				"level 控制可选深度：1 只选省，2 选到市，3 选到区。切换层级会重新裁剪数据，不会改动原始数据。",
			file: "address/level.vue",
		},
		{
			id: "datasource",
			title: "自定义数据源",
			description:
				"dataSource 的数据结构为 { code, name, children }。传入后不会再请求内置数据。",
			file: "address/datasource.vue",
		},
	],
	api: {
		props: [
			{
				name: "value",
				description: "选中的地区编码，v-model:value 绑定",
				type: "`string[]`",
				default: "`[]`",
			},
			{
				name: "level",
				description: "选择层级：1 省、2 省市、3 省市区",
				type: "`number`",
				default: "`3`",
			},
			{ name: "disabled", description: "是否禁用", type: "`boolean`", default: "`false`" },
			{
				name: "placeholder",
				description: "未选择时的占位文字",
				type: "`string`",
				default: "`请选择地区`",
			},
			{
				name: "url",
				description: "地区数据接口；未传 dataSource 时生效，不传则使用本地数据",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "afterFetched",
				description: "接口数据处理函数，返回值需符合 { code, name, children } 结构",
				type: "`(response: any) => AreaNode[]`",
				default: "`null`",
			},
			{
				name: "dataSource",
				description: "自定义地区数据，优先级高于 url 与本地数据",
				type: "`AreaNode[]`",
				default: "`[]`",
			},
		],
		events: [
			{
				name: "update:value",
				description: "选中地区变化时触发，参数为编码数组",
				params: "`(value: string[]) => void`",
			},
		],
		slots: [],
		methods: [],
		types: [
			{
				id: "area-node",
				title: "AreaNode 数据格式",
				description: "自定义数据源或接口返回值必须使用 code / name / children 三个字段。",
				columns: ["字段", "说明", "类型"],
				rows: [
					["code", "地区编码，最终提交的值", "`string`"],
					["name", "展示名称", "`string`"],
					["children", "下级地区，可选", "`AreaNode[]`"],
				],
			},
		],
	},
	guide: {
		id: "helper",
		title: "工具函数",
		content:
			"组件同时导出 `useAddressFullCode(code, level?)`，用于把单个地区编码补全成完整路径：\n\n```js\nimport { useAddressFullCode } from \"jobsys-newbie\";\n\nuseAddressFullCode(\"440103\"); // ['440000', '440100', '440103']\nuseAddressFullCode(\"440103\", 2); // ['440000', '440100']\n```",
	},
	faq: [
		{
			title: "接口返回的不是 code / name 结构怎么办？",
			content:
				"通过 `afterFetched` 转换成 `{ code, name, children }` 即可；组件内部使用固定的 fieldNames，不提供额外的字段映射配置。",
		},
		{
			title: "为什么修改 level 后已选值还在？",
			content:
				"层级只影响可选项，不会主动清空已有的 value。如果新层级下旧值不在候选范围内，请监听 `update:value` 自行裁剪。",
		},
	],
};
