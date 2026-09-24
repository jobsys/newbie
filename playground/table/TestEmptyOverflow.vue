<template>
	<div style="background: #f0f2f5; padding: 16px;">
		<NewbieTable
			method="post"
			:form-data="[]"
			row-selection
			:columns="columns()"
			:table-props="{ size: 'small' }"
		>
			<template #functional>
				<a-button type="primary">新增记录</a-button>
			</template>
			<template #append>
				<a-button type="primary" ghost>批量审核</a-button>
			</template>
		</NewbieTable>
	</div>
</template>
<script setup>
import NewbieTable from "../../components/table/NewbieTable.jsx";

const columns = () => [
	{ title: "审核状态", dataIndex: "approval_status", width: 200 },
	{ title: "工号", dataIndex: "work_num", width: 110, filterable: { key: "user.work_num" } },
	{ title: "姓名", dataIndex: "nickname", width: 100, filterable: { key: "user.nickname" } },
	{ title: "奖励名称", dataIndex: "reward_name", width: 200, ellipsis: true, filterable: true },
	{ title: "奖励级别", dataIndex: "reward_level", width: 120, filterable: true },
	{ title: "更新时间", dataIndex: "updated_at", width: 150 },
]
</script>
