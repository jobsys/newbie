<template>
	<NewbieTable
		title="可编辑单元格"
		:columns="columns"
		:data-source="data"
		editable
		:pagination="false"
		:table-props="{ scroll: { x: 900, y: 260 } }"
		:before-cell-submit="beforeCellSubmit"
	/>
</template>

<script setup>
import { reactive } from "vue";
import { message } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const data = reactive([
	{ id: 1, name: "张三", age: 28, role: "admin", enabled: true },
	{ id: 2, name: "李四", age: 32, role: "editor", enabled: false },
	{ id: 3, name: "王五", age: 25, role: "viewer", enabled: true },
]);

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "姓名", dataIndex: "name", width: 160, editable: true },
	{ title: "年龄", dataIndex: "age", width: 120, editable: { type: "number", defaultProps: { min: 0 } } },
	{
		title: "角色",
		dataIndex: "role",
		width: 160,
		editable: {
			type: "select",
			options: [
				{ label: "管理员", value: "admin" },
				{ label: "编辑", value: "editor" },
				{ label: "访客", value: "viewer" },
			],
		},
	},
	{
		title: "状态",
		dataIndex: "enabled",
		width: 120,
		editable: { type: "switch", options: ["启用", "停用"] },
		customRender: ({ record }) => (record.enabled ? "启用" : "停用"),
	},
];

const beforeCellSubmit = payload => {
	return new Promise(resolve => {
		window.setTimeout(() => {
			const target = data.find(item => item.id === payload.id);
			if (target) {
				const { id, ...rest } = payload;
				Object.assign(target, rest);
			}
			message.success("单元格已保存");
			resolve();
		}, 600);
	});
};
</script>
