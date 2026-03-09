import { isFunction } from "lodash-es";

/**
 * Render a plain text
 * @param item
 * @param submitForm
 * @returns {JSX.Element}
 */
const render = (item, submitForm) => {
  return (
    <span style={item.style} class={{ ...item.class }}>
      {isFunction(item.defaultValue) ? item.defaultValue({ submitForm }) : item.defaultValue}
    </span>
  );
};

export default render;
