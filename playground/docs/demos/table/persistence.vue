<template>
	<Space style="margin-bottom: 16px">
		<span>持久化：</span>
		<RadioGroup v-model:value="mode" button-style="solid" size="small">
			<RadioButton value="off">关闭</RadioButton>
			<RadioButton value="memory">内存</RadioButton>
			<RadioButton value="local">localStorage</RadioButton>
		</RadioGroup>
		<span class="demo-tip">刷新页面后观察分页与自定义列显隐；冷数据会自动恢复</span>
	</Space>

	<NewbieTable
		:key="mode"
		title="持久化示例"
		:columns="columns"
		:data-source="data"
		:persistence="persistence"
		:pagination="{ pageSize: 5, showSizeChanger: true }"
		:table-props="{ scroll: { x: 800, y: 300 } }"
	/>
</template>

<script setup>
import { computed, ref } from "vue";
import { RadioButton, RadioGroup, Space } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const mode = ref("memory");

const persistence = computed(() => {
	if (mode.value === "memory") return { key: "table-demo" };
	if (mode.value === "local") return { key: "table-demo", storage: "local" };
	return false;
});

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "姓名", dataIndex: "name", width: 120 },
	{ title: "部门", dataIndex: "department", width: 160 },
	{ title: "邮箱", dataIndex: "email" },
	{ title: "状态", dataIndex: "status", width: 100 },
];

const data = Array.from({ length: 12 }, (_, index) => ({
	id: index + 1,
	name: `用户 ${index + 1}`,
	department: ["研发中心", "产品部", "设计部", "运营部"][index % 4],
	email: `user${index + 1}@example.com`,
	status: index % 3 === 0 ? "停用" : "启用",
}));
</script>

<style scoped>
.demo-tip {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
