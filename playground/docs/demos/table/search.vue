<template>
	<NewbieTable
		title="订单列表"
		:columns="columns"
		:data-source="data"
		:pagination="false"
		:table-props="{ scroll: { x: 900, y: 260 } }"
		@fetch="onFetch"
	/>
</template>

<script setup>
import { message } from "antdv-next";
import { NewbieTable } from "../../../../components/index.js";

const columns = [
	{ title: "订单号", dataIndex: "order_no", width: 160, filterable: { disableConditions: true } },
	{
		title: "状态",
		dataIndex: "status",
		width: 120,
		filterable: {
			type: "select",
			options: [
				{ label: "已支付", value: "paid" },
				{ label: "待支付", value: "pending" },
				{ label: "已退款", value: "refunded" },
			],
		},
	},
	{ title: "金额", dataIndex: "amount", width: 120, filterable: { type: "number" } },
	{ title: "下单日期", dataIndex: "created_at", width: 160, filterable: { type: "date" } },
	{ title: "备注", dataIndex: "remark", isOnlyForQuery: true, filterable: { type: "textarea" } },
];

const data = [
	{ id: 1, order_no: "ORD-20261101", status: "已支付", amount: 299, created_at: "2026-11-01" },
	{ id: 2, order_no: "ORD-20261102", status: "待支付", amount: 129, created_at: "2026-11-02" },
	{ id: 3, order_no: "ORD-20261103", status: "已退款", amount: 59, created_at: "2026-11-03" },
];

const onFetch = () => {
	message.info("搜索条件变化：演示使用本地数据，实际项目请传 url 并实现 afterFetched");
};
</script>
