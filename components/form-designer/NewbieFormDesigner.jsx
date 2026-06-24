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
	Textarea,
	Tooltip,
} from "ant-design-vue";

import createFormItem from "../form/components/FormItem.jsx";
import {
	CalculatorOutlined,
	DeleteOutlined,
	DownOutlined,
	DragOutlined, FunctionOutlined,
	SaveOutlined,
	SmileTwoTone,
} from "@ant-design/icons-vue";
import NewbieForm from "../form/NewbieForm.jsx";
import {getDefaultWidgets} from "./defaultWidgets.jsx";
import {formItemToProps, propsToFormItem, widgetToProps} from "./widgetProps.js";
import {genPixel} from "../../utils/style.js";
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
			submitForm: {},
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
				options.forEach((item, index) => {
					if (isObject(item)) {
						optionsValue += item.value;
						rateValue += item.rate ? String(item.rate) : "";
					} else {
						optionsValue += item;
					}
					if (index < options.length - 1) {
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
				message.warn("请至少设置一个选项");
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
				message.warn("选项有重复，请检查数据");
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
				message.warn("请至少设置一个选项");
				return;
			}
			if (!state.currentOptionItem) {
				return;
			}

			const options = state.optionsValue.split("\n").filter(option => option.trim());
			const rates = state.rateValue.split("\n");

			if (!isEqual(options, uniq(options))) {
				message.warn("选项有重复，请检查数据");
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
				title: "清空表单",
				content: "清空表单后，所有数据将被清空，是否继续？",
				onOk: () => {
					state.painterItems = [];
					state.submitForm = {};
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

		return () => {
			const widgetListElems = () =>
				widgets.value.map(item => {
					return (
						<div class={"widget-list-container"}>
							<div class={"widget-list-title"}>{item.title || "默认"}</div>
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

			const painterContainerElem = () => (
				<div class="newbie-form-designer__painter-container">
					<div class="newbie-form-designer__painter-scroll">
						<Form
							labelCol={{ span: 24 }}
							wrapperCol={{ span: 24 }}
							model={state.submitForm}
							labelAlign={"left"}
							class={"newbie-form"}
						>
							{props.title ? <div class={"painter-title"}>{props.title}</div> : null}
							{state.painterItems.length ? null : (
								<div class={"newbie-form-designer__help-wrapper"}>
									<p>
										<SmileTwoTone style={{ marginRight: "4px" }} />
										请点击或者拖拽左侧组件至下面区域生成表单
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
															<Tooltip title={"删除"}>
																<DeleteOutlined></DeleteOutlined>
															</Tooltip>
														</div>
													</div>
													{element.props.break ? <Divider>{() => "分页栏"}</Divider> : null}
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
																				<Tooltip title="计算字段不会展示给填写用户，仅根据表单数据自动计算，可用于统计等用途">
																					<span class={"item-computed-badge"}>
																						<CalculatorOutlined style={{ marginRight: 4 }} />
																						计算字段
																					</span>
																				</Tooltip>
																			) : null}
																		</span>
																	</div>
																),
															},
															...element.props,
														},
														state.submitForm,
														{ props: {} }
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
						<Tooltip title={"清空表单"}>
							<Button
								type={"default"}
								danger
								icon={<DeleteOutlined />}
								onClick={onClearForm}
							>
								清空表单
							</Button>
						</Tooltip>
						<Space span={8}>
							<Badge count={logicRules.value.length} offset={[-4, 0]}>
								<Button
									type={"default"}
									icon={<FunctionOutlined />}
									onClick={() => {
										state.showLogicPanel = true;
									}}
								>
									表单逻辑
								</Button>
							</Badge>
							<Button type={"primary"} icon={<SaveOutlined />} onClick={onSubmit}>
								保存表单
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
														{() => "设置选项"}
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
														{() => "设置行标题"}
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
										previewData={state.submitForm}
										fieldKey={state.currentItem.props.key}
									/>
								</div>
							) : null,
						]
					) : (
						<div class={"empty-props"}>
							<Empty description={"未选中内容"}></Empty>
						</div>
					)}
				</div>
			);

			const optionsEditorElem = () => (
				<Modal v-model:open={state.showOptionsModal} title={"选项设置"} onOk={onSubmitOptions}>
					{() => [
						<Alert
							message={
								props.mode === "quiz"
									? "每行一个选项，选项不能重复，选项序号A, B, C, D...会自动添加"
									: "每行一个选项，选项不能重复"
							}
							style={{ marginBottom: "10px" }}
						></Alert>,
						<Textarea
							v-model:value={state.optionsValue}
							placeholder={"每行一个选项，如：\n选项一\n选项二"}
							auto-size={{ minRows: 14, maxRows: 14 }}
						></Textarea>,
					]}
				</Modal>
			);

			const valueOptionsEditorElem = () => (
				<Modal
					v-model:open={state.showValueOptionsModal}
					title={"选项设置"}
					onOk={onSubmitValueOptions}
				>
					{() => [
						<Alert
							message={"每行一个选项，且选项不能重复"}
							style={{ marginBottom: "10px" }}
						></Alert>,
						<Row gutter={8}>
							{() => [
								<Col span={14}>
									{() => [
										<div>选项</div>,
										<Textarea
											v-model:value={state.optionsValue}
											placeholder={"每行一个选项，如：\n选项一\n选项二"}
											auto-size={{ minRows: 14, maxRows: 14 }}
										></Textarea>,
									]}
								</Col>,
								<Col span={10}>
									{() => [
										<Dropdown>
											{{
												default: () => (
													<div>
														<a class="ant-dropdown-link">
															分值(不填代表0分)
															<DownOutlined style={{ marginLeft: "4px", fontSize: "12px" }} />
														</a>
													</div>
												),
												overlay: () => (
													<Menu onClick={onRateGenerate}>
														{() => [
															<MenuItem key={"increase"}>{() => "分数从 1 开始顺序递增"}</MenuItem>,
															<MenuItem key={"add1"}>{() => "选项分数全部加 1"}</MenuItem>,
															<MenuItem key={"minus1"}>{() => "选项分数全部减 1"}</MenuItem>,
														]}
													</Menu>
												),
											}}
										</Dropdown>,
										<Textarea
											v-model:value={state.rateValue}
											placeholder={"每行一个对应分值，如：\n1\n2"}
											auto-size={{ minRows: 14, maxRows: 14 }}
										></Textarea>,
									]}
								</Col>,
							]}
						</Row>,
					]}
				</Modal>
			);

			return (
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
			);
		};
	},
});
