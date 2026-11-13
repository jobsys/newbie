/**
 * 统一持久化 composable
 *
 * 两层存储，但只有一套读写语义：
 *   内存（hot）   — 当前 session 的热数据，同一 SPA 内页面导航不丢失。
 *   localStorage（cold）— 跨 session 的冷数据，配置 `storage: 'local'` 后启用。
 *
 * 读取顺序固定为：内存 → localStorage（命中时回填内存）→ 默认值。
 * 组件不再各自决定"要不要读冷存储"，而是通过 `parsePersistenceConfig().restore`
 * 显式声明冷数据的使用方式（auto 自动套用 / manual 交给恢复入口）。
 *
 * 约定：`write()` 的内容必须是 JSON 安全的数据（Date、dayjs 等请在调用方序列化），
 * 这样内存层与 localStorage 层保存的是同一份数据，不会出现"热数据是对象、冷数据是
 * 字符串"的分叉。组件层用 `components/search/persistence.js` 之类的快照模块完成转换。
 *
 * @param {string} namespace 命名空间，用于隔离不同模块/页面的缓存（如 "search_<hash>"）
 * @param {Object} [options]
 * @param {'memory'|'local'} [options.storage='memory'] 是否启用 localStorage 冷存储
 */

import { computed } from "vue";
import { isFunction, isNull, isUndefined } from "lodash-es";
import { useCache } from "./utils";
import { useSm3 } from "./cipher";

/**
 * 存储键前缀版本：快照结构变化时递增，旧数据自然失效，不读取脏数据
 */
export const PERSISTENCE_VERSION = 2;

const PREFIX = "nbp";

const isMissing = value => isNull(value) || isUndefined(value);

/**
 * localStorage 在隐私模式、配额已满或数据损坏时都可能抛错，
 * 持久化属于增强能力，任何异常都不应中断组件本身。
 */
const getSafeLocalStorage = () => {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
};

/**
 * 创建一个命名空间下的持久化实例
 * @param {string} namespace
 * @param {{storage?: 'memory'|'local'}} [options]
 */
export function usePersistence(namespace, options = {}) {
	const { storage = "memory" } = options;
	const enableCold = storage === "local";

	const makeKey = key =>
		[PREFIX, `v${PERSISTENCE_VERSION}`, namespace, key].filter(Boolean).join("_");

	// 记录本实例访问过的 key，让 clear() 不传参时能清掉所有已知数据
	const knownKeys = new Set();
	const track = key => {
		if (!isMissing(key)) knownKeys.add(key);
	};

	/*** 内存层 ***/

	const readMemory = key => {
		track(key);
		return useCache(makeKey(key)).get();
	};
	const writeMemory = (key, value) => {
		track(key);
		useCache(makeKey(key)).set(value);
	};
	const removeMemory = key => {
		knownKeys.delete(key);
		useCache(makeKey(key)).remove();
	};

	/*** localStorage 层 ***/

	const readColdValue = key => {
		track(key);
		if (!enableCold) return undefined;
		const storageRef = getSafeLocalStorage();
		if (!storageRef) return undefined;
		try {
			const raw = storageRef.getItem(makeKey(key));
			if (isMissing(raw)) return undefined;
			return JSON.parse(raw);
		} catch {
			return undefined;
		}
	};

	const writeColdValue = (key, value) => {
		if (!enableCold) return;
		const storageRef = getSafeLocalStorage();
		if (!storageRef) return;
		try {
			storageRef.setItem(makeKey(key), JSON.stringify(value));
		} catch {
			// 配额不足等情况忽略：内存层仍然可用
		}
	};

	const hasColdValue = key => !isMissing(readColdValue(key));

	const removeColdValue = key => {
		if (!enableCold) return;
		const storageRef = getSafeLocalStorage();
		if (!storageRef) return;
		try {
			storageRef.removeItem(makeKey(key));
		} catch {
			// ignore
		}
	};

	const store = {
		/**
		 * 统一读取：内存 → localStorage（命中回填内存）→ 默认值
		 */
		read(key, defaultValue = undefined) {
			const hot = readMemory(key);
			if (!isMissing(hot)) return hot;

			const cold = readColdValue(key);
			if (!isMissing(cold)) {
				writeMemory(key, cold);
				return cold;
			}

			return defaultValue;
		},

		/**
		 * 保存：写内存 + 按配置写 localStorage
		 */
		write(key, value) {
			writeMemory(key, value);
			writeColdValue(key, value);
		},

		/**
		 * 删除：同时清除两层
		 */
		remove(key) {
			removeMemory(key);
			removeColdValue(key);
		},

		/**
		 * 批量清除：传数组时只清指定 key，不传时清掉本实例访问过的所有 key
		 */
		clear(keys) {
			const targets = keys ?? [...knownKeys];
			targets.forEach(key => store.remove(key));
		},

		/**
		 * 任意一层是否有数据
		 */
		has(key) {
			return !isMissing(readMemory(key)) || hasColdValue(key);
		},

		/**
		 * 仅读取内存（不受冷数据策略影响，用于 restore=manual 时仍恢复会话内状态）
		 */
		readHot(key, defaultValue = undefined) {
			const value = readMemory(key);
			return isMissing(value) ? defaultValue : value;
		},

		/**
		 * 仅检查内存（用于判断会话内是否已有状态，避免重复显示冷恢复入口）
		 */
		hasHot(key) {
			return !isMissing(readMemory(key));
		},

		/**
		 * 仅检查冷存储（用于"恢复上次查询"入口）
		 */
		hasCold: hasColdValue,

		/**
		 * 仅读取冷存储，不查内存（用于手动恢复）
		 */
		readCold(key, defaultValue = undefined) {
			const value = readColdValue(key);
			return isMissing(value) ? defaultValue : value;
		},

		/*** 兼容旧 API（4.0 alpha 期间已对外导出） ***/
		save: (key, value) => store.write(key, value),
		load: (key, defaultValue) => store.read(key, defaultValue),
		loadWithFallback: (key, defaultValue) => store.read(key, defaultValue),
		loadLocal: (key, defaultValue) => store.readCold(key, defaultValue),
		hasLocalData: key => store.hasCold(key),
		hasData: key => store.has(key),
	};

	return store;
}

/**
 * 解析 persistence prop，提取配置
 * @param {boolean|string|Object} prop persistence prop 的值
 * @return {{enabled: boolean, storage: 'memory'|'local', key: string|null, restore: 'auto'|'manual'|null}}
 */
export function parsePersistenceConfig(prop) {
	const empty = { enabled: false, storage: "memory", key: null, restore: null };

	if (!prop) return empty;

	if (prop === true) {
		return { ...empty, enabled: true };
	}

	if (typeof prop === "string") {
		return { ...empty, enabled: true, key: prop };
	}

	if (typeof prop === "object" && prop !== null) {
		return {
			...empty,
			enabled: true,
			storage: prop.storage === "local" ? "local" : "memory",
			key: prop.key || null,
			restore: prop.restore === "manual" ? "manual" : prop.restore === "auto" ? "auto" : null,
		};
	}

	return empty;
}

/**
 * 组件统一的持久化作用域：配置、命名空间、存储实例
 *
 * - 显式 key 时按 `pathname + key` 取摘要，避免不同页面同名 key 串数据；
 * - 未提供 key 时按当前 URL（含 hash 路由）取摘要，即"本页一份"。
 *
 * @param {'search'|'table'|string} scope 组件作用域前缀
 * @param {*} prop `() => props.persistence` 或静态值
 */
export function usePersistenceScope(scope, prop) {
	const resolveProp = isFunction(prop) ? prop : () => prop;

	const config = computed(() => parsePersistenceConfig(resolveProp()));

	const namespace = computed(() => {
		const conf = config.value;
		if (!conf.enabled || typeof location === "undefined") return null;
		const route = conf.key ? `${location.pathname}_${conf.key}` : location.href;
		return `${scope}_${useSm3(route)}`;
	});

	const store = computed(() =>
		namespace.value ? usePersistence(namespace.value, { storage: config.value.storage }) : null
	);

	/**
	 * 冷数据策略：显式配置优先；搜索默认手动恢复，表格默认自动恢复
	 */
	const restore = computed(() => {
		const conf = config.value;
		if (conf.restore) return conf.restore;
		return scope === "search" && conf.storage === "local" ? "manual" : "auto";
	});

	return { config, namespace, store, restore };
}
