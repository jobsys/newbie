<template>
	<Button type="primary" @click="visible = true">透传 Modal 属性</Button>

	<NewbieModal
		v-model:visible="visible"
		title="自定义样式"
		:width="560"
		:modal-props="{
			centered: true,
			maskClosable: true,
			styles: {
				body: { padding: '0 24px 24px' },
			},
		}"
	>
		<Alert type="success" show-icon message="maskClosable 与 styles.body 都来自 modalProps" />
	</NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { Alert, Button } from "antdv-next";
import { NewbieModal } from "../../../../components/index.js";

const visible = ref(false);
</script>
