import { defineComponent, reactive, watch } from "vue";
import { Cascader } from "ant-design-vue";
import localData from "./addressData.json";
import { useFetch } from "../../hooks";

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
      default: () => [],
    },
    /**
     *    生成哪个级别的数据
     *    1: 省, 2: 省市, 3: 省市区
     */
    level: { type: Number, default: 3 },

    /**
     * 是否禁用选择器
     */
    disabled: { type: Boolean, default: false },

    /**
     * 占位符
     */
    placeholder: { type: String, default: "请选择地区" },

    /**
     * 获取数据的链接，如果不传则使用本地数据
     *
     */
    url: { type: String, default: "" },

    /**
     * 返回数据处理函数，处理后返回数据格式必需符合下面的 [数据格式](#数据格式)
     */
    afterFetched: { type: Function, default: null },

    /**
     * 自定义数据源
     */
    dataSource: { type: Array, default: () => [] },
  },
  emits: ["update:value"],
  setup(props, { emit }) {
    const state = reactive({
      items: props.dataSource,
      value: props.value,
    });

    watch(
      () => props.dataSource,
      () => {
        state.items = props.dataSource;
      }
    );

    if (state.items.length === 0) {
      if (props.url) {
        fetchData();
      } else {
        state.items = localData;
      }
    }

    const fetchData = async () => {
      let items = await useFetch().get(props.url);

      if (props.afterFetched) {
        items = props.afterFetched(items);
      }
      state.items = items;
    };

    const handleChange = value => {
      emit("update:value", value);
    };

    /********** render **********/

    return () => (
      <Cascader
        v-model={[state.value, "value"]}
        fieldNames={{ label: "name", value: "code", children: "children" }}
        allowClear={true}
        placeholder={props.placeholder}
        disabled={props.disabled}
        options={state.items}
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
      if (/0000$/.test(code)) {
        level = 1;
      } else if (/00$/.test(code)) {
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
