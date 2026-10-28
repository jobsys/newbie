import { isArray, isFunction, isObject, isUndefined } from "lodash-es";
import { useDayjs, useNumber, useTimeDayjs } from "../../hooks";
import { useAddressFullCode } from "../address/NewbieAddress.jsx";
import { useI18n } from "vue-i18n";

/** 是否有值（null / undefined / 空串都视为无值） */
const hasValue = value => !isUndefined(value) && value !== null && value !== "";

/**
 * 是否为支持 rangeKeys 的区间表单项
 *
 * 只对 `date` / `time` 且 `defaultProps.type` 为 `range` 的表单项生效，
 * 避免误配时把普通日期字段当成区间处理。
 *
 * @param {NewbieFormItemConfig} item
 * @return {boolean}
 */
const isRangeItem = item =>
  (item.type === "date" || item.type === "time") &&
  item.defaultProps?.type === "range" &&
  isArray(item.rangeKeys) &&
  item.rangeKeys.length >= 2;

/** 区间值拆分时的格式化：优先 item 配置的 format，时间类型兜底为 HH:mm:ss */
const formatRangeValue = (item, value) => {
  const format = item.defaultProps?.format || (item.type === "time" ? "HH:mm:ss" : null);

  return format && isFunction(value?.format) ? value.format(format) : value;
};

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

  // rangeKeys: 区间组件由两个字段存值，初始化时从这两个字段合并成区间值
  if (isRangeItem(item) && existingData) {
    const [start_key, end_key] = item.rangeKeys;
    const start_value = existingData[start_key];
    const end_value = existingData[end_key];

    // 两端都没有值时保持空区间，既不会绕过必填校验，也不会覆盖 defaultValue
    if (hasValue(start_value) || hasValue(end_value)) {
      value = [start_value, end_value];
    }
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
    // 时间类型可能是纯时间字符串（如后端 datetime:H:i 返回的 08:00），需补齐日期后解析
    const parseValue = v => (v ? (item.type === "time" ? useTimeDayjs(v) : useDayjs(v)) : null);

    if (item.defaultProps && item.defaultProps.type === "range") {
      value =
        isArray(value) && value.length ? [parseValue(value[0]), parseValue(value[1])] : [];
    } else {
      value = parseValue(value);
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

/**
 * 区间组件（date / time 的 type=range）提交前拆分到 rangeKeys 指定的两个字段
 *
 * 例：`{ key: "period", type: "date", defaultProps: { type: "range" }, rangeKeys: ["started_at", "ended_at"] }`
 * 提交时会拆成 `started_at` / `ended_at` 两个字段，并移除 `period`。
 * 未配置 rangeKeys、不支持的类型、以及区间值已被 item.beforeSubmit 转换成其它形态时都不做处理。
 *
 * @param {Object} form 表单数据
 * @param {Array.<NewbieFormItemConfig>} formItems 表单项配置（需已合并 match）
 * @return {Object}
 */
const applyRangeKeys = (form, formItems) => {
  formItems.forEach(item => {
    if (!isRangeItem(item)) {
      return;
    }

    const value = form[item.key];
    const [start_key, end_key] = item.rangeKeys;

    // 未定义说明已被 item.beforeSubmit 处理，此处不再覆盖
    if (isUndefined(value)) {
      return;
    }

    if (isArray(value) && value.length === 2) {
      form[start_key] = formatRangeValue(item, value[0]);
      form[end_key] = formatRangeValue(item, value[1]);
    } else if (value === null || (isArray(value) && !value.length)) {
      // 清空区间时两个字段一并置空
      form[start_key] = null;
      form[end_key] = null;
    } else {
      // beforeSubmit 已把区间值转成字符串/对象等形态，保持其处理结果
      return;
    }

    delete form[item.key];
  });

  return form;
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

export { applyRangeKeys, initItemDefaultValue, isOptionalChecked, placeholder };
