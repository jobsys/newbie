export default {
	slug: "uploader",
	component: "NewbieUploader",
	title: "Uploader 上传",
	description:
		"文件与图片上传组件，支持单文件/多文件、数量与大小限制、图片预览、分块上传和文件字段映射。",
	category: "data-entry",
	since: "1.0.0",
	whenToUse: [
		"需要上传附件、图片、合同等文件。",
		"需要限制文件类型、大小、数量。",
		"需要大文件分块上传或自定义预览方式。",
	],
	demos: [
		{
			id: "basic",
			title: "单文件上传",
			description:
				"v-model:value 在 maxNum 为 1 时绑定单个文件对象；上传成功后对象中会包含接口返回的字段。",
			file: "uploader/basic.vue",
		},
		{
			id: "images",
			title: "图片上传",
			description:
				"type 为 picture / picture-card 时展示图片墙，支持点击预览；初始值可以是文件对象数组。",
			file: "uploader/images.vue",
		},
		{
			id: "limits",
			title: "数量、大小与禁用",
			description:
				"maxSize 单位为 MB，maxNum 控制数量上限，accept 控制可选文件类型；disabled 时不会渲染上传按钮。",
			file: "uploader/limits.vue",
		},
		{
			id: "preview",
			title: "自定义预览",
			description:
				"非图片文件默认会打开链接；传入 preview 后改为调用自定义方法，适合在弹窗或新标签页中预览。",
			file: "uploader/preview.vue",
		},
	],
	api: {
		props: [
			{
				name: "value",
				description: "文件或文件数组，v-model:value 绑定；maxNum 为 1 时为单个对象",
				type: "`object` | `object[]`",
				default: "`{}`",
			},
			{
				name: "name",
				description: "上传文件的字段名",
				type: "`string`",
				default: "`file`",
			},
			{
				name: "headers",
				description: "上传请求头",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "accept",
				description: "可接受的文件类型，同 input accept",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "type",
				description: "上传列表样式",
				type: "`text` | `file` | `picture` | `picture-card`",
				default: "`file`",
			},
			{
				name: "disabled",
				description: "是否禁用；禁用时不渲染上传按钮",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "maxSize",
				description: "单个文件大小上限，单位 MB",
				type: "`number`",
				default: "`20`",
			},
			{
				name: "maxNum",
				description: "文件数量上限",
				type: "`number`",
				default: "`1`",
			},
			{
				name: "multiple",
				description: "是否支持多选",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "multipart",
				description: "是否使用 resumable.js 分块上传",
				type: "`boolean`",
				default: "`false`",
			},
			{
				name: "action",
				description: "上传地址；不传时读取全局 uploader.uploadUrl",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "extraData",
				description: "上传附加参数",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "uploadText",
				description: "上传按钮文字",
				type: "`string`",
				default: "`上传`",
			},
			{
				name: "disk",
				description: "上传盘符标识，会作为 `_disk` 字段提交",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "preview",
				description: "非图片文件的自定义预览方法",
				type: "`(file: UploadFile) => void`",
				default: "`null`",
			},
			{
				name: "uploadProps",
				description: "透传给 antdv-next Upload 的属性",
				type: "`object`",
				default: "`{}`",
			},
		],
		events: [
			{
				name: "update:value",
				description: "文件列表变化时触发；maxNum 为 1 时返回单个文件对象或 null",
				params: "`(value: object | object[] | null) => void`",
			},
			{
				name: "success",
				description: "所有文件上传完成后触发",
				params: "`(fileList: object[]) => void`",
			},
		],
		slots: [],
	},
	provider: [
		{
			namespace: "uploader",
			description:
				"上传地址、文件字段映射与默认预览方法。defaultFileItem 是“标准名→实际名”的映射，会深合并；上传成功后返回值按映射写入实际字段名。",
			rows: [
				["uploadUrl", "默认上传地址", "`string`", "`\"\"`"],
				[
					"defaultFileItem",
					"文件字段映射（标准名→实际名），默认 { id, name, url, path, thumbUrl }",
					"`object`",
					"见左",
				],
				["defaultPreview", "非图片文件的默认预览方法", "`(file) => void`", "`null`"],
			],
		},
	],
	guide: {
		id: "multipart",
		title: "分块上传",
		content:
			"设置 `multipart` 后组件使用 resumable.js 按 1MB 分块上传，并发 3 个分块，并展示进度条：\n\n```vue\n<NewbieUploader\n  v-model:value=\"file\"\n  multipart\n  action=\"/api/upload/chunk\"\n  :max-size=\"500\"\n/>\n```\n\n分块上传的接口需要支持分块合并，具体字段由 resumable.js 约定。",
	},
	faq: [
		{
			title: "接口返回的字段名和默认值不一致怎么办？",
			content:
				"通过 `NewbieProvider` 配置 `uploader.defaultFileItem`，例如 `{ url: 'fileUrl', name: 'fileName' }`。该配置是深合并的，只覆盖传入的字段。",
		},
		{
			title: "禁用状态下为什么看不到任何内容？",
			content:
				"这是当前实现的行为：`disabled` 时 `uploadBtn()` 返回 null。如果需要只读展示已有文件，可以关闭 disabled，并通过 `uploadProps.disabled` 或只读样式处理。",
		},
		{
			title: "上传成功但 v-model 没有更新？",
			content:
				"组件依赖接口返回中的 `result` 字段，并会按 `defaultFileItem` 映射字段。上传成功后所有文件状态都为 done 时才会触发 `update:value`；`result` 里用标准字段名（如 `path`），只有存在 `path` 才会认为上传成功。",
		},
	],
};
