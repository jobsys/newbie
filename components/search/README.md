## 详细参数

### `SearchItemConfig` 配置

| Prop name         | Description                                                                     | Type              | Values                                                   | Default   |
| ----------------- | ------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------- | --------- |
| key               | 检索时的关键词                                                                  | string            | -                                                        | ""        |
| title             | 检索时的关键词的显示文案                                                        | string            | -                                                        | ""        |
| type              | 检索类型                                                                        | string            | `"input"`、`"select"`、`"date"`、`"textare"`、`"number"` | `"input"` |
| expandable        | 是否可展项， `false` 不展开, `true` 表示`展开单选`,`"multiple"` 表示 `展开多选` | boolean \| string | `true`、`false`、`"multiple"`                            | `false`   |
| options           | 检索项的选项                                                                    | Array \| func     | -                                                        | []        |
| inputProps        | 输入组件的属性                                                                  | Object            | -                                                        | {}        |
| disableConditions | 是否禁用搜索条件                                                                | boolean           | -                                                        | false     |
| conditions        | 搜索项的条件，可选项为不同类型的内置条件                                        | array             | -                                                        | []        |
| defaultValue      | 搜索项的默认值                                                                  | any               | -                                                        | -         |

## 方法

| 名称         | 参数                   | 说明           |
| ------------ | ---------------------- | -------------- |
| getQueryForm | () => Object           | 获取搜索栏的值 |
| setQueryForm | ({key: value}) => void | 设置搜索栏的值 |

## 示例

---

<script setup>
import { ref } from "vue";
import { Card } from "ant-design-vue";
import NewbieSearch from "@components/search/NewbieSearch.jsx";

const elem = ref("");

const items = ref([
	{ title: "姓名", key: "name", type: "input", disableConditions: true },
	{ title: "学号", key: "stu_num", type: "textarea", inputProps: { style: { width: "300px" } } },
	{
		title: "审核状态",
		key: "status",
		expandable: "multiple",
		options: [
			{ label: "通过", value: "pass" },
			{ label: "未通过", value: "deny" },
			{ label: "待审核", value: "waiting" },
		],
	},

	{
		title: "性别",
		key: "gender",
		type: "select",
		expandable: true,
		options: [
			{ label: "男", value: "male" },
			{ label: "女", value: "female" },
		],
	},

	{ title: "项目金额", key: "amount", type: "number", conditions: ["equal", "notEqual"], defaultValue: [20, 0] },
	{ title: "注册日期", key: "registered_at", type: "date" },
]);

const onSearch = () => {
	console.log(elem.value.getQueryForm())
}
</script>

<Card title="搜索栏">
    <NewbieSearch ref="elem" :columns="items" @search="onSearch"></NewbieSearch>
</Card>

```vue
<template>
  <Card title="搜索栏">
    <NewbieSearch ref="elem" :columns="items" @search="onSearch"></NewbieSearch>
  </Card>
</template>
<script setup>
import { ref } from "vue";
import { Card } from "ant-design-vue";

const elem = ref("");

const items = ref([
  { title: "姓名", key: "name", type: "input", disableConditions: true },
  { title: "学号", key: "stu_num", type: "textarea", inputProps: { style: { width: "300px" } } },
  {
    title: "审核状态",
    key: "status",
    expandable: "multiple",
    options: [
      { label: "通过", value: "pass" },
      { label: "未通过", value: "deny" },
      { label: "待审核", value: "waiting" },
    ],
  },

  {
    title: "性别",
    key: "gender",
    type: "select",
    expandable: true,
    options: [
      { label: "男", value: "male" },
      { label: "女", value: "female" },
    ],
  },

  {
    title: "项目金额",
    key: "amount",
    type: "number",
    conditions: ["equal", "notEqual"],
    defaultValue: [20, 0],
  },
  { title: "注册日期", key: "registered_at", type: "date" },
]);

const onSearch = () => {
  console.log(elem.value.getQueryForm());
};
</script>
```
