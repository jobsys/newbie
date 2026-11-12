import { computed, defineComponent, reactive, ref, watch } from "vue";
import { Cascader } from "antdv-next";
import { useFetch } from "../../hooks";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { addressDefaults } from "./config.js";

/**
 * 按需加载本地地址数据，避免 211KB JSON 进入主入口 chunk
 * @returns {Promise<Array>}
 */
const loadLocalData = () => import("./addressData.json").then(module => module.default);

/**
 * 地址组件
 *
 * 数据优先级：`dataSource` > `url` > `本地数据`
 *
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbieAddress",
  props: {
    value: {
      type: [String, Number, Array],
      default: undefined,
    },
    /**
     *    生成哪个级别的数据
     *    1: 省, 2: 省市, 3: 省市区
     */
    level: { type: Number, default: undefined },

    /**
     * 是否禁用选择器
     */
    disabled: { type: Boolean, default: undefined },

    /**
     * 占位符
     */
    placeholder: { type: String, default: undefined },

    /**
     * 获取数据的链接，如果不传则使用本地数据
     *
     */
    url: { type: String, default: undefined },

    /**
     * 返回数据处理函数，处理后返回数据格式必需符合下面的 [数据格式](#数据格式)
     */
    afterFetched: { type: Function, default: undefined },

    /**
     * 自定义数据源
     */
    dataSource: { type: Array, default: undefined },
  },
  emits: ["update:value"],
  setup(rawProps, { emit, expose }) {
    const props = useMergedProps(rawProps, "address", addressDefaults);
    /**
     * 按 level 截断地址层级：1 省、2 省市、3 省市区。
     * 只影响展示的级联深度，不修改原始数据。
     */
    const limitLevel = (items, level, depth = 1) => {
      if (!Array.isArray(items)) {
        return [];
      }
      if (depth >= level) {
        return items.map(item => {
          const rest = { ...item };
          delete rest.children;
          return rest;
        });
      }
      return items.map(item =>
        item.children
          ? { ...item, children: limitLevel(item.children, level, depth + 1) }
          : item
      );
    };

    const resolveItems = items => limitLevel(items, props.level || 3);

    const state = reactive({
      value: props.value,
    });

    const sourceItems = ref(props.dataSource);
    const loading = ref(false);

    // 避免 dataSource 与异步加载结果互相覆盖
    let loadToken = 0;

    // 按 level 缓存裁剪结果，数据与层级都没变时复用同一棵地址树
    let levelCache = null;
    const items = computed(() => {
      const source = sourceItems.value;
      const level = props.level || 3;

      if (levelCache && levelCache.source === source && levelCache.level === level) {
        return levelCache.items;
      }

      const result = resolveItems(source);
      levelCache = { source, level, items: result };
      return result;
    });

    const fetchData = async token => {
      let data = await useFetch().get(props.url);

      if (props.afterFetched) {
        data = props.afterFetched(data);
      }
      if (token === loadToken) {
        sourceItems.value = data;
      }
    };

    /**
     * 数据优先级：dataSource > url > 本地数据
     * 只有既没有 dataSource 又没有 url 时才异步加载本地 JSON
     */
    const loadSource = async () => {
      const token = ++loadToken;

      if (Array.isArray(props.dataSource) && props.dataSource.length > 0) {
        sourceItems.value = props.dataSource;
        return;
      }

      if (props.url) {
        await fetchData(token);
        return;
      }

      loading.value = true;
      try {
        const localData = await loadLocalData();
        if (token === loadToken) {
          sourceItems.value = localData;
        }
      } finally {
        if (token === loadToken) {
          loading.value = false;
        }
      }
    };

    watch([() => props.dataSource, () => props.url], () => {
      loadSource();
    });

    watch(
      () => props.value,
      value => {
        state.value = value;
      }
    );

    loadSource();

    const handleChange = value => {
      emit("update:value", value);
    };

    expose({ loading });

    /********** render **********/

    return () => (
      <Cascader
        v-model={[state.value, "value"]}
        fieldNames={{ label: "name", value: "code", children: "children" }}
        allowClear={true}
        placeholder={props.placeholder}
        disabled={props.disabled}
        options={items.value}
        changeOnSelect={true}
        showSearch={true}
        onChange={handleChange}
      />
    );
  },
});

/**
 *
 * 根据地址编码获取完整的地址编码
 *
 * @param code
 * @param {number} [level] 地址级别: 1: 省, 2: 省市, 3: 省市区
 * @return {string[]|(string|*)[]|*[]}
 */
export function useAddressFullCode(code, level) {
  code += "";
  if (code && code.length === 6) {
    if (!level) {
      if (code.endsWith("0000")) {
        level = 1;
      } else if (code.endsWith("00")) {
        level = 2;
      } else {
        level = 3;
      }
    }
    if (level === 1) {
      return [`${code.substr(0, 2)}0000`];
    }
    if (level === 2) {
      return [`${code.substr(0, 2)}0000`, `${code.substr(0, 4)}00`];
    }
    if (level === 3) {
      return [`${code.substr(0, 2)}0000`, `${code.substr(0, 4)}00`, code];
    }
  }
  return [];
}
