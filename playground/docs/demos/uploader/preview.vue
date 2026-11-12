<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieUploader
			v-model:value="files"
			action="#"
			:max-num="5"
			:multiple="true"
			:preview="onPreview"
			:upload-props="{ customRequest: mockUpload }"
		/>
		<Alert
			type="info"
			show-icon
			message="点击文件右侧的预览图标，会调用 preview 回调而不是直接跳转。"
		/>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Alert, message, Space } from "antdv-next";
import { NewbieUploader } from "../../../../components/index.js";

const files = ref([
	{ id: 1, name: "合同.pdf", url: "#", path: "contract.pdf" },
	{ id: 2, name: "报价单.xlsx", url: "#", path: "quote.xlsx" },
]);

const onPreview = file => {
	message.info(`自定义预览：${file.name}`);
};

const mockUpload = ({ file: rawFile, onSuccess }) => {
	window.setTimeout(() => {
		onSuccess({
			status: 0,
			result: {
				id: Date.now(),
				name: rawFile.name,
				url: URL.createObjectURL(rawFile),
				path: rawFile.name,
			},
		});
	}, 300);
	return { abort() {} };
};
</script>
