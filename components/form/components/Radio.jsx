import { RadioGroup, Tag } from "ant-design-vue";
import { isFunction, isNumber, isString } from "lodash-es";
import { useLabelFromOptionsValue } from "../../../hooks/index.js";

/**
 * 单选框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let options = isFunction(item.options) ? item.options(submitForm) : item.options;
  options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));
  return item.readonly ? (
    <div style={{ padding: "0 11px" }}>
      <Tag>{useLabelFromOptionsValue(submitForm[item.key], options)}</Tag>
    </div>
  ) : (
    <RadioGroup
      v-model:value={submitForm[item.key]}
      optionType="button"
      buttonStyle="solid"
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      options={options}
      style={item.style || {}}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </RadioGroup>
  );
};

export default render;
