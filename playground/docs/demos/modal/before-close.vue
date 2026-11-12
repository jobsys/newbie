<template>
	<Button type="primary" @click="visible = true">关闭前确认</Button>

	<NewbieModal
		v-model:visible="visible"
		title="编辑用户"
		:before-close="beforeClose"
	>
		<p>点击关闭按钮时，会先调用 beforeClose。</p>
		<p>当前表单有未保存内容。</p>
	</NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { Button, Modal } from "antdv-next";
import { NewbieModal } from "../../../../components/index.js";

const visible = ref(false);

const beforeClose = () =>
	new Promise(resolve => {
		Modal.confirm({
			title: "放弃修改？",
			content: "表单已修改，关闭后不会保存。",
			onOk: () => resolve(true),
			onCancel: () => resolve(false),
		});
	});
</script>
