<template>
	<NewbiePagination
		title="订单卡片"
		:data-source="orders"
		:filterable-columns="filterableColumns"
		:pagination="false"
		@fetch="onFetch"
	>
		<template #item="{ item }">
			<div class="demo-order-card">
				<div class="demo-order-card__head">
					<span class="demo-order-card__no">{{ item.order_no }}</span>
					<span class="demo-order-card__status">{{ item.status }}</span>
				</div>
				<div class="demo-order-card__meta">
					金额 ¥{{ item.amount }} · {{ item.created_at }}
				</div>
			</div>
		</template>
	</NewbiePagination>
</template>

<script setup>
import { message } from "antdv-next";
import { NewbiePagination } from "../../../../components/index.js";

// 与 NewbieTable 的列 filterable 配置一致，只是不需要经过 columns，直接传搜索项
const filterableColumns = [
	{ key: "order_no", title: "订单号", type: "input", disableConditions: true },
	{ key: "amount", title: "金额", type: "number" },
	{ key: "created_at", title: "下单日期", type: "date" },
	{
		key: "status",
		title: "状态",
		type: "segmented",
		span: 2,
		options: [
			{ label: "全部", value: "" },
			{ label: "已支付", value: "paid" },
			{ label: "待支付", value: "pending" },
			{ label: "已退款", value: "refunded" },
		],
	},
];

const orders = [
	{ id: 1, order_no: "ORD-20261101", status: "已支付", amount: 299, created_at: "2026-11-01" },
	{ id: 2, order_no: "ORD-20261102", status: "待支付", amount: 129, created_at: "2026-11-02" },
	{ id: 3, order_no: "ORD-20261103", status: "已退款", amount: 59, created_at: "2026-11-03" },
];

const onFetch = () => {
	message.info("搜索条件变化：演示使用本地数据，实际项目请传 url 并实现 afterFetched");
};
</script>

<style scoped>
:deep(.newbie-pagination-items) {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 12px;
}

.demo-order-card {
	padding: 14px 16px;
	border: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
	border-radius: var(--newbie-radius, 6px);
	background: var(--newbie-color-bg-container, #fff);
}

.demo-order-card__head {
	display: flex;
	justify-content: space-between;
	margin-bottom: 6px;
}

.demo-order-card__no {
	color: var(--newbie-color-text, rgba(0, 0, 0, 0.88));
	font-weight: 500;
}

.demo-order-card__status {
	color: var(--newbie-color-primary, #1677ff);
}

.demo-order-card__meta {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
