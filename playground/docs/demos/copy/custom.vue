<template>
	<div class="demo-block">
		<div class="demo-label">customRender 自定义显示内容：</div>
		<NewbieCopy :text="orderNo" :custom-render="renderOrder" show-icon />
	</div>
	<div>
		<div class="demo-label">copy 接管复制逻辑：</div>
		<NewbieCopy :text="orderNo" :copy="copyOrder" show-icon />
	</div>
</template>

<script setup>
import { h, ref } from "vue";
import { message, Tag } from "antdv-next";
import { NewbieCopy } from "../../../../components/index.js";

const orderNo = ref("ORD-20261111-0001");

const renderOrder = text =>
	h("span", { style: { display: "inline-flex", alignItems: "center", gap: "6px" } }, [
		h(Tag, { color: "blue" }, () => "订单号"),
		text,
	]);

const copyOrder = async text => {
	await navigator.clipboard?.writeText?.(`订单：${text}`);
	message.success(`已复制订单 ${text}`);
};
</script>

<style scoped>
.demo-block {
	margin-bottom: 16px;
}

.demo-label {
	margin-bottom: 8px;
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
