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
} from "ant-design-vue";
import {PlusOutlined} from "@ant-design/icons-vue";

const operatorsByType = {
	all: ["equals", "notEquals", "isEmpty", "isNotEmpty"],
	number: ["gt", "lt", "gte", "lte"],
	text: ["contains", "notContains", "startsWith", "endsWith"],
	multi: ["in", "notIn"],
};

const operatorLabels = {
	equals: "等于",
	notEquals: "不等于",
	isEmpty: "为空",
	isNotEmpty: "不为空",
	gt: "大于",
	lt: "小于",
	gte: "大于等于",
	lte: "小于等于",
	contains: "包含",
	notContains: "不包含",
	startsWith: "开头是",
	endsWith: "结尾是",
	in: "已选择",
	notIn: "未选择",
};

export default defineComponent({
	name: "GlobalLogicPanel",
	props: {
		rules: { type: Array, default: () => [] },
		onChange: { type: Function, default: () => {} },
		availableFields: { type: Array, default: () => [] },
		open: { type: Boolean, default: false },
		onClose: { type: Function, default: () => {} },
	},
	setup(props) {
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
			props.onChange(newRules);
		};

		const saveRule = () => {
			if (!editTargetField.value) {
				message.warn("请选择目标字段");
				return;
			}
			if (!editConditions.value || editConditions.value.length === 0) {
				message.warn("请至少添加一个条件");
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
			props.onChange(newRules);
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
				? `${targetField.title}（${targetField.key}）`
				: rule.targetField || "未知字段";
			const actionText = rule.action === "show" ? "显示" : "隐藏";
			const conditionCount = rule.conditions?.length || 0;
			const gateText =
				(rule.logicGate || "AND").toUpperCase() === "AND" ? "全部满足" : "任一满足";
			return `当 ${conditionCount} 个条件(${gateText})时，${actionText} ${targetName}`;
		};

		const renderEditForm = () => {
			if (!showEditForm.value) return null;

			return (
				<div class="rule-edit-form">
					<Form layout="vertical">
						<FormItem label="目标字段">
							<Select
								value={editTargetField.value}
								onUpdate:value={val => {
									editTargetField.value = val;
								}}
								placeholder="选择目标字段"
								options={fieldOptions.value.map(f => ({ label: `${f.key}（${f.title}）`, value: f.key }))}
							/>
						</FormItem>
						<FormItem label="动作">
							<Radio.Group
								value={editAction.value}
								onChange={val => {
									// 兼容事件对象和直接值两种情况
									editAction.value = val && val.target ? val.target.value : val;
								}}
							>
								<Radio value="show">显示</Radio>
								<Radio value="hide">隐藏</Radio>
							</Radio.Group>
						</FormItem>
						<FormItem label="逻辑门">
							<Radio.Group
								value={editLogicGate.value}
								onChange={val => {
									editLogicGate.value = val && val.target ? val.target.value : val;
								}}
							>
								<Radio value="AND">AND（全部满足）</Radio>
								<Radio value="OR">OR（任一满足）</Radio>
							</Radio.Group>
						</FormItem>
						<FormItem label="条件列表">
							<Space direction="vertical" style={{ width: "100%" }}>
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
													placeholder="选择字段"
													style={{ width: "150px" }}
													options={fieldOptions.value.map(f => ({ label: `${f.key}（${f.title}）`, value: f.key }))}
												/>
												<Select
													value={cond.operator}
													onUpdate:value={val => {
														cond.operator = val;
													}}
													placeholder="操作符"
													style={{ width: "130px" }}
													options={operators.map(op => ({ label: operatorLabels[op] || op, value: op }))}
												/>
												{valueInputType === "select" ? (
													<Select
														value={cond.value}
														onUpdate:value={val => {
															cond.value = val;
														}}
														placeholder="选择值"
														style={{ width: "150px" }}
														options={fieldOptionsList}
													/>
												) : valueInputType === "number" ? (
													<InputNumber
														value={cond.value}
														onUpdate:value={val => {
															cond.value = val;
														}}
														placeholder="输入值"
														style={{ width: 150 }}
													/>
												) : (
													<Input
														value={cond.value}
														onUpdate:value={val => {
															cond.value = val;
														}}
														placeholder="输入值"
														style={{ width: 150 }}
													/>
												)}
												<Button danger size="small" onClick={() => removeCondition(index)}>
													删除
												</Button>
											</Space>
										</div>
									);
								})}
								<Button type="dashed" onClick={addCondition}>
									+ 添加条件
								</Button>
							</Space>
						</FormItem>
					</Form>
					<Space style={{ marginTop: "16px" }}>
						<Button type="primary" onClick={saveRule}>
							保存
						</Button>
						<Button onClick={cancelEdit}>取消</Button>
					</Space>
				</div>
			);
		};

		return () => (
			<Drawer title="表单逻辑" open={props.open} onClose={props.onClose} width={600}>
				{!showEditForm.value ? (
					<>
						<Button type="primary" icon={<PlusOutlined />} onClick={addRule} style={{ marginBottom: "16px" }}>
							添加规则
						</Button>
						{props.rules.length === 0 ? (
							<div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
								暂无规则，点击"添加规则"开始配置
							</div>
						) : (
							props.rules.map(rule => (
								<Card key={rule.id} size="small" style={{ marginBottom: "8px" }}>
									<div>{formatRuleSummary(rule)}</div>
									<Space style={{ marginTop: "8px" }}>
										<Button size="small" onClick={() => editRule(rule)}>
											编辑
										</Button>
										<Button danger size="small" onClick={() => deleteRule(rule.id)}>
											删除
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
