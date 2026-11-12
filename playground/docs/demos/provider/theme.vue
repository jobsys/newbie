<template>
	<Space orientation="vertical" style="width: 100%">
		<Space wrap>
			<span>密度：</span>
			<Segmented v-model:value="density" :options="densityOptions" size="small" />
			<span>主色：</span>
			<Select v-model:value="primary" :options="colorOptions" size="small" style="width: 120px" />
			<span>暗色：</span>
			<Switch v-model:checked="dark" size="small" />
		</Space>

		<NewbieThemeProvider
			:density="density"
			:color-primary="primary"
			:scheme="dark ? 'dark' : 'light'"
		>
			<div class="demo-surface">
				<Space wrap style="margin-bottom: 16px">
					<Button type="primary">主要按钮</Button>
					<Button>默认按钮</Button>
					<Button danger>危险按钮</Button>
				</Space>
				<Space wrap style="margin-bottom: 16px">
					<Input placeholder="输入框" style="width: 200px" />
					<Select :options="selectOptions" style="width: 160px" />
					<DatePicker />
				</Space>
				<Table
					size="small"
					:pagination="false"
					:columns="columns"
					:data-source="data"
					:scroll="{ y: 120 }"
				/>
			</div>
		</NewbieThemeProvider>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import {
	Button,
	DatePicker,
	Input,
	Segmented,
	Select,
	Space,
	Switch,
	Table,
} from "antdv-next";
import { NewbieThemeProvider } from "../../../../components/index.js";

const density = ref("default");
const primary = ref("#1677ff");
const dark = ref(false);

const densityOptions = ["compact", "default", "loose"];
const colorOptions = [
	{ label: "拂晓蓝", value: "#1677ff" },
	{ label: "暖橙", value: "#c2410c" },
	{ label: "青绿", value: "#0b6b4d" },
	{ label: "紫罗兰", value: "#7048e8" },
];

const columns = [
	{ title: "姓名", dataIndex: "name" },
	{ title: "状态", dataIndex: "status" },
];

const selectOptions = [
	{ label: "选项一", value: "1" },
	{ label: "选项二", value: "2" },
];

const data = [
	{ id: 1, name: "张三", status: "启用" },
	{ id: 2, name: "李四", status: "停用" },
	{ id: 3, name: "王五", status: "启用" },
];
</script>

<style scoped>
.demo-surface {
	padding: 20px;
	background: var(--newbie-color-bg-container, #fff);
	border: 1px solid var(--newbie-color-border, #f0f0f0);
	border-radius: 8px;
}
</style>
