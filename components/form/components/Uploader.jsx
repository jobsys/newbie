import NewbieUploader from "../../uploader/NewbieUploader.jsx";
import { isFunction } from "lodash-es";

/**
 * 上传组件
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  return (
    <NewbieUploader
      v-model:value={submitForm[item.key]}
      key={item.key}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </NewbieUploader>
  );
};

export default render;
