/**
 * HTML
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  if (submitForm[item.key]) {
    return <div style={item.style || {}} innerHTML={submitForm[item.key]} {...item.defaultProps} />;
  }

  return null;
};

export default render;
