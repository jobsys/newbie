import { Cascader } from "antdv-next";
import { computed, ref, watch } from "vue";
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
    { label: useT("search.null"), value: "null" },
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  // 为空不消耗值，切到为空时清掉已选的地区，避免残留
  watch(
    () => queryForm[item.key].condition,
    val => {
      if (val === "null") {
        queryForm[item.key].value = [];
      }
    }
  );

  const displayValue = computed(() => {
    if (queryForm[item.key].condition === "null") {
      return null;
    }

    return useFindLabelsFromPath(options, queryForm[item.key].value, item.inputProps?.fieldNames).join("/");
  });

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
    let value = queryForm[item.key].value || null,
      searchLabel = null;

    const condition = find(conditions, { value: queryForm[item.key].condition });

    if (condition?.value === "null") {
      return { value: null, searchLabel: `${item.title}${condition.label}` };
    }

    if (value) {
      searchLabel = `${item.title}${condition?.label}: ${useFindLabelsFromPath(options, value, item.inputProps?.fieldNames).join("/")}`;
    }

    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    inputRef.value?.focus();
  };

  const Component =
    queryForm[item.key].condition === "null" ? (
      // 为空不需要选地区，禁用级联
      <Cascader
        ref={inputRef}
        disabled={true}
        value={undefined}
        class={`${searchProvider.inputClass || ""}`}
        style={{ width: "200px" }}
        options={options}
        placeholder={useI18nJoin(useT("common.search"), item.title)}
        getPopupContainer={triggerNode => triggerNode?.parentNode}
        {...item.inputProps}
      ></Cascader>
    ) : (
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
