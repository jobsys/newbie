import {computed, defineComponent, nextTick, onMounted, onUnmounted, reactive, ref, watch,} from "vue";

import createSearchItem from "./components/SearchItem.jsx";

import "./index.less";
import {searchDefaults} from "./config.js";
import {useNewbieConfig} from "../../hooks/useMergedProps.js";
import {Button, Modal, Space, Tag, Tooltip} from "antdv-next";
import {cloneDeep, concat, find, isArray, isBoolean, isFunction, isString, isUndefined, orderBy,} from "lodash-es";
import {createExpand, createSortable} from "./components";
import {
	ClearOutlined,
	DownOutlined,
	FallOutlined,
	HistoryOutlined,
	OrderedListOutlined,
	RiseOutlined,
	SearchOutlined,
	UpOutlined,
} from "@antdv-next/icons";
import {usePersistenceScope, useT} from "../../hooks";
import dayjs from "dayjs";
import {normalizeConditionValue} from "./utils.js";
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
		});

		const formWrapperRef = ref();

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

		// 宽屏时操作区放在首行右侧并占两列，窄屏时独占一行排在搜索项之后
		const operationStyle = computed(() => {
			const columns = columnCount.value;
			if (columns > ACTION_COLUMNS) {
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

			// 内存层始终恢复；只有 restore=auto 时才自动套用 localStorage 冷数据
			const snapshot = persist.value
				? restorePolicy.value === "auto"
					? persist.value.read(SEARCH_STATE_KEY, null)
					: persist.value.readHot(SEARCH_STATE_KEY, null)
				: null;
			const persistedSort = readSearchSort(snapshot);

			props.filterableColumns.forEach(column => {
				const item = cloneDeep(column);
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

			props.sortableColumns.forEach(column => {
				const item = cloneDeep(column);

				if (!isUndefined(persistedSort[column.key])) {
					defaultSortKeys.push(column.key);
					item.direction = persistedSort[column.key];
				} else if (column.direction === "asc" || column.direction === "desc") {
					defaultSortKeys.push(column.key);
				}
				sortColumns.push(item);
			});

			// 快照保存的是表单态，直接覆盖默认值与条件，不再按类型猜测值结构
			applySearchSnapshot(snapshot, form);

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

			// 折叠时只显示首行，宽屏首行需要给操作区留出列
			const firstRowCount =
				columnCount.value > ACTION_COLUMNS
					? columnCount.value - ACTION_COLUMNS
					: columnCount.value;
			const visibleCount = state.isFormExpanded
				? state.fieldColumns.length
				: Math.max(1, firstRowCount);
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
		const getQueryForm = () => {
			const form = {};
			state.searchLabels = [];

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

			return form;
		};

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

		expose({ getQueryForm, setQueryForm, getSortForm, getSearch });

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
			return (
				<div class={"newbie-search"}>
					<div class={"newbie-search-query"}>
						<div class={"newbie-search-form"}>
							<div
								class={"newbie-search-form-wrapper"}
								ref={formWrapperRef}
								style={queryStyle.value}
							>
								{searchElems()}
								<Space
									class={"newbie-search-operation"}
									style={operationStyle.value}
								>
									{() => [
										state.overflowCount > 0 || state.isFormExpanded ? (
											<Tooltip title={useT("search.toggle-more")}>
												{() => (
													<Button
														type={"text"}
														class={"newbie-search-toggle"}
														icon={
															state.isFormExpanded ? (
																<UpOutlined />
															) : (
																<DownOutlined />
															)
														}
														onClick={onToggleMore}
													>
														{() =>
															state.isFormExpanded
																? useT("search.collapse-conditions")
																: useT("search.more-conditions")
														}
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
