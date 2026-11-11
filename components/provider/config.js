import { isPlainObject } from "lodash-es";

/** 全局配置覆盖包的注入 key
 * 用 Symbol.for 而不是 Symbol：主入口与 hooks 入口是两个构建 entry，
 * 普通 Symbol 可能在两个 chunk 里各生成一份，导致 inject 拿不到。
 */
export const NEWBIE_CONFIG = Symbol.for("jobsys-newbie.config");

/** 空配置，作为 inject 的默认值，避免每个消费方各写一个 {} */
export const EMPTY_CONFIG = Object.freeze({});

/**
 * 合并配置：普通对象递归合并，数组/函数/标量整体替换，undefined 忽略。
 * 不修改 base 与 input。
 */
export function mergeConfig(base = {}, input = {}) {
	if (!isPlainObject(base) || !isPlainObject(input)) {
		return input ?? base;
	}

	const result = { ...base };
	for (const key of Object.keys(input)) {
		const next = input[key];
		if (next === undefined) {
			continue;
		}
		result[key] =
			isPlainObject(next) && isPlainObject(base[key])
				? mergeConfig(base[key], next)
				: next;
	}
	return result;
}
