import { DatePicker, RangePicker } from "ant-design-vue";
import { isFunction, isString } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder as placeholderUtils } from "../utils.js";

/**
 * 日期选择器
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let DateComponent = DatePicker;
  let placeholder = placeholderUtils(item, "select");
  if (item.defaultProps && item.defaultProps.type === "range") {
    DateComponent = RangePicker;
    placeholder = isString(item.placeholder)
      ? [item.placeholder, item.placeholder]
      : [placeholder, placeholder];
  }

  return (
    <DateComponent
      v-model:value={submitForm[item.key]}
      allowClear
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      placeholder={placeholder}
      style={item.style || { width: genPixel(item.width || "200px") }}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </DateComponent>
  );
};

export default render;
