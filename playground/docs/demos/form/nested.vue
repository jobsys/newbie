<template>
	<Space orientation="vertical" style="width: 100%">
		<Space wrap>
			<Button @click="printForm">getFormStandalone()</Button>
			<Button @click="getField">getField('major.name')</Button>
			<Button @click="setField">setForm({ 'major.name': '软件工程' })</Button>
			<Button @click="reset">reset()</Button>
			<Button @click="checkDirty">isDirty()</Button>
		</Space>
		<NewbieForm
			ref="formRef"
			:data="initialData"
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
import { Button, message, Space } from "antdv-next";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);
const output = ref("操作表单方法后查看结果");

const initialData = {
	"major.name": "计算机科学与技术",
	"major.level": "本科",
	"advisor.name": "王老师",
};

const form = [
	{ title: "专业名称", key: "major.name", required: true },
	{
		title: "专业层次",
		key: "major.level",
		type: "select",
		options: ["本科", "硕士", "博士"],
	},
	{ title: "导师姓名", key: "advisor.name" },
	{ title: "导师电话", key: "advisor.phone" },
];

const printForm = () => {
	output.value = JSON.stringify(formRef.value?.getFormStandalone() || {}, null, 2);
};

const getField = () => {
	message.info(`major.name = ${formRef.value?.getField("major.name")}`);
};

const setField = () => {
	formRef.value?.setForm({ "major.name": "软件工程" });
	output.value = "已调用 setForm，修改专业名称";
};

const reset = () => {
	formRef.value?.reset();
	output.value = "已重置到初始数据";
};

const checkDirty = () => {
	message.info(`isDirty：${formRef.value?.isDirty()}`);
};
</script>

<style scoped>
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
