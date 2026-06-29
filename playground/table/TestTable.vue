<template>
	<div>
		<div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
			<span style="font-weight: 500;">持久化模式：</span>
			<a-radio-group v-model:value="persistenceMode" button-style="solid" size="small">
				<a-radio-button value="off">关闭</a-radio-button>
				<a-radio-button value="memory">Memory</a-radio-button>
				<a-radio-button value="local">localStorage</a-radio-button>
				<a-radio-button value="custom">自定义 Key</a-radio-button>
			</a-radio-group>
		</div>

		<NewbieTable
			:key="persistenceKey"
			title="话题列表"
			:form-data="state.data"
			submit-url="http://xx.com"
			row-selection
			:columns="columns()"
			:card-wrapper="false"
			:editable="true"
			:before-cell-submit="onBeforeCellSubmit"
			:search-slots="searchSlots"
			:persistence="persistenceProp"
			@row-click="({ record }) => console.log(record)"
		>
			<template #functional>
				<Space>
					<Button type="primary">Functional1</Button>
					<Button type="default">Functional2</Button>
				</Space>
			</template>
			<template #prepend>
				<Space>
					<Button type="primary">Prepend1</Button>
					<Button type="default">Prepend2</Button>
				</Space>
			</template>
			<template #append>
				<Space>
					<Button type="primary">Append1</Button>
					<Button type="default">Append2</Button>
				</Space>
			</template>
		</NewbieTable>
	</div>
</template>
<script setup>
import {useTableActions} from "../../components";
import {computed, h, reactive, ref} from "vue";
import {Button, Radio, Space} from "ant-design-vue";
import NewbieTable from "../../components/table/NewbieTable.jsx";

import {DeleteOutlined, EditOutlined, LikeOutlined, QrcodeOutlined} from "@ant-design/icons-vue";

const persistenceMode = ref("off");

const persistenceProp = computed(() => {
	switch (persistenceMode.value) {
		case "memory": return true;
		case "local": return { storage: "local", key: "playground" };
		case "custom": return "my-custom-key";
		default: return false;
	}
});

// Force remount when persistence mode changes to reset all state
const persistenceKey = computed(() => `table-${persistenceMode.value}`);

const state = reactive({
	data: [
		{ id: 1, name: "话题1", switch: true, number: 23 },
		{ id: 2, name: "话题2", switch: false, number: 234 },
		{ id: 3, name: "话题3", switch: true, number: 345 },
		{ id: 4, name: "话题4", switch: false, number: 456 },
		{ id: 5, name: "话题5", switch: true, number: 567 },
	],

	options: [
		{ label: "话题1", value: 1 },
		{ label: "话题2", value: 2 },
	],
});

const searchSlots = {
	number: ({ item }) => h("div", {}, item.title),
};

const onBeforeCellSubmit = data => {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, 5000);
	});
};

const columns = () => {
	return [
		{
			title: "#",
			dataIndex: "id",
			width: 40,
			onCopy: true,
		},
		{
			title: "学号",
			dataIndex: "number",
			width: 100,
			editable: true,
			filterable: {},
		},
		{
			title: "Switch",
			dataIndex: "switch",
			width: 100,
			align: "center",
			editable: {
				type: "switch",
				options: ["激活", "失活"],
			},
			customRender: ({ record }) => {
				return record.switch ? "激活" : "失活";
			},
		},
		{
			title: "话题名称",
			dataIndex: "name",
			tooltip: () => h("div", { style: { paddingLeft: "20px" } }, "话题名称12312312"),
			width: 100,
			editable: {
				type: "select",
				options: state.options,
			},
			align: "center",
			customRender: ({ record }) => {
				return record === 1  ? "TEST1" : "TEST2";
			},
		},
		{
			title: "操作",
			width: 300,
			key: "operation",
			align: "center",
			fixed: "right",
			customRender() {
				return useTableActions([
					{
						name: "二维码",
						props: {
							icon: h(QrcodeOutlined),
							size: "small",
						},
						action() {
							console.log("二维码");
						},
					},
					{
						name: "推荐至分类",
						props: {
							icon: h(LikeOutlined),
							size: "small",
						},
						action() {
							console.log("推荐至分类");
						},
					},
					{
						name: "更多",
						children: [
							{
								name: "编辑",
								props: {
									icon: h(EditOutlined),
									size: "small",
								},
								action() {
									console.log("edit");
								},
							},
							{
								name: "删除",
								props: {
									icon: h(DeleteOutlined),
									size: "small",
								},
								action() {
									console.log("delete");
								},
							},
						],
					},
				]);
			},
		},
	];
};
</script>
