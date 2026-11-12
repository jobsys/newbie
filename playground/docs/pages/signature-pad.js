export default {
	slug: "signature-pad",
	component: "NewbieSignaturePad",
	title: "SignaturePad 手写签名",
	description:
		"基于 signature_pad 的手写签名板，以弹窗形式打开，支持协议勾选、只读预览和预设签名。",
	category: "data-entry",
	since: "1.0.0",
	whenToUse: [
		"需要用户手写签名并保存为图片（data URL）。",
		"需要在签名前要求用户勾选协议。",
		"需要只读展示已有签名。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description:
				"通过 ref.open() 打开签名板，点击保存后触发 save 事件并返回 PNG 的 data URL。",
			file: "signature-pad/basic.vue",
		},
		{
			id: "readonly",
			title: "只读与预设签名",
			description:
				"readonly 会禁用绘制，preset 传入 data URL 作为初始签名，适合查看已签名内容。",
			file: "signature-pad/readonly.vue",
		},
	],
	api: {
		props: [
			{ name: "title", description: "签名板标题", type: "`string`", default: "`\"\"`" },
			{
				name: "readonly",
				description: "是否只读；只读时隐藏清空与保存按钮",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "agreement",
				description: "协议文本；传入后需要在保存前勾选",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "preset",
				description: "预设签名图片（data URL），初始化后绘制到画布",
				type: "`string`",
				default: "`\"\"`",
			},
		],
		events: [
			{
				name: "save",
				description: "保存签名时触发，参数为 PNG data URL",
				params: "`(dataUrl: string) => void`",
			},
		],
		slots: [
			{
				name: "title",
				description: "自定义标题，优先级高于 title 属性",
			},
		],
		methods: [{ name: "open", description: "打开签名弹窗", params: "`() => void`" }],
	},
	faq: [
		{
			title: "签名保存后拿到的是什么格式？",
			content:
				"`save` 事件返回 `canvas.toDataURL()` 生成的 PNG data URL，可以直接作为 `<img src>` 使用，也可以提交给后端后转存文件。",
		},
		{
			title: "为什么保存按钮没有反应？",
			content:
				"画布为空时不会触发保存；如果配置了 `agreement`，还需要先勾选协议。",
		},
		{
			title: "页面尺寸变化后签名错位？",
			content:
				"组件按 CSS 尺寸 × 设备像素比重设画布位图并缩放坐标系，监听 `window.resize` 后重绘已有笔迹，因此笔迹始终与鼠标位置对齐。嵌在可伸缩容器中时，请确保打开弹窗时容器已完成布局。",
		},
	],
};
