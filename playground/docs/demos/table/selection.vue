<template>
	<NewbieTable
		title="行选择与展开"
		:columns="columns"
		:data-source="data"
		row-selection
		row-key="id"
		:expanded-row-keys="[1]"
		:expand-render="renderExpand"
		:filterable="false"
		:pagination="false"
		:table-props="{ scroll: { x: 800, y: 260 } }"
		@row-click="onRowClick"
	/>
</template>

<script setup>
import { h } from "vue";
import { message, Tag } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "姓名", dataIndex: "name", width: 140 },
	{ title: "部门", dataIndex: "department" },
	{ title: "状态", dataIndex: "status", width: 100 },
];

const data = [
	{ id: 1, name: "张三", department: "研发中心", status: "启用" },
	{ id: 2, name: "李四", department: "产品部", status: "停用" },
	{ id: 3, name: "王五", department: "设计部", status: "启用" },
];

const renderExpand = record =>
	h("div", { style: { padding: "8px 0" } }, [
		h("strong", {}, "详细信息："),
		h("span", { style: { marginLeft: "8px" } }, `${record.name} · ${record.department}`),
		h(Tag, { color: "blue", style: { marginLeft: "8px" } }, () => record.status),
	]);

const onRowClick = ({ record }) => {
	message.info(`点击了 ${record.name}`);
};
</script>
