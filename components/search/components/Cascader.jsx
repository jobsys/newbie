import { Cascader } from "ant-design-vue";
import { computed, ref } from "vue";
import { find, findIndex, isFunction } from "lodash-es";
import { useFindLabelsFromPath, useI18nJoin, useT } from "../../../hooks/index.js";

/**
 *
 * @param {SearchItemConfig} item
 * @param {Object} queryForm
 * @param {Object} context
 */
const render = (item, queryForm, context) => {
  const { searchProvider } = context;

  let options = isFunction(item.options) ? item.options() : item.options;

  let conditions = [
    { label: useT("search.equal"), value: "equal" },
    { label: useT("search.not-equal"), value: "notEqual" },
    { label: useT("search.include-sub"), value: "include" },
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  const displayValue = computed(() =>
    useFindLabelsFromPath(options, queryForm[item.key].value, item.inputProps?.fieldNames).join("/")
  );

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
    let value = queryForm[item.key].value || null,
      searchLabel = null;

    const conditionLabel = find(conditions, { value: queryForm[item.key].condition })?.label;

    if (value) {
      searchLabel = `${item.title}${conditionLabel}: ${useFindLabelsFromPath(options, value, item.inputProps?.fieldNames).join("/")}`;
    }

    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    inputRef.value?.focus();
  };

  const Component = (
    <Cascader
      ref={inputRef}
      v-model:value={queryForm[item.key].value}
      allowClear={true}
      open={true}
      class={`${searchProvider.inputClass || ""}`}
      style={{ width: "200px" }}
      options={options}
      changeOnSelect={findIndex(conditions, { value: "include" }) > -1}
      showSearch={true}
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      getPopupContainer={triggerNode => triggerNode?.parentNode}
      {...item.inputProps}
    ></Cascader>
  );

  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
