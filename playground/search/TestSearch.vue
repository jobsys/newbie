<template>
  <Card title="搜索栏">
    <NewbieSearch
      ref="elem"
      :filterable-columns="items"
      :sortable-columns="items"
      @search="onSearch"
    >
      <template #render="{ queryForm }">
        <div>
          <Input v-model:value="queryForm.test.value" />
        </div>
      </template>
    </NewbieSearch>
  </Card>
</template>
<script setup>
import { ref } from "vue";
import { Card, Input } from "ant-design-vue";
import NewbieSearch from "../../components/search/NewbieSearch.jsx";
import { useFindParentValues } from "../../hooks/index.js";

const elem = ref();

const options = [
  {
    value: "zhejiang",
    labelX: "Zhejiang",
    children: [
      {
        value: "hangzhou",
        labelX: "Hangzhou",
        children: [
          {
            value: "xihu",
            labelX: "West Lake",
          },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    labelX: "Jiangsu",
    children: [
      {
        value: "nanjing",
        labelX: "Nanjing",
        children: [
          {
            value: "zhonghuamen",
            labelX: "Zhong Hua Men",
          },
        ],
      },
    ],
  },
];

const items = ref([
  {
    title: "自定义渲染",
    key: "render",
    collectItem: ({ queryForm }) => {
      return { value: queryForm.test?.value, searchLabel: "自定义渲染" };
    },
    customRender: ({ queryForm, item }) => {
      item.disableConditions = true;
      if (!queryForm.test) {
        queryForm.test = { condition: "equal", value: "" };
      }
      return {
        displayValue: ref("已设置"),
      };
    },
  },
  /*{ title: "是否启用", key: "enabled", type: "switch", options: ["启用", "禁用"], defaultValue: true },
	{ title: "姓名", key: "name5", type: "input", disableConditions: true },
	{ title: "学号", key: "stu_num", type: "textarea", inputProps: { style: { width: "300px" } } },
	{
		title: "审核状态",
		key: "status",
		type: "select",
		options: [
			{ label: "通过", value: "pass" },
			{ label: "未通过", value: "deny" },
			{ label: "待审核", value: "waiting" },
		],
	},
	{
		title: "级联",
		key: "cascade",
		type: "cascade",
		inputProps: {
			fieldNames: { label: "labelX", value: "value", children: "children" },
		},
		options,
	},
	{
		title: "性别",
		key: "gender",
		type: "select",
		expandable: true,
		options: [
			{ label: "男", value: "male" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
			{ label: "女", value: "female" },
		],
	},
	{ title: "项目金额", key: "amount", type: "number", sortOrder: 1, defaultValue: [20, 0] },
	{ title: "注册日期", key: "registered_at", type: "date" },*/
]);

const onSearch = () => {
  console.log(useFindParentValues(options, "zhonghuamen"));
  console.log(elem.value.getQueryForm());
};
</script>
