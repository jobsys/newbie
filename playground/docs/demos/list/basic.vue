<template>
	<NewbieList :auto-load="false" :height="280" finished-text="演示数据 · 没有更多了">
		<div v-for="item in items" :key="item.id" class="demo-list-item">
			<div class="demo-list-item__title">{{ item.title }}</div>
			<div class="demo-list-item__meta">{{ item.time }} · {{ item.author }}</div>
		</div>
	</NewbieList>
</template>

<script setup>
import { NewbieList } from "../../../../components/index.js";

const items = [
	{ id: 1, title: "如何配置一份多列表单？", time: "2026-11-01", author: "Newbie" },
	{ id: 2, title: "表格的搜索条件从哪里来？", time: "2026-11-03", author: "Newbie" },
	{ id: 3, title: "上传组件如何开启分块上传？", time: "2026-11-05", author: "Newbie" },
	{ id: 4, title: "主题密度会影响哪些组件？", time: "2026-11-07", author: "Newbie" },
	{ id: 5, title: "如何在表单中接入自定义组件？", time: "2026-11-09", author: "Newbie" },
];
</script>

<style scoped>
.demo-list-item {
	padding: 12px 16px;
	border-bottom: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
}

.demo-list-item__title {
	margin-bottom: 6px;
	color: var(--newbie-color-text, rgba(0, 0, 0, 0.88));
	font-weight: 500;
}

.demo-list-item__meta {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
