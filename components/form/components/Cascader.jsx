import { Cascader } from "ant-design-vue";
import { isFunction, isNumber, isString } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { useFindParentValues } from "../../../hooks/index.js";
import { placeholder } from "../utils.js";

/**
 * 级联选择器
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let options = isFunction(item.options) ? item.options(submitForm) : item.options;

  //如果是数字或者字符串，则尝试从 options 中查找父级
  if (isNumber(submitForm[item.key]) || isString(submitForm[item.key])) {
    submitForm[item.key] = useFindParentValues(
      options,
      submitForm[item.key],
      item.defaultProps?.fieldNames
    );
  }

  return (
    <Cascader
      v-model:value={submitForm[item.key]}
      allowClear
      options={options}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      changeOnSelect
      showSearch={{
        filter(inputValue, path) {
          return path.some(option => {
            return (
              option.label && option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
            );
          });
        },
      }}
      placeholder={placeholder(item, "select")}
      style={item.style || { width: genPixel(item.width || "200px") }}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </Cascader>
  );
};

export default render;
