import {Input} from "ant-design-vue";
import {calcFormula} from "../utils/formula-engine";
import {isFunction} from "lodash-es";
import {placeholder} from "../utils.js";

/**
 * 计算字段渲染器
 * 根据公式实时计算并显示结果，支持格式化（小数精度、前后缀）
 */
const render = (item, submitForm) => {
	const { formula } = item;
	const isEmpty = !formula || !formula.trim();
	let displayText = "",
		hasError = false;
	let inputSlot = {};
	if (item.defaultProps) {
		if (item.defaultProps.prefix) {
			inputSlot.prefix = () => {
				return isFunction(item.defaultProps.prefix)
					? item.defaultProps.prefix()
					: item.defaultProps.prefix;
			};
		}
		if (item.defaultProps.suffix) {
			inputSlot.suffix = () => {
				return isFunction(item.defaultProps.suffix)
					? item.defaultProps.suffix()
					: item.defaultProps.suffix;
			};
		}
		if (item.defaultProps.prepend) {
			inputSlot.addonBefore = () => {
				return isFunction(item.defaultProps.prepend)
					? item.defaultProps.prepend()
					: item.defaultProps.prepend;
			};
		}
		if (item.defaultProps.append) {
			inputSlot.addonAfter = () => {
				return isFunction(item.defaultProps.append)
					? item.defaultProps.append()
					: item.defaultProps.append;
			};
		}
	}

	if (isEmpty) {
		displayText = "暂未设置计算公式";
	} else {
		const result = calcFormula(formula, submitForm);
		if (result && typeof result === "object" && result.error) {
			displayText = result.error;
			hasError = true;
		} else {
			displayText =
				result === "" || result === null || result === undefined
					? "—"
					: String(result);
			hasError = false;
		}
	}
	return (
		<Input
			value={displayText}
			placeholder={placeholder(item)}
			style={{ ...item.style }}
			status={hasError ? "error" : ""}
			class={{ readonly: true, ...item.class }}
			{...item.defaultProps}
		>
			{{ ...inputSlot, ...item.defaultSlots }}
		</Input>
	);
};

export default render;
