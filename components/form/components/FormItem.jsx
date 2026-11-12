import {FormItem, Switch} from "antdv-next";

import * as Fields from "./index.js";
import {ref} from "vue";
import {uploaderDefaults} from "../../uploader/config.js";
import {isArray, isBoolean, isFunction, isUndefined} from "lodash-es";
import {initItemDefaultValue, isOptionalChecked, placeholder} from "../utils.js";
import {keyPath} from "../model.js";
import { useLocale } from "../../../hooks/i18n.js";

// 存储 optional 字段的 ref 状态
// key 为 formState[item.key]（reactive 对象，跨渲染稳定）
// 使用 WeakMap 而非直接存在 reactive 对象上，因为 reactive 会自动解包 ref，
// 导致取出来的是布尔值而非 ref 对象
const optionalStateMap = new WeakMap();

// 没有用户规则时复用同一个空数组，避免每次渲染都产生新的 rules 引用
const EMPTY_RULES = [];

// 编译后的规则按「rules 数组对象身份」缓存：同一份配置只在第一次编译时 new RegExp，
// 之后每次渲染拿到的是同一个数组引用，antdv Form 不会认为规则变化而重复校验。
// 注意：直接原地修改 rules 数组内容不会命中缓存，需要替换数组引用。
const compiledRulesCache = new WeakMap();

// 只有 required、没有自定义 rules 时，按提示文案复用同一个数组引用，避免每次渲染新数组
const requiredRulesCache = new Map();

/**
 * @param {String} message
 * @return {Array} 稳定的必填规则数组
 */
const getRequiredRules = message => {
	let rules = requiredRulesCache.get(message);
	if (!rules) {
		rules = [{ required: true, message }];
		requiredRulesCache.set(message, rules);
	}
	return rules;
};

/**
 * 编译 rules，并把「必填」变体也缓存下来（必填会改写首条规则，不能直接改缓存里的原数组）
 * @param {Array|undefined} rules
 * @param {Boolean} isRequired
 * @return {Array|null} 未提供规则时返回 null
 */
const compileRules = (rules, isRequired) => {
	if (!isArray(rules) || !rules.length) {
		return null;
	}

	let entry = compiledRulesCache.get(rules);

	if (!entry) {
		entry = {
			compiled: rules.map(rule =>
				rule.pattern ? {...rule, pattern: new RegExp(rule.pattern)} : {...rule}
			),
			requiredVariant: null,
		};
		compiledRulesCache.set(rules, entry);
	}

	if (!isRequired) {
		return entry.compiled;
	}

	if (!entry.requiredVariant) {
		const requiredVariant = entry.compiled.map(rule => ({...rule}));
		requiredVariant[0].required = true;
		entry.requiredVariant = requiredVariant;
	}

	return entry.requiredVariant;
};

/**
 *
 * 渲染优先级为：slot > customRender > type
 * @param {NewbieFormItemConfig} item
 * @param submitForm
 * @param props
 * @param slots
 * @param formState
 * @return {*|JSX.Element}
 */
const render = (item, submitForm, { props, slots, formState, uploaderProvider = uploaderDefaults }) => {
	const { t } = useLocale();

	//如果未经过 defaultValue 初始化，则进行初始化
	if (isUndefined(submitForm[item.key]) && item.key) {
		submitForm[item.key] = initItemDefaultValue(item, {}, submitForm, {
			uploaderProvider,
		});
	}

	let renderItem = null;

	const requiredRule = {
		required: true,
		message: item.requiredMessage || placeholder(item, "select"),
	};

	// 处理 required
	const isRequired = isFunction(item.required) ? item.required(submitForm) : item.required;

	// 规则按配置对象身份缓存，未提供自定义规则时复用稳定引用
	const rules =
		compileRules(item.rules, isRequired) ||
		(isRequired ? getRequiredRules(requiredRule.message) : EMPTY_RULES);

	// 渲染期只读：type / readonly / disabled / placeholder 等派生值写到局部副本，
	// 不回写调用方传入的表单项配置（与 F-004 同一约定）
	item = {
		...item,
		type: item.type ? item.type.toLowerCase() : item.type,
		readonly: item.readonly || props.readonly,
	};

	item.disabled = item.disabled || props.disabled || props.readonly || item.readonly;

	if (item.readonly || item.disabled) {
		item.placeholder = "--";
	}

	/**** 开始渲染 ****/
	// 可见性检查（规则引擎控制）
	if (item.visible === false) {
		return null;
	}

	// 处理 hidden

	if (
		(isFunction(item.hidden) && item.hidden(submitForm)) ||
		(isBoolean(item.hidden) && item.hidden)
	) {
		return null;
	} else if (item.type === "slot" && slots[item.key]) {
		return slots[item.key]({ submitForm, item });
	} else if (item.customRender) {
		renderItem = item.customRender({ submitForm, item });
		if (!renderItem) {
			return null;
		}
	} else if (item.match) {
		// 匹配模式, 合并选项后需要移除 match
		const matchItem = { ...item, ...item.match(submitForm), match: null };
		return render(matchItem, submitForm, { props, slots, formState, uploaderProvider });
	} else {
		switch (item.type) {
			case "select":
				renderItem = Fields.createSelect(item, submitForm);
				break;
			case "remote":
				renderItem = Fields.createRemote(item, submitForm, formState[item.key]);
				break;
			case "tree-select":
				renderItem = Fields.createTreeSelect(item, submitForm);
				break;
			case "date":
				renderItem = Fields.createDate(item, submitForm);
				if (item.defaultProps?.type === "range") {
					requiredRule.type = "array";
				}
				break;
			case "time":
				renderItem = Fields.createTime(item, submitForm);
				if (item.defaultProps?.type === "range") {
					requiredRule.type = "array";
				}
				break;
			case "switch":
				renderItem = Fields.createSwitch(item, submitForm);
				break;
			case "radio":
				renderItem = Fields.createRadioGroup(item, submitForm);
				break;
			case "checkbox":
				renderItem = Fields.createCheckboxGroup(item, submitForm);
				requiredRule.type = "array";
				break;
			case "tag":
				renderItem = Fields.createTag(item, submitForm, formState[item.key]);
				requiredRule.type = "array";
				break;
			case "address":
				renderItem = Fields.createAddress(item, submitForm);
				requiredRule.type = "array";
				break;
			case "cascade":
				renderItem = Fields.createCascader(item, submitForm);
				requiredRule.type = "array";
				break;
			case "number":
				renderItem = Fields.createNumber(item, submitForm);
				requiredRule.trigger = "blur";
				requiredRule.type = "number";
				requiredRule.message = item.requiredMessage || placeholder(item);
				break;
			case "html":
				renderItem = Fields.createHtml(item, submitForm);
				break;
			case "uploader":
				renderItem = Fields.createUploader(item, submitForm);
				if (isRequired) {
					if (item.defaultProps?.maxNum && item.defaultProps?.maxNum > 1) {
						requiredRule.type = "array";
						requiredRule.message = item.requiredMessage || placeholder(item, "upload");
					} else {
						requiredRule.type = "object";
						requiredRule.message = item.requiredMessage || placeholder(item, "upload");
						requiredRule.fields = {
							[uploaderProvider.defaultFileItem?.path || "path"]: {
								type: "string",
								required: true,
								message: placeholder(item, "upload"),
							},
						};
					}
				}
				break;
			case "editor":
				renderItem = Fields.createEditor(item, submitForm);
				requiredRule.message = item.requiredMessage || placeholder(item);
				requiredRule.type = "string";
				break;
			case "text":
				renderItem = Fields.createText(item, submitForm);
				break;
			case "plain":
				renderItem = Fields.createPlain(item, submitForm);
				break;
			case "group":
				renderItem = Fields.createGroup(item, submitForm, formState[item.key], {
					provider: { uploaderProvider },
				});
				break;
			case "rate":
				renderItem = Fields.createRate(item, submitForm);
				break;
			case "matrix-radio": {
				renderItem = Fields.createMatrixRadio(item, submitForm);
				requiredRule.type = "object";
				requiredRule.message = item.requiredMessage || placeholder(item, "select");
				const fields = {};
				item.rows.forEach(row => {
					fields[row] = {
						required: true,
						message: t("form.please-select", { title: row }),
					};
				});
				requiredRule.fields = fields;
				break;
			}
			case "matrix-checkbox": {
				renderItem = Fields.createMatrixCheckbox(item, submitForm);
				requiredRule.type = "object";
				requiredRule.message = item.requiredMessage || placeholder(item, "select");
				const fields = {};
				item.rows.forEach(row => {
					fields[row] = {
						required: true,
						type: "array",
						message: t("form.please-select", { title: row }),
					};
				});
				requiredRule.fields = fields;
				break;
			}
			case "matrix-scale": {
				renderItem = Fields.createMatrixScale(item, submitForm);
				requiredRule.type = "object";
				requiredRule.message = item.requiredMessage || placeholder(item, "select");
				const fields = {};
				item.rows.forEach(row => {
					fields[row] = {
						type: "number",
						required: true,
						message: t("form.please-select", { title: row }),
					};
				});
				requiredRule.fields = fields;
				break;
			}
			case "rate-radio":
				renderItem = Fields.createRateRadio(item, submitForm);
				break;
			case "rate-checkbox":
				renderItem = Fields.createRateCheckbox(item, submitForm);
				requiredRule.type = "array";
				break;
			case "combiner":
				renderItem = Fields.createCombiner(item, submitForm, {
					props,
					slots,
					formState,
					uploaderProvider,
				});
				break;
			case "computed":
				// 计算字段由 ComputedField 组件渲染，自带 FormItem 包裹与格式化
				renderItem = Fields.createComputedField(item, submitForm, { props, slots });
				break;
			default:
				renderItem = Fields.createInput(item, submitForm);
				requiredRule.message = item.requiredMessage || placeholder(item);
				requiredRule.trigger = "blur";
				requiredRule.type = "string";
				break;
		}
	}

	// FormItem props
	let itemProps = {
		label: item.title,
		name: keyPath(item.key),
		validateFirst: true,
		required: isRequired,
		hasFeedback: rules?.length > 0,
		rules,
	};

	itemProps = { ...itemProps, ...item.formItemProps };

	let itemSlots = item.formItemSlots || {};

	// 原生的 help 用于展示检验错误信息
	// extra 用于展示额外的提示信息
	if (item.help) {
		itemSlots.extra = () => (
			<div class={"newbie-form__form-item-help"}>
				{isFunction(item.help) ? item.help(submitForm) : item.help}
			</div>
		);
	}

	if (itemSlots.label) {
		delete itemProps.label;
	}

	//可选项字段
	let optionalRenderItem = null;

	if (item.optional && !item.readonly) {
		const formItemState = formState[item.key];
		let optionalValue = optionalStateMap.get(formItemState);
		if (!optionalValue) {
			const isChecked = isOptionalChecked(item, submitForm);
			optionalValue = ref(isChecked);
			optionalStateMap.set(formItemState, optionalValue);
		}
		// 如果切换为 false, 则把 value 赋为 null
		// 由原来的赋 undefined 改为 null, 因为 undefined 会被 FormItem 认为是未填写
		optionalRenderItem = (
			<div class={"newbie-form__optional"}>
				<Switch
					checked={optionalValue.value}
					onUpdate:checked={val => (optionalValue.value = val)}
					checkedChildren={item.optional?.[0] || ""}
					unCheckedChildren={item.optional?.[1] || ""}
					onChange={checked => !checked && (submitForm[item.key] = null)}
				></Switch>
				<div class={"newbie-form__optional-content"}>
					{optionalValue.value ? renderItem : false}
				</div>
			</div>
		);
	}

	return (
		<FormItem {...itemProps}>
			{{
				default: () => (item.optional && !item.readonly ? optionalRenderItem : renderItem),
				...itemSlots,
			}}
		</FormItem>
	);
};

export default render;
