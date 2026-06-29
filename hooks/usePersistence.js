/**
 * 统一持久化 composable
 *
 * 双存储层设计：
 *   内存（hot） — 当前 session 的热数据，读写快。同一 SPA 内页面导航不丢失。
 *   localStorage（cold）— 跨 session 的冷数据，需配置 storage: 'local' 启用。
 *
 * 数据流策略：
 *   save(key, value)       → 写内存 + 按配置写 localStorage
 *   load(key, default)     → 读内存（热数据），不过问冷存储
 *   loadWithFallback(...)  → 读内存 → 降级到 localStorage（用于分页等需要自动恢复的场景）
 *   loadLocal(key, ...)    → 强制读 localStorage（冷恢复，配合快捷入口使用）
 *   hasLocalData(key)      → 检查 localStorage 是否有数据
 *
 * @param {string} namespace 命名空间，用于隔离不同模块/页面的缓存（如 "search_<hash>"）
 * @param {Object} [options]
 * @param {'memory'|'local'} [options.storage='memory'] 是否启用 localStorage 冷存储
 */

import { isNull, isUndefined } from "lodash-es";
import { useCache } from "./utils";

export function usePersistence(namespace, options = {}) {
  const { storage = "memory" } = options;
  const enableLocal = storage === "local";

  function makeKey(key) {
    return ["nbp", namespace, key].filter(Boolean).join("_");
  }

  /*** 单层操作（不暴露到返回对象，仅内部调用） ***/

  function setMemory(key, value) {
    useCache(makeKey(key)).set(value);
  }

  function getMemory(key) {
    return useCache(makeKey(key)).get();
  }

  function setLocal(key, value) {
    if (!enableLocal || typeof window === "undefined") return;
    useCache(makeKey(key), window.localStorage).set(value);
  }

  function getLocal(key) {
    if (!enableLocal || typeof window === "undefined") return undefined;
    return useCache(makeKey(key), window.localStorage).get();
  }

  function removeLocal(key) {
    if (!enableLocal || typeof window === "undefined") return;
    useCache(makeKey(key), window.localStorage).remove();
  }

  return {
    /**
     * 保存：写内存 + 按配置写 localStorage
     */
    save(key, value) {
      setMemory(key, value);
      setLocal(key, value);
    },

    /**
     * 读内存（热数据），不过问冷存储
     * @param {*} defaultValue 无数据时的默认值
     */
    load(key, defaultValue = undefined) {
      const v = getMemory(key);
      return !isNull(v) && !isUndefined(v) ? v : defaultValue;
    },

    /**
     * 读内存 → 降级到 localStorage（用于需要自动恢复的场景）
     * 如果从 localStorage 命中，同步写回内存
     */
    loadWithFallback(key, defaultValue) {
      let v = getMemory(key);
      if (!isNull(v) && !isUndefined(v)) return v;

      if (enableLocal) {
        v = getLocal(key);
        if (!isNull(v) && !isUndefined(v)) {
          setMemory(key, v);
          return v;
        }
      }

      return defaultValue;
    },

    /**
     * 强制读 localStorage（用于"应用上次查询"冷恢复）
     */
    loadLocal(key, defaultValue = undefined) {
      if (!enableLocal) return defaultValue;
      const v = getLocal(key);
      return !isNull(v) && !isUndefined(v) ? v : defaultValue;
    },

    /**
     * 检查 localStorage 是否有数据
     */
    hasLocalData(key) {
      if (!enableLocal || typeof window === "undefined") return false;
      const v = useCache(makeKey(key), window.localStorage).get();
      return !isNull(v) && !isUndefined(v);
    },

    /**
     * 检查内存中是否有数据
     */
    hasData(key) {
      const v = getMemory(key);
      return !isNull(v) && !isUndefined(v);
    },

    /**
     * 删除：清除内存 + localStorage
     */
    remove(key) {
      useCache(makeKey(key)).remove();
      removeLocal(key);
    },

    /**
     * 批量清除 namespace 下多个 key
     */
    clear(keys = ["form", "sort"]) {
      keys.forEach(k => this.remove(k));
    },
  };
}

/**
 * 解析 persistence prop 值，提取配置
 * @param {boolean|string|Object} prop persistence prop 的值
 * @return {{ enabled: boolean, storage: 'memory'|'local', key: string|null }}
 */
export function parsePersistenceConfig(prop) {
  if (!prop) return { enabled: false, storage: "memory", key: null };

  if (prop === true) {
    return { enabled: true, storage: "memory", key: null };
  }

  if (typeof prop === "string") {
    return { enabled: true, storage: "memory", key: prop };
  }

  if (typeof prop === "object" && prop !== null) {
    return {
      enabled: true,
      storage: prop.storage === "local" ? "local" : "memory",
      key: prop.key || null,
    };
  }

  return { enabled: false, storage: "memory", key: null };
}
