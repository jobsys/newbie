<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieUploader
			v-model:value="file"
			action="#"
			:max-num="1"
			:upload-props="{ customRequest: mockUpload }"
		/>
		<div class="demo-result">v-model：{{ file ? file.name : "空" }}</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbieUploader } from "../../../../components/index.js";

const file = ref(null);

// 文档演示不依赖后端，模拟一次成功上传
const mockUpload = ({ file: rawFile, onProgress, onSuccess }) => {
	let percent = 0;
	const timer = window.setInterval(() => {
		percent += 20;
		onProgress({ percent });
		if (percent >= 100) {
			window.clearInterval(timer);
			onSuccess({
				status: 0,
				result: {
					id: Date.now(),
					name: rawFile.name,
					url: URL.createObjectURL(rawFile),
					path: rawFile.name,
					thumbUrl: URL.createObjectURL(rawFile),
				},
			});
		}
	}, 160);
	return {
		abort() {
			window.clearInterval(timer);
		},
	};
};
</script>

<style scoped>
.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
