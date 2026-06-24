/**
 * 规范化表单配置，兼容新旧两种格式。
 * 深拷贝原始配置以避免修改输入参数，同时确保非配置字段不暴露给消费方。
 *
 * 旧格式（向后兼容）：纯数组 [{ key, type, ... }, ...]
 * 新格式：对象 { fields: [...], logic: { rules: [...] } }
 */
export function normalizeFormConfig(raw) {
  if (!raw) return { fields: [], logic: { rules: [] } };
  if (Array.isArray(raw)) {
    return { fields: raw, logic: { rules: [] } };
  }
  const fields = raw.fields || [];
  const logic = raw.logic || { rules: [] };
  return { fields, logic: { rules: logic.rules || [] } };
}
