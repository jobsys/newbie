<template>
	<NewbieEditor
		v-model:value="content"
		placeholder="精简工具栏：只保留常用格式"
		:config="{
			toolbarConfig: {
				excludeKeys: ['group-video', 'emotion', 'insertTable', 'codeBlock', 'todo'],
			},
			editorConfig: {
				placeholder: '只保留常用格式的工具栏',
			},
		}"
	/>
</template>

<script setup>
import { ref } from "vue";
import { NewbieEditor } from "../../../../components/index.js";

const content = ref("<p>工具栏可以通过 <code>toolbarConfig.excludeKeys</code> 裁剪。</p>");
</script>
