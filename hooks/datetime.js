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
