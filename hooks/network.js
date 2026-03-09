/**
 * @module Network
 */

import axios from "axios";

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
 * 通用 AJAX 请求
 * @param {Object} [fetcher] - 用于存储请求状态的对象
 * @returns {{post(*=, *=, *=): Promise, get(*=, *=): Promise}}
 */
export function useFetch(fetcher) {
  if (!fetcher) {
    fetcher = {};
  }
  fetcher.loading = true;

  return {
    /**
     * get请求
     * @param url
     * @param {?Object} [config] - axios config
     * @returns {Promise}
     */
    get(url, config) {
      return new Promise((resolve, reject) => {
        axios
          .get(url, config)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          })
          .finally(() => {
            fetcher.loading = false;
          });
      });
    },
    /**
     * post请求
     * @param {string} url
     * @param {?Object} [data]
     * @param {?Object} [config] - axios config
     * @returns {Promise}
     */
    post(url, data, config) {
      return new Promise((resolve, reject) => {
        axios
          .post(url, data, config)
          .then(res => {
            resolve(res);
          })
          .catch(err => {
            reject(err);
          })
          .finally(() => {
            fetcher.loading = false;
          });
      });
    },
  };
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
    res = await axios.get(pagination.uri, {
      params: {
        ...(pagination.params || {}),
        page: refresh || !pagination.page ? 1 : pagination.page + 1,
      },
    });
  } catch (e) {
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
};
