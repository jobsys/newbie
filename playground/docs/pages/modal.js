export default {
	slug: "modal",
	component: "NewbieModal",
	title: "Modal 弹窗",
	description:
		"同时封装 Modal 与 Drawer，支持全屏、拖动、统一的关闭前确认，以及透传原生配置。",
	category: "feedback",
	since: "1.0.0",
	whenToUse: [
		"需要在不离开当前页面的情况下承载表单、详情或确认操作。",
		"需要 Modal 与 Drawer 使用一致的外壳和关闭逻辑。",
		"关闭前需要拦截并提示未保存内容。",
	],
	demos: [
		{
			id: "basic",
			title: "Modal 与 Drawer",
			description:
				"type 切换 modal / drawer。Modal 支持右上角全屏与标题栏拖动，Drawer 使用相同的 props。",
			file: "modal/basic.vue",
		},
		{
			id: "before-close",
			title: "函数式关闭拦截",
			description:
				"beforeClose 为函数时返回 Promise：resolve(true) 允许关闭，resolve(false) 阻止关闭。",
			file: "modal/before-close.vue",
		},
		{
			id: "before-close-object",
			title: "配置式关闭确认",
			description:
				"beforeClose 为对象时自动弹出确认框，trigger 决定是否需要确认，可传布尔值或函数。",
			file: "modal/before-close-object.vue",
		},
		{
			id: "modal-props",
			title: "透传原生属性",
			description:
				"modalProps 会透传给 antdv-next Modal / Drawer；styles.body 会与组件内置的高度和滚动配置合并。",
			file: "modal/modal-props.vue",
		},
	],
	api: {
		props: [
			{
				name: "type",
				description: "弹层类型",
				type: "`modal` | `drawer`",
				default: "`modal`",
			},
			{
				name: "visible",
				description: "是否可见，v-model:visible 绑定",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "width",
				description:
					"宽度。Drawer 模式下数字按 size 处理，百分比等字符串回退到 width；Modal 模式按 CSS 宽度处理",
				type: "`number` | `string`",
				default: "`800`",
			},
			{
				name: "height",
				description: "内容区最大高度，仅 Modal 模式生效",
				type: "`number` | `string`",
				default: "`500`",
			},
			{ name: "title", description: "标题", type: "`string`", default: "`\"\"`" },
			{
				name: "beforeClose",
				description: "关闭前拦截；函数返回 Promise，对象配置见下方 BeforeCloseConfig",
				type: "`Function` | `BeforeCloseConfig`",
				default: "`null`",
			},
			{
				name: "modalProps",
				description: "透传给 antdv-next Modal / Drawer 的属性",
				type: "`object`",
				default: "`{}`",
			},
		],
		events: [
			{
				name: "update:visible",
				description: "可见性变化时触发",
				params: "`(visible: boolean) => void`",
			},
			{ name: "close", description: "关闭时触发", params: "`() => void`" },
		],
		slots: [
			{
				name: "default",
				description: "弹层内容",
			},
		],
		methods: [],
		types: [
			{
				id: "before-close-config",
				title: "BeforeCloseConfig",
				description: "beforeClose 传对象时的确认框配置。",
				columns: ["字段", "说明", "类型", "默认值"],
				rows: [
					["title", "确认框标题", "`string`", "`操作提示`"],
					["content", "确认框内容", "`string`", "`确认关闭吗？`"],
					["okText", "确认按钮文字", "`string`", "`确定`"],
					["cancelText", "取消按钮文字", "`string`", "`取消`"],
					["trigger", "是否需要确认", "`boolean` | `() => boolean`", "`false`"],
				],
			},
		],
	},
	faq: [
		{
			title: "为什么 Drawer 宽度设置百分比不生效？",
			content:
				"antdv-next Drawer 的 `size` 只接受数字，组件对数字宽度走 `size`，对百分比等字符串仍走旧的 `width`。如果同时设置 `modalProps.width`，其优先级更高。",
		},
		{
			title: "如何自定义底部按钮？",
			content:
				"组件默认 `footer={null}`，底部按钮由内容自行提供；也可以传入 `modalProps.footer` 覆盖。",
		},
		{
			title: "Modal 全屏后内容高度不对？",
			content:
				"全屏通过 `wrapClassName` 上的 `full-modal` 类实现，内容区最大高度仍由 `height` 控制。可以结合 `modalProps.styles.body` 调整。",
		},
	],
};
