<template>
	<NewbieFormDesigner
		title="知识竞赛题目设计"
		:height="640"
		mode="quiz"
		@submit="onSubmit"
	/>
</template>

<script setup>
import { message } from "antdv-next";
import { NewbieFormDesigner } from "../../../../components/index.js";

const onSubmit = form => {
	message.success(`已保存 ${form.fields.length} 道题目`);
	console.log(form);
};
</script>
