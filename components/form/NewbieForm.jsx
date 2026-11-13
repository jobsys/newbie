import {computed, defineComponent, inject, onBeforeUnmount, onMounted, reactive, ref, watch, watchEffect} from "vue";
import {cloneDeep, isArray, isEqual, isFunction, isObject, isString} from "lodash-es";
import {useFetch, useFormFail, useFormFormat, useI18nJoin, useProcessStatusSuccess,} from "../../hooks";
import {Button, Card, Form, message, Modal, Skeleton, Space} from "antdv-next";
import createLayout from "./components/Layout.jsx";
import {formDefaults} from "./config.js";
import {uploaderDefaults} from "../uploader/config.js";
import {useNewbieConfig} from "../../hooks/useMergedProps.js";
import "./index.less";
import {applyRangeKeys, initItemDefaultValue} from "./utils";
import { useLocale } from "../../hooks/i18n.js";
import {computeVisibility} from "./utils/rule-engine";
import {normalizeFormConfig} from "./utils/normalize-form-config";
import {calcFormula} from "./utils/formula-engine";
import {createFormModel} from "./model";
import {NEWBIE_MODAL_ACTIONS} from "../modal/context.js";

/**
 * `data` 支持对象或 JSON 字符串。
 * 字符串先按 JSON 解析；解析失败或结果不是对象时忽略并告警，
 * 避免 `{ ...existingData }` 把字符串展开成 `{0: "a", 1: "b"}` 这样的字符索引对象。
 *
 * @param {Object|String} data
 * @return {Object|String} 可用于初始化表单的数据，空值返回 ""
 */
const normalizeFormData = data => {
	if (!isString(data)) {
		return data || "";
	}

	if (!data.trim()) {
		return "";
	}

	try {
		const parsed = JSON.parse(data);
		if (parsed && typeof parsed === "object" && !isArray(parsed)) {
			return parsed;
		}
	} catch {
		// 解析失败时走下面的告警分支
	}

	console.warn("NewbieForm: data 不是合法的 JSON 对象字符串，本次数据已忽略");
	return "";
};

/**
 * 表单组件
 *
 * 通过 JSON 配置生成表单，并集成表单验证，获取数据，提交数据等功能。
 *
 *
 * @version 1.0.0
 */
export default defineComponent({
	name: "NewbieForm",
	props: {
		/**
		 * 表单标题，Card 模式下生效
		 */
		title: { type: String, default: "" },

		/**
		 * 表单数据，用于初始化表单，并会进行 Watch
		 * 支持对象或 JSON 字符串（字符串会按 JSON 解析，解析失败或不是对象时忽略并告警）
		 */
		data: { type: [Object, String], default: "" },

		/**
		 * 是否自动加载
		 * `true` 表示自动加载数据
		 * `Array,String` 表示会对 `extraData` 数据中的相关字段进行非空验证，不为空再加载数据
		 */
		autoLoad: {
			//自动加载数据,在fetchData里找
			type: [Boolean, Array, String],
			default: true,
		},

		/**
		 * 获取表单数据的URL
		 */
		fetchUrl: { type: String, default: "" },

		/**
		 * 额外的数据，在提交时会合并到表单数据中并一起提交
		 */
		extraData: { type: Object, default: () => ({}) },

		/**
		 * 提交数据URL
		 */
		submitUrl: { type: String, default: "" },

		/**
		 * 提交按钮文字
		 */
		submitButtonText: { type: String, default: "" },

		/**
		 * 提交确认提示内容
		 */
		submitConfirmText: { type: String, default: "" },

		/**
		 * 是否显示关闭按钮
		 */
		closable: { type: Boolean, default: true },

		/**
		 * 关闭按钮文字
		 */
		closeButtonText: { type: String, default: "" },

		/**
		 * 是否将`关闭`按钮放在`提交`按钮前面
		 */
		closeButtonFirst: { type: Boolean, default: false },

		/**
		 * 是否隐藏按钮
		 */
		hideButtons: { type: Boolean, default: false },

		/**
		 * 是否把保存 / 关闭按钮交给外层 NewbieModal 渲染（固定在 Modal / Drawer 底部）
		 * 仅在 NewbieForm 位于 NewbieModal 内时生效；不满足时按钮仍渲染在表单底部
		 */
		buttonsInFooter: { type: Boolean, default: false },

		/**
		 * 关闭前检测脏数据（表单有未保存修改时二次确认）
		 * - `true`：使用默认文案
		 * - `Object`：`{ title, content, okText, cancelText }` 自定义确认框文案
		 *
		 * 在 NewbieModal 内时，弹层右上角关闭、点击遮罩等关闭方式也会走同一套确认。
		 */
		confirmOnClose: { type: [Boolean, Object], default: false },

		/**
		 * 是否禁用表单
		 */
		disabled: { type: Boolean, default: false },

		/**
		 * 是否只读
		 */
		readonly: { type: Boolean, default: false },

		/**
		 * 是否禁用提交按钮
		 */
		submitDisabled: { type: Boolean, default: false },

		/**
		 * 分隔类型，默认为 `divider` 分割线
		 * @values divider, collapse
		 */
		breakMode: { type: String, default: "divider" },

		/**
		 * 当 breakMode 为 `divider` 时，divider 的配置[原生分割线配置](https://www.antdv-next.com/components/divider-cn)
		 */
		dividerProps: { type: Object, default: () => ({}) },

		/**
		 * 表单布局，默认为单列，当为多列时，按 24 栅格布局
		 * 如：columns: [12, 12]
		 */
		columns: { type: Array, default: () => [24] },

		/**
		 * 如有 fixed 列，默认 fixed 列的宽度为 6，可自定义
		 */
		fixedColumns: { type: Number, default: 6 },

		/**
		 * 表单 Label 是否自动换行
		 * 默认开启，超长 Label 会换行显示而不是被截断
		 */
		labelWrap: { type: Boolean, default: true },

		/**
		 * 是否用 `Card` 包裹
		 */
		cardWrapper: { type: Boolean, default: true },

		/**
		 * Card 的配置
		 */
		cardProps: {
			type: Object,
			default: () => {},
		},

		/**
		 * Card 的Slots
		 */
		cardSlots: {
			type: Object,
			default: () => {},
		},

		/**
		 *
		 * 表单配置
		 *
		 * @typedef {Object} NewbieFormItemConfig
		 * @property {string} key 数据库关联名称
		 * @property {string} title 显示的名字
		 * @property {string} [type] 类型,默认是input
		 * @property {array|Function} [rows] 矩阵组件行标题
		 * @property {array|Function} [options] 组件选项
		 * @property {string} [placeholder] 组件里的提示
		 * @property {string|Function} [help] form item里的提示
		 * @property {array} [rules] 验证规则
		 * @property {string|number} [width] 组件宽度
		 * @property {string} [style] 样式
		 * @property {string} [class] 类名
		 * @property {boolean|Function} [required] 是否必填,默认是false
		 * @property {string} [requiredMessage] 必填项提示消息
		 * @property {boolean} [readonly] 是否只读,默认是false
		 * @property {boolean|Function} [disabled] 组件不可编辑状态,默认为 false
		 * @property {boolean|Function} [hidden] 组件是否隐藏,默认为 false
		 * @property {boolean|Array} [optional] 表单项是否开启后才可以输入
		 * @property {Function} [init] 初始化函数，用于初始化表单项的值
		 * @property {Function} [beforeSubmit] 在提交前修改表单项的值，该函数会在 NewbieForm 的 beforeSubmit 之前调用
		 * @property {Function} [match] 支持根据条件返回不同的配置进行动态渲染
		 * @param {String} [formula] 公式，类型为 computed 时需要指定 formula
		 * @property {number|Array|string} [columnIndex] 渲染在哪一列，默认为0，第一列
		 * @property {number} [rowSpan] 多列布局下占用的行数，默认为 1，单列布局下无效
		 * @property {boolean|string} [break] 新起一行，默认为false，如果为 String 则以 Divider 分割
		 * @property {Object} [defaultProps] 组件的配置
		 * @property {Object} [defaultSlots] 组件的默认插槽
		 * @property {Object} [formItemProps] FormItem 的原生配置
		 * @property {Object} [formItemSlots] FormItem 的原生Slot配置
		 * @property {*} [defaultValue] 默认值，默认是空字符串
		 * @property {Array.<NewbieFormItemConfig>|Function} [children] 子表单配置
		 * @property {Array} [childrenOperations] 子表单操作
		 * @property {Object} [cellProps] 单元格的配置
		 * @property {Array<string>} [rangeKeys] 区间组件（date / time 的 defaultProps.type 为 range）拆分写入的两个字段名，如 ["started_at", "ended_at"]
		 */

		/**
		 * 表单配置，[见表单项配置](#newbieformitemconfig-表单项配置)
		 */
		form: {
			type: [Array, Function, Object],
			default() {
				return [];
			},
		},

		/**
		 * fetch 返回数据处理函数
		 * @return {Object} 返回处理后的数据，将用于初始化表单
		 */
		afterFetched: { type: Function, default: null },

		/**
		 *
		 * @typedef {Object} ExposedFormData
		 * @property {Object} formatForm Format后的表单数据
		 * @property {Object} originalForm 原生的表单数据
		 *
		 *
		 * 提交数据处理函数
		 * @param {ExposedFormData} data
		 * @return {Boolean|Object|undefined|null} 返回值契约：
		 * - `false`：阻止本次提交（不会发请求）；
		 * - 对象：用返回的对象替换提交体；
		 * - `undefined` / `null`：沿用原提交体（适合只做副作用的场景）。
		 * 可以为 async 函数。
		 *
		 */
		beforeSubmit: { type: Function, default: null },

		/**
		 * 点击关闭时的动作
		 */
		close: { type: Function, default: null },

		/**
		 * 提交成功后的回调
		 */
		afterSubmit: { type: Function, default: null },

		/**
		 * 原生的 [Form](https://www.antdv-next.com/components/form-cn#form-props) 配置
		 */
		formProps: { type: Object, default: () => ({}) },
	},
	emits: ["success"],
	setup(props, { expose, slots, emit }) {
		const { t, locale } = useLocale();

		const editorRef = ref(null); //总的容器

		// 扁平数据视图：对外保持原有「点号 key」契约
		// 内部通过访问器同步到 antdv-next Form 需要的嵌套 model
		const formModel = createFormModel();
		const submitForm = formModel.flat;

		const state = reactive({
			temporary: {}, // 用于存放一些临时数据
			submitFetcher: {
				loading: false,
			},
			isInitializing: true, //是否正在初始化
			submitFormBackup: {}, //初始化后的表单数据备份，用于重置表单以及脏数据判断
			hiddenValues: {}, // 因条件逻辑被隐藏的字段值，字段重新显示时回填
		});

		const formConfigRef = useNewbieConfig("form", formDefaults);
		const uploaderConfigRef = useNewbieConfig("uploader", uploaderDefaults);
		const formState = {}; // 用于记录各个表单项的状态

		/**
		 * 底部按钮：NewbieModal 提供注册通道时，按钮由弹层渲染在底部固定区，
		 * 表单内部不再重复渲染一份。
		 */
		const modalActions = inject(NEWBIE_MODAL_ACTIONS, null);

		/** 保存 / 关闭按钮是否由弹层底部渲染 */
		const showFooterButtons = computed(
			() =>
				!!modalActions &&
				props.buttonsInFooter &&
				!props.disabled &&
				!props.readonly &&
				!props.hideButtons
		);

		/** 是否需要向 NewbieModal 注册：底部按钮 或 关闭前脏数据检查 */
		const useModalChannel = computed(
			() => !!modalActions && (props.buttonsInFooter || !!props.confirmOnClose)
		);

		const getCloseConfirm = () => {
			const config = isObject(props.confirmOnClose) ? props.confirmOnClose : {};
			return {
				title: config.title || t("common.data-changed"),
				content: config.content || t("common.discard-confirm"),
				okText: config.okText || t("common.confirm"),
				cancelText: config.cancelText || t("common.cancel"),
			};
		};

		let unregisterModalChannel = null;

		watch(
			useModalChannel,
			value => {
				if (value && !unregisterModalChannel) {
					unregisterModalChannel = modalActions.register(
						() => (showFooterButtons.value ? submitBtnElem() : null),
						{
							// 弹层自身的关闭（右上角 / 遮罩 / ESC）复用同一套脏数据判断
							isDirty: () => !!props.confirmOnClose && isDirty(),
							getConfirm: getCloseConfirm,
						}
					);
				} else if (!value && unregisterModalChannel) {
					unregisterModalChannel();
					unregisterModalChannel = null;
				}
			},
			{ immediate: true }
		);

		onBeforeUnmount(() => {
			unregisterModalChannel?.();
			unregisterModalChannel = null;
		});

		/**
		 * 字段类型的默认配置（Provider 的 `form.columnPresets`）。
		 * 兼容旧名 `form.columns`：新名没有配置时回退到旧名，
		 * 避免已有 Provider 配置失效；这与 NewbieForm 自己的 `columns`（24 栅格布局）互不影响。
		 */
		const columnPresets = computed(() => {
			const config = formConfigRef.value || {};
			const presets = config.columnPresets || {};
			if (Object.keys(presets).length) {
				return presets;
			}
			return config.columns || presets;
		});

		const formConfig = computed(() => {
			const raw = typeof props.form === "function" ? props.form() : props.form;
			return normalizeFormConfig(raw);
		});

		const formItems = computed(() => {
			const items = formConfig.value.fields;
			return items.map(item => {
				// 渲染期不写回调用方配置：无 type 时只在自己的副本上补默认值
				const normalizedItem = item.type ? item : { ...item, type: "input" };

				if (!formState[item.key]) {
					formState[item.key] = reactive({});
				}

				const preset = columnPresets.value[normalizedItem.type];
				if (preset) {
					return { ...preset, ...normalizedItem };
				}

				return normalizedItem;
			});
		});

		const fieldVisibility = computed(() => {
			const rules = formConfig.value.logic.rules;
			if (!rules.length) return {};
			return computeVisibility(rules, submitForm);
		});

		// 计算字段实时求值：读取公式依赖的字段，自动更新 computed 字段的值。
		// 不能直接 deep watch submitForm：扁平视图是动态 Proxy，初始化前没有任何 key，
		// watch 建立时采集不到依赖，后续新增的字段不会触发回调。
		const computeComputedFields = () => {
			formConfig.value.fields.forEach(item => {
				if (item.type === "computed" && item.formula) {
					const result = calcFormula(item.formula, submitForm);
					if (result && typeof result === "object" && result.error) {
						// 公式错误，不更新
					} else {
						formModel.bind(item.key);
						submitForm[item.key] = result;
					}
				}
			});
		};

		let stopComputedEffect = null;

		const startComputedEffect = () => {
			stopComputedEffect?.();
			computeComputedFields();
			stopComputedEffect = watchEffect(() => {
				computeComputedFields();
			});
		};

		onBeforeUnmount(() => {
			stopComputedEffect?.();
		});

		watch(
			() => props.data,
			data => {
				initFormData(data || "");
			}
		);

		/**
		 * 按条件逻辑显隐字段：
		 * 隐藏时把当前值暂存到 state.hiddenValues 再置为 null，
		 * 字段重新显示时回填暂存值，避免用户已填数据丢失。
		 */
		const applyFieldVisibility = () => {
			const visibility = fieldVisibility.value;
			if (!visibility || Object.keys(visibility).length === 0) {
				return;
			}
			for (const key of Object.keys(visibility)) {
				formModel.bind(key);
				if (!visibility[key]) {
					// 只暂存第一次隐藏前的值，反复应用同一份显隐结果不会覆盖暂存值
					if (!Object.prototype.hasOwnProperty.call(state.hiddenValues, key)) {
						state.hiddenValues[key] = cloneDeep(submitForm[key]);
					}
					submitForm[key] = null;
				} else if (Object.prototype.hasOwnProperty.call(state.hiddenValues, key)) {
					submitForm[key] = state.hiddenValues[key];
					delete state.hiddenValues[key];
				}
			}
		};

		watch(fieldVisibility, applyFieldVisibility, { deep: true });

		const init = () => {
			state.isInitializing = false;
			initFormData(props.data || "");
		};

		onMounted(() => {
			let auto = false;
			if (props.autoLoad && props.fetchUrl) {
				auto = true;
				if (props.autoLoad && isArray(props.autoLoad)) {
					auto = props.autoLoad.every(key => !!props.extraData[key]);
				} else if (props.autoLoad && isString(props.autoLoad)) {
					auto = !!props.extraData[props.autoLoad];
				}
			}
			if (auto) {
				fetchItem();
			} else {
				init();
			}
		});

		/**
		 * 初始化表单数据
		 *
		 * @param {Object} formData 表单数据
		 */
		const initFormData = formData => {
			// data 允许传 JSON 字符串；字符串必须先解析，否则 { ...existingData } 会把字符索引当成字段
			formData = normalizeFormData(formData);
			// 数据整体重新加载后，之前暂存的隐藏字段值已失效
			state.hiddenValues = {};

			// 如果有 FormData, 则从中提取 FormItem 中有定义的数据，并进行初始化后存放于 extractFormData
			// 无 FromData 则直接使用 FormItem 的 defaultValue
			let extractFormData = {};
			let existingData = formData ? cloneDeep(formData) : false;

			formItems.value.forEach(item => {
				//处理组合组件，只允许一层嵌套
				if (item.type === "combiner") {
					item.children.forEach(child => {
						// 无 key 的表单项（纯展示项）不能写成 "undefined" 字段
						if (!child.key) {
							return;
						}
						extractFormData[child.key] = initItemDefaultValue(
							child,
							existingData,
							submitForm,
							{ uploaderProvider: uploaderConfigRef.value }
						);
					});
				} else if (item.key) {
					extractFormData[item.key] = initItemDefaultValue(item, existingData, submitForm, {
						uploaderProvider: uploaderConfigRef.value,
					});
				}
			});

			if (existingData) {
				// 将初始化后的数据覆盖原有数据，并保留不在 FormItems 中的数据
				extractFormData = { ...existingData, ...extractFormData };
			}

			formModel.replace(extractFormData);
			applyFieldVisibility();
			startComputedEffect();
			state.submitFormBackup = cloneDeep(submitForm);
			// 数据重新加载后清掉上一轮校验状态，避免隐藏的旧错误残留
			editorRef.value?.clearValidate?.();
		};

		/**
		 * 远程拿数据模式
		 */
		const fetchItem = () => {
			if (props.fetchUrl) {
				state.isInitializing = true;
				useFetch()
					.get(props.fetchUrl, { params: props.extraData })
					.then(res => {
						state.isInitializing = false;
						useProcessStatusSuccess(res, () => {
							if (props.afterFetched && isFunction(props.afterFetched)) {
								res = props.afterFetched(res);
							} else if (
								formConfigRef.value.afterFetched &&
								isFunction(formConfigRef.value.afterFetched)
							) {
								res = formConfigRef.value.afterFetched(res);
							}
							initFormData(res);
						});
					})
					.finally(() => {
						state.isInitializing = false;
					});
			}
		};

		const onSubmit = () =>
			new Promise((resolve, reject) => {
				editorRef.value
					.validate()
					.then(async () => {
						// TODO need improve
						// 为了在 item 中也能定制 beforeSubmit 这里和下面的 useFormFormat 会重复 copy 一次 submitForm
						let form = cloneDeep(submitForm);

						const matchedItems = formItems.value.map(item => {
							if (item.match) {
								// match 的属性需要在这里处理
								return { ...item, ...item.match(form) };
							}
							return item;
						});

						const itemsWithBeforeSubmit = matchedItems.filter(
							item => item.beforeSubmit && isFunction(item.beforeSubmit)
						);

						for (const item of itemsWithBeforeSubmit) {
							// 各 beforeSubmit 会依次读取上一步写入 form 的结果，必须按配置顺序串行执行
							// eslint-disable-next-line no-await-in-loop
							form[item.key] = await item.beforeSubmit({
								value: form[item.key],
								submitForm: form, //将 form 传出去，这样可以增删 form 里的参数
							});
						}

						// 区间组件拆成两个字段（rangeKeys），需在全局 format 之前处理；
						// combiner 子项与 match 合并后的配置同样要覆盖
						form = applyRangeKeys(
							form,
							matchedItems.flatMap(item =>
								item.type === "combiner" && isArray(item.children) ? item.children : [item]
							)
						);

						form = useFormFormat(form, formConfigRef.value.format || {});

						if (props.beforeSubmit && isFunction(props.beforeSubmit)) {
							const submitResult = await props.beforeSubmit({
								formatForm: form,
								originalForm: submitForm,
							});
							// 契约：false 阻止提交；对象替换提交体；undefined / null 沿用原提交体
							if (submitResult === false) {
								return resolve();
							}
							if (submitResult && typeof submitResult === "object") {
								form = submitResult;
							}
						}

						let res = await useFetch(state.submitFetcher).post(props.submitUrl, form);

						//提交后再次备份表单数据，isDirty 检测即为 false
						state.submitFormBackup = cloneDeep(submitForm);

						if (props.afterSubmit) {
							props.afterSubmit(res);
						} else {
							useProcessStatusSuccess(res, () => {
								message.success(
									useI18nJoin(props.submitButtonText || t("common.save"), t("common.success"), {
										locale,
									})
								);
								emit("success", res);
							});
						}
						return resolve();
					})
					.catch(info => {
						useFormFail(info);
						return reject(info);
					});
			});

		/********** exposes **********/

		/**
		 * 是否在加载中
		 * @param {Boolean} value
		 */
		const isInitializing = value => {
			state.isInitializing = value;
		};

		const reset = () => {
			editorRef.value?.clearValidate?.();
			// 重置到初始化数据，隐藏字段的暂存值同样失效
			state.hiddenValues = {};
			// 直接按初始化备份重建嵌套模型，避免 antd resetFields 在动态 model 下
			// 依赖 initialValues 的行为差异（尤其是点号 key）
			formModel.replace(cloneDeep(state.submitFormBackup));
		};

		/**
		 * 获取复制的表单数据
		 * @return {*}
		 */
		const getFormStandalone = () => cloneDeep(submitForm);

		/**
		 * 获取表单实时数据，慎用，会改变内部的值
		 * @return {*}
		 */
		const getFormRealtime = () => submitForm;

		/**
		 * 获取表单的字段值
		 * @param {String} key
		 * @return {*}
		 */
		const getField = key => cloneDeep(submitForm[key]);

		/**
		 *
		 * 设置表单数据
		 * @param {Object} fields
		 */
		const setForm = fields => {
			Object.keys(fields).forEach(key => {
				formModel.bind(key);
				submitForm[key] = fields[key];
			});
		};

		/**
		 * 判断表单是否被修改
		 * @return {boolean}
		 */
		const isDirty = () => {
			return !isEqual(submitForm, state.submitFormBackup);
		};

		expose({
			submit: onSubmit,
			getForm: getFormStandalone,
			getFormStandalone,
			getFormRealtime,
			getField,
			setForm,
			reset,
			isDirty,
			isInitializing,
		});

		/********** render **********/

		const submitBtn = () => (
			<Button
				loading={state.submitFetcher.loading}
				type={"primary"}
				// 不能设 htmlType="submit"：原生 submit 会触发 antd Form 内部 validateFields，
				// 与 onClick 里的 validate 并发竞态，本侧永远 outOfDate 落败导致提交丢失
				disabled={props.submitDisabled}
				onClick={() => {
					if (props.submitConfirmText) {
						Modal.confirm({
							content: props.submitConfirmText,
							onOk() {
								onSubmit().catch(() => {});
							},
						});
					} else {
						onSubmit().catch(() => {});
					}
				}}
			>
				{{
					default: () =>
						`${props.submitButtonText || t("common.save")}${state.submitFetcher.loading ? "..." : ""}`,
				}}
			</Button>
		);

		/**
		 * 关闭表单：优先调用调用方的 close；在弹层底部渲染且未传 close 时交给 NewbieModal 关闭
		 */
		const closeForm = () => {
			if (props.close && isFunction(props.close)) {
				props.close();
				return;
			}
			if (showFooterButtons.value) {
				// 脏数据已在表单侧确认过，避免弹层再弹一次确认框
				modalActions.requestClose?.({ skipDirty: true });
			}
		};

		const onCloseClick = () => {
			if (!props.confirmOnClose || !isDirty()) {
				closeForm();
				return;
			}

			Modal.confirm({
				...getCloseConfirm(),
				onOk: closeForm,
			});
		};

		const closeBtn = () => (
			<Button type={"default"} onClick={onCloseClick}>
				{{ default: () => props.closeButtonText || t("common.close") }}
			</Button>
		);

		const submitBtnElem = () => {
			return (
				<Space size={"large"}>
					{{
						default: () =>
							props.closeButtonFirst
								? [props.closable ? closeBtn() : null, submitBtn()]
								: [submitBtn(), props.closable ? closeBtn() : null],
					}}
				</Space>
			);
		};

		const layoutElem = () =>
			createLayout(formItems.value, submitForm, submitBtnElem(), {
				props,
				slots,
				formState,
				fieldVisibility: fieldVisibility.value,
				formProvider: formConfigRef.value,
				uploaderProvider: uploaderConfigRef.value,
				hideInlineButtons: showFooterButtons.value,
			});

		const formElem = () => (
			<Form
				model={formModel.model}
				ref={editorRef}
				class={`newbie-form`}
				labelCol={{ span: 6 }}
				labelWrap={props.labelWrap}
				scrollToFirstError={true}
				{...props.formProps}
			>
				{{
					default: () => [layoutElem()],
				}}
			</Form>
		);

		const skeletonElem = () => (
			<Skeleton active paragraph={{ rows: 10 }} loading={state.isInitializing}>
				{{
					default: () => [slots.prepend?.(), formElem(), slots.append?.()],
				}}
			</Skeleton>
		);

		return () => (
			<div class={"newbie-form-wrapper"}>
				{props.cardWrapper ? (
					<Card {...props.cardProps} title={props.title}>
						{{
							default: () => skeletonElem(),
							...props.cardSlots,
						}}
					</Card>
				) : (
					skeletonElem()
				)}
			</div>
		);
	},
});
