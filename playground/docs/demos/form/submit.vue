<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieForm
			ref="formRef"
			title="提交前处理"
			:form="form"
			:columns="[24]"
			:card-wrapper="true"
			submit-button-text="提交并查看数据"
			:before-submit="beforeSubmit"
		/>
		<pre v-if="output" class="demo-json">{{ output }}</pre>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);
const output = ref("");

const form = [
	{
		title: "姓名",
		key: "name",
		beforeSubmit: ({ value }) => String(value || "").trim().toUpperCase(),
	},
	{
		title: "统计区间",
		key: "period",
		type: "date",
		rangeKeys: ["period_start", "period_end"],
		defaultProps: { type: "range" },
		columnIndex: [0, 1],
	},
	{ title: "备注", key: "remark", type: "textarea" },
];

const beforeSubmit = ({ formatForm, originalForm }) => {
	output.value = JSON.stringify(
		{
			说明: "beforeSubmit 返回 false，阻止了真实提交",
			格式化后的数据: formatForm,
			原始数据: originalForm,
		},
		null,
		2
	);
	return false;
};
</script>

<style scoped>
.demo-json {
	margin: 0;
	padding: 12px;
	max-height: 320px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
