<template>
	<NewbieTable
		title="嵌套字段"
		:columns="columns"
		:data-source="data"
		:filterable="false"
		:pagination="false"
		:table-props="{ scroll: { x: 900, y: 240 } }"
	/>
</template>

<script setup>
import { NewbieTable } from "../../../../components/index.js";

const data = [
	{ id: 1, user: { name: "用户1", age: 20 } },
	{ id: 2, user: { name: "用户2", age: 30 } },
];

const columns = [
	{ title: "编号", dataIndex: "id", width: 80 },
	{
		title: "dataIndex 数组",
		dataIndex: ["user", "name"],
		width: 180,
	},
	{
		title: "dataIndex 数组 + key 字符串",
		key: "user.age",
		dataIndex: ["user", "age"],
		width: 220,
	},
	{
		title: "key 数组 + customRender",
		key: ["user", "name"],
		width: 220,
		customRender: ({ record }) => record.user.name,
	},
];
</script>
