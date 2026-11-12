<template>
	<Space orientation="vertical" style="width: 100%">
		<Space>
			<Button @click="printForm">打印表单数据</Button>
			<span class="demo-tip">切换“模式”观察字段变化</span>
		</Space>
		<NewbieForm
			ref="formRef"
			:form="form"
			:columns="[24]"
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
const output = ref("点击按钮查看 submitForm");

const form = [
	{
		title: "模式",
		key: "mode",
		type: "radio",
		options: [
			{ label: "模式 A", value: "A" },
			{ label: "模式 B", value: "B" },
			{ label: "模式 C", value: "C" },
		],
		defaultValue: "A",
	},
	{
		title: "姓名",
		key: "name",
		required: form => form.mode === "B",
		requiredMessage: "模式 B 下姓名必填",
	},
	{
		title: "仅模式 C 可见",
		key: "secret",
		hidden: form => form.mode !== "C",
	},
	{
		title: "模式 A 下禁用",
		key: "readonly_field",
		disabled: form => form.mode === "A",
		defaultValue: "模式 A 中不可编辑",
	},
	{
		title: "限制人数",
		key: "limit",
		type: "number",
		optional: ["限制", "不限制"],
		help: "开启开关后才能填写人数",
	},
	{
		title: "动态组件",
		key: "dynamic",
		match: form => {
			if (form.mode === "A") {
				return { type: "input", placeholder: "模式 A：单行输入" };
			}
			if (form.mode === "B") {
				return { type: "textarea", placeholder: "模式 B：多行输入", width: "100%" };
			}
			return {
				type: "select",
				options: ["选项一", "选项二"],
				placeholder: "模式 C：下拉选择",
			};
		},
	},
];

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
	max-height: 220px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
