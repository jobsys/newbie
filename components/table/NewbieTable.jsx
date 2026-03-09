import {
  computed,
  defineComponent,
  inject,
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
  Dropdown,
  Flex,
  Image,
  Input,
  Menu,
  MenuItem,
  message,
  Modal,
  Row,
  Switch,
  Select,
  Table,
  Tag,
  Tooltip,
  InputNumber,
} from "ant-design-vue";
import {
  cloneDeep,
  isArray,
  isBoolean,
  isEqual,
  isFunction,
  isObject,
  isUndefined,
} from "lodash-es";
import {
  DownOutlined,
  FilePdfOutlined,
  PictureOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  EditOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";
import { useCache, useFetch, useProcessStatusSuccess, useSm3, useT } from "../../hooks";
import { NEWBIE_TABLE } from "../provider/NewbieProvider.jsx";
import NewbieButton from "../button/NewbieButton.jsx";
import NewbieSearch from "../search/NewbieSearch.jsx";
import i18n from "../../i18n";
import { useClipboard } from "@vueuse/core";

import "./index.less";

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
     * 是否使用表单搜索
     */
    filterable: { type: Boolean, default: true },

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
     * 是否使用分页，为 Object 时时使用自定义分页
     */
    pagination: { type: [Boolean, Object], default: true },

    /**
     * 原生翻页事件
     */
    pageEvents: { type: Object, default: () => ({}) },

    /**
     * 是否在搜索条件变化时自动搜索
     */
    autoQuery: { type: Boolean, default: false },

    /**
     * 表格数据请求 URL
     */
    url: { type: String, default: "" },

    /**
     * v1.18
     * 编辑后保存的 URL
     */
    editable: { type: Boolean, default: false },

    /**
     * v1.18
     * 编辑后保存的 URL
     */
    submitUrl: { type: String, default: "" },

    /**
     * v1.18
     * 单元格编辑提交的前置方法, 返回一个 Promise
     */
    beforeCellSubmit: { type: Function, default: null },

    /**
     * 表格请求方式，默认为 GET
     *
     * @values get, post
     */
    method: { type: String, default: "get" },

    /**
     * 请求数据时额外提交的参数
     */
    extraData: { type: Object, default: () => ({}) },

    /**
     * 请求后 Res 的处理方法, 如有 url， 则该方法必须传
     */
    afterFetched: { type: Function, default: null },

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
     *  数据值需要指定 key 值，当启用 `rowSelection` 时一定要指定这个 key
     */
    rowKey: { type: [String, Function], default: "id" },

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
     * 是否显示刷新按钮
     */
    showRefresh: { type: Boolean, default: true },

    /**
     * 持久化，传入 localStorage 的 key，如果为 true, 将会以 URL Hash 为 key
     */
    persistence: { type: [Boolean, String], default: false },

    /**
     * v1.18
     * 是否用 `Card` 包裹
     */
    cardWrapper: { type: Boolean, default: true },
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
  setup(props, { emit, slots, expose }) {
    const searchRef = ref();
    const footerElemRef = ref();

    const tableProvider = inject(NEWBIE_TABLE, () => {});

    const { copy } = useClipboard();

    const genPersistenceKey = prefix => {
      if (!props.persistence) {
        return null;
      }
      prefix = prefix || "";
      if (isBoolean(props.persistence)) {
        return `newbieTable_${prefix}` + useSm3(location.href);
      }

      return `newbieTable_${prefix}` + useSm3(location.pathname + "_" + props.persistence);
    };

    let persistencePagination = props.persistence ? useCache(genPersistenceKey()).get({}) : {};

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
        pageSize: persistencePagination.pageSize || props.pagination?.pageSize || 10,
      },
      id: "",
      tableSelection: [], // 给外部用
      tableKeySelection: [], // 内部用
      items: [], // 表格内容
      columnKey: {}, // 自定义列
      fetchQueue: [], // 请示队列，以最后那个为准
      searchFormData: {}, // 搜索表单数据
    });

    /**
     * 持久化翻页与滚动
     */
    const onPersistence = () => {
      if (!props.persistence) {
        return;
      }

      const data = {
        ...state.pagination,
      };
      useCache(genPersistenceKey()).set(data);
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

    const onResizeColumn = (w, col) => {
      col.width = w;
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
          params[tableProvider.pageSizeKey] = state.pagination.pageSize;
        }
        params[tableProvider.pageKey] = state.pagination.currentPage;
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
      const type = new Date().getTime();
      state.fetchQueue.push(type);

      const method = props.method;

      if (method === "get") {
        data = { params };
      } else if (method === "post") {
        data = { ...params };
      }

      const res = await useFetch(state.tableLoading)[method](props.url, data);
      useProcessStatusSuccess(res, () => {
        // 根据队列决定是否处理数据
        if (!state.fetchQueue.length) {
          return;
        }
        if (state.fetchQueue[state.fetchQueue.length - 1] === type) {
          state.fetchQueue = [];
        }
        state.tableKeySelection = [];
        state.tableSelection = [];
        const fetched = props.afterFetched || tableProvider.afterFetched;
        const result = fetched(res);
        if (props.pagination) {
          state.pagination.totalSize = result.totalSize;
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
      state.searchFormData = searchData;
      doFetch(!searchData.persistence);
    };

    const getKey = item => {
      if (item.key) {
        return item.key;
      }
      if (isArray(item.dataIndex)) {
        return item.dataIndex.join(".");
      }
      return item.dataIndex;
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
              result.push({ ...item, resizable: true });
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
        columns = props.tableProps.columns;
      }
      return columns.map(item => {
        if (item.minWidth) {
          item.RC_TABLE_INTERNAL_COL_DEFINE = {
            style: {
              "min-width": `${item.minWidth}px`,
            },
          };
          item.width = item.minWidth;
        }
        item.key = getKey(item);
        return item;
      });
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
            newValues[0].value.map(item => getKey(item)).sort(),
            preValues[0].value.map(item => getKey(item)).sort()
          )
        ) {
          prepareSearchColumns();
        }
      },
      { immediate: true, deep: true }
    );

    //为了避免出现 Append 在一开始覆盖 Table 内容的情况，在 doFetch 后 Pagination 确定下来再添加兼容样式
    watch(
      () => state.pagination,
      value => {
        if (value) {
          footerElemRef.value?.classList.add("pagination-adapt");
        }
      },
      { deep: true }
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
      //2. 当有持久化时需要等待 Search 和 Table 的持久化数据加载完成后再进行数据获取，放在 Search 初始化后中处理
      if (!props.persistence) {
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
              filterableColumns={state.filterableColumns}
              sortableColumns={state.sortableColumns}
              onSearch={onSearch}
            >
              {{
                ...props.searchSlots,
              }}
            </NewbieSearch>,
            <Divider></Divider>,
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

    const handleTable = () => {
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
        rowKey: props.rowKey,
        customRow: (record, index) => ({
          onClick: event => {
            const isEditing = state.editingData[record[props.rowKey]];
            if (isEditing) {
              //如果在编辑就不触发 rowClick, 否则在输入等情况下 Click 操作都会触发，不好避免
              return;
            }
            emit("rowClick", { record, index, event });
          },
        }),
        ...props.tableProps,
      };
    };

    const handlePagination = () => {
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
          pageSizeOptions: ["10", "30", "50", "100", "300", "500"],
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
    };

    const handleRowSelection = () => {
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
    };

    const onEditTableCell = (editable, record, key, value) => {
      if (state.editingData[record[props.rowKey]]) {
        state.editingData[record[props.rowKey]][key] = value;
      } else {
        state.editingData[record[props.rowKey]] = { [key]: value };
      }
    };

    const onCancelEditTableCell = (record, key) => {
      if (state.editingData[record[props.rowKey]]) {
        delete state.editingData[record[props.rowKey]][key];
      }
    };

    const onSubmitTableCell = async (editable, record, key) => {
      if (!props.submitUrl && !props.beforeCellSubmit) {
        return;
      }

      let value = null;
      if (editable.type === "switch") {
        value = state.editingSwitchData[record[props.rowKey]][key];
      } else {
        value = state.editingData[record[props.rowKey]][key];
      }

      const data = {
        [props.rowKey]: record[props.rowKey],
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
      const { column, text, record } = row;
      let editable = column.editable;
      if (column.editable === true) {
        editable = { type: "input" };
      }
      const editKey = editable.key || column.key;

      const value = isUndefined(editable.defaultValue) ? text : editable.defaultValue;

      const isEditing =
        state.editingData[record[props.rowKey]] &&
        !isUndefined(state.editingData[record[props.rowKey]][editKey]);

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
              v-model:value={state.editingData[record[props.rowKey]][editKey]}
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
              v-model:value={state.editingData[record[props.rowKey]][editKey]}
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
              v-model:value={state.editingData[record[props.rowKey]][editKey]}
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
        if (isUndefined(state.editingSwitchData[record[props.rowKey]])) {
          state.editingSwitchData[record[props.rowKey]] = {};
        }

        if (isUndefined(state.editingSwitchData[record[props.rowKey]][editKey])) {
          state.editingSwitchData[record[props.rowKey]][editKey] = value;
        }
        return (
          <div class={"table-editable-wrapper"}>
            <div class={"table-editable-text"}>
              <Switch
                v-model:checked={state.editingSwitchData[record[props.rowKey]][editKey]}
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
        return (
          <div class={"table-editable-wrapper"}>
            <div class={"table-editable-text"}>{isEditing ? editElems() : text}</div>
            {editIconElem}
          </div>
        );
      }
    };

    const tableElem = () => {
      return (
        <Table
          rowSelection={handleRowSelection()}
          pagination={handlePagination()}
          loading={state.tableLoading.loading}
          dataSource={state.items}
          columns={state.tableColumns}
          onResizeColumn={onResizeColumn}
          {...handleTable()}
        >
          {{
            headerCell: ({ column }) => {
              const titleElem = [
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
                  <div class={"newbie-table-header-title-wrapper"}>{titleElem}</div>
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
      slots.append || props.pagination ? (
        <div ref={footerElemRef} class={`newbie-table-footer`}>
          <div class={"newbie-table-append-wrapper"}>{slots.append ? slots.append() : null}</div>
          <div class={"newbie-table-pagination-wrapper"}></div>
        </div>
      ) : null;

    return () => (
      <div class={"newbie-table"}>
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
          [prependElem(), filterElem(), functionalElem(), tableElem(), footerElem()]
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

/**
 *
 * 生成表格操作按钮
 * @param {array} actions
 *  action :
 *  {
 *      type: 'Button',
 *      name: '点击'
 *      props: {type: 'primary', icon: h(EditOutlined)},
 *      action: function(){},
 *  }
 */
export function useTableActions(actions) {
  if (!actions) return null;
  if (!isArray(actions)) {
    actions = [actions];
  }
  const actionElems = actions.map(action => {
    let props = { ...action.props };

    let { type } = action;
    const { name } = action;

    let ActionComponent = null;

    if (!type || type === "button") {
      ActionComponent = NewbieButton;
      props.type = props.type || "text";
    }
    // 专为tag做一些样式处理
    if (type === "a-tag" || type === "tag") {
      ActionComponent = Tag;
    }

    if (type === "switch") {
      ActionComponent = Switch;
      if (action.name) {
        props.checkedChildren = action.name?.[0] || "";
        props.unCheckedChildren = action.name?.[1] || "";
      }
      props.checked = action.value;
      props.disabled = true;
    }

    if (action.action) {
      props.onClick = withModifiers(() => action.action(), ["stop"]);
    }
    if (action.tooltip) {
      const title = action.tooltip;
      return (
        <Tooltip title={title} transfer={true}>
          {{
            default: () => <ActionComponent {...props}>{() => name}</ActionComponent>,
          }}
        </Tooltip>
      );
    }

    if (action.children?.length) {
      const menuItems = action.children;

      return (
        <Dropdown placement={"bottom"} onClick={withModifiers(() => {}, ["stop"])}>
          {{
            default: () => (
              <NewbieButton type={"text"} size={"small"} {...props}>
                {() => [<DownOutlined style={{ fontSize: "12px" }}></DownOutlined>, name]}
              </NewbieButton>
            ),
            overlay: () => (
              <Menu>
                {() =>
                  menuItems.map(item => (
                    <MenuItem>
                      {() => (
                        <NewbieButton
                          type={"text"}
                          style={{ textAlign: "left" }}
                          buttonProps={{ block: true }}
                          onClick={withModifiers(() => item.action(), ["stop"])}
                          {...item.props}
                        >
                          {() => item.name}
                        </NewbieButton>
                      )}
                    </MenuItem>
                  ))
                }
              </Menu>
            ),
          }}
        </Dropdown>
      );
    }

    return <ActionComponent {...props}>{{ default: () => name }}</ActionComponent>;
  });
  return <div class={"table-actions-wrapper"}>{actionElems}</div>;
}

/**
 * 生成表格图片预览
 * @param {string | array} images
 * @param {object} [DefaultIcon]
 * @returns {JSX.Element|unknown[]}
 */
export function useTableImage(images, DefaultIcon) {
  if (!images) {
    return (
      <span style={{ fontSize: "30px" }}>
        {DefaultIcon ? <DefaultIcon /> : <PictureOutlined />}
      </span>
    );
  }

  if (!isArray(images)) {
    images = [images];
  }
  return (
    <Flex gap={"small"}>
      {() =>
        images.map(img => {
          const src = img.thumbUrl || img.url || img;
          return (
            <Image
              src={src}
              preview={{ src: img.url || img.thumbUrl || img }}
              width={48}
              height={48}
            ></Image>
          );
        })
      }
    </Flex>
  );
}

/**
 * 生成附件链接
 * @todo i18n
 * @param {string | array} files
 * @param {object} [options]
 * @returns {JSX.Element|unknown[]}
 */
export function useTableFile(files, options) {
  const { DefaultIcon, placeholder = "暂无内容", fileName } = options || {};
  if (!files) {
    return <span>{placeholder}</span>;
  }

  if (!isArray(files)) {
    files = [files];
  }
  return files.map((file, index) => {
    const src = file.url || file;
    const name = fileName || file.name || (files.length > 1 ? `查看附件${index + 1}` : "查看附件");
    return (
      <a href={src} style={{ display: "block" }} target="_blank">
        <span style={{ fontSize: "14px" }}>
          {DefaultIcon ? <DefaultIcon /> : <FilePdfOutlined />} {name}
        </span>
      </a>
    );
  });
}
