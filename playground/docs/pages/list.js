export default {
	slug: "list",
	component: "NewbieList",
	title: "List 滚动列表",
	description:
		"固定高度的无限滚动列表。滚动到底部自动请求下一页，自带加载中、空状态和加载完成提示。",
	category: "data-display",
	since: "1.0.0",
	notice: "该组件依赖接口返回结构，文档中的交互示例使用静态插槽展示布局；远程用法请参考下方 guide。",
	whenToUse: [
		"需要在一个固定高度的容器中展示可无限加载的列表。",
		"接口按页返回数据，并带有 last_page / total 等分页字段。",
	],
	demos: [
		{
			id: "basic",
			title: "静态布局",
			description:
				"关闭 autoLoad 后组件不发起请求，可以直接使用默认插槽渲染内容。远程模式会使用 pagination.items 渲染。",
			file: "list/basic.vue",
		},
	],
	guide: {
		id: "remote-usage",
		title: "远程数据用法",
		content:
			"设置 `url`（以及可选的 `extraData`）后，组件会在挂载时请求第一页，并在滚动到底部时继续请求下一页。接口返回需要包含 `data`、`last_page`、`total` 等字段：\n\n```vue\n<NewbieList\n  url=\"/api/articles\"\n  :extra-data=\"{ category: 'notice' }\"\n  :height=\"420\"\n  finished-text=\"没有更多了\"\n>\n  <template #renderItem=\"{ item, index }\">\n    <ArticleItem :item=\"item\" :index=\"index\" />\n  </template>\n</NewbieList>\n```\n\n如果项目里有自己的分页 store，可以传入 `useStore`，store 需要提供 `initPagination(options)` 与 `pagination`。",
	},
	api: {
		props: [
			{
				name: "url",
				description: "列表数据接口",
				type: "`string`",
				default: "`\"\"`",
			},
			{
				name: "extraData",
				description: "请求附带参数",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "height",
				description: "列表容器高度，单位 px",
				type: "`number`",
				default: "`300`",
			},
			{
				name: "offset",
				description: "距离底部多少 px 时触发加载",
				type: "`number`",
				default: "`50`",
			},
			{
				name: "finishedText",
				description: "加载完成提示文案",
				type: "`string`",
				default: "`加载完成`",
			},
			{
				name: "autoLoad",
				description: "是否在挂载后自动加载第一页",
				type: "`boolean`",
				default: "`true`",
			},
			{
				name: "useStore",
				description: "自定义分页 store，需提供 initPagination 与 pagination",
				type: "`object`",
				default: "`null`",
			},
			{
				name: "listProps",
				description: "兼容旧配置，目前只读取 header / footer",
				type: "`{ header?: VNode; footer?: VNode }`",
				default: "`{}`",
			},
		],
		events: [],
		slots: [
			{
				name: "default",
				description: "静态内容；远程模式下通常使用 renderItem",
			},
			{
				name: "renderItem",
				description: "渲染每一项，参数为 { item, index }",
			},
		],
		methods: [
			{ name: "loadMore", description: "手动加载下一页", params: "`(refresh?: boolean) => Promise<void>`" },
			{ name: "items", description: "获取当前已加载的数据", params: "`() => any[]`" },
			{ name: "pagination", description: "当前分页状态（loading / finished / items 等）", params: "`Ref<PaginationState>`" },
		],
	},
	faq: [
		{
			title: "为什么列表一直显示加载中？",
			content:
				"列表通过全局 axios 实例请求数据，接口返回的 `status` 必须等于项目约定的成功码，且 `result` 中包含 `data`、`last_page` 等字段。可以在 `main.js` 中通过 `Newbie.config({ httpStatus })` 调整成功码。",
		},
		{
			title: "listProps 里的其它属性为什么无效？",
			content:
				"迁移到 antdv-next 后 List 组件不再可用，NewbieList 改为完全自绘，`listProps` 目前只保留 `header` 与 `footer`。",
		},
	],
};
