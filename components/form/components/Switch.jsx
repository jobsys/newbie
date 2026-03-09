import { Switch } from "ant-design-vue";
import { isFunction } from "lodash-es";

/**
 * 开关
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @return {JSX.Element}
 */
const render = (item, submitForm) => {
  let optionElements = {
    checkedChildren: () => item.options?.[0] || null,
    unCheckedChildren: () => item.options?.[1] || null,
  };

  return (
    <Switch
      v-model={[submitForm[item.key], "checked"]}
      disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
      style={item.style || {}}
      {...item.defaultProps}
    >
      {optionElements}
    </Switch>
  );
};

export default render;
