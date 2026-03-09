import { Textarea } from "ant-design-vue";
import { computed, ref } from "vue";
import { find, isArray, isString } from "lodash-es";
import { useT } from "../../../hooks/index.js";

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
    { label: useT("search.exclude"), value: "exclude" },
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  const displayValue = computed(() => {
    if (queryForm[item.key].value && isString(queryForm[item.key].value)) {
      return queryForm[item.key].value.trim().split("\n").join(",");
    } else if (queryForm[item.key].value && isArray(queryForm[item.key].value)) {
      return queryForm[item.key].value.join(",");
    }
    return "";
  });

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
    let value = null,
      searchLabel = null;

    const conditionLabel = find(conditions, { value: queryForm[item.key].condition })?.label;

    value = null;
    if (queryForm[item.key].value && isString(queryForm[item.key].value)) {
      value = queryForm[item.key].value.trim().split("\n");
    } else if (queryForm[item.key].value && isArray(queryForm[item.key].value)) {
      value = queryForm[item.key].value;
    }

    searchLabel = value ? `${item.title}${conditionLabel}: ${value?.join(",")}` : null;

    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    inputRef.value?.focus();
  };

  const Component = (
    <Textarea
      ref={inputRef}
      v-model:value={queryForm[item.key].value}
      allowClear={true}
      class={`${searchProvider.inputClass || ""}`}
      style={{ width: "200px" }}
      autoSize={{ minRows: 4, maxRows: 8 }}
      placeholder={useT("search.textarea-placeholder", { title: item.title })}
      {...item.inputProps}
    ></Textarea>
  );

  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
