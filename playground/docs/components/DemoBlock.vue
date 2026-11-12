<template>
	<section :id="`demo-${demo.id}`" class="docs-demo">
		<div class="docs-demo__head">
			<h3>{{ demo.title }}</h3>
			<p v-if="demo.description" v-html="descriptionHtml"></p>
		</div>

		<div class="docs-demo__preview" :class="demo.previewClass">
			<Suspense>
				<component :is="component" v-if="component" />
				<template #fallback>
					<div class="docs-demo__loading">
						<Spin />
					</div>
				</template>
			</Suspense>
		</div>

		<div class="docs-demo__actions">
			<button type="button" class="docs-demo__code-toggle" @click="showCode = !showCode">
				<CodeOutlined />
				<span>{{ showCode ? "收起代码" : "查看代码" }}</span>
				<UpOutlined v-if="showCode" />
				<DownOutlined v-else />
			</button>
		</div>

		<CodeBlock v-if="showCode" :code="source" lang="vue" />
	</section>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from "vue";
import { Spin } from "antdv-next";
import { CodeOutlined, DownOutlined, UpOutlined } from "@antdv-next/icons";
import { getDemoLoader, getDemoSource } from "../utils/demos.js";
import { inlineMarkdown } from "../utils/markdown.js";
import CodeBlock from "./CodeBlock.vue";

const props = defineProps({
	demo: { type: Object, required: true },
});

const showCode = ref(false);

const componentCache = new Map();

const component = computed(() => {
	const loader = getDemoLoader(props.demo.file);
	if (!loader) {
		return null;
	}
	if (!componentCache.has(props.demo.file)) {
		componentCache.set(props.demo.file, defineAsyncComponent(loader));
	}
	return componentCache.get(props.demo.file);
});

const source = computed(() => getDemoSource(props.demo.file));
const descriptionHtml = computed(() => inlineMarkdown(props.demo.description || ""));
</script>
