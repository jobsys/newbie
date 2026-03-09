import { useI18n } from "vue-i18n";
import { isArray } from "lodash-es";

/**
 * 用于处理 i18n 翻译
 * 仅可在 setup 中使用，在回调或非 setup 环境无法使用
 * @param key
 * @param [options]
 * @returns {*|string}
 */
export function useT(key, options) {
  const { t } = useI18n();
  if (isArray(key)) {
    return key.map(k => t(k, options)).join("");
  }
  return t(key, options);
}

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
  let { locale } = options;
  if (!locale) {
    locale = useI18n().locale;
  }
  if (locale.value.includes("en")) {
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
