<template>
	<div class="docs-markdown" v-html="html"></div>
</template>

<script setup>
import { computed } from "vue";
import { renderMarkdown } from "../utils/markdown.js";

const props = defineProps({
	content: { type: String, default: "" },
});

const html = computed(() => renderMarkdown(props.content));
</script>
