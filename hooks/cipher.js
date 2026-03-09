/**
 * @module Cipher
 */

import { sm2, sm3, sm4 } from "sm-crypto-v2";

/**
 *  国密 sm2
 */
export function useSm2() {
  return sm2;
}

/**
 * 国密 sm3 加密
 * @param {string} msg - 密码信息
 * @param {Object} [options={}]
 * @return {*}
 */
export function useSm3(msg, options) {
  return sm3(msg, options); // 杂凑
}

/**
 * 国密 sm4 加密
 * @param {string} msg - 密码信息
 * @param {string} key - 秘钥
 * @param {Object} [options={}]
 * @return {Uint8Array}
 */
export function useSm4Encrypt(msg, key, options) {
  return sm4.encrypt(msg, key, options);
}

/**
 * 国密 sm4 解密
 * @param {string} encryptData - 加密信息
 * @param {string} key - 秘钥
 * @param {Object} [options={}]
 * @return {Uint8Array}
 */
export function useSm4Decrypt(encryptData, key, options) {
  return sm4.encrypt(encryptData, key, options);
}
