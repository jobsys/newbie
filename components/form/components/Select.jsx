import { Select } from "ant-design-vue";
import { isFunction, isNumber, isString } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

/**
 * 选择框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let options = isFunction(item.options) ? item.options(submitForm) : item.options;
  options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));

  return (
    <Select
      v-model:value={submitForm[item.key]}
      options={options}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      allowClear
      placeholder={placeholder(item, "select")}
      dropdownMatchSelectWidth={!item.width}
      showSearch={true}
      optionFilterProp={"label"}
      style={item.style || (item.width ? { width: genPixel(item.width) } : {})}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </Select>
  );
};

export default render;
