<template>
	<Space orientation="vertical">
		<Space>
			<span>层级：</span>
			<a-segmented v-model:value="level" :options="levelOptions" size="small" />
		</Space>
		<NewbieAddress v-model:value="value" :level="level" style="width: 320px" />
		<div class="demo-result">当前值：{{ value.join(" / ") || "未选择" }}</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Segmented, Space } from "antdv-next";
import { NewbieAddress } from "../../../../components/index.js";

const level = ref(2);
const value = ref(["440000", "440100"]);

const levelOptions = [
	{ label: "省", value: 1 },
	{ label: "省市", value: 2 },
	{ label: "省市区", value: 3 },
];
</script>

<style scoped>
.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
