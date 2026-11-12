<template>
	<NewbieForm
		ref="formRef"
		:form="form"
		:columns="[12, 12]"
		:card-wrapper="false"
		break-mode="divider"
		hide-buttons
	/>
</template>

<script setup>
import { NewbieForm } from "../../../../components/index.js";

const form = [
	{ title: "姓名（点号 key）", key: "major.name", required: true },
	{
		title: "专业层次",
		key: "major.level",
		type: "select",
		options: ["本科", "硕士", "博士"],
	},
	{ title: "金额", key: "amount", defaultProps: { prepend: "¥", append: "元" } },
	{ title: "人数", key: "people", type: "number" },
	{ title: "密码", key: "password", type: "password" },
	{ title: "生日", key: "birthday", type: "date" },
	{ title: "入学时间", key: "enrolled_at", type: "time" },
	{ title: "开关", key: "enabled", type: "switch", options: ["启用", "停用"] },
	{
		title: "性别",
		key: "gender",
		type: "radio",
		options: ["男", "女"],
		defaultValue: "男",
	},
	{
		title: "兴趣",
		key: "hobbies",
		type: "checkbox",
		options: ["阅读", "运动", "音乐"],
		defaultValue: ["阅读"],
	},
	{ title: "标签", key: "tags", type: "tag", width: 300 },
	{
		title: "所在地区",
		key: "area",
		type: "cascade",
		options: [
			{ label: "浙江省", value: "zhejiang", children: [{ label: "杭州市", value: "hangzhou" }] },
			{ label: "江苏省", value: "jiangsu", children: [{ label: "南京市", value: "nanjing" }] },
		],
	},
	{
		title: "部门（树选择）",
		key: "department",
		type: "tree-select",
		options: [
			{
				label: "研发中心",
				value: "rd",
				children: [
					{ label: "前端组", value: "fe" },
					{ label: "后端组", value: "be" },
				],
			},
			{ label: "产品部", value: "product" },
		],
	},
	{ title: "地址", key: "address", type: "address", width: 320 },
	{ title: "备注", key: "remark", type: "textarea", columnIndex: [0, 1] },
	{ title: "只读文本", key: "text", type: "text", defaultValue: "文本展示" },
	{
		title: "HTML",
		key: "html",
		type: "html",
		defaultValue: '<p style="margin: 0; color: #c2410c">这里可以放一段自定义 HTML。</p>',
		columnIndex: [0, 1],
	},
];
</script>
