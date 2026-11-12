export default {
	slug: "password",
	component: "NewbiePassword",
	title: "Password 密码输入",
	description:
		"带强度指示的密码输入框。按数字、小写字母、大写字母、特殊字符四类字符计算强度，并校验长度区间。",
	category: "data-entry",
	since: "1.0.0",
	whenToUse: [
		"注册、修改密码等需要提示密码强度的场景。",
		"需要限制密码最小和最大长度时。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description:
				"v-model:value 绑定密码值。输入过程中会实时计算强度；空值不显示提示，输入后按策略提示缺少的字符类型。",
			file: "password/basic.vue",
		},
		{
			id: "custom-length",
			title: "自定义长度",
			description:
				"通过 min、max 调整长度限制，width 支持数字（px）或任意 CSS 宽度字符串。",
			file: "password/custom-length.vue",
		},
	],
	api: {
		props: [
			{
				name: "value",
				description: "密码值，v-model:value 绑定",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "min",
				description: "最小长度",
				type: "`number`",
				default: "`8`",
			},
			{
				name: "max",
				description: "最大长度",
				type: "`number`",
				default: "`20`",
			},
			{
				name: "strengthRules",
				description:
					"强度提示策略：`min` / `max` 默认沿用 min、max；`require` 支持 `digit`、`lower`、`upper`、`symbol`，只作提示、不阻止输入与提交",
				type: "`{ min?: number; max?: number; require?: string[] }`",
				default: '`{ require: ["digit", "lower", "upper", "symbol"] }`',
			},
			{
				name: "width",
				description: "输入框宽度，数字按 px 处理",
				type: "`number` | `string`",
				default: "`300`",
			},
		],
		events: [
			{
				name: "update:value",
				description: "输入值变化时触发",
				params: "`(value: string) => void`",
			},
			{
				name: "change",
				description: "原生输入变化事件",
				params: "`(event: Event) => void`",
			},
		],
		slots: [],
		methods: [
			{
				name: "strength",
				description: "通过 ref 获取当前密码强度，0 最弱、4 最强",
				params: "`ComputedRef<number>`",
			},
		],
	},
	faq: [
		{
			title: "强度是如何计算的？",
			content:
				"数字、小写字母、大写字母、特殊字符各算 1 分，满分 4 分，用于强度条着色。提示策略由 `strengthRules.require` 决定，默认要求四类字符全部包含；传入空数组即可只校验长度，不提示字符组合。所有提示都只用于展示，不会阻止输入或提交。",
		},
		{
			title: "为什么初始为空时不显示提示？",
			content:
				"空值交给表单的必填校验处理，组件只在用户输入内容后提示长度或字符组合问题。如果希望空值也提示，请在表单字段上设置 `required`。",
		},
		{
			title: "可以在表单里用吗？",
			content:
				"可以。表单的 `password` 类型使用 antdv-next 的 `Input.Password`，不包含强度条；如果需要强度提示，请用 `type: \"slot\"` 或 `customRender` 嵌入 `NewbiePassword`。",
		},
	],
};
