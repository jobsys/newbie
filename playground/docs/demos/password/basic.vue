<template>
	<Space orientation="vertical">
		<NewbiePassword v-model:value="password" width="320" />
		<div class="demo-result">当前值：{{ password || "空" }}</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbiePassword } from "../../../../components/index.js";

const password = ref("");
</script>

<style scoped>
.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
