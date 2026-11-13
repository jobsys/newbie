import { SpaceAddon, SpaceCompact } from "antdv-next";
import { isFunction } from "lodash-es";

/**
 * 拆分 InputNumber 的附加内容配置。
 *
 * antdv-next 1.8 起 InputNumber 的 `addonBefore` / `addonAfter` 已废弃，继续透传会在
 * 控制台输出 “addonAfter is deprecated. Please use Space.Compact instead.”。
 * 这里把废弃属性和 Input 风格的 `prepend` / `append` 统一提取出来，剩余属性仍然透传给控件。
 *
 * @param {Object} [props] 透传给 InputNumber 的属性
 * @return {{ props: Object, addonBefore: any, addonAfter: any }}
 */
export const splitNumberAddons = (props = {}) => {
	const { addonBefore, addonAfter, prepend, append, ...rest } = props || {};

	return {
		props: rest,
		addonBefore: addonBefore !== undefined ? addonBefore : prepend,
		addonAfter: addonAfter !== undefined ? addonAfter : append,
	};
};

const resolveAddon = addon => (isFunction(addon) ? addon() : addon);

/**
 * 用 Space.Compact 包裹 InputNumber 以渲染附加内容，替代已废弃的 addon 属性；
 * 没有附加内容时原样返回，避免影响既有布局。
 *
 * @param {Object} input InputNumber 节点
 * @param {any} addonBefore 前置内容
 * @param {any} addonAfter 后置内容
 * @return {Object}
 */
export const withNumberAddons = (input, addonBefore, addonAfter) => {
	const before = resolveAddon(addonBefore);
	const after = resolveAddon(addonAfter);

	if (!before && !after) {
		return input;
	}

	return (
		<SpaceCompact>
			{before ? <SpaceAddon>{before}</SpaceAddon> : null}
			{input}
			{after ? <SpaceAddon>{after}</SpaceAddon> : null}
		</SpaceCompact>
	);
};
