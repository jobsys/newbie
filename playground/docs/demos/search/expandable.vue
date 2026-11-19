<template>
	<Card title="展开式搜索项">
		<NewbieSearch
			ref="searchRef"
			:filterable-columns="columns"
			@search="onSearch"
		/>
		<pre class="demo-json">{{ result }}</pre>
	</Card>
</template>

<script setup>
import { ref } from "vue";
import { Card } from "antdv-next";
import { NewbieSearch } from "../../../../components/index.js";

const searchRef = ref(null);
const result = ref("选择“用户角色”或“标签”后点击搜索");

// 模拟真实系统里的长选项列表，超过 20 个时默认折叠，选中项始终可见
const roleOptions = [
	"未分配",
	"超级管理员",
	"辅导员",
	"勤工助学用工单位",
	"系统管理员",
	"校级管理员",
	"院系副书记",
	"院系管理员",
	"综合测评事务管理员",
	"奖助管理校级管理员",
	"仅查看学生信息者",
	"困难认定交叉审核工作组",
	"困难认定校级工作组",
	"困难认定院级工作组",
	"劳动教育管理员",
	"劳动教育任课老师",
	"勤工助学事务管理员",
	"勤工助学学院管理员",
	"勤工助学用人部门",
	"三助一辅事务管理员",
	"三助一辅学院管理员",
	"三助一辅用人部门",
	"学工值班管理员",
	"学院审核小组",
	"研究生国家奖学金",
	"综合测评学院管理员",
];

const columns = [
	{
		title: "用户角色",
		key: "userRole",
		type: "select",
		expandable: "multiple",
		options: roleOptions,
	},
	{
		title: "账号状态",
		key: "accountStatus",
		type: "select",
		expandable: true,
		options: [
			{ label: "正常", value: "normal" },
			{ label: "停用", value: "disabled" },
			{ label: "锁定", value: "locked" },
		],
	},
	{ title: "姓名", key: "name", type: "input" },
];

const onSearch = ({ newbieQuery }) => {
	result.value = JSON.stringify(newbieQuery, null, 2);
};
</script>

<style scoped>
.demo-json {
	margin: 16px 0 0;
	padding: 12px;
	max-height: 240px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
