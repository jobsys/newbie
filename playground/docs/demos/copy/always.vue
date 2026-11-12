<template>
	<Space orientation="vertical">
		<NewbieCopy text="默认只在悬停时显示复制图标" />
		<NewbieCopy text="showIcon 让图标一直显示" show-icon />
		<NewbieCopy text="averyveryverylongtextthatwillbetruncated" show-icon style="max-width: 260px" />
	</Space>
</template>

<script setup>
import { Space } from "antdv-next";
import { NewbieCopy } from "../../../../components/index.js";
</script>
