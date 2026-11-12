<template>
	<div class="demo-row">
		<NewbieAddress v-model:value="value" style="width: 320px" />
		<div class="demo-result">
			当前值：<code>{{ value.length ? value.join(" / ") : "未选择" }}</code>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { NewbieAddress } from "../../../../components/index.js";

const value = ref(["440000", "440100", "440103"]);
</script>

<style scoped>
.demo-row {
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: flex-start;
}

.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
