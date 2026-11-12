<template>
	<Space wrap>
		<NewbieButton>默认按钮</NewbieButton>
		<NewbieButton type="primary">主要按钮</NewbieButton>
		<NewbieButton type="dashed">虚线按钮</NewbieButton>
		<NewbieButton type="text">文本按钮</NewbieButton>
		<NewbieButton type="link">链接按钮</NewbieButton>
		<NewbieButton type="ghost">幽灵按钮</NewbieButton>
		<NewbieButton danger>危险按钮</NewbieButton>
		<NewbieButton type="primary" disabled>禁用按钮</NewbieButton>
	</Space>

	<Divider />

	<Space wrap>
		<NewbieButton type="primary" size="large">大号按钮</NewbieButton>
		<NewbieButton type="primary">中号按钮</NewbieButton>
		<NewbieButton type="primary" size="small">小号按钮</NewbieButton>
	</Space>
</template>

<script setup>
import { Divider, Space } from "antdv-next";
import { NewbieButton } from "../../../../components/index.js";
</script>
