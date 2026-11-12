<template>
	<NewbieTable
		title="用户列表"
		:columns="columns"
		:data-source="data"
		:filterable="false"
		:pagination="false"
		:table-props="{ scroll: { x: 900, y: 300 } }"
		@row-click="onRowClick"
	/>
</template>

<script setup>
import { message } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "姓名", dataIndex: "name", width: 140 },
	{ title: "部门", dataIndex: "department", width: 160 },
	{ title: "邮箱", dataIndex: "email" },
	{ title: "状态", dataIndex: "status", width: 100 },
];

const data = [
	{ id: 1, name: "张三", department: "研发中心", email: "zhangsan@example.com", status: "启用" },
	{ id: 2, name: "李四", department: "产品部", email: "lisi@example.com", status: "停用" },
	{ id: 3, name: "王五", department: "设计部", email: "wangwu@example.com", status: "启用" },
	{ id: 4, name: "赵六", department: "运营部", email: "zhaoliu@example.com", status: "启用" },
];

const onRowClick = ({ record }) => {
	message.info(`点击了 ${record.name}`);
};
</script>
