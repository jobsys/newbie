<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieButton type="primary" :button-props="{ block: true }">Block 按钮</NewbieButton>
		<Space wrap>
			<NewbieButton type="primary" :button-props="{ shape: 'round' }">圆角按钮</NewbieButton>
			<NewbieButton :button-props="{ shape: 'circle', icon: h(HeartOutlined) }" />
			<NewbieButton type="primary" :button-props="{ loading: true }">持续加载</NewbieButton>
		</Space>
	</Space>
</template>

<script setup>
import { h } from "vue";
import { Space } from "antdv-next";
import { HeartOutlined } from "@antdv-next/icons";
import { NewbieButton } from "../../../../components/index.js";
</script>
