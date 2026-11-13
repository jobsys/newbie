/**
 * NewbieTable 持久化快照
 *
 * 表格持久化的是"视图状态"，不包含数据：
 * - pagination：当前页与每页条数（不保存 totalSize，它随查询结果变化）
 * - columnKey：自定义列显隐
 *
 * 快照结构：
 * {
 *   version: 1,
 *   pagination: { currentPage, pageSize },
 *   columnKey: { [columnKey]: boolean }
 * }
 */

import { isObject, isUndefined } from "lodash-es";

export const TABLE_STATE_KEY = "state";

export const TABLE_SNAPSHOT_VERSION = 1;

/**
 * 只接受正整数，恢复时避免脏数据把分页打乱
 */
export const toPositiveInt = (value, fallback) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const toBooleanMap = value => {
	if (!isObject(value)) return {};

	const result = {};
	Object.keys(value).forEach(key => {
		if (typeof value[key] === "boolean") {
			result[key] = value[key];
		}
	});
	return result;
};

export function createTableSnapshot({ pagination = {}, columnKey = {} } = {}) {
	const snapshotPagination = {
		currentPage: toPositiveInt(pagination.currentPage, 1),
	};

	const pageSize = toPositiveInt(pagination.pageSize, undefined);
	if (!isUndefined(pageSize)) snapshotPagination.pageSize = pageSize;

	return {
		version: TABLE_SNAPSHOT_VERSION,
		pagination: snapshotPagination,
		columnKey: toBooleanMap(columnKey),
	};
}

/**
 * 读取快照，版本不符或结构异常时返回 null（按无持久化处理）
 */
export function readTableSnapshot(snapshot) {
	if (!isObject(snapshot) || snapshot.version !== TABLE_SNAPSHOT_VERSION) return null;

	return {
		pagination: isObject(snapshot.pagination) ? snapshot.pagination : {},
		columnKey: toBooleanMap(snapshot.columnKey),
	};
}
