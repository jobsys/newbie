import { InputNumber } from "ant-design-vue";
import { isFunction } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

/**
 * 数字输入框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  submitForm[item.key] = Number(submitForm[item.key]) || 0;
  return (
    <InputNumber
      v-model:value={submitForm[item.key]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      placeholder={placeholder(item)}
      style={item.style || { width: genPixel(item.width) || "100px" }}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </InputNumber>
  );
};

export default render;
