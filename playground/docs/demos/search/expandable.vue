<template>
	<Card title="展开式搜索项">
		<NewbieSearch
			ref="searchRef"
			:filterable-columns="columns"
			@search="onSearch"
		/>
		<pre class="demo-json">{{ result }}</pre>
	</Card>
</template>

<script setup>
import { ref } from "vue";
import { Card } from "antdv-next";
import { NewbieSearch } from "../../../../components/index.js";

const searchRef = ref(null);
const result = ref("展开“性别”或“标签”后选择，再点击搜索");

const columns = [
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
		title: "标签",
		key: "tags",
		type: "select",
		expandable: "multiple",
		options: ["重点", "跟进", "已归档", "待回访", "高意向"],
	},
	{ title: "姓名", key: "name", type: "input" },
];

const onSearch = ({ newbieQuery }) => {
	result.value = JSON.stringify(newbieQuery, null, 2);
};
</script>

<style scoped>
.demo-json {
	margin: 16px 0 0;
	padding: 12px;
	max-height: 240px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
