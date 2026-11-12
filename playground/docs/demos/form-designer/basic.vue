<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieFormDesigner
			title="新员工入职登记"
			:height="720"
			:widgets="widgets"
			:form-items="formItems"
			@submit="onSubmit"
		/>
		<pre v-if="output" class="demo-json">{{ output }}</pre>
	</Space>
</template>

<script setup>
import { h, ref } from "vue";
import { Space } from "antdv-next";
import { MobileOutlined, UserOutlined } from "@antdv-next/icons";
import { NewbieFormDesigner } from "../../../../components/index.js";

const output = ref("");

const widgets = [
	{
		title: "业务组件",
		children: [
			{
				name: "手机号码",
				type: "input",
				icon: () => h(MobileOutlined),
				props: {
					title: "手机号码",
					rules: [{ pattern: "^1[3-9]\\d{9}$", message: "手机号码格式不正确" }],
				},
			},
			{
				name: "姓名",
				type: "input",
				icon: () => h(UserOutlined),
				props: { title: "姓名", required: true },
			},
		],
	},
];

const formItems = [
	{ key: "name", title: "姓名", type: "input", required: true, width: "100%" },
	{ key: "department", title: "部门", type: "select", options: ["研发中心", "产品部"], width: 300 },
];

const onSubmit = form => {
	output.value = JSON.stringify(form, null, 2);
};
</script>

<style scoped>
.demo-json {
	margin: 0;
	padding: 12px;
	max-height: 260px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
