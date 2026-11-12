export default {
	slug: "editor",
	component: "NewbieEditor",
	title: "Editor 富文本编辑器",
	description:
		"基于 WangEditor 5 的富文本编辑器，支持 v-model、只读/禁用、自定义工具栏与图片上传地址。",
	category: "data-entry",
	since: "1.0.0",
	whenToUse: [
		"需要录入带格式的公告、说明、邮件正文等内容。",
		"需要在表单中以富文本方式编辑某个字段。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description:
				"v-model:value 绑定 HTML 字符串。通过 ref 可以调用 setContent、getEditor 等方法。",
			file: "editor/basic.vue",
		},
		{
			id: "readonly",
			title: "只读模式",
			description:
				"readonly 会隐藏工具栏并禁止输入；disabled 除了禁止输入，还会走表单禁用态的处理。",
			file: "editor/readonly.vue",
		},
		{
			id: "config",
			title: "裁剪工具栏",
			description:
				"config.toolbarConfig 与 config.editorConfig 会分别合并到 WangEditor 的工具栏和编辑器配置。",
			file: "editor/config.vue",
		},
	],
	api: {
		props: [
			{
				name: "value",
				description: "编辑器 HTML 内容，v-model:value 绑定",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "placeholder",
				description: "占位文字",
				type: "`string`",
				default: "`请输入内容`",
			},
			{ name: "disabled", description: "是否禁用", type: "`boolean`", default: "`false`" },
			{ name: "readonly", description: "是否只读", type: "`boolean`", default: "`false`" },
			{
				name: "config",
				description: "WangEditor 配置，包含 toolbarConfig 与 editorConfig",
				type: "`{ toolbarConfig?: object; editorConfig?: object }`",
				default: "`{ toolbarConfig: {}, editorConfig: {} }`",
			},
		],
		events: [
			{
				name: "update:value",
				description: "内容变化时触发，值为 HTML 字符串",
				params: "`(html: string) => void`",
			},
		],
		slots: [],
		methods: [
			{
				name: "setContent",
				description: "设置编辑器内容",
				params: "`(content: string) => void`",
			},
			{
				name: "getEditor",
				description: "获取 WangEditor 实例，可用于 focus 等原生操作",
				params: "`() => Editor`",
			},
		],
	},
	provider: [
		{
			namespace: "editor",
			description: "编辑器中图片、文件上传使用的接口地址。",
			rows: [
				["uploadUrl", "图片/文件上传地址", "`string`", "`\"\"`"],
			],
		},
	],
	faq: [
		{
			title: "图片上传失败？",
			content:
				"编辑器会把图片以 `file` 字段 POST 到全局配置的 `editor.uploadUrl`，并要求返回结构中的 `result` 包含 `{ url, alt, href }`。请先通过 `NewbieProvider` 配置上传地址。",
		},
		{
			title: "编辑器高度可以调整吗？",
			content:
				"当前内容区固定为 400px 高，暂不提供 height 属性。可以在外层容器中通过 CSS 覆盖 `.w-e-text-container` 的高度。",
		},
		{
			title: "为什么工具栏里没有视频和表情？",
			content:
				"默认 `toolbarConfig.excludeKeys` 排除了 `group-video` 与 `emotion`。需要时在 `config.toolbarConfig.excludeKeys` 中移除对应项。",
		},
	],
};
