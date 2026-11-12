import createFormItem from "./FormItem.jsx";

/**
 * 使用 Children 渲染组合组件
 * @param item
 * @param submitForm
 * @param formState
 * @returns {JSX.Element}
 */
const render = (item, submitForm, context) => {
  const children = item.children;

  return (
    <div
      style={{ display: "flex", gap: "6px", ...item.style }}
      class={{ ...item.class }}
    >
      {children.map(child => {
        // 传副本：FormItem 会在渲染期补 type / readonly / disabled 等，不能写回调用方配置
        return createFormItem({ ...child }, submitForm, context);
      })}
    </div>
  );
};

export default render;
