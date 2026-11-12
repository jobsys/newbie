/**
 * 规范化表单配置，兼容新旧两种格式。
 * 注意：这里只做结构归一化，不拷贝 fields 元素，调用方传入的字段对象视为只读，
 * 需要加工时由使用方（如 formItems 计算属性）自行浅拷贝。
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
