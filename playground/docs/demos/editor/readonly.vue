<template>
	<Space orientation="vertical" style="width: 100%">
		<Space>
			<span>状态：</span>
			<Switch v-model:checked="readonly" checked-children="只读" un-checked-children="可编辑" />
		</Space>
		<NewbieEditor v-model:value="content" :readonly="readonly" />
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space, Switch } from "antdv-next";
import { NewbieEditor } from "../../../../components/index.js";

const readonly = ref(true);
const content = ref(
	"<h2>公告</h2><p>这是只读模式下的富文本内容，工具栏会被隐藏，编辑器不可输入。</p>"
);
</script>
