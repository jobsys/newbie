import { computed, defineComponent, inject, onMounted, reactive, ref, watch } from "vue";
import { cloneDeep, every, isEqual, isFunction, isObject, isString, pick } from "lodash-es";
import {
  useFetch,
  useFormFail,
  useFormFormat,
  useI18nJoin,
  useProcessStatusSuccess,
} from "../../hooks";
import { Button, Card, Form, message, Modal, Skeleton, Space } from "ant-design-vue";
import createLayout from "./components/Layout.jsx";
import { NEWBIE_UPLOADER, NEWBIE_FORM } from "../provider/NewbieProvider.jsx";
import "./index.less";
import { initItemDefaultValue } from "./utils";
import { useI18n } from "vue-i18n";

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
     *
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
     * 当 breakMode 为 `divider` 时，divider 的配置[原生分割线配置](https://www.antdv.com/components/divider-cn)
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
     * @property {number|Array|string} [columnIndex] 渲染在哪一列，默认为0，第一列
     * @property {boolean|string} [break] 新起一行，默认为false，如果为 String 则以 Divider 分割
     * @property {Object} [defaultProps] 组件的配置
     * @property {Object} [defaultSlots] 组件的默认插槽
     * @property {Object} [formItemProps] FormItem 的原生配置
     * @property {Object} [formItemSlots] FormItem 的原生Slot配置
     * @property {*} [defaultValue] 默认值，默认是空字符串
     * @property {Array.<NewbieFormItemConfig>|Function} [children] 子表单配置
     * @property {Array} [childrenOperations] 子表单操作
     * @property {Object} [cellProps] 单元格的配置
     */

    /**
     * 表单配置，[见表单项配置](#newbieformitemconfig-表单项配置)
     */
    form: {
      type: [Array, Function],
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
     * @return {Boolean|Object} return false会阻止提交操作，return Object会替换提交的数据
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
     * 原生的 [From](https://www.antdv.com/components/form-cn#api) 配置
     */
    formProps: { type: Object, default: () => ({}) },
  },
  emits: ["success"],
  setup(props, { expose, slots, emit }) {
    const { t, locale } = useI18n();

    const editorRef = ref(null); //总的容器

    const state = reactive({
      temporary: {}, // 用于存放一些临时数据
      submitFetcher: {
        loading: false,
      },
      isInitializing: true, //是否正在初始化
      submitForm: {}, //提交表单，初始化数据后会生成
      submitFormBackup: {}, //初始化后的表单数据备份，用于重置表单以及脏数据判断
    });

    const uploaderProvider = inject(NEWBIE_UPLOADER, () => ({}));
    const formProvider = inject(NEWBIE_FORM, () => ({}));
    const formState = {}; // 用于记录各个表单项的状态

    const formItems = computed(() => {
      const items = isFunction(props.form) ? props.form() : props.form;
      return items.map(item => {
        if (!item.type) {
          item.type = "input";
        }
        if (formProvider?.columns?.[item.type]) {
          item = { ...formProvider.columns[item.type], ...item };
        }

        if (!formState[item.key]) {
          formState[item.key] = reactive({});
        }

        return item;
      });
    });

    watch(
      () => props.data,
      data => {
        initFormData(data || "");
      }
    );

    const init = () => {
      state.isInitializing = false;
      initFormData(props.data || "");
    };

    onMounted(() => {
      let auto = false;
      if (props.autoLoad && props.fetchUrl) {
        auto = true;
        if (props.autoLoad && isObject(props.autoLoad)) {
          auto = every(Object.values(pick(props.extraData, Object.keys(props.autoLoad))));
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
      // 如果有 FormData, 则从中提取 FormItem 中有定义的数据，并进行初始化后存放于 extractFormData
      // 无 FromData 则直接使用 FormItem 的 defaultValue
      let extractFormData = {};
      let existingData = formData ? cloneDeep(formData) : false;

      formItems.value.forEach(item => {
        //处理组合组件，只允许一层嵌套
        if (item.type === "combiner") {
          item.children.forEach(child => {
            extractFormData[child.key] = initItemDefaultValue(
              child,
              existingData,
              state.submitForm,
              { uploaderProvider }
            );
          });
        } else {
          extractFormData[item.key] = initItemDefaultValue(item, existingData, state.submitForm, {
            uploaderProvider,
          });
        }
      });

      if (existingData) {
        // 将初始化后的数据覆盖原有数据，并保留不在 FormItems 中的数据
        extractFormData = { ...existingData, ...extractFormData };
      }

      state.submitForm = extractFormData;
      state.submitFormBackup = cloneDeep(extractFormData);
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
              } else if (formProvider.afterFetched && isFunction(formProvider.afterFetched)) {
                res = formProvider.afterFetched(res);
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
            let form = cloneDeep(state.submitForm);

            const itemsWithBeforeSubmit = formItems.value
              .map(item => {
                if (item.match) {
                  // match 的属性需要在这里处理
                  return { ...item, ...item.match(form) };
                }
                return item;
              })
              .filter(item => item.beforeSubmit && isFunction(item.beforeSubmit));

            for (const item of itemsWithBeforeSubmit) {
              form[item.key] = await item.beforeSubmit({
                value: form[item.key],
                submitForm: form, //将 form 传出去，这样可以增删 form 里的参数
              });
            }

            form = useFormFormat(form, formProvider.format || {});

            if (props.beforeSubmit && isFunction(props.beforeSubmit)) {
              form = await props.beforeSubmit({ formatForm: form, originalForm: state.submitForm });
              // 如果返回 false 则阻止提交
              if (form === false) {
                return resolve();
              }
            }

            let res = await useFetch(state.submitFetcher).post(props.submitUrl, form);

            //提交后再次备份表单数据，isDirty 检测即为 false
            state.submitFormBackup = cloneDeep(state.submitForm);

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
      editorRef.value.resetFields();
    };

    /**
     * 获取复制的表单数据
     * @return {*}
     */
    const getFormStandalone = () => cloneDeep(state.submitForm);

    /**
     * 获取表单实时数据，慎用，会改变内部的值
     * @return {*}
     */
    const getFormRealtime = () => state.submitForm;

    /**
     * 获取表单的字段值
     * @param {String} key
     * @return {*}
     */
    const getField = key => cloneDeep(state.submitForm[key]);

    /**
     *
     * 设置表单数据
     * @param {Object} fields
     */
    const setForm = fields => {
      Object.keys(fields).forEach(key => {
        state.submitForm[key] = fields[key];
      });
    };

    /**
     * 判断表单是否被修改
     * @return {boolean}
     */
    const isDirty = () => {
      return !isEqual(state.submitForm, state.submitFormBackup);
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

    const submitBtnElem = () => {
      const submitBtn = () => (
        <Button
          loading={state.submitFetcher.loading}
          type={"primary"}
          htmlType={"submit"}
          disabled={props.submitDisabled}
          onClick={() => {
            if (props.submitConfirmText) {
              Modal.confirm({
                content: props.submitConfirmText,
                onOk() {
                  onSubmit();
                },
              });
            } else {
              onSubmit();
            }
          }}
        >
          {{
            default: () =>
              `${props.submitButtonText || t("common.save")}${state.submitFetcher.loading ? "..." : ""}`,
          }}
        </Button>
      );

      const closeBtn = () => (
        <Button
          type={"default"}
          onClick={() => {
            if (props.close && isFunction(props.close)) {
              props.close();
            }
          }}
        >
          {{ default: () => props.closeButtonText || t("common.close") }}
        </Button>
      );

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
      createLayout(formItems.value, state.submitForm, submitBtnElem(), {
        props,
        slots,
        formState,
      });

    const formElem = () => (
      <Form
        model={state.submitForm}
        ref={editorRef}
        class={`newbie-form`}
        labelCol={{ span: 6 }}
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
