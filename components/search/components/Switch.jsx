import { find } from "lodash-es";
import { computed, ref } from "vue";
import { Select } from "ant-design-vue";
import { useI18nJoin, useT } from "../../../hooks/index.js";

const render = (item, queryForm, context) => {
  const { searchProvider } = context;

  const CHECKED = "checked";
  const UNCHECKED = "unchecked";

  let conditions = [{ label: useT("search.equal"), value: "equal" }];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  const options = [
    { value: CHECKED, label: item.options?.[0] || useT("common.yes") },
    { value: UNCHECKED, label: item.options?.[1] || useT("common.no") },
  ];

  const displayValue = computed(() => {
    return find(options, { value: queryForm[item.key].value })?.label;
  });

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
    let value =
      queryForm[item.key].value === undefined ? undefined : queryForm[item.key].value === "checked";
    let searchLabel = null;

    const condition = find(conditions, { value: queryForm[item.key].condition });

    if (value) {
      searchLabel = `${item.title}${condition?.label}: ${find(options, { value: queryForm[item.key].value })?.label}`;
    }

    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    //inputRef.value?.focus()
  };

  const Component = (
    <Select
      ref={inputRef}
      v-model:value={queryForm[item.key].value}
      allowClear={true}
      options={options}
      style={{ width: "200px" }}
      class={`${searchProvider.inputClass || ""}`}
      defaultOpen={true}
      getPopupContainer={triggerNode => triggerNode.parentNode}
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      {...item.inputProps}
    ></Select>
  );

  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
