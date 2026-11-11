import { computed, inject } from "vue";
import { EMPTY_CONFIG, NEWBIE_CONFIG, mergeConfig } from "../components/provider/config.js";

/**
 * 解析组件实际生效的配置。
 *
 * 优先级：实例 props > Provider config[namespace] > 组件 defaults。
 * 返回 Proxy，因此组件内部可以继续写 `props.xxx`，不需要改成 computed。
 *
 * @param {Object} rawProps defineComponent 传入的 props
 * @param {string} namespace 配置命名空间，如 "table"
 * @param {Object} defaults 组件默认值，同时是该组件支持的全局配置 key 清单
 */
export function useMergedProps(rawProps, namespace, defaults = {}) {
	const bag = inject(NEWBIE_CONFIG, EMPTY_CONFIG);

	const merged = computed(() => {
		const base = mergeConfig(defaults, bag[namespace] || {});
		for (const key of Object.keys(rawProps)) {
			if (rawProps[key] !== undefined) {
				base[key] = rawProps[key];
			}
		}
		return base;
	});

	return new Proxy(
		{},
		{
			get: (_, key) => (typeof key === "string" ? merged.value[key] : undefined),
			has: (_, key) => typeof key === "string" && key in merged.value,
			ownKeys: () => Reflect.ownKeys(merged.value),
			getOwnPropertyDescriptor: (_, key) =>
				typeof key === "string" && key in merged.value
					? {
							enumerable: true,
							configurable: true,
							value: merged.value[key],
						}
					: undefined,
		}
	);
}

/**
 * 只读取命名空间配置（不做实例 props 合并），返回 computed。
 * 用于 uploader / form / search / editor 这类配置项与组件 props 不同名或结构不同的场景。
 */
export function useNewbieConfig(namespace, defaults = {}) {
	const bag = inject(NEWBIE_CONFIG, EMPTY_CONFIG);
	return computed(() => mergeConfig(defaults, bag[namespace] || {}));
}
