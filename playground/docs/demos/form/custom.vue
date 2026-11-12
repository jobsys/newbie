<template>
	<NewbieForm
		ref="formRef"
		:form="form"
		:columns="[24]"
		:card-wrapper="false"
		hide-buttons
	>
		<template #custom_slot="{ submitForm }">
			<Input
				v-model:value="submitForm.custom_slot"
				placeholder="由插槽渲染的输入框"
				allow-clear
				style="width: 320px"
			/>
		</template>
	</NewbieForm>
</template>

<script setup>
import { h, ref } from "vue";
import { Input, Rate } from "antdv-next";
import { NewbieForm } from "../../../../components/index.js";

const formRef = ref(null);

const form = [
	{
		title: "插槽字段",
		key: "custom_slot",
		type: "slot",
		help: "渲染优先级：slot > customRender > type",
	},
	{
		title: "自定义渲染",
		key: "rating",
		defaultValue: 3,
		customRender: ({ submitForm }) =>
			h(Rate, {
				value: submitForm.rating,
				"onUpdate:value": value => {
					submitForm.rating = value;
				},
			}),
	},
	{
		title: "自定义提示",
		key: "with_help",
		help: () => h("span", { style: { color: "#c2410c" } }, "help 支持函数"),
	},
];
</script>
