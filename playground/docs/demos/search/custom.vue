<template>
	<Card title="自定义搜索项">
		<NewbieSearch
			ref="searchRef"
			:filterable-columns="columns"
			@search="onSearch"
		>
			<template #render="{ queryForm }">
				<Input v-model:value="queryForm.render.value" placeholder="输入关键字" allow-clear />
			</template>
		</NewbieSearch>
		<pre class="demo-json">{{ result }}</pre>
	</Card>
</template>

<script setup>
import { ref } from "vue";
import { Card, Input } from "antdv-next";
import { NewbieSearch } from "../../../../components/index.js";

const searchRef = ref(null);
const result = ref("在自定义搜索项中输入内容并搜索");

const columns = [
	{
		title: "自定义关键字",
		key: "render",
		collectItem: ({ queryForm }) => ({
			value: queryForm.render?.value,
			searchLabel: `关键字：${queryForm.render?.value || ""}`,
		}),
		customRender: ({ queryForm, item }) => {
			item.disableConditions = true;
			if (!queryForm.render) {
				queryForm.render = { condition: "equal", value: "" };
			}
			return {
				displayValue: ref(queryForm.render.value ? "已设置" : "未设置"),
			};
		},
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
