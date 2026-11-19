<template>
	<NewbiePagination
		title="项目卡片"
		:data-source="projects"
		:filterable="false"
		:pagination="{ pageSize: 6 }"
	>
		<template #item="{ item }">
			<div class="demo-project-card">
				<div class="demo-project-card__name">{{ item.name }}</div>
				<div class="demo-project-card__desc">{{ item.description }}</div>
				<div class="demo-project-card__meta">
					{{ item.owner }} · 更新于 {{ item.updated_at }}
				</div>
			</div>
		</template>
	</NewbiePagination>
</template>

<script setup>
import { NewbiePagination } from "../../../../components/index.js";

const projects = [
	{
		id: 1,
		name: "设计系统",
		description: "统一组件、主题 Token 与设计规范",
		owner: "Newbie",
		updated_at: "2026-11-01",
	},
	{
		id: 2,
		name: "运营后台",
		description: "活动配置、素材管理与数据看板",
		owner: "Newbie",
		updated_at: "2026-11-03",
	},
	{
		id: 3,
		name: "移动端壳",
		description: "基于 Webview 的混合应用容器",
		owner: "Newbie",
		updated_at: "2026-11-05",
	},
	{
		id: 4,
		name: "表单引擎",
		description: "拖拽式表单设计与逻辑编排",
		owner: "Newbie",
		updated_at: "2026-11-07",
	},
	{
		id: 5,
		name: "权限中心",
		description: "统一的账号、角色与授权管理",
		owner: "Newbie",
		updated_at: "2026-11-09",
	},
	{
		id: 6,
		name: "消息网关",
		description: "站内信、邮件与短信的统一投递",
		owner: "Newbie",
		updated_at: "2026-11-11",
	},
	{
		id: 7,
		name: "任务调度",
		description: "定时任务与异步作业编排",
		owner: "Newbie",
		updated_at: "2026-11-13",
	},
	{
		id: 8,
		name: "日志检索",
		description: "结构化日志的采集与查询",
		owner: "Newbie",
		updated_at: "2026-11-15",
	},
	{
		id: 9,
		name: "监控告警",
		description: "指标采集、阈值告警与值班流转",
		owner: "Newbie",
		updated_at: "2026-11-17",
	},
	{
		id: 10,
		name: "文件服务",
		description: "对象存储封装与直传签名",
		owner: "Newbie",
		updated_at: "2026-11-19",
	},
	{
		id: 11,
		name: "低代码画布",
		description: "可视化页面搭建与物料体系",
		owner: "Newbie",
		updated_at: "2026-11-21",
	},
	{
		id: 12,
		name: "开放平台",
		description: "API 开放与第三方应用接入",
		owner: "Newbie",
		updated_at: "2026-11-23",
	},
];
</script>

<style scoped>
:deep(.newbie-pagination-items) {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 12px;
}

.demo-project-card {
	padding: 16px;
	border: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
	border-radius: var(--newbie-radius, 6px);
	background: var(--newbie-color-bg-container, #fff);
}

.demo-project-card__name {
	margin-bottom: 6px;
	color: var(--newbie-color-text, rgba(0, 0, 0, 0.88));
	font-weight: 500;
}

.demo-project-card__desc {
	margin-bottom: 8px;
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
}

.demo-project-card__meta {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
