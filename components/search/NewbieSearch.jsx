import {computed, defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch,} from "vue";

import createSearchItem from "./components/SearchItem.jsx";

import "./index.less";
import {searchDefaults} from "./config.js";
import {useNewbieConfig} from "../../hooks/useMergedProps.js";
import {Button, Modal, Segmented, Space, Tag, Tooltip} from "antdv-next";
import {
	cloneDeep,
	concat,
	find,
	isArray,
	isBoolean,
	isFunction,
	isNull,
	isNumber,
	isPlainObject,
	isString,
	isUndefined,
	orderBy,
} from "lodash-es";
import {createExpand, createSortable} from "./components";
import {
	ClearOutlined,
	DownOutlined,
	FallOutlined,
	HistoryOutlined,
	OrderedListOutlined,
	RiseOutlined,
	SearchOutlined,
} from "@antdv-next/icons";
import {usePersistenceScope, useT} from "../../hooks";
import dayjs from "dayjs";
import {normalizeConditionValue, normalizeOptions} from "./utils.js";
import {
	applySearchSnapshot,
	createSearchSnapshot,
	isEmptySearchSnapshot,
	isSearchSnapshot,
	readSearchSort,
	SEARCH_STATE_KEY,
} from "./persistence.js";

/**
 * 搜索组件
 * @version 1.0.0
 */

const STATUS_ITEM_TYPE = "segmented";
const STATUS_MIN_SPAN = 1;
const STATUS_DEFAULT_ALL_VALUE = "";

const isStatusItem = column => column?.type === STATUS_ITEM_TYPE;

// filterableColumns 允许传函数；统一在这里取值，避免各处重复判断
const resolveColumns = columns => (isFunction(columns) ? columns() : columns) || [];

const toCount = value => {
	if (isNumber(value)) return Number.isFinite(value) ? value : undefined;
	if (isString(value) && value.trim() !== "") {
		const count = Number(value);
		return Number.isFinite(count) ? count : undefined;
	}
	return undefined;
};

const normalizeStatusCounts = (result, allValue) => {
	const counts = {};
	const put = (value, count) => {
		if (isNull(value) || isUndefined(value)) return;
		const normalized = toCount(count);
		if (isUndefined(normalized)) return;
		counts[value] = normalized;
	};

	if (isArray(result)) {
		result.forEach(item => put(item?.value, item?.count));
		return counts;
	}
	if (!isPlainObject(result)) return counts;

	if (isPlainObject(result.counts)) {
		Object.keys(result.counts).forEach(key => put(key, result.counts[key]));
		put(allValue, result.total);
	} else {
		put(allValue, result.total);
		Object.keys(result).forEach(key => {
			if (key !== "total") put(key, result[key]);
		});
	}

	return counts;
};

export default defineComponent({
	name: "NewbieSearch",
	props: {
		/**
		 * @typedef {Object} SearchItemConfig 搜索项
		 * @property {string} key 搜索项的 key
		 * @property {string} title 搜索项的标题
		 * @property {string} type 搜索项的类型
		 * @property {number} sortOrder 排序，数字越大越靠前，默认为0
		 * @property {boolean|Object} [expandable] 搜索项是否展开
		 * @property {Array|Function} [options] 搜索项的选项
		 * @property {Object} [inputProps] 搜索项的输入框属性
		 * @property {boolean} [disableConditions] 是否禁用搜索条件
		 * @property {Array} [conditions] 搜索项的条件，可选项为不同类型的内置条件
		 * @property {*} [defaultValue] 默认搜索值
		 * @property {*} [defaultCondition] 默认搜索条件
		 * @property {Function} [customRender] 自定义渲染搜索项， 接收 { item, queryForm, context } 作为参数，返回一个对象，包含 conditions, Component, displayValue, onComponentOpen 四个属性
		 * @property {Function} [collectItem] 收集搜索项的内容]
		 * */

		/**
		 * 搜索项的配置, 详见 [SearchItemConfig](#searchitemconfig-配置)
		 */
		filterableColumns: { type: [Array, Function], default: () => [] },

		/**
		 * 可排序的搜索项
		 */
		sortableColumns: { type: [Array, Function], default: () => [] },

		/**
		 * 是否禁用搜索条件
		 */
		disableConditions: { type: Boolean, default: false },

		/**
		 * 是否在搜索条件变化时自动搜索
		 */
		autoQuery: { type: Boolean, default: false },

		/**
		 * 搜索项的间距
		 */
		gutter: { type: [String, Number], default: 16 },

		/**
		 * 持久化配置
		 * - boolean / string：开启持久化，字符串作为 key
		 * - { key?, storage?: 'memory'|'local', restore?: 'auto'|'manual' }
		 *   不传 key 时以当前路由为 key；restore 控制冷数据是自动恢复还是交给恢复入口
		 */
		persistence: { type: [Boolean, String, Object], default: false },

		/**
		 * 状态分段筛选
		 * - 直接使用：传入 { key, options, span, ... }
		 * - 表格列：给 isOnlyForQuery 列的 filterable 设置 type: 'segmented'，由内部自动识别
		 * - options 支持 { label, value, count }，count 可由 counts / countRequest 异步补全
		 * - 与状态 key 相同的普通搜索项会被忽略，避免重复渲染
		 * @type {StatusFilterConfig|undefined}
		 */
		statusFilter: { type: Object, default: undefined },
	},
	emits: [
		/**
		 * 点击搜索
		 * @property queryForm {Object} 搜索栏的值
		 */
		"search",
	],
	setup(props, { expose, emit, slots }) {
		const searchConfig = useNewbieConfig("search", searchDefaults);

		/********** 持久化配置 **********/

		const { store: persist, restore: restorePolicy } = usePersistenceScope(
			"search",
			() => props.persistence
		);

		/********** 状态 **********/

		const state = reactive({
			queryForm: {}, // 搜索表单
			sortForm: { selectedKeys: [], targetKeys: [] }, // 排序表单

			columnKey: {}, // 自定义列
			searchKey: {}, // 自定义搜索框
			searchLabels: [], // 搜索项展示

			fieldColumns: [], //表单搜索项
			expandColumns: [], //展开搜索项
			sortColumns: [], //可排序搜索项

			openSortable: false, //是否打开排序设置
			isFormExpanded: false, //是否已经展开
			overflowCount: 0, //折叠时隐藏的搜索项数量

			statusCounts: {}, //状态分段的计数（来自 countRequest）
			statusCountsKey: null, //计数对应的状态字段，切换字段时丢弃旧计数
			statusCountsLoading: false, //状态计数是否正在加载
		});

		const formWrapperRef = ref();
		const statusRef = ref();

		/********** 自适应列布局 **********/

		// 单个搜索项的最小宽度，用于计算一行能放下几列
		const MIN_ITEM_WIDTH = 220;

		// 操作区（更多/清除/排序/搜索）在首行占用的列数
		const ACTION_COLUMNS = 2;

		const columnCount = ref(4);

		const gapSize = computed(() => {
			if (typeof props.gutter === "number") return `${props.gutter}px`;
			const gap = String(props.gutter ?? "").trim();
			if (/^\d+(\.\d+)?$/.test(gap)) return `${gap}px`;
			return gap || "0px";
		});

		const queryStyle = computed(() => ({
			gridTemplateColumns: `repeat(${columnCount.value}, minmax(0, 1fr))`,
			columnGap: gapSize.value,
		}));

		// 宽屏时操作区放在首行右侧；有状态栏时至少给搜索项留一列，否则操作区落到下方
		const operationStyle = computed(() => {
			const columns = columnCount.value;
			if (operationSameRow.value) {
				return {
					gridRow: 1,
					gridColumn: `${columns - ACTION_COLUMNS + 1} / -1`,
					justifySelf: "end",
					alignSelf: "end",
				};
			}
			return {
				gridColumn: "1 / -1",
				justifySelf: "end",
			};
		});

		/********** 状态分段筛选 **********/

		// 显式 statusFilter 优先；否则从 filterableColumns 里找 type: 'segmented' 的项（表格列配置走这里）
		const statusConfig = computed(() => {
			if (props.statusFilter) return props.statusFilter;

			return resolveColumns(props.filterableColumns).find(isStatusItem) || null;
		});

		const statusKey = computed(() => statusConfig.value?.key || "status");

		const statusAllValue = computed(() => {
			const allValue = statusConfig.value?.allValue;
			return isUndefined(allValue) ? STATUS_DEFAULT_ALL_VALUE : allValue;
		});

		// 优先级：countRequest 返回值 > statusFilter.counts > option.count
		const pickCount = value => {
			const candidates = [state.statusCounts?.[value], statusConfig.value?.counts?.[value]];
			for (const candidate of candidates) {
				const count = toCount(candidate);
				if (!isUndefined(count)) return count;
			}
			return undefined;
		};

		const statusOptions = computed(() => {
			const config = statusConfig.value;
			if (!config) return [];

			const allValue = statusAllValue.value;

			return normalizeOptions(config.options).map(option => {
				const value =
					isNull(option.value) || isUndefined(option.value) ? allValue : option.value;
				const count = pickCount(value) ?? toCount(option.count);

				return { ...option, value, count };
			});
		});

		const statusValue = computed(() => {
			const value = state.queryForm[statusKey.value]?.value;
			return isArray(value) ? value[0] : value;
		});

		// 状态栏未配置 span 时按内容宽度折算成整列：宁可多占一整列，也不让后面的
		// 搜索项从半列处开始，破坏网格的列对齐
		const statusAutoSpan = ref(STATUS_MIN_SPAN);

		const measureStatusSpan = () => {
			const root = statusRef.value;
			const wrapper = formWrapperRef.value;
			if (!root || !wrapper) return;

			const segmented = root.querySelector(".ant-segmented");
			const width = segmented?.getBoundingClientRect?.().width || segmented?.scrollWidth || 0;
			const containerWidth = wrapper.getBoundingClientRect?.().width || 0;
			if (width <= 0 || containerWidth <= 0) return;

			const gap = parseFloat(props.gutter) || 0;
			const columns = Math.max(1, columnCount.value);
			const columnWidth = (containerWidth - (columns - 1) * gap) / columns;
			const span = Math.min(
				columns,
				Math.max(STATUS_MIN_SPAN, Math.ceil((width + gap) / Math.max(1, columnWidth + gap)))
			);

			if (span !== statusAutoSpan.value) statusAutoSpan.value = span;
		};

		// 状态栏占用的网格列数：显式 span 优先，否则按内容宽度自动取整列；窄屏不超总列数
		const statusSpan = computed(() => {
			if (!statusConfig.value || !statusOptions.value.length) return 0;

			const configured = Number(statusConfig.value.span);
			const requested = Number.isFinite(configured)
				? Math.max(STATUS_MIN_SPAN, Math.floor(configured))
				: statusAutoSpan.value;

			return Math.min(requested, columnCount.value);
		});

		// 操作区留在首行的前提：状态栏 + 操作区能放进同一行
		const operationSameRow = computed(() => {
			if (columnCount.value <= ACTION_COLUMNS) return false;
			if (statusSpan.value > 0) {
				return statusSpan.value + ACTION_COLUMNS <= columnCount.value;
			}
			return true;
		});

		const statusStyle = computed(() => ({
			gridColumn: `span ${statusSpan.value}`,
			alignSelf: "end",
		}));

		const resolveStatusDefault = () => {
			const config = statusConfig.value;
			if (!config) return undefined;

			const options = statusOptions.value;
			let value = config.defaultValue;
			if (isFunction(value)) {
				value = value();
			}

			const matched = options.find(option => option.value === value);
			return matched ? matched.value : options[0]?.value;
		};

		const renderStatusLabel = option => {
			const labelRender = statusConfig.value?.labelRender;
			if (isFunction(labelRender)) return labelRender(option);

			const count = toCount(option?.count);

			return (
				<span class={"newbie-search-status-label"}>
					<span class={"newbie-search-status-text"}>{option?.label}</span>
					{isUndefined(count) ? null : (
						<span class={"newbie-search-status-count"}>{count}</span>
					)}
				</span>
			);
		};

		//带有 between 的搜索项则初始化为 [null, null]
		const betweenKeys = new Set(["number", "date"]);

		//可以多选的的搜索项则初始化为 []
		const arrayKeys = new Set(["select", "cascade"]);

		const searchState = {}; // 用于记录各个搜索项的状态

		/********** 自动搜索（F-016） **********/

		const AUTO_QUERY_DELAY = 300;

		let autoQueryTimer = null;
		// 初始化 / 程序化赋值期间不触发自动搜索，避免默认值和持久化恢复造成重复查询
		let autoQueryReady = false;
		let suppressAutoQuery = false;

		const clearAutoQueryTimer = () => {
			if (autoQueryTimer) {
				clearTimeout(autoQueryTimer);
				autoQueryTimer = null;
			}
		};

		const scheduleAutoQuery = () => {
			clearAutoQueryTimer();
			autoQueryTimer = setTimeout(() => {
				autoQueryTimer = null;
				if (!props.autoQuery) return;
				onSearch();
			}, AUTO_QUERY_DELAY);
		};

		/********** 状态计数 **********/

		let countRequestId = 0;
		let countAbortController = null;
		let lastCountSignature = null;

		const stableStringify = value => {
			if (isArray(value)) return `[${value.map(item => stableStringify(item)).join(",")}]`;
			if (isPlainObject(value)) {
				return `{${Object.keys(value)
					.toSorted()
					.map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
					.join(",")}}`;
			}
			return JSON.stringify(value) ?? "null";
		};

		async function requestStatusCounts(query, force = false) {
			const config = statusConfig.value;
			if (!config || !isFunction(config.countRequest) || !statusOptions.value.length) {
				return null;
			}

			const baseQuery = { ...query };
			delete baseQuery[statusKey.value];

			// 状态本身不参与计数：只发生状态切换时，签名不变，不重复请求
			const signature = stableStringify(baseQuery);
			if (!force && signature === lastCountSignature) return null;

			lastCountSignature = signature;

			countAbortController?.abort();
			const controller = typeof AbortController === "undefined" ? null : new AbortController();
			countAbortController = controller;

			const requestId = ++countRequestId;
			state.statusCountsLoading = true;

			try {
				const result = await config.countRequest({
					query: baseQuery,
					queryForm: state.queryForm,
					statusKey: statusKey.value,
					allValue: statusAllValue.value,
					options: statusOptions.value,
					signal: controller?.signal,
				});

				if (requestId !== countRequestId) return null;

				state.statusCounts = normalizeStatusCounts(result, statusAllValue.value);
				return state.statusCounts;
			} catch (error) {
				if (requestId !== countRequestId) return null;

				// 失败不保留签名，下一次搜索可以重试
				lastCountSignature = null;
				if (isFunction(config.onCountError)) {
					config.onCountError(error);
				} else {
					console.error("[NewbieSearch] statusFilter.countRequest 执行失败", error);
				}
				return null;
			} finally {
				if (requestId === countRequestId) {
					state.statusCountsLoading = false;
					countAbortController = null;
				}
			}
		}

		function refreshStatusCounts(force = true) {
			if (!isFunction(statusConfig.value?.countRequest) || !statusOptions.value.length) {
				return Promise.resolve(null);
			}

			return requestStatusCounts(collectQueryForm(false), force);
		}

		/********** 条件值规整（F-050） **********/

		const conditionWatcherStops = [];

		const stopConditionWatchers = () => {
			while (conditionWatcherStops.length) {
				conditionWatcherStops.pop()();
			}
		};

		/**
		 * 为每个搜索项注册一次条件监听；搜索项列表变化时重建，组件卸载时停止
		 */
		const setupConditionWatchers = () => {
			stopConditionWatchers();
			concat(state.fieldColumns, state.expandColumns).forEach(item => {
				const stop = watch(
					() => state.queryForm[item.key]?.condition,
					() => normalizeConditionValue(item, state.queryForm)
				);
				conditionWatcherStops.push(stop);
			});
		};

		onUnmounted(() => {
			stopConditionWatchers();
			clearAutoQueryTimer();
			resizeObserver?.disconnect();
			if (overflowFrame !== null) cancelAnimationFrame(overflowFrame);

			countRequestId += 1;
			countAbortController?.abort();
		});

		/**
		 * 初始化搜索
		 */
		const init = () => {
			const form = {};
			const expandColumns = [];
			const fieldColumns = [];
			const sortColumns = [];
			const defaultSortKeys = [];
			const status = statusConfig.value;

			// 状态字段切换时丢弃上一组计数，避免相同 value 串到新字段上
			const nextCountKey = status ? statusKey.value : null;
			if (state.statusCountsKey !== nextCountKey) {
				state.statusCounts = {};
				state.statusCountsKey = nextCountKey;
				lastCountSignature = null;
				countRequestId += 1;
				countAbortController?.abort();
			}

			// 内存层始终恢复；只有 restore=auto 时才自动套用 localStorage 冷数据
			const snapshot = persist.value
				? restorePolicy.value === "auto"
					? persist.value.read(SEARCH_STATE_KEY, null)
					: persist.value.readHot(SEARCH_STATE_KEY, null)
				: null;
			const persistedSort = readSearchSort(snapshot);

			resolveColumns(props.filterableColumns).forEach(column => {
				const item = cloneDeep(column);

				// 状态分段不进入普通搜索项网格：显式配置优先，否则由 segmented 列提供
				if (status && (isStatusItem(item) || item.key === statusKey.value)) {
					return;
				}

				if (isUndefined(item.sortOrder)) {
					item.sortOrder = 0;
				}

				if (!searchState[item.key]) {
					searchState[item.key] = reactive({
						showPanel: false,
					});
				}

				item.type = item.type || "input";
				let value = "",
					condition = "equal";
				//如果是展开显示的，那么默认值为空字符串
				//如果展开为多选，那么默认值为 []
				if (item.expandable) {
					value = [];
				} else if (betweenKeys.has(item.type)) {
					value = [null, null];
				} else if (arrayKeys.has(item.type)) {
					value = [];
				}

				//默认值处理
				if (!isUndefined(item.defaultValue)) {
					if (isFunction(item.defaultValue)) {
						value = item.defaultValue();
					} else {
						value = item.defaultValue;
					}
				}

				//默认搜索条件
				if (item.conditions && item.conditions.length === 1) {
					condition = item.conditions[0];
				} else if (item.defaultCondition) {
					if (isFunction(item.defaultCondition)) {
						condition = item.defaultCondition();
					} else {
						condition = item.defaultCondition;
					}
				}

				if (item.expandable) {
					if (!item.options) {
						console.error(`expandable 为 true 时，必须提供 options 属性`);
						return;
					}
					item.type = "select";

					expandColumns.push(item);
				} else {
					if (isUndefined(searchState[item.key].hidden)) {
						searchState[item.key].hidden = false;
					}
					fieldColumns.push(item);
				}

				if (item.type === "date") {
					if (isArray(value)) {
						value = value.map(v => (isString(v) ? dayjs(new Date(v)) : v));
					} else if (isString(value)) {
						value = dayjs(new Date(value));
					}
				}

				if (item.type === "switch") {
					value = isBoolean(value) ? (value ? "checked" : "unchecked") : undefined;
				}

				form[item.key] = {
					value,
					type: item.type,
					condition,
				};
			});

			resolveColumns(props.sortableColumns).forEach(column => {
				const item = cloneDeep(column);

				if (!isUndefined(persistedSort[column.key])) {
					defaultSortKeys.push(column.key);
					item.direction = persistedSort[column.key];
				} else if (column.direction === "asc" || column.direction === "desc") {
					defaultSortKeys.push(column.key);
				}
				sortColumns.push(item);
			});

			// 状态分段先写默认值，再由快照覆盖；快照里的旧值会在下面校验
			if (status && statusOptions.value.length) {
				form[statusKey.value] = {
					value: resolveStatusDefault(),
					type: STATUS_ITEM_TYPE,
					condition: status.condition || status.defaultCondition || "equal",
				};
			}

			// 快照保存的是表单态，直接覆盖默认值与条件，不再按类型猜测值结构
			applySearchSnapshot(snapshot, form);

			// 选项可能已经变化（或旧版本存的是数组），非法值回落到默认项
			if (status && form[statusKey.value]) {
				const field = form[statusKey.value];
				const rawValue = isArray(field.value) ? field.value[0] : field.value;
				const matched = statusOptions.value.find(option => option.value === rawValue);

				field.value = matched ? matched.value : resolveStatusDefault();
				field.type = STATUS_ITEM_TYPE;
				field.condition = status.condition || status.defaultCondition || "equal";
			}

			state.queryForm = form;
			state.sortColumns = orderBy(sortColumns, ["sortOrder"], ["desc"]);
			state.fieldColumns = orderBy(fieldColumns, ["sortOrder"], ["desc"]);
			state.expandColumns = orderBy(expandColumns, ["sortOrder"], ["desc"]);
			state.sortForm.targetKeys = defaultSortKeys;

			setupConditionWatchers();
		};

		watch(
			() => [props.filterableColumns, props.sortableColumns],
			() => {
				autoQueryReady = false;
				init();
				nextTick(() => {
					updateOverflow();
					autoQueryReady = true;
				});
			},
			{ immediate: true }
		);

		// 状态配置从无到有、或 key / 默认值变化时重建表单；仅计数变化不触发
		watch(
			() => [
				!!statusConfig.value,
				statusKey.value,
				// 函数式 defaultValue 每次父组件渲染都会是新函数，不能作为重建依据
				isFunction(statusConfig.value?.defaultValue)
					? undefined
					: statusConfig.value?.defaultValue,
				statusConfig.value?.condition,
			],
			() => {
				autoQueryReady = false;
				init();
				nextTick(() => {
					updateOverflow();
					autoQueryReady = true;
					refreshStatusCounts();
				});
			}
		);

		// span 变化（配置调整或容器列数变化）后重新计算折叠
		watch(statusSpan, () => nextTick(() => scheduleOverflowUpdate()));

		// 选项文案或计数变化会改变状态栏宽度，重新折算占用的整列数
		watch(
			() =>
				statusOptions.value
					.map(option => `${option.label}:${option.count ?? ""}`)
					.join("|"),
			() => nextTick(() => measureStatusSpan())
		);

		const onSearch = () => {
			state.openSortable = false;
			showRestore.value = false;

			const payload = { newbieQuery: getQueryForm(), newbieSort: getSortForm() };
			// 只持久化"最后一次真正执行的查询"，读取函数不再产生写入副作用
			persist.value?.write(
				SEARCH_STATE_KEY,
				createSearchSnapshot(state.queryForm, payload.newbieSort)
			);
			emit("search", payload);

			// 状态本身不参与计数，requestStatusCounts 内部会剔除 status 再比较签名
			requestStatusCounts(payload.newbieQuery, false);
		};

		const onStatusChange = value => {
			if (!statusConfig.value) return;

			const field = state.queryForm[statusKey.value];
			if (!field) return;

			field.value = value;

			// 点击状态即搜索；关闭后回退到 autoQuery / 手动搜索
			if (statusConfig.value.immediate === false) return;

			suppressAutoQuery = true;
			clearAutoQueryTimer();
			onSearch();
			nextTick(() => {
				suppressAutoQuery = false;
			});
		};

		// 条件变化后节流触发自动搜索（F-016）
		watch(
			() => state.queryForm,
			() => {
				if (!autoQueryReady || suppressAutoQuery || !props.autoQuery) return;
				scheduleAutoQuery();
			},
			{ deep: true }
		);

		const onClear = () => {
			persist.value?.clear([SEARCH_STATE_KEY]);
			showRestore.value = false;
			init();
		};

		const onToggleMore = () => {
			state.isFormExpanded = !state.isFormExpanded;
			nextTick(() => updateOverflow());
		};

		/********** 折叠逻辑（基于容器宽度测量） **********/

		const updateOverflow = () => {
			if (!formWrapperRef.value) return;
			const container = formWrapperRef.value;
			const gap = parseFloat(props.gutter) || 0;

			const containerWidth = container.getBoundingClientRect().width;
			// 按容器宽度计算可容纳的列数；容器尚未完成布局时保留上一次结果
			if (containerWidth > 0) {
				columnCount.value = Math.max(
					1,
					Math.floor((containerWidth + gap) / (MIN_ITEM_WIDTH + gap))
				);
			}

			// 折叠时只显示首行：状态栏和操作区各占若干列，剩余列放搜索项
			let firstRowCount;
			if (columnCount.value <= ACTION_COLUMNS) {
				// 窄屏时状态栏独占首行，搜索项从下一行开始，仍显示一整行
				firstRowCount = columnCount.value;
			} else if (operationSameRow.value) {
				const available = columnCount.value - ACTION_COLUMNS - statusSpan.value;
				// 首行被状态栏 + 操作区占满时，搜索项从下一行开始，仍显示一整行
				firstRowCount = available > 0 ? available : columnCount.value;
			} else {
				// 操作区落到搜索项下方，首行只扣除状态栏
				const available = columnCount.value - statusSpan.value;
				// 状态栏独占首行时，搜索项从下一行开始，仍显示一整行
				firstRowCount = available > 0 ? available : columnCount.value;
			}
			// 有状态栏时首行可能被状态栏 + 操作区占满，此时搜索项从下一行开始显示整行
			const visibleCount = state.isFormExpanded
				? state.fieldColumns.length
				: firstRowCount;
			state.overflowCount = Math.max(0, state.fieldColumns.length - visibleCount);

			// 逐条设置 item 的 hidden 状态
			// 注意：如果某个 item 的面板正在显示中，则不隐藏它，避免下拉面板被裁剪
			state.fieldColumns.forEach((item, index) => {
				const shouldHide = index >= visibleCount;
				// 如果面板正在显示，强制保持可见
				if (shouldHide && searchState[item.key]?.showPanel) {
					searchState[item.key].hidden = false;
				} else {
					searchState[item.key].hidden = shouldHide;
				}
			});

			measureStatusSpan();
		};

		let resizeObserver = null;
		let overflowFrame = null;

		// 合并多次测量请求，避免在 ResizeObserver 回调里同步改动布局造成循环告警
		const scheduleOverflowUpdate = () => {
			if (overflowFrame !== null) return;
			overflowFrame = requestAnimationFrame(() => {
				overflowFrame = null;
				updateOverflow();
			});
		};

		watch(
			() => props.gutter,
			() => nextTick(() => scheduleOverflowUpdate())
		);

		onMounted(() => {
			const store = persist.value;
			if (store && restorePolicy.value === "auto") {
				// 自动恢复：init() 已把快照写回 queryForm，这里只负责触发首次查询
				emit("search", {
					persistence: true,
					...getSearch(),
				});
			} else if (store) {
				// 手动恢复：内存已有本次会话的状态时不提示；空快照也不值得给一个恢复入口
				const coldSnapshot = store.readCold(SEARCH_STATE_KEY, null);
				showRestore.value =
					!store.hasHot(SEARCH_STATE_KEY) &&
					!isEmptySearchSnapshot(coldSnapshot);
				emit("search", {
					persistence: true,
					...getSearch(),
				});
			} else if (props.persistence) {
				// 异常兜底：persistence prop 已配置但实例不可用（理论上不应进入此分支）
				// 发出空搜索确保 Table 能获取初始数据
				emit("search", {
					persistence: true,
					newbieQuery: {},
					newbieSort: {},
				});
			}
			// 初始测量：同步一次，避免后台标签页暂停 rAF 时搜不出折叠状态
			updateOverflow();
			scheduleOverflowUpdate();

			// 容器宽度变化时重新计算列数（侧边栏收放、窗口缩放等）
			if (typeof ResizeObserver !== "undefined" && formWrapperRef.value) {
				resizeObserver = new ResizeObserver(() => scheduleOverflowUpdate());
				resizeObserver.observe(formWrapperRef.value);
			}

			// 初始计数：与列表首屏并行获取，不阻塞状态栏渲染
			refreshStatusCounts(false);
		});

		/********** exposes **********/

		const getSortForm = () => {
			const form = {};

			state.sortForm.targetKeys.forEach(key => {
				const item = find(state.sortColumns, { key });
				form[key] = item.direction;
				const sortLabelIdx = state.searchLabels.length;
				state.searchLabels.push(
					<Tag
						color={"green"}
						closable
						onClose={e => {
							e?.preventDefault?.();
							const sidx = state.sortForm.targetKeys.indexOf(key);
							if (sidx > -1) state.sortForm.targetKeys.splice(sidx, 1);
							state.searchLabels[sortLabelIdx] = null;
						}}
					>
						{() => [
							<span style={{ marginRight: "2px" }}>{item.title}</span>,
							item.direction === "asc" ? <RiseOutlined /> : <FallOutlined />,
						]}
					</Tag>
				);
			});

			return form;
		};

		/**
		 * 获取表单实时数据
		 * @return {*}
		 */
		const collectQueryForm = (withLabels = true) => {
			const form = {};
			if (withLabels) state.searchLabels = [];

			concat(state.fieldColumns, state.expandColumns).forEach(item => {
				const collectItem = searchState[item.key]?.collectItem;
				let { value, searchLabel } = collectItem
					? collectItem({ queryForm: state.queryForm, item })
					: {};
				const { condition, type } = state.queryForm[item.key];

				if (
					(Array.isArray(value) && value.length > 0) ||
					(!Array.isArray(value) &&
						value !== null &&
						value !== undefined &&
						value !== "") ||
					condition === "null" ||
					condition === "notNull"
				) {
					// 按字段类型索引的格式化函数映射，例如 { date: value => ... }
					const formatter = searchConfig.value?.valueFormatter?.[item.type];
					if (formatter && isFunction(formatter)) {
						value = isArray(value) ? value.map(v => formatter(v)) : formatter(value);
					}
					form[item.key] = { condition, type, value };
					if (!withLabels) return;
					const labelIdx = state.searchLabels.length;
					state.searchLabels.push(
						searchLabel ? (
							<Tag
								class={"newbie-search-label-tag"}
								closable
								onClose={e => {
									e?.preventDefault?.();
									if (state.queryForm[item.key]) {
										const t = state.queryForm[item.key].type || item.type;
										if (betweenKeys.has(t)) {
											state.queryForm[item.key].value = [null, null];
										} else if (arrayKeys.has(t)) {
											state.queryForm[item.key].value = [];
										} else if (t === "switch") {
											state.queryForm[item.key].value = undefined;
										} else {
											state.queryForm[item.key].value = "";
										}
									}
									state.searchLabels[labelIdx] = null;
								}}
							>
								{searchLabel}
							</Tag>
						) : null
					);
				}
			});

			// 状态分段：选中“全部”时不参与查询，其余按等值条件输出
			const config = statusConfig.value;
			if (config && statusOptions.value.length) {
				const field = state.queryForm[statusKey.value];
				const value = isArray(field?.value) ? field.value[0] : field?.value;

				if (
					!isNull(value) &&
					!isUndefined(value) &&
					value !== "" &&
					value !== statusAllValue.value
				) {
					form[statusKey.value] = {
						condition: config.condition || config.defaultCondition || "equal",
						type: config.queryType || "select",
						value,
					};
				}
			}

			return form;
		};

		const getQueryForm = () => collectQueryForm(true);

		/**
		 * 设置搜索项的值
		 * @param {Object} fields
		 */
		const setQueryForm = fields => {
			// 程序化赋值不触发自动搜索，等下一个 tick 恢复
			suppressAutoQuery = true;
			Object.keys(fields).forEach(key => {
				if (state.queryForm[key]) {
					state.queryForm[key].value = fields[key];
				} else {
					state.queryForm[key] = {
						value: fields[key],
					};
				}
			});
			nextTick(() => {
				suppressAutoQuery = false;
			});
		};

		/**
		 * 获取可直接提交给后端的搜索参数，始终返回 { newbieQuery, newbieSort }
		 * @return {{newbieQuery: Object, newbieSort: Object}}
		 */
		const getSearch = () => {
			state.searchLabels = [];

			return {
				newbieQuery: getQueryForm(),
				newbieSort: getSortForm(),
			};
		};

		expose({ getQueryForm, setQueryForm, getSortForm, getSearch, refreshStatusCounts });

		/********** 冷恢复逻辑（localStorage 模式） **********/

		const showRestore = ref(false);

		const onApplyRestore = () => {
			const store = persist.value;
			if (!store) return;

			const snapshot = store.readCold(SEARCH_STATE_KEY, null);
			if (!isSearchSnapshot(snapshot) || !applySearchSnapshot(snapshot, state.queryForm)) {
				showRestore.value = false;
				return;
			}

			// 恢复过程由末尾的 onSearch 统一查询并持久化，避免自动搜索重复触发
			suppressAutoQuery = true;

			// 应用冷排序数据到 sortForm
			const persistedSort = readSearchSort(snapshot);
			const sortTargetKeys = [];
			Object.keys(persistedSort).forEach(key => {
				const sortItem = find(state.sortColumns, { key });
				if (!sortItem) return;
				sortItem.direction = persistedSort[key];
				sortTargetKeys.push(key);
			});
			state.sortForm.targetKeys = sortTargetKeys;

			showRestore.value = false;
			onSearch();
			nextTick(() => {
				suppressAutoQuery = false;
			});
		};

		/********** render **********/

		const searchElems = () => {
			return state.fieldColumns.map(item =>
				createSearchItem(item, state.queryForm, searchState[item.key], {
					props,
					slots,
					searchProvider: searchConfig.value,
				})
			);
		};

		const statusElem = () => {
			const config = statusConfig.value;
			if (!config || !statusOptions.value.length) return null;

			return (
				<div
					class={`newbie-search-status${state.statusCountsLoading ? " is-loading" : ""}`}
					style={statusStyle.value}
					ref={statusRef}
					role={"group"}
					aria-label={config.title}
				>
					<Segmented
						{...config.inputProps}
						value={statusValue.value}
						options={statusOptions.value}
						onChange={onStatusChange}
						labelRender={renderStatusLabel}
					/>
				</div>
			);
		};

		const expandElems = () =>
			state.expandColumns.map(item => createExpand(item, state.queryForm, searchState[item.key]));

		const sortableElem = () =>
			state.sortColumns.length ? (
				<Modal
					title={useT("search.sort-setting")}
					v-model:open={state.openSortable}
					width={"800px"}
					okText={useT("common.search")}
					cancelText={useT("common.cancel")}
					onOk={() => onSearch()}
				>
					{() => createSortable(state.sortColumns, state.sortForm)}
				</Modal>
			) : null;

		return () => {
			const toggleLabel = state.isFormExpanded
				? useT("search.collapse-conditions")
				: useT("search.more-conditions");
			const toggleTooltip = useT(
				state.isFormExpanded
					? "search.collapse-more-tooltip"
					: "search.expand-more-tooltip",
				{ count: state.overflowCount }
			);
			const toggleClass = `newbie-search-toggle${state.isFormExpanded ? " is-expanded" : ""}`;
			const toggleCount =
				state.isFormExpanded || state.overflowCount <= 0
					? null
					: state.overflowCount > 99
						? "99+"
						: state.overflowCount;

			return (
				<div class={"newbie-search"}>
					<div class={"newbie-search-query"}>
						<div class={"newbie-search-form"}>
							<div
								class={"newbie-search-form-wrapper"}
								ref={formWrapperRef}
								style={queryStyle.value}
							>
								{statusElem()}
								{searchElems()}
								<Space
									class={"newbie-search-operation"}
									style={operationStyle.value}
								>
									{() => [
										state.overflowCount > 0 || state.isFormExpanded ? (
											<Tooltip
												title={toggleTooltip}
												classes={{ root: "newbie-search-tooltip" }}
												mouseEnterDelay={0.35}
											>
												{() => (
													<Button
														type={"text"}
														class={toggleClass}
														aria-expanded={state.isFormExpanded}
														onClick={onToggleMore}
													>
														{() => (
															<span class={"newbie-search-toggle-content"}>
																<span class={"newbie-search-toggle-text"}>
																	{toggleLabel}
																</span>
																{toggleCount === null ? null : (
																	<span
																		class={
																			"newbie-search-toggle-count"
																		}
																	>
																		{toggleCount}
																	</span>
																)}
																<DownOutlined
																	class={"newbie-search-toggle-icon"}
																/>
															</span>
														)}
													</Button>
												)}
											</Tooltip>
										) : null,
										<Tooltip title={useT("search.clear-all-search-items")}>
											{() => (
												<Button
													type={"dashed"}
													icon={<ClearOutlined />}
													onClick={onClear}
												>
													{() =>
														props.sortableColumns.length
															? ""
															: useT("common.clear")
													}
												</Button>
											)}
										</Tooltip>,
										props.sortableColumns.length ? (
											<Tooltip title={useT("search.sort-setting")}>
												{() => (
													<Button
														type={
															state.sortForm.targetKeys.length
																? "primary"
																: "default"
														}
														icon={<OrderedListOutlined />}
														onClick={() => (state.openSortable = true)}
													></Button>
												)}
											</Tooltip>
										) : null,
										<Button
											type={"primary"}
											icon={<SearchOutlined />}
											onClick={onSearch}
										>
											{() => useT("common.search")}
										</Button>,
									]}
								</Space>
							</div>
						</div>
					</div>
					{state.expandColumns?.length ? (
						<div class={"newbie-search-expand"}>{expandElems()}</div>
					) : null}
					{state.searchLabels?.length || showRestore.value ? (
						<div class={"newbie-search-label"}>
							<Space
								class={"newbie-search-label-content"}
								wrap={true}
								style={{ marginBottom: 0 }}
							>
								{() => [
									showRestore.value ? (
										<Tag
											color={"orange"}
											style={{
												cursor: "pointer",
												borderStyle: "dashed",
											}}
											onClick={onApplyRestore}
										>
											{() => [
												<HistoryOutlined style={{ marginRight: "4px" }} />,
												useT("search.restore-last"),
											]}
										</Tag>
									) : null,
									...state.searchLabels.filter(Boolean),
								]}
							</Space>
						</div>
					) : null}
					{sortableElem()}
				</div>
			);
		};
	},
});
