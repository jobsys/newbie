/**
 * @module Form
 */

import {
  cloneDeep,
  isArray,
  isBoolean,
  isFunction,
  isObject,
  isString,
  isUndefined,
} from "lodash-es";
import { message } from "ant-design-vue";
import { STATUS } from "./network";
import dayjs from "dayjs";

const {
  STATE_CODE_FAIL,
  STATE_CODE_INFO_NOT_COMPLETE,
  STATE_CODE_NOT_FOUND,
  STATE_CODE_NOT_ALLOWED,
  STATE_CODE_SUCCESS,
} = STATUS;

/**
 * 创建一个隐藏的表单
 *
 * @param {Object} options
 * @param {string} options.url - 请求地址
 * @param {Object} options.data  - 发送的数据
 * @param {string} [options.method=post] - 请求方法
 * @param {string} [options.csrfToken=null] - CSRF Token
 * @returns {HTMLFormElement}
 */
export function useHiddenForm(options) {
  const { url, csrfToken } = options;
  let { method, data } = options;

  method = method || "post";
  data = data || {};

  const form = document.createElement("form");
  form.action = url;
  form.method = method;
  form.target = "_blank";
  form.style.display = "none";

  Object.keys(data).forEach(key => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = data[key];
    form.appendChild(input);
  });

  if (!csrfToken) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "_token";
    input.value = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    form.appendChild(input);
  }

  document.body.appendChild(form);

  return form;
}

/**
 * 处理请求结果
 *
 * @param {object} res 请求结果
 * @param {string} res.status 请求结果状态
 * @param {*} res.result 请求结果信息
 * @param {Object.<string, string|function>} ops 状态的处理对象
 */
export function useProcessStatus(res, ops) {
  const { status } = res;
  const msg = res.result;
  const predefined = {};
  predefined.default = "请求失败, 请检查数据并重试";
  predefined[STATE_CODE_FAIL] = "系统错误，请稍候再试";
  predefined[STATE_CODE_NOT_FOUND] = "请求的内容不存在";
  predefined[STATE_CODE_INFO_NOT_COMPLETE] = "信息不完整";
  predefined[STATE_CODE_NOT_ALLOWED] = "没有权限";

  // 有几个常用的自定义名称
  const special = {
    [STATE_CODE_SUCCESS]: "success",
  };

  const op = ops[status] || ops[special[status]] || predefined[status] || predefined.def;

  if (isString(op)) {
    if (status === STATE_CODE_SUCCESS) {
      message.success(op);
    } else {
      message.error(msg || op);
    }
  } else if (isFunction(op)) {
    op();
  }
}

/**
 * 处理正确请求结果
 *
 * @param {object} res 请求结果
 * @param {string} res.status 请求结果状态
 * @param {*} res.result 请求结果信息
 * @param {string|function} success 状态的处理对象
 */
export function useProcessStatusSuccess(res, success) {
  useProcessStatus(res, { success });
}

/**
 * 处理表单提交失败
 * @param {*} e
 */
export function useFormFail(e) {
  if (e && e.errorFields) {
    e.errorFields.forEach(item => {
      message.error(item.errors.join(" "));
    });
  } else if (!(e && e.response)) {
    message.error("请检查填写项");
  }
}

/**
 * 表单布局
 * @property {Object} formLabel.commonLabelCol `{ span: 8, xxl: 6 }`
 * @property {Object} formLabel.commonWrapperCol `{ span: 12, xxl: 14 }`
 * @property {Object} formLabel.commonWrapperOffset `{ xs: { offset: 8, span: 12 }, xxl: { offset: 6, span: 14 } }`
 * @property {Object} formLabel.commonLabelFullCol `{ span: 8, xxl: 6 }`
 * @property {Object} formLabel.commonWrapperFullCol `{ span: 16, xxl: 18 }`
 * @property {Object} formLabel.commonWrapperFullOffset `{ xs: { offset: 8, span: 16 }, xxl: { offset: 6, span: 18 } }`
 * @property {Object} formLabel.commonLabelPartCol `{ span: 4, xxl: 3 }`
 * @property {Object} formLabel.commonWrapperPartCol `{ span: 20, xxl: 21 }`
 * @property {Object} formLabel.commonWrapperPartOffset `{ xs: { offset: 4, span: 20 }, xxl: { offset: 3, span: 21 } }`
 */
export const formLabel = {
  commonLabelCol: { span: 8, xxl: 6 },
  commonWrapperCol: { span: 12, xxl: 14 },
  commonWrapperOffset: { xs: { offset: 8, span: 12 }, xxl: { offset: 6, span: 14 } },
  commonLabelFullCol: { span: 8, xxl: 6 },
  commonWrapperFullCol: { span: 16, xxl: 18 },
  commonWrapperFullOffset: { xs: { offset: 8, span: 16 }, xxl: { offset: 6, span: 18 } },
  commonLabelPartCol: { span: 4, xxl: 3 },
  commonWrapperPartCol: { span: 20, xxl: 21 },
  commonWrapperPartOffset: { xs: { offset: 4, span: 20 }, xxl: { offset: 3, span: 21 } },
};

/**
 * 处理表单数据
 * @param {Object} form
 * @param {Object} [format] 需要处理的类型
 * @param {boolean|string|Function} [format.date] `true`: 转成时间戳，`string`: 为 Format 格式, 如 `"YYYY-MM-DD"`, `function`: 自定义处理函数, 参数为 dayjs 对象
 * @param {boolean} [format.boolean] 布尔值处理, 如果开启则 `true` 转成 1, `false` 转成 0
 * @param {string|Function} [format.attachment] `string`: 附件字段名, `function`: 自定义处理函数, 参数为附件对象
 * @return {Object}
 */
export function useFormFormat(form, format) {
  //必须先 Copy form, 否则会改变 vm model 里的引用值而导致出错
  const newForm = cloneDeep(form);
  format = format || {};
  const formatter = obj => {
    for (let key in obj) {
      //日期处理

      let date;
      if (dayjs.isDayjs(obj[key])) {
        date = obj[key];
      } else if (Object.prototype.toString.call(obj[key]) === "[object Date]") {
        date = dayjs(obj[key]);
      }

      if (date && format.date) {
        if (isString(format.date)) {
          obj[key] = date.format(format.date);
        } else if (isFunction(format.date)) {
          obj[key] = format.date(date);
        } else {
          obj[key] = obj[key].unix();
        }
        continue;
      }

      //布尔值处理
      if (isBoolean(obj[key]) && format.boolean) {
        if (format.boolean === true) {
          obj[key] = obj[key] ? 1 : 0;
        } else if (Array.isArray(format.boolean)) {
          obj[key] = obj[key] ? format.boolean?.[0] || 1 : format.boolean?.[1] || 0;
        }
        continue;
      }

      //附件处理
      if (format.attachment) {
        const checker = format.attachment;
        if (
          isObject(obj[key]) &&
          obj[key]._type === "file" &&
          isString(checker) &&
          !isUndefined(obj[key][checker])
        ) {
          obj[key] = obj[key][checker];
          continue;
        } else if (isObject(obj[key]) && obj[key]._type === "file" && isFunction(checker)) {
          obj[key] = checker(obj[key]);
          continue;
        }
      }

      //数组处理
      if (isArray(obj[key])) {
        obj[key] = formatter(obj[key]);
      }
    }

    return obj;
  };

  return formatter(newForm);
}

export default {
  useHiddenForm,
  useProcessStatus,
  useProcessStatusSuccess,
  useFormFail,
  useFormFormat,
  formLabel,
};
