/**
 * Rule Engine - 条件显隐规则评估引擎
 *
 * 支持基于条件的字段显示/隐藏控制，包括逻辑门组合和多种操作符
 */

/**
 * 操作符映射表
 * 每个操作符接收 (actualValue, expectedValue) 参数并返回 boolean
 */
export const OPERATORS = {
  /** 相等比较（宽松相等） */
  equals: (a, b) => a == b,
  /** 不等比较 */
  notEquals: (a, b) => a != b,
  /** 是否为空（null/undefined/空字符串） */
  isEmpty: (a) => a === null || a === undefined || a === '',
  /** 是否非空 */
  isNotEmpty: (a) => a !== null && a !== undefined && a !== '',
  /** 大于（数值比较） */
  gt: (a, b) => Number(a) > Number(b),
  /** 小于（数值比较） */
  lt: (a, b) => Number(a) < Number(b),
  /** 大于等于（数值比较） */
  gte: (a, b) => Number(a) >= Number(b),
  /** 小于等于（数值比较） */
  lte: (a, b) => Number(a) <= Number(b),
  /** 包含（字符串或数组） */
  contains: (a, b) => String(a).includes(b),
  /** 不包含 */
  notContains: (a, b) => !String(a).includes(b),
  /** 以...开头 */
  startsWith: (a, b) => String(a).startsWith(b),
  /** 以...结尾 */
  endsWith: (a, b) => String(a).endsWith(b),
  /** 在数组中 */
  in: (a, b) => Array.isArray(a) && a.includes(b),
  /** 不在数组中 */
  notIn: (a, b) => !Array.isArray(a) || !a.includes(b),
};

/**
 * 评估单条规则
 * @param {Object} rule - 规则对象
 * @param {string} rule.targetField - 目标字段
 * @param {string} rule.action - "show" | "hide"
 * @param {string} rule.logicGate - "and" | "or"
 * @param {Array} rule.conditions - 条件数组
 * @param {Object} formData - 表单数据
 * @returns {boolean} 规则是否满足
 */
export function evaluateRule(rule, formData = {}) {
  if (!rule || !rule.conditions || rule.conditions.length === 0) {
    return false;
  }

  const { conditions, logicGate = 'and' } = rule;

  // 对每个条件进行评估
  const results = conditions.map(condition => {
    const { field, operator, value } = condition;
    const actualValue = formData[field];

    const opFn = OPERATORS[operator];
    if (!opFn) {
      console.warn(`未知操作符: ${operator}`);
      return false;
    }

    // isEmpty 和 isNotEmpty 是一元操作符
    if (operator === 'isEmpty' || operator === 'isNotEmpty') {
      return opFn(actualValue);
    }

    return opFn(actualValue, value);
  });

  // 根据逻辑门组合结果（兼容大小写）
  const gate = (logicGate || 'and').toLowerCase();
  if (gate === 'and') {
    return results.every(r => r);
  } else {
    // or
    return results.some(r => r);
  }
}

/**
 * 计算所有字段的可见性
 * @param {Array} rules - 规则数组
 * @param {Object} formData - 表单数据
 * @returns {Map<string, boolean>} 字段名 -> 是否可见的映射
 *
 * 冲突解决策略：
 * - 任一规则 action="show" 且条件满足 → 显示
 * - 所有规则 action="hide" 且条件满足 → 隐藏
 * - 无规则匹配 → 默认显示
 */
export function computeVisibility(rules = [], formData = {}) {
  const visibilityMap = {};

  if (!rules || rules.length === 0) {
    return visibilityMap;
  }

  // 收集所有受控字段
  const controlledFields = new Set();
  rules.forEach(rule => {
    if (rule.targetField) {
      controlledFields.add(rule.targetField);
    }
  });

  // 对每个受控字段计算可见性
  controlledFields.forEach(fieldKey => {
    const fieldRules = rules.filter(r => r.targetField === fieldKey);

    let isVisible = true; // 默认显示

    // 检查是否有 show 规则满足
    const hasShowRule = fieldRules.some(
      rule => rule.action === 'show' && evaluateRule(rule, formData)
    );

    // 检查是否有 hide 规则满足
    const hasHideRule = fieldRules.some(
      rule => rule.action === 'hide' && evaluateRule(rule, formData)
    );

    // 冲突解决：任一 show 规则满足则显示，否则如果只有 hide 规则满足则隐藏
    if (hasShowRule) {
      isVisible = true;
    } else if (hasHideRule) {
      isVisible = false;
    }
    // 否则保持默认 true

    visibilityMap[fieldKey] = isVisible;
  });

  return visibilityMap;
}

/**
 * 清空隐藏字段的值
 * @param {Map<string, boolean>} hiddenFields - 字段可见性映射（或 Map<fieldKey, boolean>）
 * @param {Object} formData - 原始表单数据
 * @returns {Object} 新的表单数据对象，隐藏字段的值设为 null
 *
 * 注意：不修改原 formData，返回新对象
 */
export function clearHiddenValues(hiddenFields, formData = {}) {
  if (!hiddenFields || !(hiddenFields instanceof Map)) {
    return { ...formData };
  }

  const newData = { ...formData };

  hiddenFields.forEach((isVisible, fieldKey) => {
    if (!isVisible) {
      newData[fieldKey] = null;
    }
  });

  return newData;
}
