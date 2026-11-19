import { reactive, withModifiers } from "vue";
import { Input, InputNumber, Select, Switch, message } from "antdv-next";
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from "@antdv-next/icons";
import { isFunction, isUndefined } from "lodash-es";
import { useFetch, useProcessStatusSuccess } from "../../hooks";
import { tableDefaults } from "./config.js";
import { splitNumberAddons, withNumberAddons } from "../../utils/inputNumber.jsx";
import i18n from "../../i18n";

/**
 * 渲染单元格的基础文本（优先 customRender，其次兼容 antd v5 render）
 * @param {object} row
 * @returns {*}
 */
export const renderColumnText = row => {
	const { column, text, record, index } = row;
	if (column.customRender) {
		return column.customRender(row);
	}
	if (column.render) {
		return column.render(text, record, index);
	}
	return text;
};

/**
 * 表格行内单元格编辑状态与渲染逻辑
 */
export const useTableEdit = ({ props, tableLoading, getRowKey, emit }) => {
	const editingData = reactive({});
	// Switch 直接绑定值并即时提交，与文本类控件的暂存/确认流程不同，单独维护
	const editingSwitchData = reactive({});

	const isRowEditing = record => !!editingData[getRowKey(record)];

	const startEdit = (record, key, value) => {
		const rowKey = getRowKey(record);
		if (editingData[rowKey]) {
			editingData[rowKey][key] = value;
		} else {
			editingData[rowKey] = { [key]: value };
		}
	};

	const cancelEdit = (record, key) => {
		const rowKey = getRowKey(record);
		if (editingData[rowKey]) {
			delete editingData[rowKey][key];
		}
	};

	const submitCell = async (editable, record, key) => {
		if (!props.submitUrl && !props.beforeCellSubmit) {
			return;
		}

		const rowKey = getRowKey(record);
		const value =
			editable.type === "switch" ? editingSwitchData[rowKey][key] : editingData[rowKey][key];

		// rowKey 为函数时无法反推字段名，回退到 tableDefaults.rowKey（id）
		const rowKeyField = isFunction(props.rowKey) ? tableDefaults.rowKey : props.rowKey;
		const data = {
			[rowKeyField]: rowKey,
			[key]: value,
		};

		cancelEdit(record, key);

		const beforeSubmit = editable.beforeCellSubmit || props.beforeCellSubmit;
		if (beforeSubmit) {
			tableLoading.loading = true;
			await beforeSubmit(data);
			tableLoading.loading = false;
			return;
		}

		const res = await useFetch(tableLoading).post(props.submitUrl, data);
		useProcessStatusSuccess(res, () => {
			message.success(i18n.global.t("common.save-success"));
			emit("cellSubmit", { record, key, value });
		});
	};

	const renderEditControl = (editable, rowKey, editKey) => {
		if (editable.type === "input") {
			return (
				<Input
					v-model:value={editingData[rowKey][editKey]}
					style={{ width: "100%" }}
					{...editable.defaultProps}
				>
					{{ ...editable.defaultSlots }}
				</Input>
			);
		}
		if (editable.type === "number") {
			const { props: numberProps, addonBefore, addonAfter } = splitNumberAddons(
				editable.defaultProps
			);
			return withNumberAddons(
				<InputNumber
					v-model:value={editingData[rowKey][editKey]}
					style={{ width: "100%" }}
					{...numberProps}
				>
					{{ ...editable.defaultSlots }}
				</InputNumber>,
				addonBefore,
				addonAfter
			);
		}
		if (editable.type === "select") {
			return (
				<Select
					v-model:value={editingData[rowKey][editKey]}
					options={editable.options}
					style={{ width: "100%" }}
					{...editable.defaultProps}
				>
					{{ ...editable.defaultSlots }}
				</Select>
			);
		}
		return null;
	};

	const renderSwitchCell = (editable, record, rowKey, editKey, value) => {
		if (isUndefined(editingSwitchData[rowKey])) {
			editingSwitchData[rowKey] = {};
		}
		if (isUndefined(editingSwitchData[rowKey][editKey])) {
			editingSwitchData[rowKey][editKey] = value;
		}

		return (
			<div class={"table-editable-wrapper"}>
				<div class={"table-editable-text"}>
					<Switch
						v-model:checked={editingSwitchData[rowKey][editKey]}
						onClick={(_checked, e) => e.stopPropagation()}
						onChange={(_checked, e) => {
							e.stopPropagation();
							submitCell(editable, record, editKey);
						}}
						{...editable.defaultProps}
					>
						{{
							checkedChildren: () => editable.options?.[0] || null,
							unCheckedChildren: () => editable.options?.[1] || null,
						}}
					</Switch>
				</div>
			</div>
		);
	};

	const renderEditableCell = row => {
		const { column, text, record } = row;
		const editable = column.editable === true ? { type: "input" } : column.editable;
		const editKey = editable.key || column.key;
		const rowKey = getRowKey(record);
		const value = isUndefined(editable.defaultValue) ? text : editable.defaultValue;

		if (editable.type === "switch") {
			return renderSwitchCell(editable, record, rowKey, editKey, value);
		}

		const isEditing = editingData[rowKey] && !isUndefined(editingData[rowKey][editKey]);

		return (
			<div class={"table-editable-wrapper"}>
				<div class={"table-editable-text"}>
					{isEditing ? renderEditControl(editable, rowKey, editKey) : renderColumnText(row)}
				</div>
				{isEditing ? (
					<span class={"table-editable-icon editing"}>
						<CheckCircleOutlined
							class={"check-icon"}
							onClick={withModifiers(() => submitCell(editable, record, editKey), ["stop"])}
						/>
						<CloseCircleOutlined
							class={"close-icon"}
							onClick={withModifiers(() => cancelEdit(record, editKey), ["stop"])}
						/>
					</span>
				) : (
					<span class={"table-editable-icon"}>
						<EditOutlined
							class={"edit-icon"}
							onClick={withModifiers(() => startEdit(record, editKey, value), ["stop"])}
						/>
					</span>
				)}
			</div>
		);
	};

	return {
		isRowEditing,
		renderEditableCell,
	};
};
