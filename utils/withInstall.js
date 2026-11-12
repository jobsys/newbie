/**
 * 库组件标记。
 * 用 Symbol.for 而不是普通 Symbol：主入口与 hooks 入口是两个构建 entry，
 * 普通 Symbol 可能在两个 chunk 里各生成一份，导致标记判断失效。
 */
export const NEWBIE_COMPONENT = Symbol.for("jobsys-newbie.component");

/**
 * 是否为 withInstall 标记过的库组件。
 * 不能只看有没有 `install`：普通插件/业务对象也可能自带 install。
 *
 * @param {*} component
 * @return {boolean}
 */
export const isNewbieComponent = component =>
	!!component &&
	(typeof component === "object" || typeof component === "function") &&
	component[NEWBIE_COMPONENT] === true;

/**
 * 给组件挂 install 与库组件标记，供 index.js 的安装循环识别。
 *
 * @param {Object} component
 * @return {Object} 同一个组件对象（保持既有 import 用法不变）
 */
export default component => {
	component[NEWBIE_COMPONENT] = true;
	component.install = app => {
		const name = component.name || component.__name;
		app.component(name, component);
	};
	return component;
};
