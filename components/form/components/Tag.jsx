import { Tag, Input, message, TimePicker, TimeRangePicker } from "ant-design-vue";
import { nextTick, withModifiers } from "vue";
import { PlusOutlined } from "@ant-design/icons-vue";
import { isFunction } from "lodash-es";
import { genPixel } from "../../../utils/style.js";

/**
 * 标签输入框
 *
 * @param {NewbieFormItemConfig} item 字段配置
 * @param {Object} submitForm Form 数据
 * @param itemState
 * @return {JSX.Element}
 */
const render = (item, submitForm, itemState) => {
  if (!Object.keys(itemState).length) {
    itemState.value = null;
  }
  let tagElements = submitForm[item.key]?.length
    ? submitForm[item.key].map(tag => {
        return (
          <Tag
            key={tag}
            closable={!item.disabled}
            style={{ marginBottom: "10px" }}
            onClose={() => {
              submitForm[item.key] = submitForm[item.key].filter(item => item !== tag);
            }}
          >
            {tag}
          </Tag>
        );
      })
    : null;

  let inputElements = null;

  if (item.disabled || item.readonly) {
    inputElements = null;
  } else if (item.defaultProps?.inputType === "time") {
    inputElements = (
      <TimePicker
        v-model:value={itemState.value}
        disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
        format={item.defaultProps?.format || "HH:mm"}
        onChange={time => {
          if (!time) {
            return;
          }
          const value = time.format(item.defaultProps?.format || "HH:mm");

          if (submitForm[item.key].indexOf(value) !== -1) {
            message.warn("时间已存在");
            return;
          }

          submitForm[item.key].push(value);
          nextTick(() => {
            itemState.value = "";
          });
        }}
      ></TimePicker>
    );
  } else if (item.defaultProps?.inputType === "time_range") {
    inputElements = (
      <TimeRangePicker
        v-model:value={itemState.value}
        disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
        format={item.defaultProps?.format || "HH:mm"}
        onChange={time => {
          if (!time) {
            return;
          }
          let value = [
            time[0].format(item.defaultProps?.format || "HH:mm"),
            time[1].format(item.defaultProps?.format || "HH:mm"),
          ];
          value = value.join("至");
          if (submitForm[item.key].indexOf(value) !== -1) {
            message.warn("时间已存在");
            return;
          }

          submitForm[item.key].push(value);
          nextTick(() => {
            itemState.value = [];
          });
        }}
      ></TimeRangePicker>
    );
  } else {
    inputElements = (
      <Input
        v-model:value={itemState.value}
        disabled={isFunction(item.disabled) ? item.disabled(submitForm) : item.disabled}
        placeholder={item.placeholder || "按Enter键确认"}
        style={item.style || { width: genPixel(item.width || "200px") }}
        onPressEnter={withModifiers(
          e => {
            e.preventDefault();
            if (e.keyCode === 13 && itemState.value) {
              if (submitForm[item.key].indexOf(itemState.value) !== -1) {
                message.warn("标签已存在");
                return;
              }
              submitForm[item.key].push(itemState.value);
              itemState.value = "";
            }
          },
          ["stop"]
        )}
      >
        {{
          prefix: () => <PlusOutlined />,
        }}
      </Input>
    );
  }

  return <div class={`newbie-form-tag`}>{[tagElements, inputElements]}</div>;
};

export default render;
