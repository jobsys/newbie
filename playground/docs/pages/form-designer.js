export default {
	slug: "form-designer",
	component: "NewbieFormDesigner",
	title: "FormDesigner 表单设计器",
	description:
		"拖拽式表单设计器。左侧组件面板、中间画布、右侧属性面板，支持字段逻辑、公式、自定义业务组件与知识竞赛模式。",
	category: "data-entry",
	since: "1.2.0",
	whenToUse: [
		"需要让业务人员自己搭建表单或问卷。",
		"需要把设计结果保存为 NewbieForm 可用的 JSON 配置。",
		"需要在设计器中配置条件显隐、计算公式或题目答案。",
	],
	demos: [
		{
			id: "basic",
			title: "基础设计器",
			description:
				"widgets 追加业务组件分组，formItems 作为初始画布内容。保存时触发 submit，返回字段配置与逻辑规则。",
			file: "form-designer/basic.vue",
		},
		{
			id: "quiz",
			title: "知识竞赛模式",
			description:
				"mode 为 quiz 时使用题目组件（单选、多选、填空），选项支持分值，保存结构仍为 { fields, logic }。",
			file: "form-designer/quiz.vue",
		},
	],
	api: {
		props: [
			{ name: "title", description: "设计器标题", type: "`string`", default: "`\"\"`" },
			{
				name: "widgets",
				description: "额外的业务组件分组",
				type: "`FormDesignerWidgetGroup[]`",
				default: "`[]`",
			},
			{
				name: "formItems",
				description: "初始画布字段，兼容 NewbieForm 的字段数组或 { fields, logic }",
				type: "`NewbieFormItemConfig[]` | `{ fields, logic }` | `Function`",
				default: "`[]`",
			},
			{
				name: "height",
				description: "设计器高度，数字按 px 处理",
				type: "`number` | `string`",
				default: "`100%`",
			},
			{
				name: "mode",
				description: "设计模式，quiz 为知识竞赛",
				type: "`quiz`",
				default: "`null`",
			},
		],
		events: [
			{
				name: "submit",
				description: "点击保存表单时触发",
				params: "`({ fields: NewbieFormItemConfig[]; logic: { rules: LogicRule[] } }) => void`",
			},
		],
		slots: [],
		methods: [],
		types: [
			{
				id: "widget",
				title: "FormDesignerWidget",
				description: "左侧面板中的单个组件。",
				columns: ["字段", "说明", "类型"],
				rows: [
					["name", "面板显示名称", "`string`"],
					["type", "实际字段类型，对应 NewbieForm 的 type", "`string`"],
					["icon", "图标，返回 VNode 的函数", "`() => VNode`"],
					["props", "拖入画布时预设的字段配置", "`object`"],
				],
			},
			{
				id: "widget-group",
				title: "FormDesignerWidgetGroup",
				description: "组件分组，会在默认分组之后追加。",
				columns: ["字段", "说明", "类型"],
				rows: [
					["title", "分组标题", "`string`"],
					["children", "分组内的组件", "`FormDesignerWidget[]`"],
				],
			},
		],
	},
	faq: [
		{
			title: "保存的结构能直接给 NewbieForm 用吗？",
			content:
				"可以。`submit` 返回的 `{ fields, logic }` 就是 NewbieForm 支持的对象格式：\n\n```vue\n<NewbieForm :form=\"saved\" />\n```",
		},
		{
			title: "为什么设计器高度不生效？",
			content:
				"默认 `height=\"100%\"`，需要父容器有确定高度。文档示例直接传数字，组件会转换成 px；也可以给外层容器设置 `height: 100vh`。",
		},
		{
			title: "自定义组件需要实现什么？",
			content:
				"业务组件本质上是 NewbieForm 的字段配置。通过 `widgets[].children[].props` 预设 `type`、`options`、`defaultProps` 等，设计器会把它当成普通字段拖拽和编辑。",
		},
		{
			title: "逻辑规则在哪里配置？",
			content:
				"设计器顶部有“表单逻辑”入口，可为字段配置 show / hide 规则；保存时会写入 `logic.rules`，与 NewbieForm 的条件显隐一致。",
		},
		{
			title: "支持暗色模式吗？",
			content:
				"支持。设计器的面板、画布、工具栏、属性面板以及「设置选项」「表单逻辑」「公式使用说明」等弹层，颜色都来自 antdv-next 的 Design Token（以 `--newbie-*` CSS 变量下发），跟随当前主题的明暗切换：\n\n```vue\n<NewbieThemeProvider scheme=\"dark\">\n\t<NewbieFormDesigner :form-items=\"formItems\" />\n</NewbieThemeProvider>\n```\n\n只使用 antdv-next 的 `ConfigProvider` 并配置 `darkAlgorithm` 同样有效；未配置任何主题时回落到浅色。",
		},
	],
};
