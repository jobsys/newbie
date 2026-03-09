import { Input } from "ant-design-vue";
import { isFunction } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

/**
 * 输入框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  if (
    submitForm[item.key] === null ||
    submitForm[item.key] === "null" ||
    submitForm[item.key] === undefined
  ) {
    submitForm[item.key] = "";
  }
  submitForm[item.key] = String(submitForm[item.key]);
  let inputSlot = {};
  if (item.defaultProps) {
    if (item.defaultProps.prefix) {
      inputSlot.prefix = () => {
        return isFunction(item.defaultProps.prefix)
          ? item.defaultProps.prefix()
          : item.defaultProps.prefix;
      };
    }
    if (item.defaultProps.suffix) {
      inputSlot.suffix = () => {
        return isFunction(item.defaultProps.suffix)
          ? item.defaultProps.suffix()
          : item.defaultProps.suffix;
      };
    }
    if (item.defaultProps.prepend) {
      inputSlot.addonBefore = () => {
        return isFunction(item.defaultProps.prepend)
          ? item.defaultProps.prepend()
          : item.defaultProps.prepend;
      };
    }
    if (item.defaultProps.append) {
      inputSlot.addonAfter = () => {
        return isFunction(item.defaultProps.append)
          ? item.defaultProps.append()
          : item.defaultProps.append;
      };
    }
  }
  let defaultStyle = { width: genPixel(item.width || "200px") };
  let InputComponent = Input;
  if (item.type === "textarea" || (item.defaultProps && item.defaultProps.type === "textarea")) {
    InputComponent = Input.TextArea;
    defaultStyle = { width: genPixel(item.width || "100%") };
  }

  if (item.type === "password" || (item.defaultProps && item.defaultProps.type === "password")) {
    InputComponent = Input.Password;
  }

  return (
    <InputComponent
      v-model:value={submitForm[item.key]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      placeholder={placeholder(item)}
      style={item.style || defaultStyle}
      class={{ readonly: item.readonly, ...item.class }}
      {...item.defaultProps}
    >
      {{ ...inputSlot, ...item.defaultSlots }}
    </InputComponent>
  );
};

export default render;
