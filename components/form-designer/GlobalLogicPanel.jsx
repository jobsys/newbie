import {computed, defineComponent, reactive, ref} from "vue";
import {cloneDeep} from "lodash-es";
import {
	Button,
	Card,
	Drawer,
	Form,
	FormItem,
	Input,
	InputNumber,
	message,
	Radio,
	Select,
	Space,
} from "antdv-next";
import {PlusOutlined} from "@antdv-next/icons";
import {t, useT} from "../../hooks";

const operatorsByType = {
	all: ["equals", "notEquals", "isEmpty", "isNotEmpty"],
	number: ["gt", "lt", "gte", "lte"],
	text: ["contains", "notContains", "startsWith", "endsWith"],
	multi: ["in", "notIn"],
};

// 操作符展示文案的 i18n key，实际文案在 setup / render 中通过 useT 读取
const operatorLabelKeys = {
	equals: "form-designer.logic-panel.operators.equals",
	notEquals: "form-designer.logic-panel.operators.not-equals",
	isEmpty: "form-designer.logic-panel.operators.is-empty",
	isNotEmpty: "form-designer.logic-panel.operators.is-not-empty",
	gt: "form-designer.logic-panel.operators.gt",
	lt: "form-designer.logic-panel.operators.lt",
	gte: "form-designer.logic-panel.operators.gte",
	lte: "form-designer.logic-panel.operators.lte",
	contains: "form-designer.logic-panel.operators.contains",
	notContains: "form-designer.logic-panel.operators.not-contains",
	startsWith: "form-designer.logic-panel.operators.starts-with",
	endsWith: "form-designer.logic-panel.operators.ends-with",
	in: "form-designer.logic-panel.operators.in",
	notIn: "form-designer.logic-panel.operators.not-in",
};

export default defineComponent({
	name: "GlobalLogicPanel",
	props: {
		rules: { type: Array, default: () => [] },
		availableFields: { type: Array, default: () => [] },
		open: { type: Boolean, default: false },
	},
	emits: ["change", "close"],
	setup(props, {emit}) {
		const showEditForm = ref(false);

		// 用独立 ref 管理编辑表单状态，避免 Vue reactive proxy 的问题
		const editId = ref("");
		const editTargetField = ref("");
		const editAction = ref("show");
		const editLogicGate = ref("AND");
		const editConditions = ref([]);

		const resetEditForm = () => {
			editId.value = "";
			editTargetField.value = "";
			editAction.value = "show";
			editLogicGate.value = "AND";
			editConditions.value = [];
		};

		const fieldOptions = computed(() => props.availableFields.filter(f => f.type !== "computed"));

		const getOperatorsForField = fieldKey => {
			const field = props.availableFields.find(f => f.key === fieldKey);
			if (!field) return operatorsByType.all;

			const baseOps = [...operatorsByType.all];
			if (field.type === "number") {
				baseOps.push(...operatorsByType.number);
			} else if (["input", "textarea"].includes(field.type)) {
				baseOps.push(...operatorsByType.text);
			} else if (["checkbox", "select"].includes(field.type) && field.props?.mode === "multiple") {
				baseOps.push(...operatorsByType.multi);
			}
			return baseOps;
		};

		const getValueInputType = fieldKey => {
			const field = props.availableFields.find(f => f.key === fieldKey);
			if (!field) return "input";

			if (["radio", "select"].includes(field.type)) {
				return "select";
			}
			if (field.type === "number") {
				return "number";
			}
			return "input";
		};

		const getFieldOptions = fieldKey => {
			const field = props.availableFields.find(f => f.key === fieldKey);
			if (!field || !field.props?.options) return [];
			return field.props.options.map(opt =>
				typeof opt === "object" ? opt : { label: opt, value: opt }
			);
		};

		const addRule = () => {
			resetEditForm();
			editId.value = Date.now().toString();
			showEditForm.value = true;
		};

		const editRule = rule => {
			editId.value = rule.id || "";
			editTargetField.value = rule.targetField || "";
			editAction.value = rule.action || "show";
			editLogicGate.value = (rule.logicGate || "AND").toUpperCase();
			editConditions.value = rule.conditions
				? cloneDeep(rule.conditions).map(c => reactive(c))
				: [];
			showEditForm.value = true;
		};

		const deleteRule = ruleId => {
			const newRules = props.rules.filter(r => r.id !== ruleId);
			emit("change", newRules);
		};

		const saveRule = () => {
			if (!editTargetField.value) {
				message.warn(t("form-designer.logic-panel.target-field-required"));
				return;
			}
			if (!editConditions.value || editConditions.value.length === 0) {
				message.warn(t("form-designer.logic-panel.condition-required"));
				return;
			}

			const ruleData = {
				id: editId.value,
				targetField: editTargetField.value,
				action: editAction.value,
				logicGate: editLogicGate.value,
				conditions: cloneDeep(editConditions.value),
			};

			const existingIndex = props.rules.findIndex(r => r.id === ruleData.id);
			let newRules;
			if (existingIndex >= 0) {
				newRules = [...props.rules];
				newRules[existingIndex] = ruleData;
			} else {
				newRules = [...props.rules, ruleData];
			}
			emit("change", newRules);
			showEditForm.value = false;
			resetEditForm();
		};

		const cancelEdit = () => {
			showEditForm.value = false;
			resetEditForm();
		};

		const addCondition = () => {
			editConditions.value.push(
				reactive({
					field: "",
					operator: "equals",
					value: "",
				})
			);
		};

		const removeCondition = index => {
			editConditions.value.splice(index, 1);
		};

		const formatRuleSummary = rule => {
			const targetField = rule.targetField
				? props.availableFields.find(f => f.key === rule.targetField)
				: null;
			const targetName = targetField
				? useT("form-designer.logic-panel.field-title", {title: targetField.title, key: targetField.key})
				: rule.targetField || useT("form-designer.logic-panel.unknown-field");
			const actionText =
				rule.action === "show"
					? useT("form-designer.logic-panel.action-show")
					: useT("form-designer.logic-panel.action-hide");
			const conditionCount = rule.conditions?.length || 0;
			const gateText =
				(rule.logicGate || "AND").toUpperCase() === "AND"
					? useT("form-designer.logic-panel.gate-all")
					: useT("form-designer.logic-panel.gate-any");
			return useT("form-designer.logic-panel.summary", {
				count: conditionCount,
				gate: gateText,
				action: actionText,
				target: targetName,
			});
		};

		const renderEditForm = () => {
			if (!showEditForm.value) return null;

			return (
				<div class="rule-edit-form">
					<Form layout="vertical">
						<FormItem label={useT("form-designer.logic-panel.target-field")}>
							<Select
								value={editTargetField.value}
								onUpdate:value={val => {
									editTargetField.value = val;
								}}
								placeholder={useT("form-designer.logic-panel.target-field-placeholder")}
								options={fieldOptions.value.map(f => ({
									label: useT("form-designer.logic-panel.field-option-label", {
										key: f.key,
										title: f.title,
									}),
									value: f.key,
								}))}
							/>
						</FormItem>
						<FormItem label={useT("form-designer.logic-panel.action")}>
							<Radio.Group
								value={editAction.value}
								onChange={val => {
									// 兼容事件对象和直接值两种情况
									editAction.value = val && val.target ? val.target.value : val;
								}}
							>
								<Radio value="show">{useT("form-designer.logic-panel.action-show")}</Radio>
								<Radio value="hide">{useT("form-designer.logic-panel.action-hide")}</Radio>
							</Radio.Group>
						</FormItem>
						<FormItem label={useT("form-designer.logic-panel.logic-gate")}>
							<Radio.Group
								value={editLogicGate.value}
								onChange={val => {
									editLogicGate.value = val && val.target ? val.target.value : val;
								}}
							>
								<Radio value="AND">{useT("form-designer.logic-panel.gate-and")}</Radio>
								<Radio value="OR">{useT("form-designer.logic-panel.gate-or")}</Radio>
							</Radio.Group>
						</FormItem>
						<FormItem label={useT("form-designer.logic-panel.conditions")}>
							<Space orientation="vertical" style={{ width: "100%" }}>
								{editConditions.value.map((cond, index) => {
									const operators = getOperatorsForField(cond.field);
									const valueInputType = getValueInputType(cond.field);
									const fieldOptionsList = getFieldOptions(cond.field);

									return (
										<div key={index} class="condition-row">
											<Space>
												<Select
													value={cond.field}
													onUpdate:value={val => {
														// 字段变化时重置操作符和值
														editConditions.value[index] = reactive({
															field: val,
															operator: getOperatorsForField(val)[0],
															value: "",
														});
													}}
													placeholder={useT("form-designer.logic-panel.select-field")}
													style={{ width: "150px" }}
													options={fieldOptions.value.map(f => ({
														label: useT("form-designer.logic-panel.field-option-label", {
															key: f.key,
															title: f.title,
														}),
														value: f.key,
													}))}
												/>
												<Select
													value={cond.operator}
													onUpdate:value={val => {
														cond.operator = val;
													}}
													placeholder={useT("form-designer.logic-panel.operator")}
													style={{ width: "130px" }}
													options={operators.map(op => ({
														label: operatorLabelKeys[op]
															? useT(operatorLabelKeys[op])
															: op,
														value: op,
													}))}
												/>
												{valueInputType === "select" ? (
													<Select
														value={cond.value}
														onUpdate:value={val => {
															cond.value = val;
														}}
														placeholder={useT("form-designer.logic-panel.select-value")}
														style={{ width: "150px" }}
														options={fieldOptionsList}
													/>
												) : valueInputType === "number" ? (
													<InputNumber
														value={cond.value}
														onUpdate:value={val => {
															cond.value = val;
														}}
														placeholder={useT("form-designer.logic-panel.input-value")}
														style={{ width: 150 }}
													/>
												) : (
													<Input
														value={cond.value}
														onUpdate:value={val => {
															cond.value = val;
														}}
														placeholder={useT("form-designer.logic-panel.input-value")}
														style={{ width: 150 }}
													/>
												)}
												<Button danger size="small" onClick={() => removeCondition(index)}>
													{useT("common.delete")}
												</Button>
											</Space>
										</div>
									);
								})}
								<Button type="dashed" onClick={addCondition}>
									{useT("form-designer.logic-panel.add-condition")}
								</Button>
							</Space>
						</FormItem>
					</Form>
					<Space style={{ marginTop: "16px" }}>
						<Button type="primary" onClick={saveRule}>
							{useT("common.save")}
						</Button>
						<Button onClick={cancelEdit}>{useT("common.cancel")}</Button>
					</Space>
				</div>
			);
		};

		return () => (
			<Drawer
				title={useT("form-designer.logic")}
				open={props.open}
				onClose={() => emit("close")}
				size={600}
			>
				{!showEditForm.value ? (
					<>
						<Button type="primary" icon={<PlusOutlined />} onClick={addRule} style={{ marginBottom: "16px" }}>
							{useT("form-designer.logic-panel.add-rule")}
						</Button>
						{props.rules.length === 0 ? (
							<div class="logic-panel__empty">
								{useT("form-designer.logic-panel.empty")}
							</div>
						) : (
							props.rules.map(rule => (
								<Card key={rule.id} size="small" style={{ marginBottom: "8px" }}>
									<div class="logic-panel__rule-summary">{formatRuleSummary(rule)}</div>
									<Space style={{ marginTop: "8px" }}>
										<Button size="small" onClick={() => editRule(rule)}>
											{useT("common.edit")}
										</Button>
										<Button danger size="small" onClick={() => deleteRule(rule.id)}>
											{useT("common.delete")}
										</Button>
									</Space>
								</Card>
							))
						)}
					</>
				) : (
					renderEditForm()
				)}
			</Drawer>
		);
	},
});
