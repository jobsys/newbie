<template>
	<Space orientation="vertical">
		<Button @click="signatureRef?.open()">查看已签名内容</Button>
		<NewbieSignaturePad
			ref="signatureRef"
			title="签名预览"
			readonly
			:preset="preset"
		/>
		<div class="demo-tip">readonly 模式下只能查看和关闭，不能修改签名。</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Button, Space } from "antdv-next";
import { NewbieSignaturePad } from "../../../../components/index.js";

const signatureRef = ref(null);

const preset =
	"data:image/svg+xml;charset=utf-8," +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="100%" height="100%" fill="#ffffff"/><path d="M70 200 C130 80 150 80 170 190 C190 280 210 110 250 160 C280 195 310 90 350 170 C390 250 430 110 520 150" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/></svg>'
	);
</script>

<style scoped>
.demo-tip {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
