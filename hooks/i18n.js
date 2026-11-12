import { getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { isArray } from "lodash-es";
import i18n from "../i18n.js";

/**
 * 按 key 翻译，数组 key 会逐项翻译后拼接
 * @param {(key: string, options?: Object) => string} translate
 * @param {String|String[]} key
 * @param {Object} [options]
 * @returns {String}
 */
const translateKey = (translate, key, options) => {
  if (isArray(key)) {
    return key.map(k => translate(k, options)).join("");
  }
  return translate(key, options);
};

/**
 * 在任意位置处理 i18n 翻译
 * 内部使用库自带的 i18n 实例，可用于事件回调、Promise 回调、watcher 等
 * 非 setup / render 环境（此时 useT 不可用）
 * @param {String|String[]} key
 * @param {Object} [options]
 * @returns {String}
 */
export function t(key, options) {
  return translateKey((k, opts) => i18n.global.t(k, opts), key, options);
}

/**
 * 用于处理 i18n 翻译
 * 优先使用当前组件上下文中的 i18n 实例（可复用宿主已安装的实例）
 * 在 setup / render 之外调用，或宿主未安装 i18n 时，自动降级到内置实例
 * @param key
 * @param [options]
 * @returns {*|string}
 */
export function useT(key, options) {
  let translate;
  if (getCurrentInstance()) {
    try {
      translate = useI18n().t;
    } catch {
      translate = null;
    }
  }
  if (!translate) {
    return t(key, options);
  }
  return translateKey(translate, key, options);
}

/**
 * 安全的 useI18n 替代品：
 * - setup / render 中优先使用当前组件上下文的 i18n 实例；
 * - 宿主未安装 vue-i18n、或不在 setup/render 中时，降级到库内置实例。
 * 返回值至少包含 t / locale，可直接替换 `const { t, locale } = useI18n()`。
 *
 * @param {Object} [options] 透传给 vue-i18n 的 useI18n 选项
 * @returns {{t: Function, locale: Object, availableLocales: Array, messages: Object}}
 */
export function useLocale(options) {
	if (getCurrentInstance()) {
		try {
			return useI18n(options);
		} catch {
			// 宿主未安装 vue-i18n，继续使用内置实例
		}
	}

	return {
		t: (key, opts) => translateKey((k, o) => i18n.global.t(k, o), key, opts),
		// composition 模式下 locale 是 WritableComputedRef
		locale: i18n.global.locale,
		availableLocales: i18n.global.availableLocales,
		messages: i18n.global.messages,
	};
}

/**
 * 获取当前 locale（ref 或字符串统一取值）
 * setup / render 中优先使用组件上下文，否则使用内置实例
 * @returns {String}
 */
const getLocaleName = options => {
  let locale = options?.locale;
  if (!locale && getCurrentInstance()) {
    try {
      locale = useI18n().locale;
    } catch {
      locale = null;
    }
  }
  if (!locale) {
    locale = i18n.global.locale;
  }
  if (typeof locale === "string") {
    return locale;
  }
  return locale?.value || "";
};

/**
 * 用于处理 i18n 文本拼接情况
 *
 */
export function useI18nJoin(first, second, options) {
  const {
    capitalizeFirst = true,
    uncapitalizeSecond = true,
    uncapitalizeSecondAll = true,
  } = options || {};

  options = options || {};
  const localeName = getLocaleName(options);
  if (localeName.includes("en")) {
    //first 首字母大写
    first = first.trim();
    second = second.trim();
    if (capitalizeFirst) {
      first = first.charAt(0).toUpperCase() + first.slice(1);
    }
    if (uncapitalizeSecond) {
      second = second.charAt(0).toLowerCase() + second.slice(1);
    }
    if (uncapitalizeSecondAll) {
      second = second.toLowerCase();
    }

    return `${first} ${second}`;
  }

  return `${first}${second}`;
}
