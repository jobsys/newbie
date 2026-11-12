<template>
	<Space orientation="vertical" style="width: 420px">
		<NewbiePassword v-model:value="password" :min="10" :max="24" width="100%" />
		<Alert
			type="info"
			show-icon
			message="强度规则"
			description="密码必须同时包含数字、小写字母、大写字母和特殊符号；长度默认 8 - 20 位。"
		/>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Alert, Space } from "antdv-next";
import { NewbiePassword } from "../../../../components/index.js";

const password = ref("Abc123!@#x");
</script>
