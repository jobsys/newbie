import { TreeSelect } from "ant-design-vue";
import { isFunction } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

/**
 * 树选择器
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let options = isFunction(item.options) ? item.options(submitForm) : item.options;
  return (
    <TreeSelect
      v-model:value={submitForm[item.key]}
      treeData={options}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      treeDefaultExpandAll
      treeNodeFilterProp="label"
      showSearch
      allowClear
      placeholder={placeholder(item, "select")}
      dropdownMatchSelectWidth={!item.width}
      style={item.style || (item.width ? { width: genPixel(item.width) } : {})}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </TreeSelect>
  );
};

export default render;
