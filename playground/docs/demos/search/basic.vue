<template>
	<Card title="搜索栏">
		<NewbieSearch ref="searchRef" :filterable-columns="columns" @search="onSearch" />
		<pre class="demo-json">{{ result }}</pre>
	</Card>
</template>

<script setup>
import { ref } from "vue";
import { Card, message } from "antdv-next";
import { NewbieSearch } from "../../../../components/index.js";

const searchRef = ref(null);
const result = ref("点击“搜索”查看 getQueryForm() 的结果");

const columns = [
	{ title: "姓名", key: "name", type: "input", disableConditions: true },
	{ title: "学号", key: "student_no", type: "textarea" },
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
	{ title: "金额", key: "amount", type: "number", defaultValue: [20, 0] },
	{ title: "注册日期", key: "registered_at", type: "date" },
	{ title: "是否启用", key: "enabled", type: "switch", options: ["启用", "禁用"] },
	{
		title: "所在地区",
		key: "area",
		type: "cascade",
		options: [
			{
				label: "浙江省",
				value: "zhejiang",
				children: [{ label: "杭州市", value: "hangzhou" }],
			},
			{
				label: "江苏省",
				value: "jiangsu",
				children: [{ label: "南京市", value: "nanjing" }],
			},
		],
	},
];

const onSearch = ({ newbieQuery, newbieSort }) => {
	result.value = JSON.stringify({ newbieQuery, newbieSort }, null, 2);
	message.success("已触发 search 事件");
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
