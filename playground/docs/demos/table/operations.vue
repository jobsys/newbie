<template>
	<NewbieTable
		title="操作列与单元格能力"
		:columns="columns"
		:data-source="data"
		:filterable="false"
		:pagination="false"
		:table-props="{ scroll: { x: 1100, y: 260 } }"
	/>
</template>

<script setup>
import { h } from "vue";
import { message } from "antdv-next";
import { DeleteOutlined, EditOutlined, LikeOutlined, QrcodeOutlined } from "@antdv-next/icons";
import { NewbieTable, useTableActions, useTableFile, useTableImage } from "../../../../components/index.js";

const svg = (label, color) =>
	`data:image/svg+xml;charset=utf-8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="54%" text-anchor="middle" fill="#fff" font-size="16">${label}</text></svg>`
	)}`;

const data = [
	{
		id: 1,
		name: "张三",
		status: "在线",
		avatar: svg("张", "#1677ff"),
		file: { name: "合同.pdf", url: "#" },
	},
	{
		id: 2,
		name: "李四",
		status: "离线",
		avatar: [svg("李", "#0b6b4d")],
		file: { name: "报价单.xlsx", url: "#" },
	},
];

const columns = [
	{ title: "编号", dataIndex: "id", width: 100, onCopy: true },
	{
		title: "姓名",
		dataIndex: "name",
		width: 120,
		onClick: ({ record }) => message.info(`查看 ${record.name}`),
	},
	{ title: "状态", dataIndex: "status", width: 100, tooltip: "当前登录状态" },
	{
		title: "头像",
		dataIndex: "avatar",
		width: 100,
		customRender: ({ record }) => useTableImage(record.avatar),
	},
	{
		title: "附件",
		dataIndex: "file",
		width: 180,
		customRender: ({ record }) => useTableFile(record.file),
	},
	{
		title: "操作",
		key: "operation",
		width: 300,
		fixed: "right",
		customRender: () =>
			useTableActions([
				{
					name: "二维码",
					props: { icon: h(QrcodeOutlined), size: "small" },
					action: () => message.info("二维码"),
				},
				{
					name: "推荐",
					props: { icon: h(LikeOutlined), size: "small" },
					action: () => message.info("推荐"),
				},
				{
					name: "更多",
					children: [
						{
							name: "编辑",
							props: { icon: h(EditOutlined), size: "small" },
							action: () => message.info("编辑"),
						},
						{
							name: "删除",
							props: { icon: h(DeleteOutlined), size: "small" },
							action: () => message.info("删除"),
						},
					],
				},
			]),
	},
];
</script>
