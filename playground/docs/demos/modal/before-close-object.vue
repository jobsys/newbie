<template>
	<Space>
		<Switch v-model:checked="dirty" />
		<span>模拟表单已修改</span>
		<Button type="primary" @click="visible = true">打开 Drawer</Button>
	</Space>

	<NewbieModal
		v-model:visible="visible"
		type="drawer"
		title="编辑资料"
		:before-close="{
			title: '确认关闭',
			content: '表单已修改，是否放弃本次修改？',
			okText: '放弃',
			cancelText: '继续编辑',
			trigger: () => dirty,
		}"
	>
		<p>只有 dirty 为 true 时，关闭才会弹出确认框。</p>
		<p>trigger 也可以是布尔值，或返回布尔值的函数。</p>
	</NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { Button, Space, Switch } from "antdv-next";
import { NewbieModal } from "../../../../components/index.js";

const visible = ref(false);
const dirty = ref(true);
</script>
