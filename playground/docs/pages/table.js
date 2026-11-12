export default {
	slug: "table",
	component: "NewbieTable",
	title: "Table 表格",
	description:
		"在 antdv-next Table 之上集成搜索栏、可编辑单元格、操作列、复制/链接、列显隐、分页与持久化。",
	category: "data-display",
	since: "1.0.0",
	whenToUse: [
		"后台列表页需要搜索、分页、列显隐、操作列等一整套能力。",
		"希望用同一份列配置同时驱动表格和搜索栏。",
		"需要单元格编辑、复制、图片/附件预览等常用单元格能力。",
	],
	demos: [
		{
			id: "basic",
			title: "基础表格",
			description:
				"columns 定义列，dataSource（或 formData）传本地数据。没有 url 时组件不会请求接口，只触发 fetch 事件。",
			file: "table/basic.vue",
		},
		{
			id: "search",
			title: "搜索与列配置",
			description:
				"列的 filterable 会自动生成搜索项；isOnlyForQuery 的列只参与搜索，不显示在表格中。",
			file: "table/search.vue",
		},
		{
			id: "editable",
			title: "可编辑单元格",
			description:
				"开启 editable 后，列上配置 editable 即可编辑。beforeCellSubmit 可在保存前做异步处理，不传时请求 submitUrl。",
			file: "table/editable.vue",
		},
		{
			id: "operations",
			title: "操作列与单元格能力",
			description:
				"onCopy、onClick、tooltip、renderTableActions、renderTableImage、renderTableFile 覆盖常见单元格交互。",
			file: "table/operations.vue",
		},
		{
			id: "selection",
			title: "行选择与展开",
			description:
				"rowSelection、rowKey、expandRender、expandedRowKeys 直接映射到 antdv-next Table 的对应能力。",
			file: "table/selection.vue",
		},
		{
			id: "persistence",
			title: "持久化",
			description:
				"persistence 支持内存与 localStorage，保存列显隐、分页等状态；切换配置时可通过 key 重新挂载表格。",
			file: "table/persistence.vue",
		},
		{
			id: "slots",
			title: "自定义插槽",
			description:
				"title、extra、prepend、functional、append 分别对应标题、卡片右上角、搜索前、工具栏和底部区域。",
			file: "table/slots.vue",
		},
		{
			id: "nested",
			title: "嵌套字段",
			description:
				"dataIndex 支持 a.b.c 字符串或数组；key 也可以使用数组，customRender 仍然可以完全接管单元格。",
			file: "table/nested.vue",
		},
		{
			id: "empty",
			title: "空数据",
			description:
				"空数据时会展示内置空状态；工具栏、搜索栏与分页仍然按配置渲染，适合“新增第一条记录”的场景。",
			file: "table/empty.vue",
		},
	],
	api: {
		props: [
			{ name: "title", description: "表格标题", type: "`string`", default: "`\"\"`" },
			{
				name: "filterable",
				description: "是否显示搜索栏",
				type: "`boolean`",
				default: "`true`",
			},
			{ name: "tableProps", description: "透传给 antdv-next Table", type: "`object`", default: "`{}`" },
			{ name: "tableEvents", description: "透传给 antdv-next Table 的事件", type: "`object`", default: "`{}`" },
			{ name: "tableSlots", description: "透传给 antdv-next Table 的插槽", type: "`object`", default: "`{}`" },
			{ name: "searchSlots", description: "透传给 NewbieSearch 的插槽", type: "`object`", default: "`{}`" },
			{
				name: "pagination",
				description: "是否分页，或自定义分页配置",
				type: "`boolean` | `object`",
				default: "`true`",
			},
			{ name: "pageEvents", description: "透传给分页组件的事件", type: "`object`", default: "`{}`" },
			{
				name: "autoQuery",
				description:
					"搜索条件变化后是否自动查询；默认 `false`，值会透传给内部 `NewbieSearch` 的 `autoQuery`（约 300ms 防抖，初始化与 `setQueryData` 不触发）",
				type: "`boolean`",
				default: "`false`",
			},
			{ name: "url", description: "表格数据接口", type: "`string`", default: "`\"\"`" },
			{ name: "method", description: "请求方式", type: "`get` | `post`", default: "`get`" },
			{ name: "extraData", description: "请求附加参数", type: "`object`", default: "`{}`" },
			{
				name: "afterFetched",
				description:
					"接口数据处理函数，必须返回 `{ items, totalSize }`；未提供或不是函数时组件会 `console.error` 并放弃本次结果",
				type: "`(res: any) => { items: any[]; totalSize: number }`",
				default: "`null`",
			},
			{ name: "columns", description: "列配置", type: "`TableColumnConfig[]` | `() => TableColumnConfig[]`", default: "`[]`" },
			{ name: "rowSelection", description: "行选择配置", type: "`boolean` | `object`", default: "`null`" },
			{ name: "rowKey", description: "行主键", type: "`string` | `Function`", default: "`id`" },
			{ name: "dataSource", description: "本地表格数据", type: "`any[]`", default: "`[]`" },
			{ name: "formData", description: "dataSource 的别名", type: "`any[]`", default: "`[]`" },
			{ name: "expandRender", description: "展开行内容渲染函数", type: "`Function`", default: "`null`" },
			{ name: "expandedRowKeys", description: "展开的行 key", type: "`string[]`", default: "`null`" },
			{ name: "showRefresh", description: "是否显示刷新按钮", type: "`boolean`", default: "`true`" },
			{
				name: "persistence",
				description: "持久化配置",
				type: "`boolean` | `string` | `{ key?: string; storage?: 'memory' | 'local' }`",
				default: "`false`",
			},
			{ name: "cardWrapper", description: "是否用 Card 包裹", type: "`boolean`", default: "`false`" },
		],
		events: [
			{
				name: "fetch",
				description: "没有 url 时，搜索或刷新会触发该事件，由业务自行加载数据",
				params: "`() => void`",
			},
			{
				name: "rowClick",
				description: "点击行时触发（编辑状态下不触发）",
				params: "`({ record, index, event }) => void`",
			},
			{
				name: "cellSubmit",
				description: "使用内置 submitUrl 保存单元格成功后触发",
				params: "`({ record, key, value }) => void`",
			},
		],
		slots: [
			{ name: "title", description: "自定义标题" },
			{ name: "extra", description: "Card 右上角内容（cardWrapper 时生效）" },
			{ name: "prepend", description: "搜索栏之前的内容" },
			{ name: "functional", description: "工具栏左侧内容，右侧是自定义列与刷新" },
			{ name: "append", description: "表格底部内容，有分页时与分页同行" },
		],
		methods: [
			{ name: "getData", description: "获取当前表格数据", params: "`() => any[]`" },
			{ name: "setData", description: "设置表格数据", params: "`(items: any[]) => void`" },
			{
				name: "setPagination",
				description: "设置分页信息",
				params: "`(total?: number, currentPage?: number, pageSize?: number) => void`",
			},
			{ name: "getPagination", description: "获取分页状态", params: "`() => object`" },
			{ name: "getSelection", description: "获取选中的行", params: "`() => any[]`" },
			{ name: "getQueryData", description: "获取当前搜索条件与分页参数", params: "`() => object`" },
			{ name: "setQueryData", description: "设置搜索条件", params: "`(fields: object) => void`" },
			{ name: "doFetch", description: "重新请求数据，传 true 时回到第一页", params: "`(refresh?: boolean) => Promise<void>`" },
			{ name: "setTableLoading", description: "设置表格 loading", params: "`(loading: boolean) => void`" },
		],
		types: [
			{
				id: "column",
				title: "TableColumnConfig",
				description: "在 antdv-next Column 基础上扩展的列配置。",
				columns: ["字段", "说明", "类型", "默认值"],
				rows: [
					["title", "列标题；同时作为默认搜索项标题", "`string`", "-"],
					["dataIndex", "数据字段，支持 a.b.c 嵌套", "`string` | `string[]`", "-"],
					["key", "列 key，未设置时使用 dataIndex", "`string`", "-"],
					["width", "列宽", "`number` | `string`", "-"],
					["minWidth", "最小宽度；与 onClick / onCopy 冲突", "`number`", "-"],
					["align", "对齐方式", "`left` | `center` | `right`", "-"],
					["ellipsis", "是否自动缩略", "`boolean`", "-"],
					["fixed", "固定列", "`boolean` | `left` | `right`", "-"],
					["tooltip", "表头提示", "`string` | `Function`", "-"],
					["onClick", "单元格文字变为链接", "`({ column, text, record, index }) => void`", "-"],
					["onCopy", "显示复制图标；true 复制当前文本，函数可自定义", "`boolean` | `(copy, ctx) => void`", "-"],
					["customRender", "自定义单元格内容", "`({ column, text, record, index }) => VNode`", "-"],
					["render", "兼容 antdv-next 的 render 写法", "`(text, record, index) => VNode`", "-"],
					["editable", "单元格编辑配置", "`boolean` | `TableColumnEditable`", "-"],
					["filterable", "搜索项配置", "`boolean` | `SearchItemConfig`", "-"],
					["isOnlyForQuery", "只作为搜索项，不显示列", "`boolean`", "`false`"],
					["sortable", "可排序字段配置", "`boolean` | `'asc'` | `'desc'` | `object`", "-"],
					["children", "分组表头子列", "`TableColumnConfig[]`", "-"],
				],
			},
			{
				id: "editable",
				title: "TableColumnEditable",
				description: "列 editable 传对象时的配置。",
				columns: ["字段", "说明", "类型", "默认值"],
				rows: [
					["type", "编辑控件类型", "`input` | `number` | `select` | `switch`", "`input`"],
					["key", "提交字段，默认与 dataIndex 一致", "`string`", "-"],
					["options", "select 选项；switch 时 [checked, unchecked]", "`array`", "-"],
					["beforeCellSubmit", "单元格级保存前处理", "`(data) => Promise<void>`", "-"],
					["defaultValue", "进入编辑时的默认值", "`any`", "-"],
					["defaultProps", "透传给编辑控件", "`object`", "`{}`"],
					["defaultSlots", "透传给编辑控件", "`object`", "`{}`"],
				],
			},
			{
				id: "action",
				title: "TableAction（renderTableActions）",
				description: "操作列每一项的配置。",
				columns: ["字段", "说明", "类型", "默认值"],
				rows: [
					["type", "渲染类型", "`button` | `tag` | `switch`", "`button`"],
					["name", "按钮文字；switch 时为 [开, 关] 文案", "`string` | `string[]`", "-"],
					["props", "透传给按钮 / Tag / Switch", "`object`", "`{}`"],
					["action", "点击回调", "`() => void`", "-"],
					["tooltip", "悬浮提示", "`string`", "-"],
					["children", "下拉菜单项，配置同 TableAction", "`TableAction[]`", "-"],
					["value", "switch 的选中值", "`any`", "-"],
				],
			},
		],
	},
	guide: {
		id: "remote-data",
		title: "远程数据与工具函数",
		content:
			"传入 `url` 后，表格会带上搜索条件与分页参数请求数据，并通过 `afterFetched` 转换成 `{ items, totalSize }`：\n\n```vue\n<NewbieTable\n  url=\"/api/users\"\n  :columns=\"columns\"\n  :after-fetched=\"res => ({ items: res.result.data, totalSize: res.result.total })\"\n  :extra-data=\"{ type: 1 }\"\n/>\n```\n\n`afterFetched` 的返回值契约：\n\n- 必须返回对象，包含 `items`（数组，直接作为表格 `dataSource`）与 `totalSize`（数字，开启分页时写入分页总数）；\n- 只要配置了 `url` 就必须提供函数；未提供或传入的不是函数时，组件会输出\n  `console.error(\"[NewbieTable] 使用 url 时必须提供 afterFetched，且需返回 { items, totalSize }\")`\n  并丢弃本次响应，表格不会更新；\n- 只返回 `items` 而不返回 `totalSize`、或直接返回 `undefined`，会在读取 `totalSize` 时抛错（已知问题，见 [FAQ](#afterfetched-返回什么)）。\n\n请求参数默认使用 `page` 与 `pageSize`，可以在 `NewbieProvider` 的 `table` 命名空间里改成 `page_size` 等后端约定。\n\n开启 `autoQuery` 后，搜索条件变化会由内部 `NewbieSearch` 防抖（约 300ms）触发查询；初始化和通过 `setQueryData` 程序化赋值不会触发。`autoQuery` 默认 `false`，实例 props 优先于 `NewbieProvider` 的 `table.autoQuery`。\n\n组件同时导出三个单元格渲染助手，**只能在 render 中调用**（例如列的 `customRender`）：\n\n```js\nimport { renderTableActions, renderTableImage, renderTableFile } from \"jobsys-newbie\";\n\nrenderTableActions(actions); // 操作列\nrenderTableImage(images, DefaultIcon); // 图片预览，支持单个或数组\nrenderTableFile(files, { fileName, placeholder, DefaultIcon }); // 附件链接\n```\n\n旧名字 `useTableActions` / `useTableImage` / `useTableFile` 保留为别名，行为一致，但新代码请使用 `render*`。",
	},
	provider: [
		{
			namespace: "table",
			description: "表格的全局默认值，实例 props 优先。",
			rows: [
				["pageSize", "每页条数", "`number`", "`20`"],
				["pageKey", "页码参数名", "`string`", "`page`"],
				["pageSizeKey", "每页条数参数名", "`string`", "`pageSize`"],
				["filterable", "是否显示搜索栏", "`boolean`", "`true`"],
				["pagination", "是否分页", "`boolean` | `object`", "`true`"],
				["autoQuery", "搜索条件变化后是否自动查询（透传给 NewbieSearch，约 300ms 防抖）", "`boolean`", "`false`"],
				["showRefresh", "是否显示刷新按钮", "`boolean`", "`true`"],
				["cardWrapper", "是否用 Card 包裹", "`boolean`", "`false`"],
				["method", "请求方式", "`get` | `post`", "`get`"],
				["rowKey", "行主键", "`string` | `Function`", "`id`"],
				["afterFetched", "数据处理函数，返回值契约同 props.afterFetched", "`Function`", "`null`"],
				["persistence", "持久化配置", "`boolean` | `string` | `object`", "`false`"],
			],
		},
	],
	faq: [
		{
			title: "没有 url 时搜索为什么不生效？",
			content:
				"无 `url` 时，搜索与刷新只会触发 `fetch` 事件，不会自动过滤本地数据。需要本地过滤请监听 `fetch`，通过 ref 调用 `getQueryData()` 后自行筛选并 `setData()`。",
		},
		{
			title: "afterFetched 返回什么？",
			content:
				"必须返回 `{ items, totalSize }`：\n\n```js\n{\n  items: res.result.data,      // 表格行数据\n  totalSize: res.result.total  // 分页总数\n}\n```\n\n组件会根据这个结果更新行数据与分页总数；返回结构不符合时表格会显示空数据或抛错。未提供该函数时不会静默回退到内置解析，而是输出 `console.error` 并放弃本次响应。`totalSize` 只在开启分页时使用，但返回对象里仍然建议始终带上。",
		},
		{
			title: "为什么 beforeCellSubmit 后没有触发 cellSubmit 事件？",
			content:
				"`cellSubmit` 只在使用内置 `submitUrl` 保存并成功后触发。使用 `beforeCellSubmit` 或列级 `editable.beforeCellSubmit` 时，由业务自行完成保存与提示。",
		},
		{
			title: "表格列宽拖拽为什么没有生效？",
			content:
				"antdv-next 的列宽拖拽要求 `tableLayout=\"fixed\"`，而组件默认是 `auto`。需要拖拽时请通过 `tableProps` 设置 `tableLayout: 'fixed'`，并显式配置列宽。",
		},
	],
};
