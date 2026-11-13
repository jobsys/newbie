<template>
	<Space>
		<Button type="primary" @click="visible = true">打开 Drawer 表单</Button>
	</Space>

	<NewbieModal v-model:visible="visible" type="drawer" title="单位设置" :width="520">
		<NewbieForm
			ref="formRef"
			:form="form"
			:data="data"
			:card-wrapper="false"
			buttons-in-footer
			confirm-on-close
			:before-submit="onBeforeSubmit"
			@close="visible = false"
		/>
	</NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { Button, message, Space } from "antdv-next";
import { NewbieForm, NewbieModal } from "../../../../components/index.js";

const visible = ref(false);
const formRef = ref(null);

const data = ref({ name: "系统管理部门", max_people: 10, hours: 40 });

const form = [
	{ title: "单位名称", key: "name", required: true },
	{ title: "最大招聘人数", key: "max_people", type: "number", defaultProps: { append: "人" } },
	{ title: "核定工时", key: "hours", type: "number", defaultProps: { append: "小时" } },
];

// 演示环境没有后端：返回 false 阻止真实请求，同时展示 beforeSubmit 的数据处理契约
const onBeforeSubmit = ({ formatForm }) => {
	message.info(`提交数据：${JSON.stringify(formatForm)}`);
	return false;
};
</script>
