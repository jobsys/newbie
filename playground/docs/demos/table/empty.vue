<template>
	<NewbieTable
		title="空数据与工具栏"
		:columns="columns"
		:form-data="data"
		:pagination="false"
		:table-props="{ scroll: { x: 800, y: 220 } }"
	>
		<template #functional>
			<Button type="primary">新增记录</Button>
		</template>
	</NewbieTable>
</template>

<script setup>
import { Button } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const data = [];

const columns = [
	{ title: "审核状态", dataIndex: "approval_status", width: 180 },
	{ title: "工号", dataIndex: "work_num", width: 140 },
	{ title: "姓名", dataIndex: "nickname", width: 140 },
	{ title: "专业技术职务", dataIndex: "title", width: 180 },
];
</script>
