<template>
	<NewbieTable
		:columns="columns"
		:data-source="data"
		card-wrapper
		:filterable="false"
		:pagination="false"
		:table-props="{ scroll: { x: 800, y: 260 } }"
	>
		<template #title>
			<Space>
				<Tag color="blue">自定义标题</Tag>
				<span>最近登录记录</span>
			</Space>
		</template>
		<template #extra>
			<Button type="link">导出</Button>
		</template>
		<template #prepend>
			<Alert type="info" show-icon message="prepend 位于搜索栏与表格之间" />
		</template>
		<template #functional>
			<Button type="primary">批量操作</Button>
		</template>
		<template #append>
			<div class="demo-append">append 会与分页共用底部一行；关闭分页时单独展示。</div>
		</template>
	</NewbieTable>
</template>

<script setup>
import { Alert, Button, Space, Tag } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "用户", dataIndex: "name", width: 140 },
	{ title: "登录 IP", dataIndex: "ip", width: 180 },
	{ title: "登录时间", dataIndex: "time" },
];

const data = [
	{ id: 1, name: "张三", ip: "10.0.0.12", time: "2026-11-11 09:12:00" },
	{ id: 2, name: "李四", ip: "10.0.0.18", time: "2026-11-11 08:40:00" },
	{ id: 3, name: "王五", ip: "10.0.0.21", time: "2026-11-10 18:20:00" },
];
</script>

<style scoped>
.demo-append {
	padding: 8px 0;
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
