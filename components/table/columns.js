import { cloneDeep, isArray, isUndefined } from "lodash-es";

/**
 * 获取列的唯一 key
 * key 与 dataIndex 都可能是数组（嵌套路径），需要统一转成字符串，
 * 否则自定义列弹窗中 checkbox 的 value 会是数组，无法与 columnKey 的字符串 key 匹配
 * @param {object} item
 * @returns {*}
 */
export const getColumnKey = item => {
	const key = item.key || item.dataIndex;
	return isArray(key) ? key.join(".") : key;
};

/**
 * 规范化列配置（不改写调用方传入的原对象，满足 F-021 只读契约）
 * @param {Array} columns
 * @returns {Array}
 */
export const normalizeColumns = columns =>
	(columns || []).map(item => ({
		...item,
		key: getColumnKey(item),
		...(item.minWidth
			? {
					width: item.minWidth,
					RC_TABLE_INTERNAL_COL_DEFINE: {
						style: {
							"min-width": `${item.minWidth}px`,
						},
					},
				}
			: {}),
		...(item.children ? { children: normalizeColumns(item.children) } : {}),
	}));

/**
 * 为尚未记录显隐状态的列补充默认可见（true）
 * @param {Array} columns
 * @param {Record<string, boolean>} columnKeyMap
 */
export const ensureColumnKeys = (columns, columnKeyMap) => {
	if (!columns?.length) return;
	columns.forEach(column => {
		const key = getColumnKey(column);
		if (key && isUndefined(columnKeyMap[key])) {
			columnKeyMap[key] = true;
		}
		if (column.children) {
			ensureColumnKeys([].concat(column.children), columnKeyMap);
		}
	});
};

/**
 * 按显隐状态过滤表格列，并为叶子列默认开启 resizable
 * @param {Array} columns
 * @param {Record<string, boolean>} columnKeyMap
 * @returns {Array}
 */
export const collectVisibleColumns = (columns, columnKeyMap) => {
	const result = [];
	if (!columns?.length) return result;

	columns.forEach(column => {
		const item = cloneDeep(column);
		const key = getColumnKey(item);
		const isVisible = !key || columnKeyMap[key];

		if (!item.children) {
			if (isVisible) {
				result.push({
					...item,
					resizable: item.resizable ?? true,
				});
			}
			return;
		}

		const children = collectVisibleColumns([].concat(item.children), columnKeyMap);
		if (children.length && isVisible) {
			item.children = children;
			result.push(item);
		}
	});

	return result;
};

/**
 * 展平列配置用于自定义列弹窗
 * @param {Array} columns
 * @returns {Array}
 */
export const flattenCustomColumns = columns => {
	let result = [];
	if (!columns?.length) return result;

	columns.forEach(column => {
		const item = cloneDeep(column);
		item.checkKey = getColumnKey(item);
		if (!item.children) {
			result.push(item);
		} else {
			const children = flattenCustomColumns(item.children);
			delete item.children;
			result.push(item);
			result = result.concat(children);
		}
	});

	return result;
};

/**
 * 提取可过滤列配置供 NewbieSearch 使用
 * @param {Array} columns
 * @returns {Array}
 */
export const extractFilterableColumns = columns =>
	columns
		.filter(item => item.filterable || item.isOnlyForQuery)
		.map(item => ({
			title: item.title,
			key: getColumnKey(item),
			options: item.options,
			...item.filterable,
		}));

/**
 * 提取可排序列配置供 NewbieSearch 使用
 * @param {Array} columns
 * @returns {Array}
 */
export const extractSortableColumns = columns =>
	columns
		.filter(item => item.sortable)
		.map(item => {
			const base = {
				title: item.title,
				key: getColumnKey(item),
			};
			if (item.sortable === "asc" || item.sortable === "ASC") {
				return { ...base, direction: "asc" };
			}
			if (item.sortable === "desc" || item.sortable === "DESC") {
				return { ...base, direction: "desc" };
			}
			return { ...base, ...item.sortable };
		});
