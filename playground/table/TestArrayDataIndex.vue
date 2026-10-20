<template>
	<div>
		<NewbieTable
			title="key 场景测试"
			:form-data="data"
			:columns="tableColumns"
			:card-wrapper="false"
			:show-refresh="false"
		/>
	</div>
</template>
<script setup>
import {reactive} from "vue";
import NewbieTable from "../../components/table/NewbieTable.jsx";

const data = reactive([
	{ id: 1, user: { name: "用户1", age: 20 } },
	{ id: 2, user: { name: "用户2", age: 30 } },
]);

const tableColumns = [
	{ title: "编号", dataIndex: "id", width: 80 },
	{
		title: "A-key为数组",
		key: ["user", "name"],
		width: 120,
		customRender: ({record}) => record.user.name,
	},
	{
		title: "B-key字符串+dataIndex数组",
		key: "user.age",
		dataIndex: ["user", "age"],
		width: 120,
	},
	{
		title: "C-仅key",
		key: "nickname",
		width: 120,
		customRender: ({record}) => record.user.name,
	},
	{
		title: "D-dataIndex数组",
		dataIndex: ["user", "name"],
		width: 120,
	},
];
</script>
