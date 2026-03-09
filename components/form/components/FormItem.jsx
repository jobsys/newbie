import { FormItem, FormItemRest, Switch } from "ant-design-vue";

import * as Fields from "./index.js";
import { inject, ref } from "vue";
import { NEWBIE_FORM, NEWBIE_UPLOADER } from "../../provider/NewbieProvider.jsx";
import { isBoolean, isFunction, isUndefined } from "lodash-es";
import { initItemDefaultValue, isOptionalChecked, placeholder } from "../utils.js";
import { useI18n } from "vue-i18n";

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
const render = (item, submitForm, { props, slots, formState }) => {
  const { t } = useI18n();
  const uploaderProvider = inject(NEWBIE_UPLOADER, () => ({}));
  const formProvider = inject(NEWBIE_FORM, () => ({}));

  //如果未经过 defaultValue 初始化，则进行初始化
  if (isUndefined(submitForm[item.key]) && item.key) {
    submitForm[item.key] = initItemDefaultValue(item, {}, submitForm, {
      formProvider,
      uploaderProvider,
    });
  }

  let renderItem = null,
    rules = item.rules?.length
      ? item.rules.map(rule => {
          if (rule.pattern) {
            return {
              ...rule,
              pattern: new RegExp(rule.pattern),
            };
          }
          return { ...rule };
        })
      : [],
    requiredRule = {
      required: true,
      message: item.requiredMessage || placeholder(item, "select"),
    };
  item.type = item.type ? item.type.toLowerCase() : item.type;

  // 处理 required
  const isRequired = isFunction(item.required) ? item.required(submitForm) : item.required;

  // 处理 readonly 和 disabled
  item.readonly = item.readonly || props.readonly;

  item.disabled = item.disabled || props.disabled || props.readonly || item.readonly;

  if (item.readonly || item.disabled) {
    item.placeholder = "--";
  }

  /**** 开始渲染 ****/
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
    return render(matchItem, submitForm, { props, slots });
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
        break;
      case "time":
        renderItem = Fields.createTime(item, submitForm);
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
          if (!Object.keys(uploaderProvider).length) {
            console.error("Please inject NEWBIE_UPLOADER config in root component");
            renderItem = null;
            break;
          }

          if (item.defaultProps?.maxNum && item.defaultProps?.maxNum > 1) {
            requiredRule.type = "array";
            requiredRule.message = item.requiredMessage || placeholder(item, "upload");
          } else {
            requiredRule.type = "object";
            requiredRule.message = item.requiredMessage || placeholder(item, "upload");
            requiredRule.fields = {
              [uploaderProvider.defaultFileItem.path]: {
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
        renderItem = Fields.createCombiner(item, submitForm, { props, slots });
        break;
      default:
        renderItem = Fields.createInput(item, submitForm);
        requiredRule.message = item.requiredMessage || placeholder(item);
        requiredRule.trigger = "blur";
        requiredRule.type = "string";
        break;
    }
  }

  if (isRequired) {
    if (rules.length) {
      rules[0].required = true;
    } else {
      rules.push(requiredRule);
    }
  }

  // FormItem props
  let itemProps = {
    label: item.title,
    name: item.key,
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
    if (isUndefined(item.optionalValue)) {
      const isChecked = isOptionalChecked(item, submitForm);
      item.optionalValue = ref(isChecked);
    }
    // 如果切换为 false, 则把 value 赋为 null
    // 由原来的赋 undefined 改为 null, 因为 undefined 会被 FormItem 认为是未填写
    optionalRenderItem = (
      <div class={"newbie-form__optional"}>
        <FormItemRest>
          <Switch
            v-model:checked={item.optionalValue.value}
            checkedChildren={item.optional?.[0] || ""}
            unCheckedChildren={item.optional?.[1] || ""}
            onChange={checked => !checked && (submitForm[item.key] = null)}
          ></Switch>
        </FormItemRest>
        <div class={"newbie-form__optional-content"}>
          {item.optionalValue.value ? renderItem : false}
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
