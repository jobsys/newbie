<template>
	<NewbieForm
		ref="formRef"
		title="多列布局与分组"
		:form="form"
		:columns="[12, 12]"
		break-mode="collapse"
		:card-wrapper="true"
		hide-buttons
	/>
</template>

<script setup>
import { ref } from "vue";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);

const form = [
	{ title: "姓名", key: "name", required: true, break: "基本信息", columnIndex: 0 },
	{ title: "邮箱", key: "email", columnIndex: 1 },
	{ title: "手机号", key: "phone", columnIndex: 0 },
	{ title: "个人简介", key: "intro", type: "textarea", columnIndex: 1, rowSpan: 2 },
	{ title: "公司", key: "company", columnIndex: 0 },
	{ title: "入职日期", key: "joined_at", type: "date", break: "更多信息", columnIndex: 0 },
	{ title: "员工编号", key: "employee_no", columnIndex: 1 },
	{ title: "备注", key: "remark", type: "textarea", columnIndex: [0, 1] },
];
</script>
