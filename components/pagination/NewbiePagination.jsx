import {
	computed,
	defineComponent,
	Fragment,
	nextTick,
	onMounted,
	reactive,
	ref,
	watch,
} from "vue";
import { Button, Card, Empty, Pagination, Spin } from "antdv-next";
import { SyncOutlined } from "@antdv-next/icons";
import { cloneDeep, isArray, isEqual, isFunction, isObject, isUndefined } from "lodash-es";
import { useFetch, usePersistenceScope, useProcessStatusSuccess, useT } from "../../hooks";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import NewbieSearch from "../search/NewbieSearch.jsx";
import { paginationDefaults } from "./config.js";
import {
	createPaginationSnapshot,
	readPaginationSnapshot,
	PAGINATION_STATE_KEY,
} from "./persistence.js";

import "./index.less";

/**
 * Newbie 分页列表组件
 *
 * 与 NewbieTable 共享同一套「搜索 + 取数 + 分页 + 持久化」能力，
 * 但不提供默认的数据渲染：每一项内容完全由 #item 插槽自定义，
 * 适合卡片、时间轴等非表格的业务展示形态。
 *
 * @version 1.0.0
 */
export default defineComponent({
	name: "NewbiePagination",
	props: {
		/**
		 * 标题
		 */
		title: { type: String, default: "" },

		/**
		 * 是否使用表单搜索，默认读取 `paginationDefaults.filterable`（true）
		 */
		filterable: { type: Boolean, default: undefined },

		/**
		 * 搜索项配置，直传 NewbieSearch 的 filterableColumns，详见 SearchItemConfig
		 */
		filterableColumns: { type: [Array, Function], default: () => [] },

		/**
		 * 可排序的搜索项，直传 NewbieSearch 的 sortableColumns
		 */
		sortableColumns: { type: [Array, Function], default: () => [] },

		/**
		 * NewbieSearch slots
		 */
		searchSlots: { type: Object, default: () => ({}) },

		/**
		 * 是否使用分页，为 Object 时使用自定义分页，默认读取 `paginationDefaults.pagination`（true）
		 */
		pagination: { type: [Boolean, Object], default: undefined },

		/**
		 * 分页组件原生事件
		 */
		pageEvents: { type: Object, default: () => ({}) },

		/**
		 * 是否在搜索条件变化时自动搜索，默认读取 `paginationDefaults.autoQuery`（false）
		 */
		autoQuery: { type: Boolean, default: undefined },

		/**
		 * 数据请求 URL
		 */
		url: { type: String, default: "" },

		/**
		 * 请求方式，默认读取 `paginationDefaults.method`（get）
		 *
		 * @values get, post
		 */
		method: { type: String, default: undefined },

		/**
		 * 请求数据时额外提交的参数
		 */
		extraData: { type: Object, default: () => ({}) },

		/**
		 * 请求后 Res 的处理方法, 如有 url， 则该方法必须传，默认读取 `paginationDefaults.afterFetched`（null）
		 */
		afterFetched: { type: Function, default: undefined },

		/**
		 * 数据值需要指定 key 值，启用 `rowSelection` 时一定要指定这个 key，默认读取 `paginationDefaults.itemKey`（id）
		 */
		itemKey: { type: [String, Function] },

		/**
		 * 数据
		 */
		dataSource: { type: Array, default: () => [] },

		/**
		 * 数据, alias of `dataSource`
		 */
		formData: { type: Array, default: () => [] },

		/**
		 * 选择功能的配置，默认读取 `paginationDefaults.rowSelection`（false）
		 * - onChange(selectedItems, selectedKeys)：选择变化回调
		 * - disabled({ item, index })：返回 true 时该项不可选
		 * - preserveSelectedKeys：翻页 / 重新查询后是否保留选中（默认清空，与 NewbieTable 一致）
		 */
		rowSelection: { type: [Boolean, Object], default: undefined },

		/**
		 * 是否显示刷新按钮，默认读取 `paginationDefaults.showRefresh`（true）
		 */
		showRefresh: { type: Boolean, default: undefined },

		/**
		 * 持久化，传入 localStorage 的 key，如果为 true, 将会以 URL Hash 为 key，默认读取 `paginationDefaults.persistence`（false）
		 */
		persistence: { type: [Boolean, String, Object], default: undefined },

		/**
		 * 内部 NewbieSearch 的持久化配置；不传时沿用 persistence
		 * 冷数据默认交给“恢复上次查询”入口，避免旧条件影响本次查询
		 */
		searchPersistence: { type: [Boolean, String, Object], default: undefined },

		/**
		 * 是否用 `Card` 包裹，默认读取 `paginationDefaults.cardWrapper`（false）
		 */
		cardWrapper: { type: Boolean, default: undefined },
	},
	emits: [
		/**
		 * 未传入 `url` 时的手动请求方法
		 */
		"fetch",

		/**
		 * 选择变化（rowSelection 开启时）
		 * @property {Array} selectedItems 选中的数据项
		 * @property {Array} selectedKeys 选中的数据项 key
		 */
		"selectionChange",
	],
	setup(rawProps, { emit, slots, expose }) {
		const props = useMergedProps(rawProps, "pagination", paginationDefaults);

		const searchRef = ref();
		const rootRef = ref();

		/**
		 * 解析数据项标识，兼容 itemKey 为函数的情况
		 * @param {object} item
		 * @returns {*}
		 */
		const getItemKey = item =>
			isFunction(props.itemKey) ? props.itemKey(item) : item?.[props.itemKey];

		/**
		 * 组件与内部搜索栏各自持有一份持久化配置：
		 * - 组件保存分页视图状态，冷数据始终自动恢复；
		 * - 搜索栏默认沿用组件配置，但冷数据默认交给“恢复上次查询”入口。
		 */
		const searchPersistenceProp = computed(() => props.searchPersistence ?? props.persistence);
		const { store: persistPagination } = usePersistenceScope(
			"pagination",
			() => props.persistence
		);

		// 分页视图状态始终自动恢复（restore 只影响搜索栏），快照不合法时按无持久化处理
		const persistedState = readPaginationSnapshot(
			persistPagination.value?.read(PAGINATION_STATE_KEY, null)
		) ?? { pagination: {} };
		const persistencePagination = persistedState.pagination;

		const state = reactive({
			fetchLoading: { loading: false },
			pagination: {
				totalSize: 0,
				currentPage: persistencePagination.currentPage || 1,
				pageSize:
					persistencePagination.pageSize || props.pagination?.pageSize || props.pageSize,
			},
			items: [],
			keySelection: [], // 给内部用：选中项的 key 集合
			selection: [], // 给外部用：选中项的数据引用
			lastRequestId: 0, // 最近一次请求的 id，用于丢弃过期响应
			searchFormData: {},
		});

		// 跨页保留选中时，key -> item 的引用缓存（不参与渲染，只用于还原 selection）
		const selectionMap = new Map();

		watch(
			() => props.pagination?.pageSize || props.pageSize,
			nextSize => {
				if (!persistencePagination.pageSize && nextSize) {
					state.pagination.pageSize = nextSize;
				}
			}
		);

		/**
		 * 持久化分页视图状态
		 */
		const onPersistence = () => {
			if (!persistPagination.value) return;
			persistPagination.value.write(
				PAGINATION_STATE_KEY,
				createPaginationSnapshot({ pagination: state.pagination })
			);
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
		 * 客户端分页：无 url 且业务未通过 setPagination 接管总数时，
		 * dataSource 是全量数据，由组件自己切片展示（与 antd Table 本地数据的行为一致）。
		 */
		const isClientPagination = computed(() => !props.url && !state.pagination.totalSize);

		/**
		 * 当前展示的数据：客户端分页时按页切片，其余模式为整份当页数据
		 */
		const displayItems = computed(() => {
			if (!isClientPagination.value || !props.pagination) return state.items;

			const { currentPage, pageSize } = state.pagination;
			if (!pageSize) return state.items;
			return state.items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
		});

		/**
		 * 恢复的页码超过实际页数时回落到最后一页（客户端分页同样适用）
		 * @return {boolean} 是否发生了回落
		 */
		const clampPageToLast = () => {
			if (!props.pagination) return false;

			const { pageSize, currentPage } = state.pagination;
			const total = isClientPagination.value
				? state.items.length
				: state.pagination.totalSize;
			if (!pageSize || !total) return false;

			const lastPage = Math.max(1, Math.ceil(total / pageSize));
			if (currentPage <= lastPage) return false;

			state.pagination.currentPage = lastPage;
			return true;
		};

		/********** selection **********/

		const selectionConfig = computed(() => {
			if (!props.rowSelection) return null;
			return isObject(props.rowSelection) ? props.rowSelection : {};
		});

		const preserveSelection = computed(() => !!selectionConfig.value?.preserveSelectedKeys);

		/**
		 * @param {object} item
		 * @param {number} index
		 * @returns {boolean} 该项是否允许被选中
		 */
		const isItemSelectable = (item, index) => {
			const config = selectionConfig.value;
			if (!config) return false;
			return isFunction(config.disabled) ? !config.disabled({ item, index }) : true;
		};

		const isSelected = item => state.keySelection.includes(getItemKey(item));

		const syncSelectionItems = () => {
			state.selection = state.keySelection.map(key => selectionMap.get(key)).filter(Boolean);
		};

		const emitSelectionChange = () => {
			const selectedItems = [].concat(state.selection);
			const selectedKeys = [].concat(state.keySelection);
			emit("selectionChange", { selectedItems, selectedKeys });
			selectionConfig.value?.onChange?.(selectedItems, selectedKeys);
		};

		const toggleSelection = (item, index) => {
			if (!selectionConfig.value || !isItemSelectable(item, index)) return;

			const key = getItemKey(item);
			const pos = state.keySelection.indexOf(key);
			if (pos >= 0) {
				state.keySelection.splice(pos, 1);
				selectionMap.delete(key);
			} else {
				state.keySelection.push(key);
				selectionMap.set(key, item);
			}
			syncSelectionItems();
			emitSelectionChange();
		};

		const toggleAllSelection = () => {
			if (!selectionConfig.value) return;

			const selectable = displayItems.value
				.map((item, index) => ({ item, index }))
				.filter(({ item, index }) => isItemSelectable(item, index));
			if (!selectable.length) return;

			const allSelected = selectable.every(({ item }) => isSelected(item));
			selectable.forEach(({ item }) => {
				const key = getItemKey(item);
				if (allSelected) {
					const pos = state.keySelection.indexOf(key);
					if (pos >= 0) state.keySelection.splice(pos, 1);
					selectionMap.delete(key);
				} else if (!state.keySelection.includes(key)) {
					state.keySelection.push(key);
					selectionMap.set(key, item);
				}
			});
			syncSelectionItems();
			emitSelectionChange();
		};

		const clearSelection = () => {
			state.keySelection.splice(0);
			selectionMap.clear();
			state.selection = [];
			if (selectionConfig.value) {
				emitSelectionChange();
			}
		};

		const setSelection = items => {
			state.keySelection.splice(0);
			selectionMap.clear();
			[].concat(items || []).forEach(item => {
				const key = getItemKey(item);
				if (isUndefined(key) || key === null) return;
				state.keySelection.push(key);
				selectionMap.set(key, item);
			});
			syncSelectionItems();
			if (selectionConfig.value) {
				emitSelectionChange();
			}
		};

		/**
		 * 取数后按配置清空选中（与 NewbieTable 的行为保持一致）
		 */
		const resetSelectionAfterFetch = () => {
			if (!selectionConfig.value || preserveSelection.value) return;
			clearSelection();
		};

		/********** fetch **********/

		const fetchItems = async () => {
			const params = getQueryData();
			const method = props.method;
			const data = method === "get" ? { params } : { ...params };
			// 只认最后一次请求：响应回来时 id 不是最新的就丢弃，避免旧数据覆盖新数据
			const requestId = ++state.lastRequestId;

			const res = await useFetch(state.fetchLoading)[method](props.url, data);
			useProcessStatusSuccess(res, () => {
				if (requestId !== state.lastRequestId) return;

				// afterFetched 由 props / Provider / paginationDefaults 合并而来，缺省时给出明确报错
				const fetched = isFunction(props.afterFetched)
					? props.afterFetched
					: paginationDefaults.afterFetched;
				if (!isFunction(fetched)) {
					console.error(
						"[NewbiePagination] 使用 url 时必须提供 afterFetched，且需返回 { items, totalSize }"
					);
					return;
				}

				const result = fetched(res);
				if (!result || !isArray(result.items)) {
					console.error(
						"[NewbiePagination] afterFetched 必须返回 { items, totalSize }，items 需为数组"
					);
					return;
				}

				if (props.pagination) {
					state.pagination.totalSize = result.totalSize ?? 0;
				}
				state.items = result.items;
				resetSelectionAfterFetch();

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

		// 客户端分页：本地数据替换后页码越界时回落到最后一页
		watch(
			() => state.items.length,
			() => {
				if (isClientPagination.value) {
					clampPageToLast();
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
		const getSelection = () => [].concat(state.selection);
		const setLoading = loading => (state.fetchLoading.loading = loading);

		expose({
			getData,
			setData,
			setPagination,
			getPagination,
			getSelection,
			setSelection,
			toggleSelection,
			toggleAllSelection,
			clearSelection,
			getQueryData,
			setQueryData,
			doFetch,
			setLoading,
			refreshStatusCounts: force => searchRef.value?.refreshStatusCounts(force),
		});

		/********** computed configs **********/

		// 客户端分页 total 取数据长度；url / 手动模式（业务 setPagination 接管）取 totalSize
		const displayTotal = computed(() => {
			if (state.pagination.totalSize) return state.pagination.totalSize;
			return props.url ? 0 : state.items.length;
		});

		const handlePagination = computed(() => {
			if (!props.pagination || !displayTotal.value) return null;

			const custom = isObject(props.pagination) ? cloneDeep(props.pagination) : {};
			return {
				size: "small",
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: total => useT("pagination.total", { total }),
				pageSizeOptions: ["10", "20", "30", "50", "100", "300", "500"],
				total: displayTotal.value,
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
				onShowSizeChange: () => {
					doFetch(true);
				},
				...custom,
			};
		});

		/********** render helpers **********/

		/**
		 * #item 插槽作用域：rowSelection 关闭时 selected 恒为 false，
		 * 保留字段使模板写法在开启 / 关闭之间保持一致。
		 */
		const buildItemScope = (item, index) => ({
			item,
			index,
			selected: selectionConfig.value ? isSelected(item) : false,
			selectionDisabled: selectionConfig.value ? !isItemSelectable(item, index) : false,
			toggleSelect: () => toggleSelection(item, index),
		});

		/**
		 * #prepend / #append 插槽作用域，供批量操作使用
		 */
		const buildBatchScope = () => ({
			selectedItems: [].concat(state.selection),
			selectedKeys: [].concat(state.keySelection),
			clearSelection,
			toggleAllSelection,
		});

		const renderTitle = () => {
			if (slots.title) {
				return <div class={"newbie-pagination-title-wrapper"}>{slots.title()}</div>;
			}
			if (props.title) {
				return <div class={"newbie-pagination-title-wrapper"}>{props.title}</div>;
			}
			return null;
		};

		const renderPrepend = () =>
			slots.prepend ? (
				<div class={"newbie-pagination-prepend-wrapper"}>
					{slots.prepend(buildBatchScope())}
				</div>
			) : null;

		const renderFilter = () =>
			props.filterable ? (
				<NewbieSearch
					ref={searchRef}
					persistence={searchPersistenceProp.value}
					autoQuery={props.autoQuery}
					filterableColumns={props.filterableColumns}
					sortableColumns={props.sortableColumns}
					onSearch={onSearch}
				>
					{{ ...props.searchSlots }}
				</NewbieSearch>
			) : null;

		const renderFunctional = () => (
			<div class={"newbie-pagination-functional-wrapper"}>
				<div class={"newbie-pagination-functional"}>
					{slots.functional?.(buildBatchScope())}
				</div>
				<div class={"newbie-pagination-functional-default"}>
					{props.showRefresh ? (
						<Button
							class={"newbie-pagination-refresh"}
							icon={<SyncOutlined />}
							onClick={() => doFetch(false)}
						/>
					) : null}
				</div>
			</div>
		);

		const renderItems = () =>
			displayItems.value.map((item, index) => (
				<Fragment key={getItemKey(item) ?? index}>
					{slots.item?.(buildItemScope(item, index))}
				</Fragment>
			));

		const renderEmpty = () => {
			if (state.fetchLoading.loading || displayItems.value.length) return null;
			if (slots.empty) {
				return <div class={"newbie-pagination-empty-wrapper"}>{slots.empty()}</div>;
			}
			return <Empty class={"newbie-pagination-empty"} description={useT("common.no-data")} />;
		};

		const renderBody = () => (
			<div class={"newbie-pagination-body"}>
				<Spin spinning={state.fetchLoading.loading}>
					<div class={"newbie-pagination-items"}>{renderItems()}</div>
					{renderEmpty()}
				</Spin>
			</div>
		);

		const renderPagination = () => {
			const config = handlePagination.value;
			if (!config) return null;
			return (
				<div class={"newbie-pagination-pagination-wrapper"}>
					<Pagination {...config} {...props.pageEvents} />
				</div>
			);
		};

		const renderFooter = () => {
			if (!slots.append && !handlePagination.value) return null;
			return (
				<div class={"newbie-pagination-footer"}>
					{slots.append ? (
						<div class={"newbie-pagination-append-wrapper"}>
							{slots.append(buildBatchScope())}
						</div>
					) : null}
					{renderPagination()}
				</div>
			);
		};

		return () => (
			<div class={"newbie-pagination"} ref={rootRef}>
				{props.cardWrapper ? (
					<Card size={"small"} class={"newbie-pagination-card"}>
						{{
							title: renderTitle,
							extra: () => slots.extra?.() ?? null,
							default: () => [
								renderPrepend(),
								renderFilter(),
								renderFunctional(),
								renderBody(),
								renderFooter(),
							],
						}}
					</Card>
				) : (
					[
						renderPrepend(),
						renderFilter(),
						<div class={"newbie-pagination-content"}>
							{[renderFunctional(), renderBody(), renderFooter()]}
						</div>,
					]
				)}
			</div>
		);
	},
});
