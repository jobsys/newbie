import { CheckboxGroup, Tag } from "ant-design-vue";
import { isFunction, isNumber, isString } from "lodash-es";
import { useFindLabelsInValues } from "../../../hooks/index.js";

/**
 * 多选框
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
      {useFindLabelsInValues(options, submitForm[item.key]).map(label => (
        <Tag style={{ marginRight: "5px" }}>{label}</Tag>
      ))}
    </div>
  ) : (
    <CheckboxGroup
      v-model:value={submitForm[item.key]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      options={options}
      shape={"square"}
      style={item.style || {}}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </CheckboxGroup>
  );
};

export default render;
