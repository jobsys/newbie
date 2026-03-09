import { computed, ref, watch } from "vue";
import { every, find, isFunction, isNull, isNumber, isString, isUndefined } from "lodash-es";
import { Select, Space, Tag } from "ant-design-vue";
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
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  let options = isFunction(item.options) ? item.options() : item.options;
  options = options.map(op => (isString(op) || isNumber(op) ? { value: op, label: op } : op));

  const displayValue = computed(() => {
    return (
      <Space>
        {{
          default: () =>
            queryForm[item.key].value.map(val => {
              return <Tag>{{ default: () => find(options, { value: val })?.label }}</Tag>;
            }),
        }}
      </Space>
    );
  });

  watch(
    () => queryForm[item.key].condition,
    val => {
      if (["equal", "notEqual"].includes(val)) {
        queryForm[item.key].value = queryForm[item.key].value?.[0]
          ? [queryForm[item.key].value[0]]
          : [];
      }
    }
  );

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  item.collectItem = () => {
    let value = null,
      searchLabel = null;

    const conditionLabel = find(conditions, { value: queryForm[item.key].condition })?.label;

    if (
      ["equal", "notEqual"].includes(queryForm[item.key].condition) &&
      !isUndefined(queryForm[item.key].value?.[0]) &&
      !isNull(queryForm[item.key].value?.[0])
    ) {
      value = queryForm[item.key].value?.[0] || null;
      searchLabel = `${item.title}${conditionLabel}: ${find(options, { value })?.label}`;
    } else if (
      !["equal", "notEqual"].includes(queryForm[item.key].condition) &&
      every(queryForm[item.key].value, val => !isNull(val) && !isUndefined(val))
    ) {
      value = queryForm[item.key].value;
      const label = value.map(val => find(options, { value: val })?.label)?.join(",");
      searchLabel = `${item.title}${conditionLabel}: ${label}`;
    }
    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    //inputRef.value?.focus()
  };

  const Component = ["equal", "notEqual"].includes(queryForm[item.key].condition) ? (
    <Select
      ref={inputRef}
      v-model:value={queryForm[item.key].value[0]}
      allowClear={true}
      options={options}
      style={{ width: "200px" }}
      class={`${searchProvider.inputClass || ""}`}
      defaultOpen={true}
      filterOption={true}
      showSearch={true}
      optionFilterProp="label"
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      getPopupContainer={triggerNode => triggerNode.parentNode}
      {...item.inputProps}
    ></Select>
  ) : (
    <Select
      ref={inputRef}
      v-model:value={queryForm[item.key].value}
      allowClear={true}
      options={options}
      mode={"multiple"}
      class={`${searchProvider.inputClass || ""}`}
      style={{ width: "200px" }}
      defaultOpen={true}
      filterOption={true}
      optionFilterProp="label"
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      getPopupContainer={triggerNode => triggerNode.parentNode}
      {...item.inputProps}
    ></Select>
  );

  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
