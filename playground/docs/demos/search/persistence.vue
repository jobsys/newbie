<template>
	<Card title="搜索条件持久化">
		<Space style="margin-bottom: 16px">
			<span>存储方式：</span>
			<Segmented v-model:value="mode" :options="modes" size="small" />
			<span class="demo-tip">切换后组件会重新挂载</span>
		</Space>
		<NewbieSearch
			:key="mode"
			:filterable-columns="columns"
			:sortable-columns="columns"
			:persistence="persistence"
			@search="onSearch"
		/>
		<pre class="demo-json">{{ result }}</pre>
	</Card>
</template>

<script setup>
import { computed, ref } from "vue";
import { Card, Segmented, Space } from "antdv-next";
import { NewbieSearch } from "../../../../components/index.js";

const mode = ref("memory");
const result = ref("输入搜索条件并搜索；内存模式在同一会话内切换页面/重新挂载后自动恢复，localStorage 模式需点“恢复上次查询”");

const modes = [
	{ label: "关闭", value: "off" },
	{ label: "内存", value: "memory" },
	{ label: "localStorage", value: "local" },
];

const persistence = computed(() => {
	if (mode.value === "memory") return { key: "search-demo" };
	if (mode.value === "local") return { key: "search-demo", storage: "local" };
	return false;
});

const columns = [
	{ title: "姓名", key: "name", type: "input" },
	{ title: "金额", key: "amount", type: "number" },
	{ title: "注册日期", key: "registered_at", type: "date" },
];

const onSearch = ({ newbieQuery }) => {
	result.value = JSON.stringify(newbieQuery, null, 2);
};
</script>

<style scoped>
.demo-tip {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}

.demo-json {
	margin: 16px 0 0;
	padding: 12px;
	max-height: 200px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
