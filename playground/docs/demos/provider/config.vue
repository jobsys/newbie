<template>
	<NewbieProvider :config="{ table: { pageSize: 4, pageSizeKey: 'page_size' } }">
		<NewbieTable
			title="Provider 配置 pageSize = 4"
			:columns="columns"
			:data-source="data"
			:filterable="false"
			:pagination="{ showSizeChanger: false }"
			:table-props="{ scroll: { x: 800, y: 260 } }"
		/>
	</NewbieProvider>
</template>

<script setup>
import { NewbieProvider, NewbieTable } from "../../../../components/index.js";

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "姓名", dataIndex: "name", width: 140 },
	{ title: "部门", dataIndex: "department", width: 160 },
	{ title: "邮箱", dataIndex: "email" },
];

const data = Array.from({ length: 12 }, (_, index) => ({
	id: index + 1,
	name: `用户 ${index + 1}`,
	department: ["研发中心", "产品部", "设计部"][index % 3],
	email: `user${index + 1}@example.com`,
}));
</script>
