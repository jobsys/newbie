import { DatePicker, RangePicker, Tag } from "ant-design-vue";
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { every, find } from "lodash-es";
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
    { label: useT("search.less-than"), value: "lessThan" },
    { label: useT("search.greater-than"), value: "greaterThan" },
    { label: useT("search.between"), value: "between" },
    { label: useT("search.null"), value: "null" },
    { label: useT("search.not-null"), value: "notNull" },
  ];

  if (item.conditions && item.conditions.length) {
    conditions = conditions.filter(condition => item.conditions.includes(condition.value));
  }

  const inputRef = ref(null);

  const format = item.inputProps?.format || "YYYY-MM-DD";
  const picker = item.inputProps?.picker || "date";

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
      every(queryForm[item.key].value, dayjs.isDayjs)
    ) {
      value = queryForm[item.key].value;
      searchLabel = `${item.title}${conditionLabel}: ${value[0].format(format)} - ${value[1].format(format)} `;
    } else if (
      queryForm[item.key].condition !== "between" &&
      dayjs.isDayjs(queryForm[item.key].value[0])
    ) {
      value = queryForm[item.key].value[0];
      searchLabel = `${item.title}${conditionLabel}: ${value.format(format)}`;
    }
    return { value, searchLabel };
  };

  const onComponentOpen = () => {
    //暂时无法实现自动弹出日期选择面板
    inputRef.value?.focus();
  };

  const displayValue = computed(() => {
    if (
      queryForm[item.key].condition === "between" &&
      queryForm[item.key].value &&
      every(queryForm[item.key].value, dayjs.isDayjs)
    ) {
      return [
        <Tag style={{ marginRight: 0 }}>
          {{ default: () => queryForm[item.key].value?.[0]?.format(format) }}
        </Tag>,
        <span> - </span>,
        <Tag>{{ default: () => queryForm[item.key].value?.[1]?.format(format) }}</Tag>,
      ];
    }
    return queryForm[item.key].value?.[0]?.format(format);
  });

  const presets = ref([
    {
      label: useT("search.last-week"),
      value: dayjs().add(-7, "d"),
    },
    {
      label: useT("search.last-month"),
      value: dayjs().add(-1, "month"),
    },
  ]);
  const rangePresets = ref([
    {
      label: useT("search.past-week"),
      value: [dayjs().add(-7, "d"), dayjs()],
    },
    {
      label: useT("search.past-two-weeks"),
      value: [dayjs().add(-14, "d"), dayjs()],
    },
    {
      label: useT("search.past-days", { days: 30 }),
      value: [dayjs().add(-30, "d"), dayjs()],
    },
    {
      label: useT("search.past-days", { days: 90 }),
      value: [dayjs().add(-90, "d"), dayjs()],
    },
  ]);

  let Component =
    queryForm[item.key].condition === "between" ? (
      <RangePicker
        ref={inputRef}
        v-model:value={queryForm[item.key].value}
        allowClear={true}
        inputReadOnly={true}
        open={true}
        presets={picker === "date" ? rangePresets.value : []}
        style={{ width: "400px" }}
        class={`${searchProvider.inputClass || ""}`}
        placeholder={[useT("search.start-time"), useT("search.end-time")]}
        getPopupContainer={triggerNode => triggerNode?.parentNode}
        {...item.inputProps}
      ></RangePicker>
    ) : (
      <DatePicker
        ref={inputRef}
        v-model:value={queryForm[item.key].value[0]}
        allowClear={true}
        open={true}
        inputReadOnly={true}
        presets={picker === "date" ? presets.value : []}
        style={{ width: "200px" }}
        class={`${searchProvider.inputClass || ""}`}
        placeholder={useI18nJoin(useT("common.search"), item.title)}
        getPopupContainer={triggerNode => triggerNode?.parentNode}
        {...item.inputProps}
      ></DatePicker>
    );

  return { conditions, Component, displayValue, onComponentOpen };
};

export default render;
