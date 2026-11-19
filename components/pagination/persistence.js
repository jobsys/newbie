/**
 * NewbiePagination 持久化快照
 *
 * 与 NewbieTable 不同，这里没有列显隐，持久化的只有"分页视图状态"：
 * - pagination：当前页与每页条数（不保存 totalSize，它随查询结果变化）
 *
 * 快照结构：
 * {
 *   version: 1,
 *   pagination: { currentPage, pageSize }
 * }
 */

import { isObject, isUndefined } from "lodash-es";

export const PAGINATION_STATE_KEY = "state";

export const PAGINATION_SNAPSHOT_VERSION = 1;

/**
 * 只接受正整数，恢复时避免脏数据把分页打乱
 */
export const toPositiveInt = (value, fallback) => {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export function createPaginationSnapshot({ pagination = {} } = {}) {
	const snapshotPagination = {
		currentPage: toPositiveInt(pagination.currentPage, 1),
	};

	const pageSize = toPositiveInt(pagination.pageSize, undefined);
	if (!isUndefined(pageSize)) snapshotPagination.pageSize = pageSize;

	return {
		version: PAGINATION_SNAPSHOT_VERSION,
		pagination: snapshotPagination,
	};
}

/**
 * 读取快照，版本不符或结构异常时返回 null（按无持久化处理）
 */
export function readPaginationSnapshot(snapshot) {
	if (!isObject(snapshot) || snapshot.version !== PAGINATION_SNAPSHOT_VERSION) return null;

	return {
		pagination: isObject(snapshot.pagination) ? snapshot.pagination : {},
	};
}
