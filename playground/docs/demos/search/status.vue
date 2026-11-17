<template>
	<Card title="状态分段筛选">
		<NewbieSearch
			ref="searchRef"
			:filterable-columns="columns"
			:status-filter="statusFilter"
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
const result = ref("点击状态分段或搜索，查看 newbieQuery 的结果");

const columns = [
	{ title: "活动名称", key: "name", type: "input" },
	{ title: "负责人", key: "owner", type: "input" },
	{ title: "创建日期", key: "created_at", type: "date" },
];

const statusFilter = {
	key: "status",
	title: "状态",
	span: 2,
	options: [
		{ label: "全部", value: "" },
		{ label: "已发送", value: "sent" },
		{ label: "已排期", value: "scheduled" },
		{ label: "草稿", value: "draft" },
		{ label: "已归档", value: "archived" },
	],
	// 模拟独立计数接口：query 已排除 status，只包含其他搜索条件
	countRequest: async ({ query }) => {
		await new Promise(resolve => setTimeout(resolve, 300));

		const extra = query.name?.value ? 20 : 0;

		return {
			total: 128 + extra,
			counts: {
				sent: 96 + extra,
				scheduled: 6,
				draft: 18,
				archived: 8,
			},
		};
	},
};

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
