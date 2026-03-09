import { Rate } from "ant-design-vue";
import { isFunction } from "lodash-es";

/**
 * 评分
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  submitForm[item.key] = Number(submitForm[item.key]) || 0;
  return (
    <Rate
      v-model:value={submitForm[item.key]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      {...item.defaultProps}
    >
      {{ ...item.defaultSlots }}
    </Rate>
  );
};

export default render;
