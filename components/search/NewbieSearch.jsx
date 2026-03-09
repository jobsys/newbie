import { computed, defineComponent, inject, onMounted, reactive, ref, watch } from "vue";

import createSearchItem from "./components/SearchItem.jsx";

import "./index.less";
import { NEWBIE_SEARCH } from "../provider/NewbieProvider.jsx";
import { Button, Modal, Space, Tag, Tooltip } from "ant-design-vue";
import {
  cloneDeep,
  concat,
  find,
  isArray,
  isBoolean,
  isFunction,
  isString,
  isUndefined,
  orderBy,
} from "lodash-es";
import { createExpand, createSortable } from "./components";
import {
  ArrowsAltOutlined,
  ClearOutlined,
  FallOutlined,
  OrderedListOutlined,
  RiseOutlined,
  SearchOutlined,
  ShrinkOutlined,
} from "@ant-design/icons-vue";
import { useWindowSize } from "@vueuse/core";
import { useCache, useSm3, useT } from "../../hooks";
import dayjs from "dayjs";

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
     * 持久化，传入 localStorage 的 key，如果为 true, 将会以 URL Hash 为 key
     */
    persistence: { type: [Boolean, String], default: false },
  },
  emits: [
    /**
     * 点击搜索
     * @property queryForm {Object} 搜索栏的值
     */
    "search",
  ],
  setup(props, { expose, emit, slots }) {
    const searchProvider = inject(NEWBIE_SEARCH, () => {});

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
      availableSearchItems: 0, //第一行可展数量
    });

    const formWrapperRef = ref();

    const { width: windowWidth } = useWindowSize();

    //带有 between 的搜索项则初始化为 [null, null]
    const betweenKeys = ["number", "date"];

    //可以多选的的搜索项则初始化为 []
    const arrayKeys = ["select", "cascade"];

    const searchState = {}; // 用于记录各个搜索项的状态

    const genPersistenceKey = prefix => {
      if (!props.persistence) {
        return null;
      }
      prefix = prefix || "";
      if (isBoolean(props.persistence)) {
        return `newbieSearch_${prefix}` + useSm3(location.href);
      }

      return `newbieSearch_${prefix}` + useSm3(location.pathname + "_" + props.persistence);
    };

    /**
     * 初始化搜索
     */
    const init = () => {
      const form = {};
      const expandColumns = [];
      const fieldColumns = [];
      const sortColumns = [];
      const defaultSortKeys = [];

      const persistenceSearchData = props.persistence ? useCache(genPersistenceKey()).get({}) : {};
      const persistenceSortData = props.persistence
        ? useCache(genPersistenceKey("sort")).get({})
        : {};

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
        } else if (betweenKeys.includes(item.type)) {
          value = [null, null];
        } else if (arrayKeys.includes(item.type)) {
          value = [];
        }

        //默认值处理
        if (!isUndefined(persistenceSearchData[item.key])) {
          const persistenceValue = persistenceSearchData[item.key].value;
          if (
            (betweenKeys.includes(item.type) || arrayKeys.includes(item.type)) &&
            !isArray(persistenceValue)
          ) {
            value = [persistenceValue];
          } else {
            value = persistenceValue;
          }
        } else if (!isUndefined(item.defaultValue)) {
          if (isFunction(item.defaultValue)) {
            value = item.defaultValue();
          } else {
            value = item.defaultValue;
          }
        }

        //默认搜索条件
        if (!isUndefined(persistenceSearchData[item.key])) {
          condition = persistenceSearchData[item.key].condition;
        } else if (item.conditions && item.conditions.length === 1) {
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

        if (!isUndefined(persistenceSortData[column.key])) {
          defaultSortKeys.push(column.key);
          item.direction = persistenceSortData[column.key];
        }

        if (column.direction === "asc" || column.direction === "desc") {
          defaultSortKeys.push(column.key);
        }
        sortColumns.push(item);
      });

      state.queryForm = form;
      state.sortColumns = orderBy(sortColumns, ["sortOrder"], ["desc"]);
      state.fieldColumns = orderBy(fieldColumns, ["sortOrder"], ["desc"]);
      state.expandColumns = orderBy(expandColumns, ["sortOrder"], ["desc"]);
      state.sortForm.targetKeys = defaultSortKeys;
    };

    watch(
      () => [props.filterableColumns, props.sortableColumns],
      () => {
        init();
      },
      { immediate: true }
    );

    // 查询表格是否多行
    const isFormFlexible = computed(() => state.fieldColumns.length > state.availableSearchItems);

    const onSearch = () => {
      state.openSortable = false;
      emit("search", { newbieQuery: getQueryForm(), newbieSort: getSortForm() });
    };

    const onClear = () => {
      useCache(genPersistenceKey()).remove();
      useCache(genPersistenceKey("sort")).remove();
      init();
    };

    const onToggleFormExpand = () => {
      handleFormFlexible({ show: !state.isFormExpanded });
      state.isFormExpanded = !state.isFormExpanded;
    };

    const handleFormFlexible = ({ show, stand }) => {
      if (isFormFlexible.value && !stand) {
        state.fieldColumns.forEach((item, index) => {
          searchState[item.key].hidden = show ? false : index >= state.availableSearchItems;
        });
      }
    };
    onMounted(() => {
      if (props.persistence) {
        emit("search", {
          persistence: true,
          newbieQuery: getQueryForm(),
          newbieSort: getSortForm(),
        });
      }
      watch(
        () => windowWidth.value,
        () => {
          const items = Math.floor(formWrapperRef.value.scrollWidth / (200 + props.gutter));
          if (state.availableSearchItems !== items) {
            state.availableSearchItems = items;
            handleFormFlexible({});
          }
        },
        { immediate: true }
      );
    });

    /********** exposes **********/

    const getSortForm = () => {
      const form = {};

      state.sortForm.targetKeys.forEach(key => {
        const item = find(state.sortColumns, { key });
        form[key] = item.direction;
        state.searchLabels.push(
          <Tag color={"green"}>
            {() => [
              <span style={{ marginRight: "2px" }}>{item.title}</span>,
              item.direction === "asc" ? <RiseOutlined /> : <FallOutlined />,
            ]}
          </Tag>
        );
      });

      if (props.persistence) {
        const key = genPersistenceKey("sort");
        useCache(key).set(form);
      }
      return form;
    };

    /**
     * 获取表单实时数据
     * @return {*}
     */
    const getQueryForm = () => {
      const form = {};
      const persistenceForm = {}; //由于 Form 里的值会按 Provider 进行格式化，但这里需要的是原始值，所以记录多一次
      state.searchLabels = [];

      concat(state.fieldColumns, state.expandColumns).forEach(item => {
        let { value, searchLabel } = item.collectItem
          ? item.collectItem({ queryForm: state.queryForm, item })
          : {};
        const { condition, type } = state.queryForm[item.key];

        if (
          (Array.isArray(value) && value.length > 0) ||
          (!Array.isArray(value) && value !== null && value !== undefined && value !== "") ||
          condition === "null" ||
          condition === "notNull"
        ) {
          if (props.persistence) {
            persistenceForm[item.key] = { condition, type, value };
          }
          //对返回值做预处理
          const formatter = searchProvider?.valueFormatter?.[item.type];
          if (formatter && isFunction(formatter)) {
            value = isArray(value) ? value.map(v => formatter(v)) : formatter(value);
          }
          form[item.key] = { condition, type, value };
          state.searchLabels.push(searchLabel ? <Tag color={"blue"}>{searchLabel}</Tag> : null);
        }
      });

      if (props.persistence) {
        const key = genPersistenceKey();
        useCache(key).set(persistenceForm);
      }

      return form;
    };

    /**
     * 设置搜索项的值
     * @param {Object} fields
     */
    const setQueryForm = fields => {
      Object.keys(fields).forEach(key => {
        if (state.queryForm[key]) {
          state.queryForm[key].value = fields[key];
        } else {
          state.queryForm[key] = {
            value: fields[key],
          };
        }
      });
    };

    const getSearch = () => {
      state.searchLabels = [];

      const searchForm = {};
      const newbieQuery = getQueryForm();
      const newbieSort = getSortForm();

      if (Object.keys(newbieQuery).length) {
        searchForm.newbieQuery = newbieQuery;
      }

      if (Object.keys(newbieSort).length) {
        searchForm.newbieSort = newbieSort;
      }
      return searchForm;
    };

    expose({ getQueryForm, setQueryForm, getSortForm, getSearch });

    /********** render **********/

    const searchElems = () => {
      return state.fieldColumns.map(item =>
        createSearchItem(item, state.queryForm, searchState[item.key], {
          props,
          slots,
          searchProvider,
        })
      );
    };

    const expandElems = () => state.expandColumns.map(item => createExpand(item, state.queryForm));

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
              <div class={`newbie-search-form-wrapper`} ref={formWrapperRef}>
                <Space size={[props.gutter, 10]} wrap style={{ marginBottom: 0 }}>
                  {() => searchElems()}
                </Space>
              </div>
            </div>

            <Space class={"newbie-search-operation"}>
              {() => [
                isFormFlexible.value ? (
                  <Tooltip title={useT("search.toggle-more")}>
                    {() => (
                      <Button
                        type={"link"}
                        icon={state.isFormExpanded ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
                        onClick={onToggleFormExpand}
                      >
                        {() =>
                          state.isFormExpanded ? useT("search.collapse") : useT("common.more")
                        }
                      </Button>
                    )}
                  </Tooltip>
                ) : null,
                <Tooltip title={useT("search.clear-all-search-items")}>
                  {() => (
                    <Button type={"dashed"} icon={<ClearOutlined />} onClick={onClear}>
                      {() => (props.sortableColumns.length ? "" : useT("common.clear"))}
                    </Button>
                  )}
                </Tooltip>,
                props.sortableColumns.length ? (
                  <Tooltip title={useT("search.sort-setting")}>
                    {() => (
                      <Button
                        type={state.sortForm.targetKeys.length ? "primary" : "default"}
                        icon={<OrderedListOutlined />}
                        onClick={() => (state.openSortable = true)}
                      ></Button>
                    )}
                  </Tooltip>
                ) : null,
                <Button type={"primary"} icon={<SearchOutlined />} onClick={onSearch}>
                  {() => useT("common.search")}
                </Button>,
              ]}

              {/*<Tooltip title={"自定义搜索项"}>
				<Button type={"link"} icon={<SettingOutlined />} style={{ marginLeft: "10px" }}></Button>
			</Tooltip>*/}
            </Space>
          </div>
          {state.expandColumns?.length ? (
            <div class={"newbie-search-expand"}>{expandElems()}</div>
          ) : null}
          {state.searchLabels?.length ? (
            <div class={"newbie-search-label"}>
              <span class={"newbie-search-label-title"}>{useT("search.search-items")}：</span>
              <Space class={"newbie-search-label-content"} wrap={true} style={{ marginBottom: 0 }}>
                {() => state.searchLabels}
              </Space>
            </div>
          ) : null}

          {sortableElem()}
        </div>
      );
    };
  },
});
