<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieUploader
			v-model:value="images"
			type="picture-card"
			action="#"
			accept=".png,.jpg,.jpeg,.svg"
			:max-num="4"
			:multiple="true"
			:upload-props="{ customRequest: mockUpload }"
		/>
		<div class="demo-result">已选择 {{ images.length }} 个文件</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbieUploader } from "../../../../components/index.js";

const svg = (label, color) =>
	`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="52%" text-anchor="middle" fill="#fff" font-size="18">${label}</text></svg>`
	)}`;

const images = ref([
	{ id: 1, name: "cover.svg", url: svg("封面", "#1677ff"), path: "cover.svg", thumbUrl: svg("封面", "#1677ff") },
	{ id: 2, name: "banner.svg", url: svg("Banner", "#0b6b4d"), path: "banner.svg", thumbUrl: svg("Banner", "#0b6b4d") },
]);

const mockUpload = ({ file: rawFile, onProgress, onSuccess }) => {
	let percent = 0;
	const timer = window.setInterval(() => {
		percent += 25;
		onProgress({ percent });
		if (percent >= 100) {
			window.clearInterval(timer);
			const url = rawFile.type.startsWith("image/")
				? URL.createObjectURL(rawFile)
				: svg("文件", "#c2410c");
			onSuccess({
				status: 0,
				result: {
					id: Date.now(),
					name: rawFile.name,
					url,
					path: rawFile.name,
					thumbUrl: url,
				},
			});
		}
	}, 200);
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
