import { Checkbox, FormItemRest, Tag } from "ant-design-vue";
import { isFunction, isNumber, isObject, isString, isUndefined } from "lodash-es";
import { useFindLabelsInValues } from "../../../hooks/index.js";

/**
 * 评分多选框
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

  const onChange = option => {
    if (!submitForm[item.key]) {
      submitForm[item.key] = [];
    }
    if (submitForm[item.key].filter(v => v.value === option.value).length) {
      submitForm[item.key] = submitForm[item.key].filter(v => v.value !== option.value);
    } else {
      submitForm[item.key].push({ value: option.value, rate: option.rate });
    }
  };

  return item.readonly ? (
    <div style={{ padding: "0 11px" }}>
      {useFindLabelsInValues(
        options,
        submitForm[item.key].map(v => v.value)
      ).map(label => (
        <Tag style={{ marginRight: "5px" }}>{label}</Tag>
      ))}
    </div>
  ) : (
    <FormItemRest>
      {() =>
        options.map(option => {
          const checked = submitForm[item.key].filter(v => v.value === option.value).length > 0;
          return (
            <Checkbox
              id={option.value}
              checked={checked}
              onChange={() => onChange(option)}
              disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
            >
              {() => option.label}
            </Checkbox>
          );
        })
      }
    </FormItemRest>
  );
};

export default render;
