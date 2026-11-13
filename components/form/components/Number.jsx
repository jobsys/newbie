import { InputNumber } from "antdv-next";
import { isFunction } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { splitNumberAddons, withNumberAddons } from "../../../utils/inputNumber.jsx";
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
  const { props: numberProps, addonBefore, addonAfter } = splitNumberAddons(item.defaultProps);
  const input = (
    <InputNumber
      v-model:value={submitForm[item.key]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      placeholder={placeholder(item)}
      style={item.style || { width: genPixel(item.width) || "100px" }}
      class={{ readonly: item.readonly, ...item.class }}
      {...numberProps}
    >
      {{ ...item.defaultSlots }}
    </InputNumber>
  );
  return withNumberAddons(input, addonBefore, addonAfter);
};

export default render;
