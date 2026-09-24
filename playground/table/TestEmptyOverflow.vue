<template>
	<div style="background: #f0f2f5; padding: 16px;">
		<!-- 复刻用户项目场景：7 个宽列、无 append、无 pagination 内容、空数据 -->
		<NewbieTable
			method="post"
			:form-data="[]"
			:columns="columns()"
			:table-props="{ size: 'small' }"
		>
			<template #functional>
				<a-button type="primary">新增记录</a-button>
			</template>
		</NewbieTable>
	</div>
</template>
<script setup>
import NewbieTable from "../../components/table/NewbieTable.jsx";

const columns = () => [
	{ title: "审核状态", dataIndex: "approval_status", width: 280 },
	{ title: "工号", dataIndex: "work_num", width: 150 },
	{ title: "姓名", dataIndex: "nickname", width: 150 },
	{ title: "专业技术职务", dataIndex: "title", width: 220 },
	{ title: "专业技术职务详细", dataIndex: "title_detail", width: 220 },
	{ title: "起始时间", dataIndex: "start_at", width: 180 },
	{ title: "结束时间", dataIndex: "end_at", width: 180 },
]
</script>
