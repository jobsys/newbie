import { defaultFileItem } from "./config.js";

/**
 * 把“标准字段名 → 实际字段名”映射应用到对象上。
 *
 * `defaultFileItem` 是映射表而不是字段名列表：
 * `{ url: "fileUrl" }` 表示标准字段 `url` 在业务数据里叫 `fileUrl`。
 *
 * @param {Object} source 使用标准字段名的对象（如后端返回值）
 * @param {Object} [mapping] 标准字段名 → 实际字段名
 * @returns {Object} 使用实际字段名的新对象
 */
export function toActualNames(source, mapping = defaultFileItem) {
	const result = {};
	for (const [canonical, actual] of Object.entries(mapping)) {
		if (source?.[canonical] !== undefined) {
			result[actual] = source[canonical];
		}
	}
	return result;
}

/**
 * 读取一份文件数据并统一成标准字段名。
 *
 * 组件内部的 fileList 按“实际字段名”读写（如 `item.fileUrl`），
 * 而外部传入的值、后端返回值可能仍使用标准名（如 `url`），
 * 因此优先读实际名，读不到再回退标准名。
 *
 * @param {Object} source 文件数据
 * @param {Object} [mapping] 标准字段名 → 实际字段名
 * @returns {Object} 使用标准字段名的新对象
 */
export function readFileItem(source, mapping = defaultFileItem) {
	const result = {};
	for (const [canonical, actual] of Object.entries(mapping)) {
		const value = source?.[actual] !== undefined ? source[actual] : source?.[canonical];
		if (value !== undefined) {
			result[canonical] = value;
		}
	}
	return result;
}
