import { isArray, isFunction, isObject, isUndefined } from "lodash-es";
import { useDayjs, useNumber } from "../../hooks";
import { useAddressFullCode } from "../address/NewbieAddress.jsx";
import { useI18n } from "vue-i18n";

/**
 * 初始化表单项默认值
 * @param {NewbieFormItemConfig} item
 * @param {Object} existingData
 * @param {Object} submitForm
 * @param {Object} provider
 */
const initItemDefaultValue = (item, existingData, submitForm, provider) => {
  let value = "";

  const { uploaderProvider } = provider;

  if (existingData && !isUndefined(existingData[item.key])) {
    value = existingData[item.key];
  } else if (!isUndefined(item.defaultValue)) {
    value = isFunction(item.defaultValue)
      ? item.defaultValue({ submitForm, existingData })
      : item.defaultValue;
  }

  if (item.init && isFunction(item.init)) {
    value = item.init({ submitForm, value, existingData });
  }

  if (item.type === "number" || item.type === "slider" || item.type === "rate") {
    value = useNumber(value);
  } /*else if (item.type === "switch") {
		value = value === "true" || value === 1 || value === "1" || value === true
	}*/ else if (item.type === "select" || item.type === "remote") {
    if (
      item.defaultProps &&
      (item.defaultProps.mode === "multiple" || item.defaultProps.mode === "tags")
    ) {
      value = value || [];
    } else {
      value = value || undefined;
    }
  } else if (item.type === "tree-select") {
    if (
      item.defaultProps &&
      (item.defaultProps.multiple === true || item.defaultProps.treeCheckable === true)
    ) {
      value = value || [];
    } else {
      value = value || undefined;
    }
  } else if (item.type === "date" || item.type === "time") {
    if (item.defaultProps && item.defaultProps.type === "range") {
      value = value ? [useDayjs(value[0]), useDayjs(value[1])] : [];
    } else {
      value = value ? useDayjs(value) : null;
    }
  } else if (item.type === "address") {
    value = value || [];
    if (!isArray(value)) {
      value = useAddressFullCode(value);
    }
  } else if (item.type === "uploader") {
    if (item.defaultProps && item.defaultProps.maxNum && item.defaultProps.maxNum > 1) {
      value = value || [];
    } else {
      const { path: pathKey, url: urlKey } = uploaderProvider.defaultFileItem;
      value = value || { [pathKey]: "", [urlKey]: "" };
    }
  } else if (
    ["matrix-checkbox", "matrix-radio", "matrix-scale", "rate-radio"].includes(item.type)
  ) {
    value = value || {};
  } else if (["group", "tag", "checkbox", "rate-checkbox"].includes(item.type)) {
    value = value || [];
  }

  return value;
};

const isOptionalChecked = (item, submitForm) => {
  const value = submitForm[item.key];
  if (isObject(value) && !Object.keys(value).length) {
    return false;
  }

  if (isArray(value) && !value.length) {
    return false;
  }

  if (value === "" || value === false || value === null || value === undefined || value === 0) {
    return false;
  }

  return true;
};

/**
 *
 * @param item
 * @param {"input"|"select"|"upload"} [type]
 * @returns {string}
 */
const placeholder = (item, type) => {
  const { t, locale } = useI18n();

  const title = locale.value === "en_US" ? item.title?.toLowerCase() : item.title;

  if (type === "select") {
    return item.placeholder || t("form.please-select", { title });
  }
  if (type === "upload") {
    return item.placeholder || t("form.please-upload", { title });
  }

  return item.placeholder || t("form.please-input", { title });
};

export { initItemDefaultValue, isOptionalChecked, placeholder };
