import { InputNumber, Tag } from "ant-design-vue";
import { every, find, isNumber } from "lodash-es";
import { computed, ref } from "vue";
import { useI18nJoin, useT } from "../../../hooks/index.js";

/**
 *
 * @param {SearchItemConfig} item
 * @param {Object} queryForm
 * @param {Object} context
 */
const render = (item, queryForm, context) => {
  const { searchProvider } = context;

  let conditions = [
    { label: useT("search.equal"), value: "equal" },
    { label: useT("search.not-equal"), value: "notEqual" },
    { label: useT("search.less-than"), value: "lessThan" },
    { label: useT("search.greater-than"), value: "greaterThan" },
    { label: useT("search.between"), value: "between" },
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  // 如果是介于，且第一个值大于第二个值，则交换两个值
  const onBlur = () => {
    if (
      queryForm[item.key].condition === "between" &&
      queryForm[item.key].value &&
      isNumber(queryForm[item.key].value[0]) &&
      isNumber(queryForm[item.key].value[1]) &&
      queryForm[item.key].value[0] > queryForm[item.key].value[1]
    ) {
      const temp = queryForm[item.key].value[0];
      queryForm[item.key].value[0] = queryForm[item.key].value[1];
      queryForm[item.key].value[1] = temp;
    }
  };

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
    let value = null,
      searchLabel = null;

    const conditionLabel = find(conditions, { value: queryForm[item.key].condition })?.label;

    if (
      queryForm[item.key].condition === "between" &&
      queryForm[item.key].value &&
      every(queryForm[item.key].value, isNumber)
    ) {
      value = queryForm[item.key].value;
      searchLabel = `${item.title}${conditionLabel}: ${value[0]} - ${value[1]} `;
    } else if (
      queryForm[item.key].condition !== "between" &&
      queryForm[item.key].value &&
      isNumber(queryForm[item.key].value[0])
    ) {
      value = queryForm[item.key].value[0];
      searchLabel = `${item.title}${conditionLabel}: ${value}`;
    }
    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    inputRef.value?.focus();
  };

  const displayValue = computed(() => {
    if (
      queryForm[item.key].condition === "between" &&
      queryForm[item.key].value &&
      every(queryForm[item.key].value, isNumber)
    ) {
      return [
        <Tag style={{ marginRight: 0 }}>{{ default: () => queryForm[item.key].value[0] }}</Tag>,
        <span> - </span>,
        <Tag>{{ default: () => queryForm[item.key].value[1] }}</Tag>,
      ];
    }
    return queryForm[item.key].value[0];
  });

  let Component = [
    <InputNumber
      ref={inputRef}
      v-model:value={queryForm[item.key].value[0]}
      style={{ width: "200px" }}
      class={`${searchProvider.inputClass || ""}`}
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      onBlur={onBlur}
      {...item.inputProps}
    ></InputNumber>,
  ];

  if (queryForm[item.key].condition === "between") {
    Component = (
      <div style={{ display: "flex", alignItems: "center" }}>
        {Component.concat([
          <span style={{ margin: "0 8px" }}>-</span>,
          <InputNumber
            v-model:value={queryForm[item.key].value[1]}
            style={{ width: "200px" }}
            class={`${searchProvider.inputClass || ""}`}
            placeholder={useT("form.please-input")}
            onBlur={onBlur}
            {...item.inputProps}
          ></InputNumber>,
        ])}
      </div>
    );
  }
  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
