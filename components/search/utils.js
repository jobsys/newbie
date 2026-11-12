import { isArray, isFunction, isNull, isNumber, isString, isUndefined } from "lodash-es";

/**
 * 归一化搜索项的 options
 * - 函数式 options 只调用一次
 * - 非数组返回 []
 * - 字符串/数字项归一化为 { value, label }
 * - 对象原样返回
 * @param {Array|Function} options
 * @return {Array}
 */
export const normalizeOptions = options => {
	const list = isFunction(options) ? options() : options;

	if (!isArray(list)) return [];

	return list.map(option =>
		isString(option) || isNumber(option) ? { value: option, label: option } : option
	);
};

/**
 * 以数组存值的搜索项类型
 * select 的 value 是已选值列表，cascade 的 value 是完整路径数组，两者规则不同
 */
const ARRAY_VALUE_TYPES = new Set(["select", "cascade"]);

/**
 * 条件变化时规整搜索项的值（纯函数，直接从 render 里的 watch 抽离）
 * - select：equal/notEqual 只保留首值；null/notNull 清空；其余条件过滤 null/undefined
 * - cascade：值必须保持完整路径，只处理 null/notNull 的清空
 * - 其它类型返回原字段，不做处理
 * @param {SearchItemConfig} item
 * @param {Object} queryForm
 * @return {Object|undefined} 被规整的字段
 */
export const normalizeConditionValue = (item, queryForm) => {
	const field = queryForm?.[item.key];

	if (!field) return field;

	const type = item.type || field.type;

	if (!ARRAY_VALUE_TYPES.has(type)) return field;

	const { condition, value } = field;

	if (type === "cascade") {
		// 为空/不为空不消耗值，清掉已选路径避免残留
		if (condition === "null" || condition === "notNull") {
			field.value = [];
		}
		return field;
	}

	if (condition === "equal" || condition === "notEqual") {
		field.value = value?.[0] ? [value[0]] : [];
	} else if (condition === "null" || condition === "notNull") {
		field.value = [];
	} else if (isArray(value)) {
		// 从为空/不为空切回带值条件时，清理持久化恢复可能产生的 null 残留
		field.value = value.filter(option => !isNull(option) && !isUndefined(option));
	}

	return field;
};
