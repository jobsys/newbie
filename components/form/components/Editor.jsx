import NewbieEditor from "../../editor/NewbieEditor.jsx";
import { isFunction } from "lodash-es";
import { placeholder } from "../utils.js";

/**
 * 富文本编辑器
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  return (
    <NewbieEditor
      key={item.key}
      v-model:value={submitForm[item.key]}
      readonly={item.readonly}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      placeholder={placeholder(item)}
      {...item.defaultProps}
    ></NewbieEditor>
  );
};

export default render;
