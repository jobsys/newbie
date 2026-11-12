import { getCurrentInstance, inject, readonly } from "vue";
import { theme as antdTheme } from "antdv-next";

/**
 * 主题上下文的注入 key
 * 用 Symbol.for 而不是 Symbol：主入口与 hooks 入口是两个构建 entry，
 * 普通 Symbol 可能在两个 chunk 里各生成一份，导致 inject 拿不到。
 */
export const NEWBIE_THEME_CONTEXT = Symbol.for("jobsys-newbie.theme");

/**
 * 没有 Provider 时的兜底 token。
 *
 * antdTheme.useToken() 只能在组件 setup 中调用（依赖 inject 与生命周期），
 * 这里用等价的 getDesignToken() 取默认 token，并缓存结果，
 * 避免每次调用都重新计算一遍派生 token。
 */
let defaultToken = null;

const getDefaultToken = () => {
	if (!defaultToken) {
		defaultToken = antdTheme.getDesignToken({});
	}
	return defaultToken;
};

/**
 * 读取当前主题上下文。
 *
 * - density：当前密度（compact / default / loose）
 * - scheme：当前明暗模式（light / dark）
 * - colorPrimary：当前生效的主色
 * - token：antdv-next 的 token 对象
 * - theme：传给 ConfigProvider 的 theme 配置
 *
 * 字段用 getter 暴露，读取时会建立依赖，主题变化能触发依赖组件重新渲染。
 * 没有 NewbieThemeProvider 时返回安全默认值，不会抛异常。
 *
 * @return {Object} 只读的主题上下文
 */
export function useNewbieTheme() {
	// 在 setup 之外调用时 inject 会告警，这里直接走默认值
	const context = getCurrentInstance() ? inject(NEWBIE_THEME_CONTEXT, null) : null;

	if (context) {
		return readonly(context);
	}

	const token = getDefaultToken();
	return readonly({
		density: "default",
		scheme: "light",
		colorPrimary: token.colorPrimary,
		token,
		theme: {},
	});
}

export default useNewbieTheme;
