<template>
	<Space wrap>
		<NewbieButton type="primary" :icon="h(EditOutlined)" label="编辑" />
		<NewbieButton
			type="primary"
			:icon="h(DownloadOutlined)"
			icon-position="right"
			label="下载"
		/>
		<NewbieButton :icon="h(SearchOutlined)" label="搜索" />
		<NewbieButton type="primary" danger :icon="h(DeleteOutlined)" label="删除" />
	</Space>
</template>

<script setup>
import { h } from "vue";
import { Space } from "antdv-next";
import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	SearchOutlined,
} from "@antdv-next/icons";
import { NewbieButton } from "../../../../components/index.js";
</script>
