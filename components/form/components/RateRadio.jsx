import { RadioGroup, Tag } from "ant-design-vue";
import { find, isFunction, isNumber, isObject, isString, isUndefined } from "lodash-es";
import { useLabelFromOptionsValue } from "../../../hooks/index.js";

/**
 * 评分单选框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let options = isFunction(item.options) ? item.options(submitForm) : item.options;
  options = options.map(op => {
    if (isString(op) || isNumber(op)) {
      return { value: op, label: op, rate: 0 };
    } else if (isObject(op) && op.value) {
      if (isUndefined(op.label)) {
        op.label = op.value;
      }
      if (isUndefined(op.rate)) {
        op.rate = 0;
      }
      return op;
    }
  });

  const onChange = e => {
    const { value } = e.target;
    submitForm[item.key]["rate"] = find(options, { value })?.rate || 0;
  };

  return item.readonly ? (
    <div style={{ padding: "0 11px" }}>
      <Tag>{useLabelFromOptionsValue(submitForm[item.key]["value"], options)}</Tag>
    </div>
  ) : (
    <RadioGroup
      v-model:value={submitForm[item.key]["value"]}
      optionType="button"
      buttonStyle="solid"
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      options={options}
      style={item.style || {}}
      onChange={onChange}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </RadioGroup>
  );
};

export default render;
