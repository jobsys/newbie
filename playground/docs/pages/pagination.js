export default {
	slug: "pagination",
	component: "NewbiePagination",
	title: "Pagination 分页列表",
	description:
		"NewbieTable 的搜索、取数与分页能力，配上完全自定义的 item 渲染：卡片、时间轴等任意业务形态。",
	category: "data-display",
	since: "1.0.0",
	whenToUse: [
		"列表数据不适合用表格展示，希望渲染成卡片、时间轴等自定义形态。",
		"仍需要 NewbieTable 那套搜索、分页、持久化与刷新能力。",
		"本地数据想要开箱即用的翻页，或者卡片类列表需要多选与批量操作（批量删除等）。",
	],
	demos: [
		{
			id: "basic",
			title: "卡片列表",
			description:
				"dataSource 传本地数据，#item 插槽自定义每一项的渲染。无 url 且未接管总数时，组件自动按 pageSize 做客户端分页，翻页纯前端完成。",
			file: "pagination/basic.vue",
		},
		{
			id: "selection",
			title: "多选与批量操作",
			description:
				"四个区域各就各位：#prepend 在最上方；#functional 与刷新按钮同行（作用域带 selectedItems / clearSelection / toggleAllSelection），批量操作放这里；#item 作用域带 selected / selectionDisabled / toggleSelect；#append 在底部与分页同行。",
			file: "pagination/selection.vue",
		},
		{
			id: "search",
			title: "搜索与排序",
			description:
				"filterableColumns 直传 SearchItemConfig 生成搜索栏；无 url 时搜索点击只触发 fetch 事件，由业务自行取数。",
			file: "pagination/search.vue",
		},
	],
	api: {
		props: [
			{ name: "title", description: "标题", type: "`string`", default: '`""`' },
			{
				name: "filterable",
				description: "是否显示搜索栏",
				type: "`boolean`",
				default: "`true`",
			},
			{
				name: "filterableColumns",
				description: "搜索项配置，直传给内部 NewbieSearch 的 filterableColumns",
				type: "`SearchItemConfig[]` | `() => SearchItemConfig[]`",
				default: "`[]`",
			},
			{
				name: "sortableColumns",
				description: "可排序的搜索项，直传给内部 NewbieSearch 的 sortableColumns",
				type: "`array` | `Function`",
				default: "`[]`",
			},
			{
				name: "searchSlots",
				description: "透传给 NewbieSearch 的插槽",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "pagination",
				description:
					"是否分页，或自定义 antdv-next Pagination 配置；无 url 且未通过 setPagination 接管总数时为客户端分页（组件按 pageSize 切片数据），翻页纯前端完成",
				type: "`boolean` | `object`",
				default: "`true`",
			},
			{
				name: "pageEvents",
				description: "透传给分页组件的事件",
				type: "`object`",
				default: "`{}`",
			},
			{
				name: "autoQuery",
				description:
					"搜索条件变化后是否自动查询；透传给内部 `NewbieSearch`（约 300ms 防抖）",
				type: "`boolean`",
				default: "`false`",
			},
			{ name: "url", description: "数据接口", type: "`string`", default: '`""`' },
			{ name: "method", description: "请求方式", type: "`get` | `post`", default: "`get`" },
			{ name: "extraData", description: "请求附加参数", type: "`object`", default: "`{}`" },
			{
				name: "afterFetched",
				description:
					"接口数据处理函数，必须返回 `{ items, totalSize }`；未提供或不是函数时组件会 `console.error` 并放弃本次结果",
				type: "`(res: any) => { items: any[]; totalSize: number }`",
				default: "`null`",
			},
			{
				name: "itemKey",
				description: "数据项主键，rowSelection 依赖它",
				type: "`string` | `Function`",
				default: "`id`",
			},
			{
				name: "rowSelection",
				description:
					"选择配置：`true` 全默认；对象支持 `onChange(selectedItems, selectedKeys)`、`disabled({ item, index })`、`preserveSelectedKeys`（翻页后保留选中，默认每次取数清空，与 NewbieTable 一致）",
				type: "`boolean` | `object`",
				default: "`false`",
			},
			{
				name: "dataSource",
				description:
					"本地数据。无 url 且未接管总数时视为全量数据，由组件自动做客户端分页；接管后（setData + setPagination）表示当页数据",
				type: "`any[]`",
				default: "`[]`",
			},
			{
				name: "formData",
				description: "dataSource 的别名",
				type: "`any[]`",
				default: "`[]`",
			},
			{
				name: "showRefresh",
				description: "是否显示刷新按钮",
				type: "`boolean`",
				default: "`true`",
			},
			{
				name: "persistence",
				description: "持久化配置，保存分页视图状态（当前页与每页条数）；冷数据默认自动恢复",
				type: "`boolean` | `string` | `{ key?: string; storage?: 'memory' | 'local'; restore?: 'auto' | 'manual' }`",
				default: "`false`",
			},
			{
				name: "searchPersistence",
				description:
					"内部 NewbieSearch 的持久化配置；不传时沿用 persistence，但冷数据默认交给“恢复上次查询”入口",
				type: "`boolean` | `string` | `{ key?: string; storage?: 'memory' | 'local'; restore?: 'auto' | 'manual' }`",
				default: "-",
			},
			{
				name: "cardWrapper",
				description: "是否用 Card 包裹",
				type: "`boolean`",
				default: "`false`",
			},
		],
		events: [
			{
				name: "fetch",
				description: "没有 url 时，搜索或刷新会触发该事件，由业务自行加载数据",
				params: "`() => void`",
			},
			{
				name: "selectionChange",
				description: "rowSelection 开启时选择发生变化触发",
				params: "`({ selectedItems, selectedKeys }) => void`",
			},
		],
		slots: [
			{
				name: "item",
				description:
					"渲染每一项（无默认实现，必须自定义），作用域 `{ item, index, selected, selectionDisabled, toggleSelect }`；rowSelection 关闭时 selected 恒为 false",
			},
			{
				name: "prepend",
				description:
					"最上方、搜索栏之前的内容，作用域 `{ selectedItems, selectedKeys, clearSelection, toggleAllSelection }`",
			},
			{
				name: "functional",
				description: "与刷新按钮同行的内容区（刷新在右），作用域同 prepend，批量操作放这里",
			},
			{
				name: "append",
				description: "底部内容，有分页时与分页条同行（分页在右），作用域同 prepend",
			},
			{ name: "title", description: "自定义标题" },
			{ name: "extra", description: "Card 右上角内容（cardWrapper 时生效）" },
			{ name: "empty", description: "自定义空状态" },
		],
		methods: [
			{ name: "getData", description: "获取当前数据", params: "`() => any[]`" },
			{ name: "setData", description: "设置当前数据", params: "`(items: any[]) => void`" },
			{
				name: "setPagination",
				description: "设置分页信息",
				params: "`(total?: number, currentPage?: number, pageSize?: number) => void`",
			},
			{ name: "getPagination", description: "获取分页状态", params: "`() => object`" },
			{ name: "getSelection", description: "获取选中的数据项", params: "`() => any[]`" },
			{
				name: "setSelection",
				description: "整体替换选中项",
				params: "`(items: any[]) => void`",
			},
			{
				name: "toggleSelection",
				description: "切换某一项的选中状态",
				params: "`(item: any, index?: number) => void`",
			},
			{
				name: "toggleAllSelection",
				description: "全选 / 取消全选当前页可选项",
				params: "`() => void`",
			},
			{ name: "clearSelection", description: "清空选中", params: "`() => void`" },
			{
				name: "getQueryData",
				description: "获取当前搜索条件与分页参数",
				params: "`() => object`",
			},
			{
				name: "setQueryData",
				description: "设置搜索条件",
				params: "`(fields: object) => void`",
			},
			{
				name: "doFetch",
				description: "重新请求数据，传 true 时回到第一页",
				params: "`(refresh?: boolean) => Promise<void>`",
			},
			{
				name: "setLoading",
				description: "设置 loading",
				params: "`(loading: boolean) => void`",
			},
			{
				name: "refreshStatusCounts",
				description: "刷新状态分段计数，转发给内部 NewbieSearch",
				params: "`(force?: boolean) => Promise<object>`",
			},
		],
	},
	faq: [
		{
			title: "和 NewbieTable 什么时候选哪个？",
			content:
				"数据适合表格（列对齐、列宽、固定列）时用 NewbieTable；希望按卡片、时间轴等业务形态展示，但仍要搜索、分页、持久化时用 NewbiePagination。两者取数、搜索与分页参数的行为保持一致，业务代码可以低成本切换。",
		},
		{
			title: "为什么翻页后选中被清空了？",
			content:
				'与 NewbieTable 保持一致：每次取数后默认清空选中，避免跨页累积造成误删。需要跨页批量操作时配置 `:row-selection="{ preserveSelectedKeys: true }"`。',
		},
		{
			title: "本地数据怎么分页？什么时候需要 setPagination？",
			content:
				"无 url 且没有通过 setPagination 设置总数时，dataSource 被视为全量数据，组件自动按 pageSize 做客户端分页，翻页纯前端完成。只有在手动模式（监听 fetch 事件自行取数）下，才需要在回调里 setData 提供当页数据并 setPagination(total, currentPage, pageSize) 提供总数。",
		},
	],
};
