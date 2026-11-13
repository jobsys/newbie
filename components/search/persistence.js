/**
 * NewbieSearch 持久化快照
 *
 * 只持久化"表单态"（queryForm）而不是 collectItem 产出的"接口值"：
 * 表单态本身就是 input 的 v-model 值，恢复时可以直接写回，不需要再按
 * between / 多选 / switch 猜测数组还是标量。
 *
 * 唯一的类型差异是日期：表单里是 dayjs 对象，落盘前转 ISO 字符串。
 *
 * 快照结构：
 * {
 *   version: 1,
 *   form: { [key]: { condition, type, value } },   // value 为 JSON 安全的表单值
 *   sort: { [key]: 'asc' | 'desc' }                // 按用户排序顺序记录
 * }
 */

import dayjs from "dayjs";
import { isArray, isNull, isObject, isPlainObject, isString, isUndefined } from "lodash-es";

export const SEARCH_STATE_KEY = "state";

export const SEARCH_SNAPSHOT_VERSION = 1;

const isDateValue = value =>
	dayjs.isDayjs(value) || Object.prototype.toString.call(value) === "[object Date]";

const toDayjs = item =>
	isString(item) || typeof item === "number" ? dayjs(new Date(item)) : item;

// number / date / select / cascade 的表单值始终是数组，恢复时兜底为数组形态
const ARRAY_VALUE_TYPES = new Set(["number", "date", "select", "cascade"]);

const normalizeShape = (type, value) => {
	if (!ARRAY_VALUE_TYPES.has(type)) return value;
	if (isArray(value)) return value;
	if (isNull(value) || isUndefined(value)) return [];
	return [value];
};

const encodeValue = value => {
	if (isUndefined(value)) return undefined;
	if (isDateValue(value)) return dayjs(value).toISOString();
	// 数组里的 undefined 落盘后会被 JSON 转成 null，内存层保持一致
	if (isArray(value)) return value.map(item => (isUndefined(item) ? null : encodeValue(item)));
	// 普通对象（customRender 的值）逐层编码：去掉 undefined、避免把响应式代理写进内存快照
	if (isPlainObject(value)) {
		const result = {};
		Object.keys(value).forEach(key => {
			const encoded = encodeValue(value[key]);
			if (!isUndefined(encoded)) result[key] = encoded;
		});
		return result;
	}
	return value;
};

const decodeValue = (type, value) => {
	if (isNull(value) || isUndefined(value)) return value;
	if (type !== "date") return value;

	return isArray(value) ? value.map(toDayjs) : toDayjs(value);
};

/**
 * 与 getQueryForm 的"是否算有值"判断保持一致：
 * 为空/不为空条件本身就是有效搜索，其余类型需要有实际值
 */
const hasValue = value => {
	if (isArray(value)) {
		return value.some(item => !isNull(item) && !isUndefined(item) && item !== "");
	}
	return !isNull(value) && !isUndefined(value) && value !== "";
};

export const isMeaningfulField = field =>
	!!field &&
	(field.condition === "null" || field.condition === "notNull" || hasValue(field.value));

/**
 * 由表单态生成快照
 * @param {Object} queryForm state.queryForm
 * @param {Object} sortForm getSortForm() 的返回值
 */
export function createSearchSnapshot(queryForm = {}, sortForm = {}) {
	const form = {};

	Object.keys(queryForm).forEach(key => {
		const field = queryForm[key];
		if (!isMeaningfulField(field)) return;

		const encoded = encodeValue(field.value);
		const snapshot = { condition: field.condition, type: field.type };
		// undefined 在 JSON 里会被丢掉；显式省略，保证内存层与 localStorage 层完全一致
		if (!isUndefined(encoded)) snapshot.value = encoded;
		form[key] = snapshot;
	});

	return {
		version: SEARCH_SNAPSHOT_VERSION,
		form,
		sort: { ...sortForm },
	};
}

/**
 * 是否为当前版本的有效快照
 */
export const isSearchSnapshot = snapshot =>
	isObject(snapshot) &&
	snapshot.version === SEARCH_SNAPSHOT_VERSION &&
	isObject(snapshot.form);

/**
 * 把快照写回已验证过默认值/类型的 queryForm
 * 只恢复当前仍存在的搜索项，列被删除或改名时自动丢弃旧值
 * @returns {boolean} 是否发生了恢复
 */
export function applySearchSnapshot(snapshot, queryForm) {
	if (!isSearchSnapshot(snapshot)) return false;

	Object.keys(snapshot.form).forEach(key => {
		const saved = snapshot.form[key];
		const field = queryForm[key];
		if (!field || !isObject(saved)) return;

		if (!isUndefined(saved.condition)) field.condition = saved.condition;
		if (!isUndefined(saved.value)) {
			field.value = normalizeShape(
				field.type || saved.type,
				decodeValue(saved.type || field.type, saved.value)
			);
		}
	});

	return true;
}

/**
 * 读取快照中的排序状态，只接受合法的 asc/desc，避免脏数据透传到后端
 */
export function readSearchSort(snapshot) {
	if (!isSearchSnapshot(snapshot) || !isObject(snapshot.sort)) return {};

	const sort = {};
	Object.keys(snapshot.sort).forEach(key => {
		const direction = snapshot.sort[key];
		if (direction === "asc" || direction === "desc") sort[key] = direction;
	});
	return sort;
}

/**
 * 空快照（既没有条件也没有排序）不值得显示"恢复上次查询"入口
 */
export const isEmptySearchSnapshot = snapshot => {
	if (!isSearchSnapshot(snapshot)) return true;
	return (
		Object.keys(snapshot.form).length === 0 &&
		Object.keys(readSearchSort(snapshot)).length === 0
	);
};
