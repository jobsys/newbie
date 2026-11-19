import {
	computed,
	defineComponent,
	nextTick,
	onMounted,
	reactive,
	ref,
	watch,
	withModifiers,
} from "vue";
import { Button, Card, Table, Tooltip, message } from "antdv-next";
import { cloneDeep, isArray, isEqual, isFunction, isObject, isUndefined } from "lodash-es";
import { CopyOutlined, InfoCircleOutlined, SyncOutlined } from "@antdv-next/icons";
import { useClipboard } from "@vueuse/core";
import { useFetch, usePersistenceScope, useProcessStatusSuccess, useT } from "../../hooks";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import NewbieSearch from "../search/NewbieSearch.jsx";
import i18n from "../../i18n";
import { tableDefaults } from "./config.js";
import { createTableSnapshot, readTableSnapshot, TABLE_STATE_KEY } from "./persistence.js";
import {
	collectVisibleColumns,
	ensureColumnKeys,
	extractFilterableColumns,
	extractSortableColumns,
	flattenCustomColumns,
	normalizeColumns,
} from "./columns.js";
import { renderColumnText, useTableEdit } from "./useTableEdit.jsx";
import CustomColumnsModal from "./CustomColumnsModal.jsx";

import "./index.less";

// 渲染助手已抽到 ./helpers.jsx，这里保留同名导出以兼容旧的深层导入
export {
	renderTableActions,
	renderTableImage,
	renderTableFile,
	useTableActions,
	useTableImage,
	useTableFile,
} from "./helpers.jsx";

/**
 * Newbie 表格组件
 * @version 1.0.0
 */
export default defineComponent({
	name: "NewbieTable",
	props: {
		/**
		 * 表格标题
		 */
		title: { type: String, default: "" },

		/**
		 * 是否使用表单搜索，默认读取 `tableDefaults.filterable`（true）
		 */
		filterable: { type: Boolean, default: undefined },

		/**
		 * 原生表格属性
		 */
		tableProps: { type: Object, default: () => ({}) },

		/**
		 * 原生表格事件
		 */
		tableEvents: { type: Object, default: () => ({}) },

		/**
		 * 原生 slots
		 */
		tableSlots: { type: Object, default: () => ({}) },

		/**
		 * NewbieSearch slots
		 */
		searchSlots: { type: Object, default: () => ({}) },

		/**
		 * 是否使用分页，为 Object 时使用自定义分页，默认读取 `tableDefaults.pagination`（true）
		 */
		pagination: { type: [Boolean, Object], default: undefined },

		/**
		 * 原生翻页事件
		 */
		pageEvents: { type: Object, default: () => ({}) },

		/**
		 * 是否在搜索条件变化时自动搜索，默认读取 `tableDefaults.autoQuery`（false）
		 */
		autoQuery: { type: Boolean, default: undefined },

		/**
		 * 表格数据请求 URL
		 */
		url: { type: String, default: "" },

		/**
		 * v1.18
		 * 是否启用单元格编辑，默认读取 `tableDefaults.editable`（false）
		 */
		editable: { type: Boolean, default: undefined },

		/**
		 * v1.18
		 * 单元格编辑提交的 URL，默认读取 `tableDefaults.submitUrl`（""）
		 */
		submitUrl: { type: String, default: undefined },

		/**
		 * v1.18
		 * 单元格编辑提交的前置方法, 返回一个 Promise，默认读取 `tableDefaults.beforeCellSubmit`（null）
		 */
		beforeCellSubmit: { type: Function, default: undefined },

		/**
		 * 表格请求方式，默认读取 `tableDefaults.method`（get）
		 *
		 * @values get, post
		 */
		method: { type: String },

		/**
		 * 请求数据时额外提交的参数
		 */
		extraData: { type: Object, default: () => ({}) },

		/**
		 * 请求后 Res 的处理方法, 如有 url， 则该方法必须传，默认读取 `tableDefaults.afterFetched`（null）
		 */
		afterFetched: { type: Function, default: undefined },

		/**
		 * @typedef {Object} TableColumnConfig
		 * @property {string} title - 列标题
		 * @property {string} dataIndex - 列数据在数据项中对应的 key，支持 a.b.c 的嵌套写法
		 * @property {string} key - Vue 需要的 key，如果已经设置了唯一的 dataIndex，可以忽略这个属性
		 * @property {string} [width] - 列宽度
		 * @property {string} [minWidth] - 最小宽度，支持占满其它空位 与 onClick 冲突 v1.18
		 * @property {string} [align] - 对齐方式
		 * @property {string|Function} [tooltip] - 提示 v1.18
		 * @property {Function} [onClick] - 生成链接可点击，有 minWidth 冲突失效  v1.18
		 * @property {Function|boolean} [onCopy] - 自动生成 copy 图标并支持单击复制，默认复制当前文本， minWidth 冲突失效  v2.0.16
		 * @property {boolean|TableColumnEditable} [editable] - 是否可编辑，如果是对象，则为编辑配置，为 true 时 `editable.type = 'input'`
		 * @property {boolean} [ellipsis] - 是否自动缩略
		 * @property {boolean} [fixed] - 列是否固定，可选 true(等效于 left) 'left' 'right'
		 * @property {boolean|SearchItemConfig} [filterable] - 是否可过滤，如果是对象，则为过滤配置，为 true 时 `filterable.type = 'input'`
		 * @property {boolean} [isOnlyForQuery] - 是否只用于搜索
		 */

		/**
		 * @typedef {Object} TableColumnEditable
		 * @property {string} [type] - 编辑类型, 支持 input(默认), number, select, switch
		 * @property {string} [key] - 字段 key, 默认与 dataIndex 一致
		 * @property {array} [options] - 选项，当 type 为 select 时必填，如果 type 为 switch, options[0] 为 checked, options[1] 为 unchecked
		 * @property {Function} [beforeCellSubmit] - 单元格编辑提交的前置方法, 返回一个 Promise
		 * @property {*} [defaultValue] 默认编辑时的值
		 * @property {Object} [defaultProps] - 编辑项配置
		 * @property {Object} [defaultSlots] - 编辑项 Slot
		 */

		/**
		 * 表格列定义, [TableColumnConfig ](#tablecolunmconfig-配置)
		 */
		columns: { type: [Array, Function], default: () => [] },

		/**
		 * 选择功能的配置
		 */
		rowSelection: { type: [Boolean, Object], default: () => null },

		/**
		 * 数据值需要指定 key 值，当启用 `rowSelection` 时一定要指定这个 key，默认读取 `tableDefaults.rowKey`（id）
		 */
		rowKey: { type: [String, Function] },

		/**
		 * 表格数据
		 */
		dataSource: { type: Array, default: () => [] },

		/**
		 * 表格数据, alias of `dataSource`
		 */
		formData: { type: Array, default: () => [] },

		/**
		 * 额外的展开行
		 */
		expandRender: { type: [String, Function], default: null },

		/**
		 * 展开的行
		 */
		expandedRowKeys: { type: Array, default: () => null },

		/**
		 * 是否显示刷新按钮，默认读取 `tableDefaults.showRefresh`（true）
		 */
		showRefresh: { type: Boolean, default: undefined },

		/**
		 * 持久化，传入 localStorage 的 key，如果为 true, 将会以 URL Hash 为 key，默认读取 `tableDefaults.persistence`（false）
		 */
		persistence: { type: [Boolean, String, Object], default: undefined },

		/**
		 * 内部 NewbieSearch 的持久化配置；不传时沿用 persistence
		 * 冷数据默认交给“恢复上次查询”入口，避免旧条件影响本次查询
		 */
		searchPersistence: { type: [Boolean, String, Object], default: undefined },

		/**
		 * v1.18
		 * 是否用 `Card` 包裹，默认读取 `tableDefaults.cardWrapper`（false）
		 */
		cardWrapper: { type: Boolean, default: undefined },
	},
	emits: [
		/**
		 * 未传入 `url` 时的手动请求方法
		 */
		"fetch",

		/**
		 * 行点击 v1.18
		 */
		"rowClick",

		/**
		 * 单元格编辑 v1.18
		 */
		"cellSubmit",
	],
	setup(rawProps, { emit, slots, expose }) {
		const props = useMergedProps(rawProps, "table", tableDefaults);

		const searchRef = ref();
		const tableRef = ref();

		const { copy } = useClipboard({ legacy: true });

		/**
		 * 解析行标识，兼容 rowKey 为函数的情况（F-014）
		 * @param {object} record
		 * @returns {*}
		 */
		const getRowKey = record =>
			isFunction(props.rowKey) ? props.rowKey(record) : record?.[props.rowKey];

		/**
		 * 表格与内部搜索栏各自持有一份持久化配置：
		 * - 表格保存分页与自定义列显隐，冷数据始终自动恢复；
		 * - 搜索栏默认沿用表格配置，但冷数据默认交给“恢复上次查询”入口。
		 */
		const searchPersistenceProp = computed(() => props.searchPersistence ?? props.persistence);
		const { store: persistTable } = usePersistenceScope("table", () => props.persistence);

		// 表格视图状态始终自动恢复（restore 只影响搜索栏），快照不合法时按无持久化处理
		const persistedState = readTableSnapshot(persistTable.value?.read(TABLE_STATE_KEY, null)) ?? {
			pagination: {},
			columnKey: {},
		};
		const persistencePagination = persistedState.pagination;

		const state = reactive({
			tableLoading: { loading: false },
			customColumnVisible: false,
			pagination: {
				totalSize: 0,
				currentPage: persistencePagination.currentPage || 1,
				pageSize: persistencePagination.pageSize || props.pagination?.pageSize || props.pageSize,
			},
			tableSelection: [], // 给外部用
			tableKeySelection: [], // 内部用
			items: [],
			columnKey: { ...persistedState.columnKey },
			lastRequestId: 0, // 最近一次请求的 id，用于丢弃过期响应
			searchFormData: {},
		});

		const { isRowEditing, renderEditableCell } = useTableEdit({
			props,
			tableLoading: state.tableLoading,
			getRowKey,
			emit,
		});

		watch(
			() => props.pagination?.pageSize || props.pageSize,
			nextSize => {
				if (!persistencePagination.pageSize && nextSize) {
					state.pagination.pageSize = nextSize;
				}
			}
		);

		/**
		 * 持久化表格视图状态：分页 + 自定义列显隐
		 */
		const onPersistence = () => {
			if (!persistTable.value) return;
			persistTable.value.write(
				TABLE_STATE_KEY,
				createTableSnapshot({
					pagination: state.pagination,
					columnKey: state.columnKey,
				})
			);
		};

		const onCustomSubmit = checkedKeys => {
			Object.keys(state.columnKey).forEach(key => {
				state.columnKey[key] = checkedKeys.includes(key);
			});
			// 列显隐变化立即落盘，不依赖下一次翻页
			onPersistence();
		};

		const onSelectionChange = (selectedRowKeys, selectedRows) => {
			state.tableKeySelection = [].concat(selectedRowKeys);
			state.tableSelection = [].concat(selectedRows);
		};

		const getQueryData = () => {
			const params = { ...state.searchFormData, ...props.extraData };
			if (props.pagination) {
				if (state.pagination.pageSize) {
					params[props.pageSizeKey] = state.pagination.pageSize;
				}
				params[props.pageKey] = state.pagination.currentPage;
			}
			return params;
		};

		const setQueryData = fields => {
			searchRef.value?.setQueryForm(fields);
		};

		/**
		 * 恢复的页码超过实际页数时回落到最后一页
		 * @return {boolean} 是否发生了回落
		 */
		const clampPageToLast = () => {
			if (!props.pagination) return false;

			const { totalSize, pageSize, currentPage } = state.pagination;
			if (!pageSize || !totalSize) return false;

			const lastPage = Math.max(1, Math.ceil(totalSize / pageSize));
			if (currentPage <= lastPage) return false;

			state.pagination.currentPage = lastPage;
			return true;
		};

		const fetchItems = async () => {
			const params = getQueryData();
			const method = props.method;
			const data = method === "get" ? { params } : { ...params };
			// 只认最后一次请求：响应回来时 id 不是最新的就丢弃，避免旧数据覆盖新数据
			const requestId = ++state.lastRequestId;

			const res = await useFetch(state.tableLoading)[method](props.url, data);
			useProcessStatusSuccess(res, () => {
				if (requestId !== state.lastRequestId) return;

				state.tableKeySelection = [];
				state.tableSelection = [];

				// afterFetched 由 props / Provider / tableDefaults 合并而来，缺省时给出明确报错
				const fetched = isFunction(props.afterFetched)
					? props.afterFetched
					: tableDefaults.afterFetched;
				if (!isFunction(fetched)) {
					console.error(
						"[NewbieTable] 使用 url 时必须提供 afterFetched，且需返回 { items, totalSize }"
					);
					return;
				}

				const result = fetched(res);
				if (!result || !isArray(result.items)) {
					console.error(
						"[NewbieTable] afterFetched 必须返回 { items, totalSize }，items 需为数组"
					);
					return;
				}

				if (props.pagination) {
					state.pagination.totalSize = result.totalSize ?? 0;
				}
				state.items = result.items;

				// 页码越界（恢复的旧页码 / 数据变少）时回到最后一页并重新取数
				if (clampPageToLast()) {
					fetchItems();
				}
			});
		};

		/**
		 * 执行获取数据
		 * @param {boolean} refresh 是否刷新
		 * @return {Promise<void>}
		 */
		const doFetch = async refresh => {
			if (refresh === true) {
				state.pagination.currentPage = 1;
			}

			if (props.url) {
				await fetchItems();
			} else {
				emit("fetch");
			}

			onPersistence();
		};

		const onSearch = searchData => {
			const { persistence, ...formData } = searchData || {};
			state.searchFormData = formData;
			doFetch(!persistence);
		};

		/********** columns **********/

		const totalColumns = computed(() => {
			let columns;
			if (isFunction(props.columns)) {
				columns = props.columns();
			} else if (props.columns.length) {
				columns = props.columns;
			} else {
				columns = props.tableProps.columns || [];
			}
			return normalizeColumns(columns);
		});

		const displaySourceColumns = computed(() =>
			totalColumns.value.filter(item => !item.isOnlyForQuery)
		);

		watch(
			displaySourceColumns,
			columns => {
				ensureColumnKeys(columns, state.columnKey);
			},
			{ immediate: true }
		);

		const customColumns = computed(() => flattenCustomColumns(displaySourceColumns.value));
		const tableColumns = computed(() =>
			collectVisibleColumns(displaySourceColumns.value, state.columnKey)
		);
		const filterableColumns = computed(() => extractFilterableColumns(totalColumns.value));
		const sortableColumns = computed(() => extractSortableColumns(totalColumns.value));

		/**
		 * 仅在 antd 真正渲染分页后，才让 Append 与分页共用一行。
		 * 不能只根据 props.pagination 添加 class：空数据时 antd 会隐藏分页，
		 * 此时旧版负 margin 会让空 footer 压住表格底部。
		 */
		const syncPaginationAdapt = () => {
			const hasPagination = !!tableRef.value?.querySelector(".ant-table-pagination");
			tableRef.value?.classList.toggle("pagination-adapt", hasPagination);
		};

		watch(
			() => [
				props.pagination,
				props.tableProps.pagination,
				state.items.length,
				state.pagination.totalSize,
				tableRef.value,
			],
			() => nextTick(syncPaginationAdapt),
			{ immediate: true, flush: "post" }
		);

		watch(
			() => props.formData,
			(newValue, oldValue) => {
				if (!isEqual(newValue, oldValue)) {
					state.items = newValue;
				}
			}
		);

		watch(
			() => props.dataSource,
			(newValue, oldValue) => {
				if (!props.url && !isEqual(newValue, oldValue)) {
					state.items = newValue;
				}
			}
		);

		const initFetch = () => {
			if (props.url) {
				state.searchFormData = searchRef.value?.getSearch();
				nextTick(() => fetchItems());
				return;
			}

			if (props.formData.length) {
				state.items = props.formData;
			} else if (props.dataSource.length) {
				state.items = props.dataSource;
			}
			emit("fetch");
		};

		onMounted(() => {
			// 1. 手动 fetch 需要等待 mounted 后调用 ref 方法；
			// 2. 启用搜索持久化且存在 Search 时，由 Search 初始化后触发 onSearch 拉取数据；
			// 3. 其余场景直接在此初始化。
			if (!searchPersistenceProp.value || !props.filterable) {
				initFetch();
			}
		});

		/********** exposes **********/

		const getData = () => [].concat(state.items);
		const setData = items => {
			state.items = items;
		};
		const setPagination = (total, currentPage, pageSize) => {
			if (!isUndefined(total)) state.pagination.totalSize = total;
			if (!isUndefined(currentPage)) state.pagination.currentPage = currentPage;
			if (!isUndefined(pageSize)) state.pagination.pageSize = pageSize;
		};
		const getPagination = () => state.pagination;
		const getSelection = () => [].concat(state.tableSelection);
		const setTableLoading = loading => (state.tableLoading.loading = loading);

		expose({
			getData,
			setData,
			setPagination,
			getPagination,
			getSelection,
			getQueryData,
			setQueryData,
			doFetch,
			setTableLoading,
			refreshStatusCounts: force => searchRef.value?.refreshStatusCounts(force),
		});

		/********** table props **********/

		// 用 computed 缓存，避免每次渲染都新建对象导致 antd Table 重置内部状态（F-052）
		const handleTable = computed(() => ({
			bordered: true,
			size: "middle",
			scroll: {
				y: 570,
				x: 1000,
				scrollToFirstRowOnChange: true,
			},
			rowClassName: (_record, index) => (index % 2 === 1 ? "newbie-table-striped" : null),
			expandedRowRender: props.expandRender,
			expandedRowKeys: props.expandedRowKeys,
			/**
			 * 展开列必须给出明确宽度。
			 * antdv-next 生成的展开列默认没有 width，空数据时表头 colgroup 里就有一列没有列宽，
			 * 列宽会按容器重新分配，固定列（展开列 / 选择列）的 sticky 偏移与真实列宽对不上，
			 * 出现选择列压住第一列、表头与容器对不齐的错乱。
			 */
			expandable: {
				columnWidth: 48,
			},
			rowKey: props.rowKey,
			onRow: (record, index) => ({
				onClick: event => {
					if (isRowEditing(record)) {
						// 编辑中不触发 rowClick，避免输入交互误触发行点击
						return;
					}
					emit("rowClick", { record, index, event });
				},
			}),
			...props.tableProps,
		}));

		const handlePagination = computed(() => {
			if (!props.pagination) return false;

			const custom = isObject(props.pagination) ? cloneDeep(props.pagination) : {};
			return {
				size: "small",
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: total => useT("table.total", { total }),
				pageSizeOptions: ["10", "20", "30", "50", "100", "300", "500"],
				total: state.pagination.totalSize,
				pageSize: state.pagination.pageSize,
				current: state.pagination.currentPage,
				"onUpdate:current": value => {
					state.pagination.currentPage = value;
				},
				"onUpdate:pageSize": value => {
					state.pagination.pageSize = value;
				},
				onChange: () => {
					doFetch(false);
				},
				showSizeChange: () => {
					doFetch(true);
				},
				...custom,
			};
		});

		const handleRowSelection = computed(() => {
			if (!props.rowSelection) return null;

			const custom = isObject(props.rowSelection) ? cloneDeep(props.rowSelection) : {};
			return {
				selectedRowKeys: state.tableKeySelection,
				preserveSelectedRowKeys: true,
				columnWidth: 40,
				fixed: true,
				onChange: onSelectionChange,
				...custom,
			};
		});

		/********** render helpers **********/

		const renderHeaderCell = ({ column }) => {
			const tooltipElem = column.tooltip ? (
				isFunction(column.tooltip) ? (
					<Tooltip>
						{{
							default: () => <InfoCircleOutlined style={{ marginLeft: "5px" }} />,
							title: column.tooltip,
						}}
					</Tooltip>
				) : (
					<Tooltip title={column.tooltip}>
						{() => <InfoCircleOutlined style={{ marginLeft: "5px" }} />}
					</Tooltip>
				)
			) : null;

			const funcElems = [];
			if (props.editable && column.editable) {
				funcElems.push(<span class={"newbie-table-header-func"}>{useT("table.editable")}</span>);
			}

			return (
				<div class={`newbie-table-header-wrapper ${funcElems.length ? "with-func" : ""}`}>
					<div class={"newbie-table-header-title-wrapper"}>
						<span>{column.title}</span>
						{tooltipElem}
					</div>
					<div class={"newbie-table-header-func-wrapper"}>{funcElems}</div>
				</div>
			);
		};

		const renderBodyCell = row => {
			const { column, text, record, index } = row;

			if (props.editable && column.editable) {
				return renderEditableCell(row);
			}

			if (column.customRender || column.render) {
				return renderColumnText(row);
			}

			if (column.onClick) {
				return (
					<a
						href="javascript:void(0);"
						onClick={withModifiers(() => column.onClick({ column, text, record, index }), ["stop"])}
					>
						{text}
					</a>
				);
			}

			if (column.onCopy) {
				return (
					<span
						class={"table-copy-wrapper"}
						onClick={withModifiers(() => {
							if (column.onCopy === true) {
								copy(text);
							} else {
								column.onCopy(copy, { column, text, record, index });
							}
							message.success(i18n.global.t("table.copy-success"));
						}, ["stop"])}
					>
						<span class={"table-copy-content"}>{text}</span>
						<CopyOutlined />
					</span>
				);
			}

			return <span>{text}</span>;
		};

		const renderTitle = () => {
			if (slots.title) {
				return <div class={"newbie-table-title-wrapper"}>{slots.title()}</div>;
			}
			if (props.title) {
				return <div class={"newbie-table-title-wrapper"}>{props.title}</div>;
			}
			return null;
		};

		const renderPrepend = () =>
			slots.prepend ? <div class={"newbie-table-prepend-wrapper"}>{slots.prepend()}</div> : null;

		const renderFilter = () =>
			props.filterable ? (
				<NewbieSearch
					ref={searchRef}
					persistence={searchPersistenceProp.value}
					autoQuery={props.autoQuery}
					filterableColumns={filterableColumns.value}
					sortableColumns={sortableColumns.value}
					onSearch={onSearch}
				>
					{{ ...props.searchSlots }}
				</NewbieSearch>
			) : null;

		const renderFunctional = () => (
			<div class={"newbie-table-functional-wrapper"}>
				<div class={"newbie-table-functional"}>{slots.functional?.()}</div>
				<div class={"newbie-table-functional-default"}>
					{props.filterable ? (
						<Button
							type={"link"}
							style={{ marginRight: "5px" }}
							onClick={() => (state.customColumnVisible = true)}
						>
							{() => useT("table.custom")}
						</Button>
					) : null}
					{props.showRefresh ? (
						<Button
							class={"newbie-table-refresh"}
							icon={<SyncOutlined />}
							onClick={() => doFetch(false)}
						/>
					) : null}
				</div>
			</div>
		);

		const renderTable = () => (
			<Table
				rowSelection={handleRowSelection.value}
				pagination={handlePagination.value}
				loading={state.tableLoading.loading}
				dataSource={state.items}
				columns={tableColumns.value}
				{...handleTable.value}
			>
				{{
					headerCell: renderHeaderCell,
					bodyCell: renderBodyCell,
					...props.tableSlots,
				}}
			</Table>
		);

		const renderFooter = () =>
			slots.append ? (
				<div class={"newbie-table-footer"}>
					<div class={"newbie-table-append-wrapper"}>{slots.append()}</div>
					<div class={"newbie-table-pagination-wrapper"} />
				</div>
			) : null;

		return () => (
			<div class={"newbie-table"} ref={tableRef}>
				{props.cardWrapper ? (
					<Card size={"small"} class={"newbie-table-card"}>
						{{
							title: renderTitle,
							extra: () => slots.extra?.() ?? null,
							default: () => [
								renderPrepend(),
								renderFilter(),
								renderFunctional(),
								renderTable(),
								renderFooter(),
							],
						}}
					</Card>
				) : (
					[
						renderPrepend(),
						renderFilter(),
						<div class={"newbie-table-content"}>
							{[renderFunctional(), renderTable(), renderFooter()]}
						</div>,
					]
				)}

				<CustomColumnsModal
					v-model:open={state.customColumnVisible}
					columns={customColumns.value}
					columnKey={state.columnKey}
					onSubmit={onCustomSubmit}
				/>
			</div>
		);
	},
});
