<template>
	<Space wrap>
		<NewbieButton
			type="primary"
			:fetcher="fetcher"
			:icon="h(SaveOutlined)"
			label="保存"
			@click="onSave"
		/>
		<NewbieButton type="default" :fetcher="fetcher" label="取消" />
	</Space>
</template>

<script setup>
import { h, reactive } from "vue";
import { Space } from "antdv-next";
import { SaveOutlined } from "@antdv-next/icons";
import { NewbieButton } from "../../../../components/index.js";

const fetcher = reactive({ loading: false });

const onSave = () => {
	fetcher.loading = true;
	window.setTimeout(() => {
		fetcher.loading = false;
	}, 2000);
};
</script>
