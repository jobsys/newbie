<template>
	<Space orientation="vertical" style="width: 100%">
		<Alert
			type="info"
			show-icon
			message="点击表格底部的“新增数据源”打开子表单，保存后会写入数组字段。"
		/>
		<NewbieForm
			ref="formRef"
			:form="form"
			:columns="[24]"
			:card-wrapper="false"
			hide-buttons
		/>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Alert, message, Space } from "antdv-next";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);

const form = [
	{
		title: "数据源",
		key: "data_sources",
		type: "group",
		childrenOperations: [
			{
				name: "推荐",
				action: ({ record, index }) => {
					message.info(`推荐第 ${index + 1} 行：${record.category_id}`);
				},
			},
		],
		children: [
			{
				title: "分类",
				key: "category_id",
				type: "tree-select",
				width: 260,
				options: [
					{
						label: "技术",
						value: 1,
						children: [
							{ label: "前端", value: 2 },
							{ label: "后端", value: 3 },
						],
					},
					{ label: "业务", value: 4 },
				],
				required: true,
			},
			{
				title: "是否分页",
				key: "is_pagination_required",
				type: "switch",
				options: ["是", "否"],
				defaultValue: true,
			},
			{
				title: "说明",
				key: "remark",
				type: "textarea",
				width: "100%",
			},
		],
	},
];
</script>
