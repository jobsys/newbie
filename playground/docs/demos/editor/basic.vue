<template>
	<Space orientation="vertical" style="width: 100%">
		<Space wrap>
			<Button type="primary" @click="setContent">写入内容</Button>
			<Button @click="getContent">读取内容</Button>
			<Button @click="editorRef?.getEditor()?.focus()">聚焦编辑器</Button>
		</Space>
		<NewbieEditor ref="editorRef" v-model:value="content" placeholder="在这里输入内容…" />
		<Alert
			type="info"
			show-icon
			message="当前 HTML"
			:description="content || '（空）'"
		/>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Alert, Button, message, Space } from "antdv-next";
import { NewbieEditor } from "../../../../components/index.js";

const editorRef = ref(null);
const content = ref("<p>Hello <strong>Newbie</strong></p>");

const setContent = () => {
	editorRef.value?.setContent("<p>内容由 <code>setContent()</code> 写入。</p>");
};

const getContent = () => {
	message.info(content.value || "编辑器为空");
};
</script>
