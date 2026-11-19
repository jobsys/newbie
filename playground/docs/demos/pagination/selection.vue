<template>
	<NewbiePagination
		title="通知卡片"
		:data-source="notices"
		:filterable="false"
		:pagination="{ pageSize: 3 }"
		:row-selection="{
			disabled: ({ item }) => item.locked,
		}"
		@selection-change="onSelectionChange"
	>
		<template #prepend>
			<Alert type="info" show-icon message="prepend 位于搜索栏与列表之间" />
		</template>
		<template #functional="{ selectedItems, clearSelection, toggleAllSelection }">
			<div class="demo-batch-bar">
				<Button size="small" @click="toggleAllSelection()">全选本页</Button>
				<span v-if="selectedItems.length" class="demo-batch-bar__count">
					已选 {{ selectedItems.length }} 条
				</span>
				<Button
					v-if="selectedItems.length"
					size="small"
					danger
					@click="onBatchDelete(selectedItems, clearSelection)"
				>
					批量删除
				</Button>
			</div>
		</template>
		<template #item="{ item, selected, selectionDisabled, toggleSelect }">
			<div
				class="demo-notice-card"
				:class="{ 'is-selected': selected, 'is-disabled': selectionDisabled }"
				@click="selectionDisabled ? null : toggleSelect()"
			>
				<div class="demo-notice-card__check" :class="{ 'is-checked': selected }" />
				<div class="demo-notice-card__body">
					<div class="demo-notice-card__title">{{ item.title }}</div>
					<div class="demo-notice-card__meta">
						{{ item.publisher }} · {{ item.published_at }}
						<span v-if="item.locked" class="demo-notice-card__locked"
							>已锁定，不可选择</span
						>
					</div>
				</div>
			</div>
		</template>
		<template #append>
			<div class="demo-append">append 会与分页共用底部一行；关闭分页时单独展示。</div>
		</template>
	</NewbiePagination>
</template>

<script setup>
import { Alert, Button, message } from "antdv-next";
import { NewbiePagination } from "../../../../components/index.js";

const notices = [
	{
		id: 1,
		title: "系统维护通知",
		publisher: "运维中心",
		published_at: "2026-11-01",
		locked: false,
	},
	{
		id: 2,
		title: "新版组件库发布",
		publisher: "前端组",
		published_at: "2026-11-03",
		locked: false,
	},
	{ id: 3, title: "制度归档说明", publisher: "行政部", published_at: "2026-11-05", locked: true },
	{
		id: 4,
		title: "年度评审安排",
		publisher: "人事部",
		published_at: "2026-11-07",
		locked: false,
	},
];

const onSelectionChange = ({ selectedItems, selectedKeys }) => {
	message.info(`当前选中 ${selectedItems.length} 条：${selectedKeys.join(", ") || "无"}`);
};

const onBatchDelete = (selectedItems, clearSelection) => {
	message.success(`删除 ${selectedItems.length} 条（演示数据未真正删除）`);
	clearSelection();
};
</script>

<style scoped>
:deep(.newbie-pagination-items) {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 12px;
}

.demo-batch-bar {
	display: flex;
	gap: 8px;
	align-items: center;
}

.demo-batch-bar__count {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
}

.demo-append {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}

.demo-notice-card {
	position: relative;
	display: flex;
	align-items: center;
	padding: 14px 16px 14px 36px;
	border: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
	border-radius: var(--newbie-radius, 6px);
	background: var(--newbie-color-bg-container, #fff);
	cursor: pointer;
	transition: border-color 0.2s;
}

.demo-notice-card.is-selected {
	border-color: var(--newbie-color-primary, #1677ff);
}

.demo-notice-card.is-disabled {
	cursor: not-allowed;
	opacity: 0.55;
}

.demo-notice-card__check {
	position: absolute;
	left: 12px;
	width: 16px;
	height: 16px;
	border: 1px solid var(--newbie-color-border, #d9d9d9);
	border-radius: 50%;
}

.demo-notice-card__check.is-checked {
	border-color: var(--newbie-color-primary, #1677ff);
	background: var(--newbie-color-primary, #1677ff);
	box-shadow: inset 0 0 0 3px var(--newbie-color-bg-container, #fff);
}

.demo-notice-card__title {
	margin-bottom: 4px;
	color: var(--newbie-color-text, rgba(0, 0, 0, 0.88));
	font-weight: 500;
}

.demo-notice-card__meta {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}

.demo-notice-card__locked {
	margin-left: 8px;
}
</style>
