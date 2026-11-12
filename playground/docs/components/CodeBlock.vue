<template>
	<div class="docs-code">
		<div class="docs-code__header">
			<span class="docs-code__lang">{{ lang }}</span>
			<button class="docs-code__copy" type="button" @click="onCopy">
				<CheckOutlined v-if="copied" />
				<CopyOutlined v-else />
				<span>{{ copied ? "已复制" : "复制代码" }}</span>
			</button>
		</div>
		<pre class="docs-code__body"><code v-html="highlighted"></code></pre>
	</div>
</template>

<script setup>
import { computed, ref } from "vue";
import { message } from "antdv-next";
import { CheckOutlined, CopyOutlined } from "@antdv-next/icons";
import { highlight } from "../utils/highlight.js";

const props = defineProps({
	code: { type: String, default: "" },
	lang: { type: String, default: "vue" },
});

const copied = ref(false);

const highlighted = computed(() => highlight(props.code, props.lang));

const onCopy = async () => {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(props.code);
		} else {
			const textarea = document.createElement("textarea");
			textarea.value = props.code;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
		copied.value = true;
		message.success("代码已复制");
		window.setTimeout(() => {
			copied.value = false;
		}, 1600);
	} catch {
		message.error("复制失败，请手动选择代码");
	}
};
</script>
