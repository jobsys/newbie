/**
 * @module Network
 */

import axios, { create } from "axios";
import { isReactive, reactive } from "vue";

/**
 * 请求返回状态码
 * @property {string} STATUS.STATE_CODE_SUCCESS  `SUCCESS` 成功
 * @property {string} STATUS.STATE_CODE_FAIL  `FAIL` 失败
 * @property {string} STATUS.STATE_CODE_NOT_FOUND  `NOT_FOUND` 找不到资源
 * @property {string} STATUS.STATE_CODE_INFO_NOT_COMPLETE  `INCOMPLETE` 信息不完整
 * @property {string} STATUS.STATE_CODE_NOT_ALLOWED  `NOT_ALLOWED` 无权限
 */
export const STATUS = {
	STATE_CODE_SUCCESS: "SUCCESS", // 成功
	STATE_CODE_FAIL: "FAIL", // 失败
	STATE_CODE_NOT_FOUND: "NOT_FOUND", // 找不到资源
	STATE_CODE_INFO_NOT_COMPLETE: "INCOMPLETE", // 信息不完整
	STATE_CODE_NOT_ALLOWED: "NOT_ALLOWED", //没有权限
};

/**
 * STATUS 适配器，内部使用
 * @param status
 * @private
 */
export function _configStatus(status) {
	Object.keys(status).forEach(key => {
		STATUS[key] = status[key];
	});
}

/**
 * 默认请求实例，可通过 {@link setFetchInstance} 替换
 * @type {import("axios").AxiosInstance}
 */
let fetchInstance = axios;

/**
 * 替换 useFetch / usePage 默认使用的 axios 实例，便于挂载鉴权、错误处理等拦截器
 * @param {import("axios").AxiosInstance} [instance]
 * @returns {import("axios").AxiosInstance}
 */
export function setFetchInstance(instance) {
	fetchInstance = instance || axios;
	return fetchInstance;
}

/**
 * 获取当前默认的 axios 实例
 * @returns {import("axios").AxiosInstance}
 */
export function getFetchInstance() {
	return fetchInstance;
}

/**
 * 归一化 loading 载体：沿用调用方对象，并保证其可被 Vue 追踪
 * @param {Object} [fetcher]
 * @returns {Object}
 * @private
 */
function resolveFetcher(fetcher) {
	if (!fetcher || typeof fetcher !== "object") {
		return reactive({ loading: false });
	}
	return isReactive(fetcher) ? fetcher : reactive(fetcher);
}

/**
 * 基于 loading 载体创建请求方法
 * @param {Object} state 至少包含 loading 字段
 * @param {Object} [options]
 * @param {import("axios").AxiosInstance} [options.instance] 请求实例
 * @param {number} [options.timeout] 默认超时时间（单次 config.timeout 优先）
 * @param {AbortSignal} [options.signal] 默认取消信号（单次 config.signal 优先）
 * @param {Object} [options.headers] 默认请求头
 * @private
 */
function createRequest(state, options = {}) {
	const { instance = fetchInstance, timeout, signal, headers } = options;

	const withDefaults = config => {
		const merged = { ...config };
		if (timeout !== undefined && merged.timeout === undefined) {
			merged.timeout = timeout;
		}
		if (signal !== undefined && merged.signal === undefined) {
			merged.signal = signal;
		}
		if (headers !== undefined) {
			merged.headers = { ...headers, ...merged.headers };
		}
		return merged;
	};

	const send = (method, args) => {
		state.loading = true;

		let task;
		try {
			task = instance[method](...args);
		} catch (e) {
			state.loading = false;
			return Promise.reject(e);
		}

		if (!task || typeof task.finally !== "function") {
			state.loading = false;
			return Promise.resolve(task);
		}

		return task.finally(() => {
			state.loading = false;
		});
	};

	return {
		/** 实际使用的 axios 实例 */
		instance,
		/** loading 载体，模板中也可直接读取 loading */
		state,
		/** 当前是否正在请求 */
		get loading() {
			return state.loading;
		},
		/**
		 * get 请求
		 * @param {string} url
		 * @param {Object} [config] axios config，可传 timeout / signal
		 * @returns {Promise}
		 */
		get(url, config) {
			return send("get", [url, withDefaults(config)]);
		},
		/**
		 * post 请求
		 * @param {string} url
		 * @param {*} [data]
		 * @param {Object} [config] axios config，可传 timeout / signal
		 * @returns {Promise}
		 */
		post(url, data, config) {
			return send("post", [url, data, withDefaults(config)]);
		},
		/**
		 * put 请求
		 * @param {string} url
		 * @param {*} [data]
		 * @param {Object} [config] axios config，可传 timeout / signal
		 * @returns {Promise}
		 */
		put(url, data, config) {
			return send("put", [url, data, withDefaults(config)]);
		},
		/**
		 * delete 请求
		 * @param {string} url
		 * @param {Object} [config] axios config，可传 timeout / signal
		 * @returns {Promise}
		 */
		delete(url, config) {
			return send("delete", [url, withDefaults(config)]);
		},
	};
}

/**
 * 通用 AJAX 请求
 *
 * @param {Object} [fetcher] - 用于存储请求状态的对象（reactive 或普通对象均可）
 * @param {Object} [options] - 默认请求参数
 * @param {import("axios").AxiosInstance} [options.instance] - 自定义 axios 实例
 * @param {number} [options.timeout] - 默认超时时间
 * @param {AbortSignal} [options.signal] - 默认取消信号
 * @param {Object} [options.headers] - 默认请求头
 * @returns {{instance: import("axios").AxiosInstance, state: Object, loading: boolean, get(*=, *=): Promise, post(*=, *=, *=): Promise, put(*=, *=, *=): Promise, delete(*=, *=): Promise}}
 */
export function useFetch(fetcher, options = {}) {
	const state = resolveFetcher(fetcher);

	if (typeof state.loading !== "boolean") {
		state.loading = false;
	}

	return createRequest(state, options);
}

/**
 * 创建一个独立的请求器，默认绑定新建的 axios 实例，便于隔离拦截器与默认配置
 *
 * @param {Object} [options] - axios 配置，另支持 instance 直接传入已有实例
 * @param {import("axios").AxiosInstance} [options.instance] - 已有的 axios 实例
 * @param {number} [options.timeout] - 默认超时时间
 * @param {AbortSignal} [options.signal] - 默认取消信号
 * @param {Object} [options.headers] - 默认请求头
 * @param {Object} [options.axiosConfig] - 透传给 axios.create 的配置
 * @returns {ReturnType<typeof createRequest>}
 */
export function createFetch(options = {}) {
	const { instance, timeout, signal, headers, axiosConfig, ...rest } = options;
	const clientConfig = { ...axiosConfig, ...rest };
	if (timeout !== undefined) {
		clientConfig.timeout = timeout;
	}
	if (headers !== undefined) {
		clientConfig.headers = { ...clientConfig.headers, ...headers };
	}

	const client = instance || create(clientConfig);
	const state = reactive({ loading: false });

	return createRequest(state, { instance: client, timeout, signal, headers });
}

/**
 * 分页请求
 * @param {object} pagination 分页对象
 * @param {string} pagination.uri 请求地址
 * @param {object} [pagination.params] 请求参数
 * @param {number} [pagination.page] 当前页码
 * @param {string} pagination.finishedText 加载完毕文本
 * @param {boolean} pagination.loading 加载状态
 * @param {boolean} pagination.finished 加载完毕
 * @param {boolean} pagination.error 是否错误
 * @param {string} pagination.errorText 错误文本
 * @param {boolean} pagination.empty 是否无内容
 * @param {array} pagination.items 分页数据
 *
 * @param {boolean} refresh 是否刷新
 * @param {function} [process] 数据处理函数
 *
 * @return {object} pagination 分页对象
 *
 */
export async function usePage(pagination, refresh, process) {
	pagination.finishedText = pagination.finishedText || "加载完毕";
	pagination.loading = true;

	if (!pagination.uri) {
		console.error("URI is required in pagination");
		return pagination;
	}

	let res = {};
	try {
		res = await fetchInstance.get(pagination.uri, {
			params: {
				...pagination.params,
				page: refresh || !pagination.page ? 1 : pagination.page + 1,
			},
		});
	} catch (e) {
		console.error(e);
		pagination.loading = false;
		pagination.finished = false;
		pagination.error = true;
		return pagination;
	}

	if (res.status !== STATUS.STATE_CODE_SUCCESS) {
		pagination.loading = false;
		pagination.error = true;
		pagination.errorText = res.result;
		return pagination;
	}

	let result;

	if (process) {
		result = process(res);
	} else {
		result = res.result;
	}

	let items = result.data;

	if (!refresh && pagination.items) {
		items = pagination.items.concat(items);
	}

	const currentPage = result.current_page || result.current || result.page || 1;
	const lastPage = result.last_page || result.lastPage || result.pages || 0;
	const totalSize = result.total_size || result.totalSize || result.total || 0;

	pagination.loading = false;
	pagination.error = false;
	pagination.page = currentPage;
	pagination.items = items;
	pagination.finished = lastPage === 0 || lastPage === currentPage;
	pagination.empty = totalSize === 0;

	return pagination;
}

export default {
	STATUS,
	useFetch,
	usePage,
	createFetch,
	setFetchInstance,
	getFetchInstance,
};
