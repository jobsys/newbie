<template>
	<Card title="可排序搜索项">
		<NewbieSearch
			ref="searchRef"
			:filterable-columns="columns"
			:sortable-columns="columns"
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
const result = ref("在搜索栏中打开排序设置，选择字段排序后再搜索");

const columns = [
	{ title: "姓名", key: "name", type: "input" },
	{ title: "金额", key: "amount", type: "number" },
	{ title: "注册日期", key: "registered_at", type: "date" },
	{ title: "审核状态", key: "status", type: "select", options: ["通过", "驳回"] },
];

const onSearch = ({ newbieQuery, newbieSort }) => {
	result.value = JSON.stringify({ newbieQuery, newbieSort }, null, 2);
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
