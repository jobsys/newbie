import { computed, ref } from "vue";
import { every, find, isNull, isUndefined } from "lodash-es";
import { Select, Space, Tag } from "antdv-next";
import { useI18nJoin, useT } from "../../../hooks/index.js";
import { normalizeOptions } from "../utils.js";

// 空实现，作为渲染结果的一部分返回，供外部统一调用
const onComponentOpen = () => {
  //inputRef.value?.focus()
};

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

  const options = normalizeOptions(item.options);

  const displayValue = computed(() => {
    // 为空/不为空条件不消耗值，持久化恢复的残留选项不参与展示
    if (["null", "notNull"].includes(queryForm[item.key].condition)) {
      return null;
    }

    return (
      <Space>
        {{
          default: () =>
            (queryForm[item.key].value || []).map(val => {
              return <Tag>{{ default: () => find(options, { value: val })?.label }}</Tag>;
            }),
        }}
      </Space>
    );
  });

  const inputRef = ref(null);

  /**
   * 根据条件收集组件实际的值
   */
  const collectItem = () => {
    let value = null,
      searchLabel = null;

    const condition = find(conditions, { value: queryForm[item.key].condition });

    if (condition && ["null", "notNull"].includes(condition.value)) {
      searchLabel = `${item.title}${condition?.label}`;
    } else if (
      ["equal", "notEqual"].includes(queryForm[item.key].condition) &&
      !isUndefined(queryForm[item.key].value?.[0]) &&
      !isNull(queryForm[item.key].value?.[0])
    ) {
      value = queryForm[item.key].value?.[0] || null;
      searchLabel = `${item.title}${condition?.label}: ${find(options, { value })?.label}`;
    } else if (
      !["equal", "notEqual"].includes(queryForm[item.key].condition) &&
      every(queryForm[item.key].value, val => !isNull(val) && !isUndefined(val))
    ) {
      value = queryForm[item.key].value;
      const label = value.map(val => find(options, { value: val })?.label)?.join(",");
      searchLabel = `${item.title}${condition?.label}: ${label}`;
    }
    return { value, searchLabel };
  };

  const Component = ["null", "notNull"].includes(queryForm[item.key].condition) ? (
    // 为空/不为空不需要选值，禁用下拉
    <Select
      ref={inputRef}
      disabled={true}
      value={undefined}
      options={options}
      style={{ width: "200px" }}
      class={`${searchProvider.inputClass || ""}`}
      placeholder={useI18nJoin(useT("common.search"), item.title)}
      getPopupContainer={triggerNode => triggerNode.parentNode}
      {...item.inputProps}
    ></Select>
  ) : ["equal", "notEqual"].includes(queryForm[item.key].condition) ? (
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

  return { conditions, Component, displayValue, onComponentOpen, collectItem };
};

export default render;
