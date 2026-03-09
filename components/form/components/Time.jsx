import { TimePicker, TimeRangePicker } from "ant-design-vue";
import { isFunction, isString } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder as placeholderUtil } from "../utils.js";

/**
 * 时间选择器
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let TimeComponent = TimePicker;
  let placeholder = placeholderUtil(item, "select");

  if (item.defaultProps && item.defaultProps.type === "range") {
    TimeComponent = TimeRangePicker;
    placeholder = isString(item.placeholder)
      ? [item.placeholder, item.placeholder]
      : [placeholder, placeholder];
  }

  return (
    <TimeComponent
      v-model:value={submitForm[item.key]}
      allowClear
      placeholder={placeholder}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      style={item.style || { width: genPixel(item.width || "200px") }}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </TimeComponent>
  );
};

export default render;
