<template>
	<Space orientation="vertical">
		<NewbieAddress
			v-model:value="value"
			:data-source="options"
			placeholder="请选择常驻城市"
			style="width: 320px"
		/>
		<div class="demo-result">当前值：{{ value.join(" / ") || "未选择" }}</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbieAddress } from "../../../../components/index.js";

const options = [
	{
		code: "310000",
		name: "上海市",
		children: [
			{
				code: "310100",
				name: "上海市",
				children: [
					{ code: "310101", name: "黄浦区" },
					{ code: "310104", name: "徐汇区" },
					{ code: "310115", name: "浦东新区" },
				],
			},
		],
	},
	{
		code: "330000",
		name: "浙江省",
		children: [
			{
				code: "330100",
				name: "杭州市",
				children: [
					{ code: "330102", name: "上城区" },
					{ code: "330106", name: "西湖区" },
				],
			},
		],
	},
];

const value = ref([]);
</script>

<style scoped>
.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
