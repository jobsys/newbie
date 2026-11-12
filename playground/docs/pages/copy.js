export default {
	slug: "copy",
	component: "NewbieCopy",
	title: "Copy 复制",
	description:
		"点击文本即可复制到剪贴板，默认只在悬停时显示复制图标，也可以自定义渲染内容和复制逻辑。",
	category: "general",
	since: "2.1.0",
	whenToUse: [
		"需要让用户快速复制订单号、链接、编号等短文本。",
		"表格或详情页中需要展示带复制图标的字段。",
		"复制前需要加工内容，或复制后需要自定义提示时。",
	],
	demos: [
		{
			id: "basic",
			title: "基础用法",
			description: "传入 text 即可点击复制，复制成功后会给出全局提示。",
			file: "copy/basic.vue",
		},
		{
			id: "always",
			title: "常显图标",
			description: "showIcon 让复制图标一直显示，适合触屏或需要更明显提示的场景。",
			file: "copy/always.vue",
		},
		{
			id: "custom",
			title: "自定义渲染与复制",
			description:
				"customRender 控制显示内容，copy 接管复制行为；两者都接收 text 参数。",
			file: "copy/custom.vue",
		},
	],
	api: {
		props: [
			{
				name: "text",
				description: "要复制的内容，默认也作为显示内容",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "showIcon",
				description: "是否一直显示复制图标；false 时只在悬停显示",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "customRender",
				description: "自定义显示内容，参数为 text",
				type: "`(text: string) => VNode`",
				default: "`null`",
			},
			{
				name: "copy",
				description: "自定义复制方法，参数为 text；不传时使用浏览器剪贴板",
				type: "`(text: string) => void | Promise<void>`",
				default: "`null`",
			},
		],
		events: [],
		slots: [],
	},
	faq: [
		{
			title: "复制没有反应？",
			content:
				"浏览器剪贴板 API 在非安全上下文（非 https / localhost）下可能不可用。组件使用 `useClipboard({ legacy: true })` 做了降级，但如果浏览器完全禁用了剪贴板权限，仍需要提供自定义 `copy` 方法。",
		},
		{
			title: "能否复制 HTML 或富文本？",
			content:
				"当前只接受并复制字符串。如果需要复制 HTML，请通过自定义 `copy` 方法自行写入剪贴板。",
		},
	],
};
