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
import {
    Button,
    Card,
    Checkbox,
    CheckboxGroup,
    Col,
    Divider,
    Input,
    InputNumber,
    message,
    Modal,
    Row,
    Select,
    Switch,
    Table,
    Tooltip,
} from "antdv-next";
import {cloneDeep, isArray, isEqual, isFunction, isObject, isUndefined,} from "lodash-es";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    EditOutlined,
    InfoCircleOutlined,
    SyncOutlined,
} from "@antdv-next/icons";
import {parsePersistenceConfig, useFetch, usePersistence, useProcessStatusSuccess, useSm3, useT} from "../../hooks";
import {tableDefaults} from "./config.js";
import {useMergedProps} from "../../hooks/useMergedProps.js";
import NewbieSearch from "../search/NewbieSearch.jsx";
import i18n from "../../i18n";
import {useClipboard} from "@vueuse/core";

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
 * 获取列的唯一 key
 * key 与 dataIndex 都可能是数组（嵌套路径），需要统一转成字符串，
 * 否则自定义列弹窗中 checkbox 的 value 会是数组，无法与 columnKey 的字符串 key 匹配
 * @param item
 * @returns {*}
 */
const getKey = item => {
	const key = item.key || item.dataIndex;
	return isArray(key) ? key.join(".") : key;
};

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
		 *  原生表格属性
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
		 * 是否使用分页，为 Object 时时使用自定义分页，默认读取 `tableDefaults.pagination`（true）
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
		 *  数据值需要指定 key 值，当启用 `rowSelection` 时一定要指定这个 key，默认读取 `tableDefaults.rowKey`（id）
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

		const persistenceConf = computed(() => parsePersistenceConfig(props.persistence));

		const persistenceNamespace = computed(() => {
			if (!persistenceConf.value.enabled) return null;
			const { key } = persistenceConf.value;
			if (!key) return `table_${useSm3(location.href)}`;
			return `table_${useSm3(location.pathname + "_" + key)}`;
		});

		const persistTable = computed(() => {
			const ns = persistenceNamespace.value;
			if (!ns) return null;
			return usePersistence(ns, { storage: persistenceConf.value.storage });
		});

		let persistencePagination = persistTable.value
			? persistTable.value.loadWithFallback("pagination", {})
			: {};

		const state = reactive({
			customColumns: [],
			tableColumns: [],
			editingData: {}, //编辑中的单元格
			editingSwitchData: {}, //可编辑的 Switch 的值, 因为 Switch 的逻辑与其它类型不同，不能复用editingData
			filterableColumns: [], // 可过滤的列
			sortableColumns: [], // 可排序的列
			temporary: {}, // 用于存放一些临时数据
			tableLoading: { loading: false }, // 翻页Loading
			customColumnVisible: false,
			columnKeyModal: [],
			pagination: {
				// 翻页数据
				totalSize: 0,
				currentPage: persistencePagination.currentPage || 1,
				pageSize: persistencePagination.pageSize || props.pagination?.pageSize || props.pageSize,
			},
			id: "",
			tableSelection: [], // 给外部用
			tableKeySelection: [], // 内部用
			items: [], // 表格内容
			columnKey: {}, // 自定义列
			lastRequestId: 0, // 最近一次请求的 id，用于丢弃过期响应
			searchFormData: {}, // 搜索表单数据
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
		 * 持久化翻页与滚动
		 */
		const onPersistence = () => {
			if (!persistTable.value) {
				return;
			}

			persistTable.value.save("pagination", { ...state.pagination });
		};

		const onOpenCustomColumns = () => {
			// 复制一份
			state.columnKeyModal = [];
			Object.keys(state.columnKey).forEach(key => {
				if (state.columnKey[key]) {
					state.columnKeyModal.push(key);
				}
			});
			state.customColumnVisible = true;
		};

		const onCustomClearAll = () => {
			state.columnKeyModal = [];
		};

		const onCustomSelectAll = () => {
			onCustomClearAll();

			Object.keys(state.columnKey).forEach(key => {
				state.columnKeyModal.push(key);
			});
		};

		const onSelectionChange = (selectedRowKeys, selectedRows) => {
			state.tableKeySelection = [].concat(selectedRowKeys);
			state.tableSelection = [].concat(selectedRows);
		};

		const onCustomSubmit = () => {
			Object.keys(state.columnKey).forEach(key => {
				state.columnKey[key] = state.columnKeyModal.indexOf(key) > -1;
			});
			state.customColumnVisible = false;
		};

		const getQueryData = () => {
			let params = { ...state.searchFormData, ...props.extraData };
			if (props.pagination) {
				if (state.pagination.pageSize) {
					params[props.pageSizeKey] = state.pagination.pageSize;
				}
				params[props.pageKey] = state.pagination.currentPage;
			}
			return params;
		};

		const setQueryData = fields => {
			if (searchRef.value) {
				searchRef.value?.setQueryForm(fields);
			}
		};

		const fetchItems = async () => {
			let data = {},
				params = getQueryData();
			// 只认最后一次请求：响应回来时 id 不是最新的就丢弃，避免旧数据覆盖新数据
			const requestId = ++state.lastRequestId;

			const method = props.method;

			if (method === "get") {
				data = { params };
			} else if (method === "post") {
				data = { ...params };
			}

			const res = await useFetch(state.tableLoading)[method](props.url, data);
			useProcessStatusSuccess(res, () => {
				// 过期响应直接丢弃（loading 已由 useFetch 结束）
				if (requestId !== state.lastRequestId) {
					return;
				}
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
			});
		};

		/**
		 * 执行获取数据
		 * @param {boolean} refresh 是否刷新
		 * @return {*}
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

		const tidyColumnsRecursion = columns => {
			const result = [];
			if (columns && columns.length) {
				columns.forEach(column => {
					const item = cloneDeep(column);
					const key = getKey(item);
					if (key && isUndefined(state.columnKey[key])) {
						state.columnKey[key] = true;
					}
					if (!item.children) {
						if ((key && state.columnKey[key]) || !key) {
							result.push(item);
						}
					} else {
						const res = tidyColumnsRecursion([].concat(item.children));
						if (res.length) {
							item.children = res;
							if ((key && state.columnKey[key]) || !key) {
								result.push(item);
							}
						}
					}
				});
			}
			return result;
		};

		/**
		 * 用于获取自定义列
		 * @param columns
		 * @returns {*[]}
		 */
		const tidyCustomColumnsRecursion = columns => {
			let result = [];
			if (columns && columns.length) {
				columns.forEach(column => {
					const item = cloneDeep(column);
					item.checkKey = getKey(item);
					if (!item.children) {
						result.push(item);
					} else {
						const res = tidyCustomColumnsRecursion(item.children);
						delete item.children;
						result.push(item);
						result = result.concat(res);
					}
				});
			}

			return result;
		};

		const totalColumns = computed(() => {
			let columns;
			if (isFunction(props.columns)) {
				columns = props.columns();
			} else if (props.columns.length) {
				columns = props.columns;
			} else {
				columns = props.tableProps.columns || [];
			}
			// 不改写调用方传入的列对象，改为返回浅拷贝后的新列（F-021）
			return columns.map(item => ({
				...item,
				key: getKey(item),
				...(item.minWidth
					? {
							width: item.minWidth,
							RC_TABLE_INTERNAL_COL_DEFINE: {
								style: {
									"min-width": `${item.minWidth}px`,
								},
							},
						}
					: {}),
			}));
		});

		const prepareFormColumns = () => {
			const originColumns = totalColumns.value.filter(item => {
				return !item.isOnlyForQuery;
			});

			state.customColumns = tidyCustomColumnsRecursion([].concat(originColumns));
			// 显示列表数组
			state.tableColumns = tidyColumnsRecursion([].concat(originColumns));
		};

		const prepareSearchColumns = () => {
			state.filterableColumns = totalColumns.value
				.filter(item => {
					return item.filterable || item.isOnlyForQuery;
				})
				.map(item => {
					return {
						title: item.title,
						key: getKey(item),
						options: item.options,
						...item.filterable,
					};
				});

			state.sortableColumns = totalColumns.value
				.filter(item => item.sortable)
				.map(item => {
					let column = {
						title: item.title,
						key: getKey(item),
					};

					if (item.sortable === "asc" || item.sortable === "ASC") {
						column.direction = "asc";
					} else if (item.sortable === "desc" || item.sortable === "DESC") {
						column.direction = "desc";
					} else {
						column = { ...column, ...item.sortable };
					}
					return column;
				});
		};

		watch(
			() => [totalColumns, state.columnKey],
			(newValues, preValues) => {
				prepareFormColumns();
				//只有 Columns 确实发生变化了才重新渲染 Search,否则会导致 Search 的值丢失
				if (
					!preValues ||
					!isEqual(
						newValues[0].value.map(item => getKey(item)).toSorted(),
						preValues[0].value.map(item => getKey(item)).toSorted()
					)
				) {
					prepareSearchColumns();
				}
			},
			{ immediate: true, deep: true }
		);

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

		/**
		 * 第一次拿数据
		 */
		const initFetch = () => {
			if (props.url) {
				//如果有默认搜索条件先拿出来
				state.searchFormData = searchRef.value?.getSearch();
				nextTick(() => fetchItems());
			} else {
				if (props.formData.length) {
					state.items = props.formData;
				}

				if (props.dataSource.length) {
					state.items = props.dataSource;
				}

				emit("fetch");
			}
		};

		onMounted(() => {
			//1. 因为手动 fetch 需要调用 $ref 的 getQueryForm 等方法，所以需要 mounted 后才执行 fetch
			//2. 当有持久化且存在 Search 组件时，需要等待 Search 初始化后（onMounted）触发搜索事件来拉取数据
			//3. 如果没有 Search（filterable=false），或未开启持久化，直接在此处 initFetch
			if (!props.persistence || !props.filterable) {
				initFetch();
			}
		});

		/**
		 * 获取当前页的数据
		 * @returns {*[]}
		 */
		const getData = () => {
			return [].concat(state.items);
		};

		/**
		 * 设置数据
		 * @param items
		 */
		const setData = items => {
			state.items = items;
		};

		/**
		 * 设置翻页数据
		 * @param {int} total
		 * @param {int} currentPage
		 * @param {int} pageSize
		 */
		const setPagination = (total, currentPage, pageSize) => {
			if (!isUndefined(total)) {
				state.pagination.totalSize = total;
			}
			if (!isUndefined(currentPage)) {
				state.pagination.currentPage = currentPage;
			}
			if (!isUndefined(pageSize)) {
				state.pagination.pageSize = pageSize;
			}
		};

		/**
		 * 获取翻页数据
		 * @returns {*}
		 */
		const getPagination = () => state.pagination;

		/**
		 * 获取已选择的行数据
		 * @returns {*[]}
		 */
		const getSelection = () => [].concat(state.tableSelection);

		/**
		 * 设置表格 loading 状态
		 * @param {boolean} loading
		 */
		const setTableLoading = loading => (state.tableLoading.loading = loading);

		/********** exposes **********/

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
		});

		/********** render **********/

		const titleElem = () => {
			if (slots.title) {
				return <div class={"newbie-table-title-wrapper"}>{slots.title()}</div>;
			} else if (props.title) {
				return <div class={"newbie-table-title-wrapper"}>{props.title}</div>;
			}
			return null;
		};

		const prependElem = () =>
			slots.prepend ? <div class={"newbie-table-prepend-wrapper"}>{slots.prepend()}</div> : null;

		const filterElem = () =>
			props.filterable
				? [
						<NewbieSearch
							ref={searchRef}
							persistence={props.persistence}
							autoQuery={props.autoQuery}
							filterableColumns={state.filterableColumns}
							sortableColumns={state.sortableColumns}
							onSearch={onSearch}
						>
							{{
								...props.searchSlots,
							}}
						</NewbieSearch>,
					]
				: null;

		const functionalElem = () => (
			<div class={"newbie-table-functional-wrapper"}>
				<div class={"newbie-table-functional"}>{slots.functional ? slots.functional() : null}</div>
				<div class={"newbie-table-functional-default"}>
					{props.filterable ? (
						<Button type={"link"} style={{ marginRight: "5px" }} onClick={onOpenCustomColumns}>
							{() => useT("table.custom")}
						</Button>
					) : null}
					{props.showRefresh ? (
						<Button
							class={"newbie-table-refresh"}
							icon={<SyncOutlined />}
							onClick={() => doFetch(false)}
						></Button>
					) : null}
				</div>
			</div>
		);

		// 用 computed 缓存，避免每次渲染都新建对象导致 antd Table 重置内部状态（F-052）
		const handleTable = computed(() => {
			return {
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
						const isEditing = state.editingData[getRowKey(record)];
						if (isEditing) {
							//如果在编辑就不触发 rowClick, 否则在输入等情况下 Click 操作都会触发，不好避免
							return;
						}
						emit("rowClick", { record, index, event });
					},
				}),
				...props.tableProps,
			};
		});

		const handlePagination = computed(() => {
			let pagination = !props.pagination
				? false
				: isObject(props.pagination)
					? cloneDeep(props.pagination)
					: {};
			if (isObject(pagination)) {
				pagination = {
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
					...pagination,
				};
			}

			return pagination;
		});

		const handleRowSelection = computed(() => {
			let rowSelection = !props.rowSelection
				? null
				: isObject(props.rowSelection)
					? cloneDeep(props.rowSelection)
					: {};

			if (isObject(rowSelection)) {
				rowSelection = {
					selectedRowKeys: state.tableKeySelection,
					preserveSelectedRowKeys: true,
					columnWidth: 40,
					fixed: true,
					onChange: onSelectionChange,
					...rowSelection,
				};
			}

			return rowSelection;
		});

		const onEditTableCell = (editable, record, key, value) => {
			if (state.editingData[getRowKey(record)]) {
				state.editingData[getRowKey(record)][key] = value;
			} else {
				state.editingData[getRowKey(record)] = { [key]: value };
			}
		};
		const onCancelEditTableCell = (record, key) => {
			if (state.editingData[getRowKey(record)]) {
				delete state.editingData[getRowKey(record)][key];
			}
		};

		const onSubmitTableCell = async (editable, record, key) => {
			if (!props.submitUrl && !props.beforeCellSubmit) {
				return;
			}

			let value = null;
			if (editable.type === "switch") {
				value = state.editingSwitchData[getRowKey(record)][key];
			} else {
				value = state.editingData[getRowKey(record)][key];
			}

			// rowKey 为函数时无法反推字段名，回退到 tableDefaults.rowKey（id）
			const rowKeyField = isFunction(props.rowKey) ? tableDefaults.rowKey : props.rowKey;
			const data = {
				[rowKeyField]: getRowKey(record),
				[key]: value,
			};

			onCancelEditTableCell(record, key);

			if (editable.beforeCellSubmit) {
				state.tableLoading.loading = true;
				await editable.beforeCellSubmit(data);
				state.tableLoading.loading = false;
			} else if (props.beforeCellSubmit) {
				state.tableLoading.loading = true;
				await props.beforeCellSubmit(data);
				state.tableLoading.loading = false;
			} else {
				const res = await useFetch(state.tableLoading).post(props.submitUrl, data);
				useProcessStatusSuccess(res, () => {
					message.success(i18n.global.t("common.save-success"));
					emit("cellSubmit", { record, key, value });
				});
			}
		};

		const handleEditableCell = row => {
			const { column, text, record, index } = row;
			let editable = column.editable;
			if (column.editable === true) {
				editable = { type: "input" };
			}
			const editKey = editable.key || column.key;

			const value = isUndefined(editable.defaultValue) ? text : editable.defaultValue;

			const isEditing =
				state.editingData[getRowKey(record)] &&
				!isUndefined(state.editingData[getRowKey(record)][editKey]);

			const editIconElem = isEditing ? (
				<span class={"table-editable-icon editing"}>
					<CheckCircleOutlined
						class={"check-icon"}
						onClick={withModifiers(() => onSubmitTableCell(editable, record, editKey), ["stop"])}
					/>
					<CloseCircleOutlined
						class={"close-icon"}
						onClick={withModifiers(() => onCancelEditTableCell(record, editKey), ["stop"])}
					/>
				</span>
			) : (
				<span class={"table-editable-icon"}>
					<EditOutlined
						class={"edit-icon"}
						onClick={withModifiers(
							() => onEditTableCell(editable, record, editKey, value),
							["stop"]
						)}
					/>
				</span>
			);

			const editElems = () => {
				if (editable.type === "input") {
					return (
						<Input
							v-model:value={state.editingData[getRowKey(record)][editKey]}
							style={{ width: "100%" }}
							{...editable.defaultProps}
						>
							{{ ...editable.defaultSlots }}
						</Input>
					);
				}
				if (editable.type === "number") {
					return (
						<InputNumber
							v-model:value={state.editingData[getRowKey(record)][editKey]}
							style={{ width: "100%" }}
							{...editable.defaultProps}
						>
							{{ ...editable.defaultSlots }}
						</InputNumber>
					);
				}
				if (editable.type === "select") {
					return (
						<Select
							v-model:value={state.editingData[getRowKey(record)][editKey]}
							options={editable.options}
							style={{ width: "100%" }}
							{...editable.defaultProps}
						>
							{{ ...editable.defaultSlots }}
						</Select>
					);
				}
			};

			if (editable.type === "switch") {
				let optionElements = {
					checkedChildren: () => editable.options?.[0] || null,
					unCheckedChildren: () => editable.options?.[1] || null,
				};
				if (isUndefined(state.editingSwitchData[getRowKey(record)])) {
					state.editingSwitchData[getRowKey(record)] = {};
				}

				if (isUndefined(state.editingSwitchData[getRowKey(record)][editKey])) {
					state.editingSwitchData[getRowKey(record)][editKey] = value;
				}
				return (
					<div class={"table-editable-wrapper"}>
						<div class={"table-editable-text"}>
							<Switch
								v-model:checked={state.editingSwitchData[getRowKey(record)][editKey]}
								onClick={(checked, e) => e.stopPropagation()}
								onChange={(checked, e) => {
									e.stopPropagation();
									onSubmitTableCell(editable, record, editKey);
								}}
								{...editable.defaultProps}
							>
								{optionElements}
							</Switch>
						</div>
					</div>
				);
			} else {
				let textElem = null;

				if (isEditing) {
					textElem = editElems();
				} else if (column.customRender) {
					textElem = column.customRender(row);
				} else if (column.render) {
					// 与非编辑态保持一致的 antd v5 列 render 兼容
					textElem = column.render(text, record, index);
				} else {
					textElem = text;
				}

				return (
					<div class={"table-editable-wrapper"}>
						<div class={"table-editable-text"}>{textElem}</div>
						{editIconElem}
					</div>
				);
			}
		};

		const tableElem = () => {
			return (
				<Table
					rowSelection={handleRowSelection.value}
					pagination={handlePagination.value}
					loading={state.tableLoading.loading}
					dataSource={state.items}
					columns={state.tableColumns}
					{...handleTable.value}
				>
					{{
						headerCell: ({ column }) => {
							const titleCellElem = [
								<span>{column.title}</span>,
								column.tooltip ? (
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
								) : null,
							];

							const funcElems = [];

							if (props.editable && column.editable) {
								funcElems.push(
									<span class={"newbie-table-header-func"}>{useT("table.editable")}</span>
								);
							}

							return (
								<div class={`newbie-table-header-wrapper ${funcElems?.length ? "with-func" : ""}`}>
									<div class={"newbie-table-header-title-wrapper"}>{titleCellElem}</div>
									<div class={"newbie-table-header-func-wrapper"}>{funcElems}</div>
								</div>
							);
						},
						bodyCell: ({ column, text, record, index }) => {
							if (props.editable && column.editable) {
								return handleEditableCell({ column, text, record, index });
							}

							if (column.customRender) {
								return column.customRender({ column, text, record, index });
							}

							// 兼容 antdv-next / antd v5 的列 render 写法
							if (column.render) {
								return column.render(text, record, index);
							}

							if (column.onClick) {
								return (
									<a
										href="javascript:void(0);"
										onClick={withModifiers(
											() =>
												column.onClick({
													column,
													text,
													record,
													index,
												}),
											["stop"]
										)}
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
												column.onCopy(copy, {
													column,
													text,
													record,
													index,
												});
											}
											message.success(i18n.global.t("table.copy-success"));
										}, ["stop"])}
									>
										<span class={"table-copy-content"}>{text}</span>

										<CopyOutlined></CopyOutlined>
									</span>
								);
							}
							return <span>{text}</span>;
						},
						...props.tableSlots,
					}}
				</Table>
			);
		};

		const footerElem = () =>
			slots.append ? (
				<div class={`newbie-table-footer`}>
					<div class={"newbie-table-append-wrapper"}>{slots.append ? slots.append() : null}</div>
					<div class={"newbie-table-pagination-wrapper"}></div>
				</div>
			) : null;

		return () => (
			<div class={"newbie-table"} ref={tableRef}>
				{props.cardWrapper ? (
					<Card size={"small"} class={"newbie-table-card"}>
						{{
							title: () => titleElem(),
							extra: () => (slots.extra ? slots.extra() : null),
							default: () => [
								prependElem(),
								filterElem(),
								functionalElem(),
								tableElem(),
								footerElem(),
							],
						}}
					</Card>
				) : (
					[
						prependElem(),
						filterElem(),
						<div class={"newbie-table-content"}>
							{[functionalElem(), tableElem(), footerElem()]}
						</div>,
					]
				)}

				<Modal
					v-model:open={state.customColumnVisible}
					title={useT("table.custom")}
					width={"900px"}
					onOk={onCustomSubmit}
				>
					{() => [
						<CheckboxGroup v-model:value={state.columnKeyModal} style={{ width: "100%" }}>
							{() => (
								<Row gutter={15}>
									{() =>
										state.customColumns.map(item => (
											<Col span={6}>
												{() => (
													<Checkbox
														style={{ width: "100%", marginBottom: "5px", overflow: "hidden" }}
														value={item.checkKey}
													>
														{() => item.title}
													</Checkbox>
												)}
											</Col>
										))
									}
								</Row>
							)}
						</CheckboxGroup>,
						<Divider></Divider>,
						<Button onClick={onCustomSelectAll}>{() => useT("table.select-all")}</Button>,
						<Button onClick={onCustomClearAll} style={{ marginLeft: "5px" }}>
							{() => useT("table.unselect-all")}
						</Button>,
					]}
				</Modal>
			</div>
		);
	},
});
