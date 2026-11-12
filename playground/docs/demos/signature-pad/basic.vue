<template>
	<Space orientation="vertical">
		<Button type="primary" @click="signatureRef?.open()">打开签名板</Button>
		<NewbieSignaturePad
			ref="signatureRef"
			title="请在下方签名"
			agreement="我已阅读并同意《用户协议》"
			@save="onSave"
		/>
		<div v-if="signature" class="demo-signature">
			<div class="demo-signature__label">最近一次签名：</div>
			<img :src="signature" alt="签名结果" />
		</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Button, message, Space } from "antdv-next";
import { NewbieSignaturePad } from "../../../../components/index.js";

const signatureRef = ref(null);
const signature = ref("");

const onSave = dataUrl => {
	signature.value = dataUrl;
	message.success("签名已保存");
};
</script>

<style scoped>
.demo-signature__label {
	margin-bottom: 8px;
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}

.demo-signature img {
	max-width: 320px;
	border: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
	border-radius: 6px;
}
</style>
