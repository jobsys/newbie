/**
 * @module Interact
 */

import { Modal } from "ant-design-vue";
import { isFunction } from "lodash-es";
import i18n from "../i18n";

/**
 * 确认弹窗
 * @param {string} msg - 提示信息
 * @param {Function} [onOk=null] - 确认回调
 * @param {boolean}  [loading=false] - 是否异步加载
 * @param {Function} [onCancel=null] - 取消回调
 * @return {*}
 */
export function useModalConfirm(msg, onOk, loading, onCancel) {
  const modal = Modal.confirm({
    title: i18n.global.t("common.action-prompt"),
    content: msg || "",
    onOk: () => {
      if (onOk && isFunction(onOk)) {
        onOk();
      }
      if (loading) {
        modal.update({
          okButtonProps: {
            loading: true,
          },
        });
        return new Promise(() => {});
      }
      return null;
    },
    onCancel: () => {
      if (onCancel && isFunction(onCancel)) {
        onCancel();
      }
    },
  });
  return modal;
}
