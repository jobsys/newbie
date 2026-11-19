import { CheckableTag } from "antdv-next";
import { find } from "lodash-es";
import { DownOutlined } from "@antdv-next/icons";
import { useI18nJoin, useLocale } from "../../../hooks/index.js";
import { normalizeOptions } from "../utils.js";

/**
 * 选项超过 COLLAPSE_THRESHOLD 个时才启用折叠，避免“展开全部”按钮比省下的选项还占位
 */
const COLLAPSE_LIMIT = 16;
const COLLAPSE_THRESHOLD = 20;

/**
 * 选中态始终以 queryForm 为唯一数据源。
 * 不能在渲染函数里创建局部 ref 存选中状态：render 是普通函数，父组件每次重渲染都会
 * 重新执行并丢弃上一次的 ref；而 CheckableTag 的 change 事件先于 update:checked 触发，
 * 事件里读局部状态拿到的还是旧值，写回的也是旧值，点击因此毫无反应。
 * 这里改为：渲染时从 queryForm 派生选中态，点击时用事件带回的新值直接写回 queryForm。
 *
 * @param {SearchItemConfig} item
 * @param {Object} queryForm
 * @param {Object} itemState
 */
const render = (item, queryForm, itemState) => {
	const { t, locale } = useLocale();
	const options = normalizeOptions(item.options);
	const isMultiple = item.expandable === "multiple";
	const field = queryForm[item.key];

	// 旧版本的多选写入会在数组里留下 undefined 占位，统一过滤后再使用
	const currentValue = () =>
		Array.isArray(field?.value)
			? field.value.filter(val => val !== null && val !== undefined)
			: [];

	const isChecked = option => currentValue().includes(option.value);

	const handleChange = (option, checked) => {
		if (isMultiple) {
			// 多选条件固定为 include；在事件里写而不是渲染期写，避免额外触发一次自动搜索
			field.condition = "include";
			field.value = checked
				? [...currentValue(), option.value]
				: currentValue().filter(value => value !== option.value);
		} else {
			field.value = checked ? [option.value] : [];
		}
	};

	const handleClear = () => {
		field.value = [];
	};

	const collectItem = () => {
		const value = currentValue();

		if (isMultiple) {
			if (!value.length) {
				return { value: null, searchLabel: null };
			}
			const label = value.map(val => find(options, { value: val })?.label).join(",");
			return {
				value,
				searchLabel: `${useI18nJoin(item.title, t("search.include"), { locale })}: ${label}`,
			};
		}

		if (!value.length) {
			return { value: null, searchLabel: null };
		}
		const singleValue = value[0];
		return {
			value: singleValue,
			searchLabel: `${useI18nJoin(item.title, t("search.equal"), { locale })}: ${
				find(options, { value: singleValue })?.label
			}`,
		};
	};

	if (itemState) {
		itemState.collectItem = collectItem;
	}

	// 选项较多时默认折叠展示；被折叠的选项一旦选中会补在末尾，选中状态永远看得见
	const expanded = itemState?.optionsExpanded === true;
	const collapsible = options.length > COLLAPSE_THRESHOLD;
	const visibleOptions =
		collapsible && !expanded
			? [
					...options.slice(0, COLLAPSE_LIMIT),
					...options.slice(COLLAPSE_LIMIT).filter(isChecked),
				]
			: options;

	const selectedCount = currentValue().length;

	return (
		<div class={"newbie-search-expand-item"}>
			<div class={"newbie-search-expand-item-title"}>
				<span class={"newbie-search-expand-item-title-text"}>{item.title}</span>
			</div>
			<div class={"newbie-search-expand-item-options"}>
				{visibleOptions.map(option => (
					<CheckableTag
						class={"newbie-search-expand-option"}
						checked={isChecked(option)}
						onChange={checked => handleChange(option, checked)}
					>
						{{ default: () => option.label }}
					</CheckableTag>
				))}
				{collapsible ? (
					<button
						type={"button"}
						class={"newbie-search-expand-toggle"}
						aria-expanded={expanded}
						onClick={() => {
							if (itemState) {
								itemState.optionsExpanded = !expanded;
							}
						}}
					>
						{expanded
							? t("search.collapse-options")
							: t("search.expand-all-options", { count: options.length })}
						<DownOutlined
							class={`newbie-search-expand-toggle-icon${expanded ? " is-expanded" : ""}`}
						/>
					</button>
				) : null}
				{selectedCount > 0 ? (
					<span class={"newbie-search-expand-item-selected"}>
						<span class={"newbie-search-expand-item-selected-count"}>
							{t("search.selected-count", { count: selectedCount })}
						</span>
						<button
							type={"button"}
							class={"newbie-search-expand-item-clear"}
							onClick={handleClear}
						>
							{t("common.clear")}
						</button>
					</span>
				) : isMultiple ? (
					<span class={"newbie-search-expand-item-hint"}>
						{t("search.multiple-choice-available")}
					</span>
				) : null}
			</div>
		</div>
	);
};

export default render;
