/**
 * @module Datetime
 */

import dayjs from "dayjs";

/**
 * 根据格式创建 Dayjs 对象
 * @param {string|number} date - 日期字符
 * @param {string} [format=null] - 日期格式
 * @return {dayjs.Dayjs}
 */
export function useDayjs(date, format) {
  if (date && /^\d+$/.test(date) && String(date).length <= 10) {
    date = parseInt(`${date}000`);
  }
  return format ? dayjs(date, format) : dayjs(date);
}

/**
 * 创建时间类型的 Dayjs 对象
 *
 * 纯时间字符串（`HH:mm`、`HH:mm:ss`，如后端 `datetime:H:i` 的返回值）无法被 dayjs 直接解析，
 * 这里补齐日期部分再解析，避免出现 `Invalid Date`；其余值与 useDayjs 表现一致。
 *
 * @param {string|number|dayjs.Dayjs|Date} value - 时间值
 * @return {dayjs.Dayjs|null}
 */
export function useTimeDayjs(value) {
  if (!value) {
    return null;
  }
  if (dayjs.isDayjs(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    return dayjs(`2000-01-01 ${value.trim()}`);
  }
  return useDayjs(value);
}

/**
 * 格式化日期
 * @param {dayjs.Dayjs|Date} date - 日期对象
 * @param {string} [format=YYYY-MM-DD HH:mm] - 日期格式
 * @return {string}
 */
export function useDateFormat(date, format) {
  if (!date) {
    return "";
  }

  if (!dayjs.isDayjs(date)) {
    date = useDayjs(date);
  }

  return date.format(format || "YYYY-MM-DD HH:mm");
}

/**
 * 获取日期的 Unix 时间戳
 * @param {dayjs.Dayjs|Date} date - 日期对象
 * @return {number|string}
 */
export function useDateUnix(date) {
  if (!date) {
    return "";
  }
  if (!dayjs.isDayjs(date)) {
    date = useDayjs(date);
  }

  return date.unix();
}
