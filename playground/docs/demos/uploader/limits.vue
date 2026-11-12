<template>
	<Space orientation="vertical" style="width: 100%">
		<div class="demo-label">最多 2 个、单个不超过 1MB、仅 PDF / Word：</div>
		<NewbieUploader
			v-model:value="files"
			action="#"
			accept=".pdf,.doc,.docx"
			:max-size="1"
			:max-num="2"
			:multiple="true"
			:upload-props="{ customRequest: mockUpload }"
		/>

		<div class="demo-label">禁用状态：</div>
		<NewbieUploader
			v-model:value="disabledFiles"
			disabled
			action="#"
			:max-num="3"
		/>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbieUploader } from "../../../../components/index.js";

const files = ref([]);
const disabledFiles = ref([
	{
		id: 1,
		name: "award-import-template.xlsx",
		url: "#",
		path: "award-import-template.xlsx",
	},
]);

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
	}, 400);
	return { abort() {} };
};
</script>

<style scoped>
.demo-label {
	margin: 4px 0 10px;
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
