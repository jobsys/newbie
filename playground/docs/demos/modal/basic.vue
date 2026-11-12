<template>
	<Space>
		<Button type="primary" @click="modalVisible = true">打开 Modal</Button>
		<Button @click="drawerVisible = true">打开 Drawer</Button>
	</Space>

	<NewbieModal v-model:visible="modalVisible" title="Modal 标题" :width="640">
		<p>这是 Modal 内容。点击右上角图标可以全屏，按住标题栏可以拖动。</p>
		<p>底部没有默认按钮，提交逻辑由业务自己控制。</p>
	</NewbieModal>

	<NewbieModal
		v-model:visible="drawerVisible"
		type="drawer"
		title="Drawer 标题"
		:width="520"
	>
		<p>Drawer 与 Modal 使用同一套 props，type 切换为 drawer 即可。</p>
	</NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { Button, Space } from "antdv-next";
import { NewbieModal } from "../../../../components/index.js";

const modalVisible = ref(false);
const drawerVisible = ref(false);
</script>
