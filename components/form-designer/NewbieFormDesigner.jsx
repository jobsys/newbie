import {computed, defineComponent, reactive, ref, TransitionGroup, watch, withModifiers,} from "vue";
import "./index.less";
import Draggable from "vuedraggable/src/vuedraggable";
import {cloneDeep, isArray, isEqual, isFunction, isObject, uniq} from "lodash-es";
import {
	Alert,
	Badge,
	Button,
	Col,
	Divider,
	Dropdown,
	Empty,
	Form,
	FormItem,
	Menu,
	MenuItem,
	message,
	Modal,
	Row, Space,
	TextArea,
	Tooltip,
} from "antdv-next";

import createFormItem from "../form/components/FormItem.jsx";
import { createFormModel } from "../form/model.js";
import {
	CalculatorOutlined,
	DeleteOutlined,
	DownOutlined,
	DragOutlined, FunctionOutlined,
	SaveOutlined,
	SmileTwoTone,
} from "@antdv-next/icons";
import NewbieForm from "../form/NewbieForm.jsx";
import {getDefaultWidgets} from "./defaultWidgets.jsx";
import {DesignerThemeScope} from "./themeVars.jsx";
import {formItemToProps, propsToFormItem, widgetToProps} from "./widgetProps.js";
import {genPixel} from "../../utils/style.js";
import {t, useT} from "../../hooks";
import GlobalLogicPanel from "./GlobalLogicPanel.jsx";
import FormulaEditor from "./FormulaEditor.jsx";

/**
 * 表单设计组件
 *
 * @version 1.2.0
 */
export default defineComponent({
	name: "NewbieFormDesigner",
	props: {
		/**
		 * 标题
		 */
		title: { type: String, default: "" },

		/**
		 * @typedef {Object} FormDesignerWidget
		 * @property {string} name 组件名称
		 * @property {string} type 组件实际类型
		 * @property {string} [icon] 组件图标
		 * @property {Object} [props] 组件的预设配置
		 **/
		/**
		 *
		 * 额外的业务组件
		 *
		 * @typedef {Object|Array} FormDesignerWidgetGroup
		 * @property {string} [title] 分组标题
		 * @property {Array.<FormDesignerWidget>} children 组件类型
		 */
		widgets: { type: Array, default: () => [] },

		/**
		 * 表单项
		 *
		 * @typedef {Object|Array} FormDesignerFormItemConfig
		 * @property {string} key 表单项的唯一标识
		 * @property {string} type 表单项的类型
		 * @property {string} title 表单项的标题
		 * @property
		 */
		formItems: { type: [Array, Function], default: () => [] },

		/**
		 * 组件高度
		 */
		height: { type: [String, Number], default: "100%" },

		/**
		 * 设计类型，默认为表单设置，可选 quiz: 知识竞赛设计（题目带答案和解析）
		 */
		mode: { type: String, default: null },
	},
	emits: ["submit"],
	setup(props, { emit }) {
		const propFormRef = ref(null);
		const logicRules = ref([]); // 独立 ref，避免嵌套 reactive 的响应式问题
		const rulesUserModified = ref(false); // 标记规则是否被用户修改过

		const state = reactive({
			painterItems: [], //由于Draggable只能纯粹Copy原来的数据，需要定义另外一个处理后的数组负责渲染
			dragOptions: {
				animation: 200,
				group: "designer",
				disabled: false,
				ghostClass: "ghost",
			},
			isDragging: false,
			currentItem: null,
			currentIndex: null,
			propsFormData: {},
			showOptionsModal: false,
			showValueOptionsModal: false,
			currentOptionItem: null,
			optionsValue: "",
			rateValue: "",
			showLogicPanel: false,
		});

		// 画布预览使用与 NewbieForm 相同的「扁平视图 + 嵌套 model」，
		// 这样设计器中配置带点号的 key 时，name: keyPath(key) 仍能命中同一个值
		const canvasModel = createFormModel();

		// 按 key 懒创建表单项状态，避免画布预览中 tag / remote / group / optional
		// 读取 formState[item.key] 时因为没有状态对象而抛错
		const canvasFormState = new Proxy(
			{},
			{
				get(target, key) {
					if (typeof key !== "string") {
						return undefined;
					}
					if (!target[key]) {
						target[key] = reactive({});
					}
					return target[key];
				},
			}
		);

		// track historical max sequence number per type - avoids key reuse after deletion
		const typeMaxSeq = {};

		const getNextKey = (type) => {
			if (!(type in typeMaxSeq)) {
				let maxSeq = 0;
				state.painterItems.forEach(item => {
					if (item.type === type && item.key) {
						const pattern = type + '-(\\d+)$';
						const match = item.key.match(new RegExp(pattern));
						if (match) maxSeq = Math.max(maxSeq, parseInt(match[1]));
					}
				});
				typeMaxSeq[type] = maxSeq;
			}
			typeMaxSeq[type] += 1;
			return type + '-' + typeMaxSeq[type];
		};

		const prepareFormItems = () => {
			let items = [];
			let logic = { rules: [] };
			if (isFunction(props.formItems)) {
				items = props.formItems();
			} else {
				items = cloneDeep(props.formItems);
			}
			// 兼容新格式 { fields: [...], logic: { rules: [...] } }
			if (!Array.isArray(items) && items && items.fields) {
				logic = items.logic || { rules: [] };
				items = items.fields;
			}
			// 只在用户未修改过规则时才从配置加载，防止覆盖用户正在编辑的规则
			if (Array.isArray(logic.rules) && !rulesUserModified.value) {
				logicRules.value = logic.rules;
			}
			state.painterItems = items.map(item => {
				return {
					key: item.key,
					type: item.type,
					name: item.title,
					props: item,
				};
			});
		};

		watch(
			() => props.formItems,
			() => prepareFormItems(),
			{ deep: true }
		);

		prepareFormItems();

		const prepareWidgets = getDefaultWidgets(props.mode)
			.concat(props.widgets)
			.map(item => {
				if (isArray(item)) {
					item = { children: item };
				}
				return item;
			});

		const widgets = ref(prepareWidgets);

		//复制组件的时候将渲染 Form 的属性全部放到 props 属性中
		const onCloneWidget = item => {
			const painterItem = cloneDeep(item);
			// 生成有意义的 key：type + 历史最大序号，如 radio-1, checkbox-2，避免删除后重复
			const type = painterItem.type || "field";
			painterItem.key = getNextKey(type);
			if (!painterItem.props) {
				painterItem.props = {};
			}
			painterItem.props.title = painterItem.props.title || painterItem.name;
			painterItem.props.key = painterItem.key;
			painterItem.props.type = painterItem.type;
			painterItem.props.placeholder = " - ";

			return painterItem;
		};

		const onSelectWidget = item => {
			const painterItem = onCloneWidget(item);
			state.painterItems.push(painterItem);
			onSelectItem(state.painterItems.length - 1);
		};

		const onSelectItem = index => {
			state.currentItem = state.painterItems[index];
			state.currentIndex = index;
			state.propsFormData = formItemToProps(state.painterItems[index], props.mode);
		};

		const onAddItem = ({ newIndex }) => {
			if (newIndex === 0) {
				onSelectItem(0);
			}
		};

		const onDeleteItem = index => {
			if (state.painterItems[index].key === state.currentItem?.key) {
				state.currentItem = null;
				state.currentIndex = null;
			}

			state.painterItems.splice(index, 1);
		};

		const onEditOptions = item => {
			state.currentOptionItem = item;

			if (state.currentItem.type.startsWith("rate-")) {
				let optionsValue = "",
					rateValue = "";
				const options = state.currentItem?.props[item.key] || [];
				options.forEach((option, optionIndex) => {
					if (isObject(option)) {
						optionsValue += option.value;
						rateValue += option.rate ? String(option.rate) : "";
					} else {
						optionsValue += option;
					}
					if (optionIndex < options.length - 1) {
						optionsValue += "\n";
						rateValue += "\n";
					}
				});
				state.optionsValue = optionsValue;
				state.rateValue = rateValue;
				state.showValueOptionsModal = true;
			} else {
				state.optionsValue = state.currentItem?.props[item.key]?.join("\n");
				state.showOptionsModal = true;
			}
		};

		const onSubmitOptions = () => {
			if (!state.optionsValue.trim()) {
				message.warn(t("form-designer.options-required"));
				return;
			}
			if (!state.currentOptionItem) {
				return;
			}

			let options = state.optionsValue.split("\n").filter(option => option.trim());

			if (props.mode === "quiz") {
				//每个选项添加 A,B,C,D
				options = options.map((option, index) => {
					// 如果选项不是以"字母+."开头，则添加前缀
					if (!/^[A-Z]\.\s?/.test(option)) {
						return `${String.fromCharCode(65 + index)}. ${option}`;
					}
					return option;
				});
			}

			if (!isEqual(options, uniq(options))) {
				message.warn(t("form-designer.options-duplicate"));
				return;
			}

			if (!state.currentItem.props) {
				state.currentItem.props = {};
			}

			state.currentItem.props[state.currentOptionItem.key] = options;
			state.showOptionsModal = false;
		};

		const onSubmitValueOptions = () => {
			if (!state.optionsValue.trim()) {
				message.warn(t("form-designer.options-required"));
				return;
			}
			if (!state.currentOptionItem) {
				return;
			}

			const options = state.optionsValue.split("\n").filter(option => option.trim());
			const rates = state.rateValue.split("\n");

			if (!isEqual(options, uniq(options))) {
				message.warn(t("form-designer.options-duplicate"));
				return;
			}

			if (!state.currentItem.props) {
				state.currentItem.props = {};
			}

			state.currentItem.props[state.currentOptionItem.key] = options.map((item, index) => {
				return {
					label: item,
					value: item,
					rate: rates[index] ? String(rates[index]).trim() : 0,
				};
			});
			state.showOptionsModal = false;
			state.showValueOptionsModal = false;
		};

		const onRateGenerate = e => {
			const { key } = e;
			if (key === "increase") {
				state.rateValue = state.optionsValue
					.split("\n")
					.map((item, index) => index + 1)
					.join("\n");
			} else {
				state.rateValue = state.rateValue
					.split("\n")
					.map(item => {
						if (!isNaN(item) && !isNaN(parseFloat(item))) {
							return key === "add1" ? Number(item) + 1 : Number(item) - 1;
						}
						return item;
					})
					.join("\n");
			}
		};

		const onClearForm = () => {
			Modal.confirm({
				title: t("form-designer.clear-form"),
				content: t("form-designer.clear-form-confirm"),
				onOk: () => {
					state.painterItems = [];
					canvasModel.replace({});
				},
			});
		};

		const onSubmit = () => {
			emit("submit", {
				fields: state.painterItems?.length ? state.painterItems.map(item => item.props) : [],
				logic: { rules: logicRules.value },
			});
		};

		const propSubmitForm = computed(() => propFormRef.value?.getForm());

		//在表单数据变化的时候更新组件的数据
		watch(
			() => propSubmitForm.value,
			formatForm => {
				propsToFormItem(formatForm, state.currentItem, props.mode);
			},
			{ deep: true }
		);

		const widgetListElems = () =>
			widgets.value.map(item => {
				return (
					<div class={"widget-list-container"}>
						<div class={"widget-list-title"}>{item.title || useT("form-designer.default-group")}</div>
						<Draggable
							tag={"div"}
							list={item.children}
							sort={false}
							group={{ name: "designer", pull: "clone", put: false }}
							clone={onCloneWidget}
							handle={".drag-handle"}
							class={"widget-list"}
							itemKey={"name"}
						>
							{{
								item: ({ element }) => (
									<Button
										class={"widget-item drag-handle"}
										onClick={() => onSelectWidget(element)}
									>
										{element.icon ? (
											<span role="img" class={"widget-icon"}>
												{isFunction(element.icon) ? element.icon() : element.icon}
											</span>
										) : null}
										<span class={"widget-name"}>{element.name}</span>
									</Button>
								),
							}}
						</Draggable>
					</div>
				);
			});

		const widgetContainerElem = () => {
			return (
				<div class={"newbie-form-designer__widget-container"}>
					<div class={"widget-container"}>{widgetListElems()}</div>
				</div>
			);
		};

		return () => {
			const painterContainerElem = () => (
				<div class="newbie-form-designer__painter-container">
					<div class="newbie-form-designer__painter-scroll">
						<Form
							labelCol={{ span: 24 }}
							wrapperCol={{ span: 24 }}
							model={canvasModel.model}
							labelAlign={"start"}
							class={"newbie-form"}
						>
							{props.title ? <div class={"painter-title"}>{props.title}</div> : null}
							{state.painterItems.length ? null : (
								<div class={"newbie-form-designer__help-wrapper"}>
									<p>
										<SmileTwoTone style={{ marginRight: "4px" }} />
										{useT("form-designer.drag-hint")}
									</p>
								</div>
							)}
							<TransitionGroup>
								<Draggable
									list={state.painterItems}
									class={"painter-wrapper"}
									handle={".painter-item"}
									itemKey={"key"}
									key={"key"}
									{...state.dragOptions}
									onStart={() => (state.isDragging = true)}
									onEnd={() => (state.isDragging = false)}
									onAdd={onAddItem}
								>
									{{
										item: ({ element, index }) => {
											const itemIndex = String(index + 1).padStart(2, "0") + ".";
											return (
												<div
													class={`painter-item ${state.currentItem?.key === element.key ? "active" : ""}`}
													key={element.key}
													onClick={() => onSelectItem(index)}
												>
													<div class={"drag-handle"}>
														<DragOutlined></DragOutlined>
													</div>
													<div class={"op-container"}>
														<div
															class={"op-item"}
															onClick={withModifiers(() => onDeleteItem(index), ["stop"])}
														>
															<Tooltip title={useT("common.delete")}>
																<DeleteOutlined></DeleteOutlined>
															</Tooltip>
														</div>
													</div>
													{element.props.break ? (
														<Divider>{() => useT("form-designer.page-break")}</Divider>
													) : null}
													{createFormItem(
														{
															formItemSlots: {
																label: () => (
																	<div class={"item-label"}>
																		<span class={"item-index"}>{itemIndex}</span>
																		<span class={"item-name"}>
																			<span class={"item-key"}>[{element.props.key}]</span>
																			{element.props.title}
																			{element.type === "computed" ? (
																				<Tooltip title={useT("form-designer.computed-field-tip")}>
																					<span class={"item-computed-badge"}>
																						<CalculatorOutlined style={{ marginRight: 4 }} />
																						{useT("form-designer.computed-field")}
																					</span>
																				</Tooltip>
																			) : null}
																		</span>
																	</div>
																),
															},
															...element.props,
														},
														canvasModel.flat,
														{ props: {}, formState: canvasFormState }
													)}
												</div>
											);
										},
									}}
								</Draggable>
							</TransitionGroup>
						</Form>
					</div>
					<div class={"newbie-form-designer__painter-toolbar"}>
						<Tooltip title={useT("form-designer.clear-form")}>
							<Button
								type={"default"}
								danger
								icon={<DeleteOutlined />}
								onClick={onClearForm}
							>
								{useT("form-designer.clear-form")}
							</Button>
						</Tooltip>
						<Space size={8}>
							<Badge count={logicRules.value.length} offset={[-4, 0]}>
								<Button
									type={"default"}
									icon={<FunctionOutlined />}
									onClick={() => {
										state.showLogicPanel = true;
									}}
								>
									{useT("form-designer.logic")}
								</Button>
							</Badge>
							<Button type={"primary"} icon={<SaveOutlined />} onClick={onSubmit}>
								{useT("form-designer.save-form")}
							</Button>
                        </Space>
					</div>
				</div>
			);

			const propsContainerElem = () => (
				<div class={"newbie-form-designer__props-container"}>
					{state.currentItem ? (
						[
							<div class={"widget-name"}>
								{state.currentItem.icon ? (
									<span role="img" class={"widget-icon"}>
										{isFunction(state.currentItem.icon)
											? state.currentItem.icon()
											: state.currentItem.icon}
									</span>
								) : null}
								{state.currentItem.name}
							</div>,
							<NewbieForm
								ref={propFormRef}
								form={() => widgetToProps(state.currentItem, props.mode)}
								cardWrapper={false}
								closable={false}
								data={state.propsFormData}
							>
								{{
									options: ({ item }) => {
										return (
											<FormItem label={item.title}>
												{() => (
													<Button type={"primary"} onClick={() => onEditOptions(item)}>
														{() => useT("form-designer.set-options")}
													</Button>
												)}
											</FormItem>
										);
									},
									rows: ({ item }) => {
										return (
											<FormItem label={item.title}>
												{() => (
													<Button type={"primary"} onClick={() => onEditOptions(item)}>
														{() => useT("form-designer.set-row-titles")}
													</Button>
												)}
											</FormItem>
										);
									},

								}}
							</NewbieForm>,
							state.currentItem.type === "computed" ? (
								<div style={{ padding: "0 16px 16px" }}>
									<FormulaEditor
										value={state.currentItem.props.formula}
										onChange={val => {
											state.currentItem.props.formula = val;
										}}
										availableFields={state.painterItems
											.filter(p => p.type !== "computed" && p.props.key !== state.currentItem.props.key)
											.map(p => ({ key: p.props.key, title: p.props.title }))}
										previewData={canvasModel.flat}
										fieldKey={state.currentItem.props.key}
									/>
								</div>
							) : null,
						]
					) : (
						<div class={"empty-props"}>
							<Empty description={useT("form-designer.empty-props")}></Empty>
						</div>
					)}
				</div>
			);

			const optionsEditorElem = () => (
				<Modal
					v-model:open={state.showOptionsModal}
					title={useT("form-designer.options-title")}
					onOk={onSubmitOptions}
				>
					{() => [
						<Alert
							message={
								props.mode === "quiz"
									? useT("form-designer.options-alert-quiz")
									: useT("form-designer.options-alert")
							}
							style={{ marginBottom: "10px" }}
						></Alert>,
						<TextArea
							v-model:value={state.optionsValue}
							placeholder={useT("form-designer.options-placeholder")}
							auto-size={{ minRows: 14, maxRows: 14 }}
						></TextArea>,
					]}
				</Modal>
			);

			const valueOptionsEditorElem = () => (
				<Modal
					v-model:open={state.showValueOptionsModal}
					title={useT("form-designer.options-title")}
					onOk={onSubmitValueOptions}
				>
					{() => [
						<Alert
							message={useT("form-designer.options-alert-strict")}
							style={{ marginBottom: "10px" }}
						></Alert>,
						<Row gutter={8}>
							{() => [
								<Col span={14}>
									{() => [
										<div>{useT("form.options")}</div>,
										<TextArea
											v-model:value={state.optionsValue}
											placeholder={useT("form-designer.options-placeholder")}
											auto-size={{ minRows: 14, maxRows: 14 }}
										></TextArea>,
									]}
								</Col>,
								<Col span={10}>
									{() => [
										<Dropdown>
											{{
												default: () => (
													<div>
														<a class="ant-dropdown-link">
															{useT("form-designer.score-label")}
															<DownOutlined style={{ marginLeft: "4px", fontSize: "12px" }} />
														</a>
													</div>
												),
												popupRender: () => (
													<Menu onClick={onRateGenerate}>
														{() => [
															<MenuItem key={"increase"}>
																{() => useT("form-designer.score-increase")}
															</MenuItem>,
															<MenuItem key={"add1"}>
																{() => useT("form-designer.score-add-one")}
															</MenuItem>,
															<MenuItem key={"minus1"}>
																{() => useT("form-designer.score-minus-one")}
															</MenuItem>,
														]}
													</Menu>
												),
											}}
										</Dropdown>,
										<TextArea
											v-model:value={state.rateValue}
											placeholder={useT("form-designer.score-placeholder")}
											auto-size={{ minRows: 14, maxRows: 14 }}
										></TextArea>,
									]}
								</Col>,
							]}
						</Row>,
					]}
				</Modal>
			);

			return (
				<DesignerThemeScope>
					<div class={"newbie-form-designer"} style={{ height: genPixel(props.height) }}>
						{widgetContainerElem()}
						{painterContainerElem()}
						{propsContainerElem()}
						{optionsEditorElem()}
						{valueOptionsEditorElem()}
						<GlobalLogicPanel
							rules={logicRules.value}
							onChange={rules => {
								logicRules.value = rules;
								rulesUserModified.value = true;
							}}
							availableFields={state.painterItems.map(item => ({
								key: item.key,
								title: item.props.title || item.name,
								type: item.type,
								props: item.props,
							}))}
							open={state.showLogicPanel}
							onClose={() => {
								state.showLogicPanel = false;
							}}
						/>
					</div>
				</DesignerThemeScope>
			);
		};
	},
});
