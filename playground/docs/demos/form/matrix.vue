<template>
	<NewbieForm
		ref="formRef"
		:form="form"
		:columns="[24]"
		:card-wrapper="false"
		hide-buttons
	/>
</template>

<script setup>
import { ref } from "vue";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);

const form = [
	{
		title: "矩阵单选",
		key: "matrix_radio",
		type: "matrix-radio",
		rows: ["质量", "外观", "服务"],
		options: ["很好", "一般", "较差"],
		required: true,
	},
	{
		title: "矩阵多选",
		key: "matrix_checkbox",
		type: "matrix-checkbox",
		rows: ["功能", "性能"],
		options: ["满意", "一般", "不满意"],
	},
	{
		title: "矩阵量表",
		key: "matrix_scale",
		type: "matrix-scale",
		rows: ["易用性", "稳定性"],
		defaultProps: { level: 5, showScale: true },
	},
	{
		title: "星级评分",
		key: "rate",
		type: "rate",
		defaultValue: 3,
	},
	{
		title: "单选评分",
		key: "rate_radio",
		type: "rate-radio",
		options: [
			{ label: "非常满意", value: "great", rate: 5 },
			{ label: "满意", value: "good", rate: 4 },
			{ label: "一般", value: "normal", rate: 3 },
		],
	},
	{
		title: "多选评分",
		key: "rate_checkbox",
		type: "rate-checkbox",
		options: [
			{ label: "响应快", value: "fast", rate: 5 },
			{ label: "易上手", value: "easy", rate: 4 },
			{ label: "性价比高", value: "value", rate: 3 },
		],
	},
];
</script>
