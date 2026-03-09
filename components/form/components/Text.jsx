import { isArray } from "lodash-es";
import { Tag } from "ant-design-vue";

/**
 * 纯文本
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  const value = submitForm[item.key];

  if (value) {
    if (isArray(value)) {
      return value.map(item => <Tag {...item.defaultProps}>{{ default: () => item }}</Tag>);
    } else {
      return <Tag {...item.defaultProps}>{{ default: () => value }}</Tag>;
    }
  }

  return null;
};

export default render;
