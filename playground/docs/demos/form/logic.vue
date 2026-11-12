<template>
	<Space orientation="vertical" style="width: 100%">
		<Space>
			<Button @click="printForm">查看表单数据</Button>
			<span class="demo-tip">计算字段不会渲染，但会写入提交数据</span>
		</Space>
		<NewbieForm
			ref="formRef"
			:form="form"
			:columns="[12, 12]"
			:card-wrapper="false"
			hide-buttons
		/>
		<pre class="demo-json">{{ output }}</pre>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Button, Space } from "antdv-next";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);
const output = ref("修改单价或数量，总价会自动计算");

const form = {
	fields: [
		{
			title: "类型",
			key: "type",
			type: "radio",
			options: [
				{ label: "类型 A", value: "A" },
				{ label: "类型 B", value: "B" },
			],
			defaultValue: "A",
		},
		{ title: "单价", key: "price", type: "number", defaultValue: 10 },
		{ title: "数量", key: "qty", type: "number", defaultValue: 2 },
		{
			title: "总价（计算字段）",
			key: "total",
			type: "computed",
			formula: "[price] * [qty]",
		},
		{
			title: "总价展示",
			type: "plain",
			defaultValue: ({ submitForm }) => `¥ ${Number(submitForm.total || 0).toFixed(2)}`,
		},
		{
			title: "B 类型专属",
			key: "b_only",
			placeholder: "切换到类型 B 后出现",
		},
	],
	logic: {
		rules: [
			{
				targetField: "b_only",
				action: "hide",
				logicGate: "and",
				conditions: [{ field: "type", operator: "notEquals", value: "B" }],
			},
		],
	},
};

const printForm = () => {
	output.value = JSON.stringify(formRef.value?.getForm() || {}, null, 2);
};
</script>

<style scoped>
.demo-tip {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}

.demo-json {
	margin: 0;
	padding: 12px;
	max-height: 240px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
