import { Input } from "antdv-next";
import { computed, ref } from "vue";
import { find } from "lodash-es";
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
    { label: useT("search.include"), value: "include" },
    { label: useT("search.exclude"), value: "exclude" },
    { label: useT("search.null"), value: "null" },
    { label: useT("search.not-null"), value: "notNull" },
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  const displayValue = computed(() =>
    ["null", "notNull"].includes(queryForm[item.key].condition)
      ? null
      : queryForm[item.key].value
  );

  const isValuelessCondition = computed(() =>
    ["null", "notNull"].includes(queryForm[item.key].condition)
  );

  const inputRef = ref();

  /**
   * 根据条件收集组件实际的值
   */
  const collectItem = () => {
    let value = queryForm[item.key].value || null,
      searchLabel = null;

    const condition = find(conditions, { value: queryForm[item.key].condition });

    if (condition && ["null", "notNull"].includes(condition.value)) {
      value = null;
      searchLabel = `${item.title}${condition?.label}`;
    } else if (value) {
      searchLabel = `${item.title}${condition?.label}: ${value}`;
    }

    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    inputRef.value?.focus();
  };

  const Component = (
    <Input
      ref={inputRef}
      value={isValuelessCondition.value ? "" : queryForm[item.key].value}
      onUpdate:value={value => {
        if (isValuelessCondition.value) return;
        queryForm[item.key].value = value;
      }}
      allowClear={true}
      disabled={isValuelessCondition.value}
      class={`${searchProvider.inputClass || ""}`}
      style={{ width: "100%" }}
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      {...item.inputProps}
    ></Input>
  );

  return { conditions, Component, displayValue, onComponentOpen, collectItem };
};

export default render;
