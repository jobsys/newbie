import NewbieAddress from "../../address/NewbieAddress.jsx";
import { isFunction } from "lodash-es";
import { genPixel } from "../../../utils/style.js";
import { placeholder } from "../utils.js";

/**
 * 地址选择器
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  return (
    <NewbieAddress
      v-model:value={submitForm[item.key]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      placeholder={placeholder(item, "select")}
      class={{ readonly: item.readonly, ...item.class }}
      style={item.style || { width: genPixel(item.width || "200px") }}
      {...item.defaultProps}
    />
  );
};

export default render;
