import { Input } from "ant-design-vue";
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

  const displayValue = computed(() => queryForm[item.key].value);

  const inputRef = ref();

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
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
      v-model:value={queryForm[item.key].value}
      allowClear={true}
      disabled={
        queryForm[item.key].condition === "null" || queryForm[item.key].condition === "notNull"
      }
      class={`${searchProvider.inputClass || ""}`}
      style={{ width: "200px" }}
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      {...item.inputProps}
    ></Input>
  );

  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
