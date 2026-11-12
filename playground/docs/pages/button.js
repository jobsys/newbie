export default {
	slug: "button",
	component: "NewbieButton",
	title: "Button 按钮",
	description:
		"按钮用于开始一个即时操作。NewbieButton 在 antdv-next Button 的基础上增加了 label、图标位置与 fetcher 加载状态。",
	category: "general",
	since: "1.0.0",
	whenToUse: [
		"标记一个操作，例如提交、保存、删除。",
		"需要根据请求状态自动展示 loading 时，传入 fetcher。",
		"按钮内容需要图标在左或在右时，使用 icon 与 icon-position。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description: "通过 type、size、danger、disabled 控制按钮的语义与状态。",
			file: "button/basic.vue",
		},
		{
			id: "icon",
			title: "图标按钮",
			description:
				"icon 接收的是 VNode，需要在模板中通过 `h(Icon)` 创建；icon-position 控制图标在文字左侧还是右侧。",
			file: "button/icon.vue",
		},
		{
			id: "loading",
			title: "加载状态",
			description:
				"传入一个包含 loading 字段的响应式对象，请求开始时把 loading 置为 true，按钮会自动进入加载状态。",
			file: "button/loading.vue",
		},
		{
			id: "native",
			title: "透传原生属性",
			description:
				"buttonProps 可以透传 antdv-next Button 的属性，适合 block、shape、htmlType 等场景。同名属性会覆盖组件内置值。",
			file: "button/native.vue",
		},
	],
	api: {
		props: [
			{
				name: "type",
				description: "按钮类型",
				type: "`primary` | `default` | `dashed` | `text` | `link` | `ghost`",
				default: "`default`",
			},
			{
				name: "size",
				description: "按钮大小",
				type: "`large` | `middle` | `small`",
				default: "`middle`",
			},
			{ name: "danger", description: "是否危险按钮", type: "`boolean`", default: "`false`" },
			{ name: "disabled", description: "是否禁用", type: "`boolean`", default: "`false`" },
			{
				name: "label",
				description: "按钮文字；不传时使用默认插槽",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "icon",
				description: "按钮图标，必须是 VNode，例如 `h(EditOutlined)`",
				type: "`VNode`",
				default: "`null`",
			},
			{
				name: "iconPosition",
				description: "图标在文字的左侧或右侧",
				type: "`left` | `right`",
				default: "`left`",
			},
			{
				name: "fetcher",
				description: "请求状态对象，读取 `fetcher.loading` 自动展示 loading",
				type: "`{ loading: boolean }`",
				default: "`{ loading: false }`",
			},
			{
				name: "buttonProps",
				description: "透传给 antdv-next Button，会覆盖同名内置属性",
				type: "`object`",
				default: "`{}`",
			},
		],
		events: [
			{
				name: "click",
				description: "点击按钮时触发",
				params: "`(event: MouseEvent) => void`",
			},
		],
		slots: [
			{
				name: "default",
				description: "按钮内容；label 为空时使用",
			},
		],
	},
	faq: [
		{
			title: "为什么图标不显示？",
			content:
				"`icon` 的类型是 VNode，不是组件定义。请使用 `:icon=\"h(EditOutlined)\"`，不要直接传 `:icon=\"EditOutlined\"`。",
		},
		{
			title: "buttonProps 与组件 props 的优先级？",
			content:
				"`buttonProps` 会展开在组件内置属性之后，因此同名属性（如 `loading`、`type`）以 `buttonProps` 为准。",
		},
	],
};
