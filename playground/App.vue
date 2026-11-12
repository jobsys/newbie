<script setup>
import { computed, watch } from "vue";
import ComponentPage from "./docs/components/ComponentPage.vue";
import DocsShell from "./docs/components/DocsShell.vue";
import OverviewPage from "./docs/components/OverviewPage.vue";
import { getPage, getPageByLegacy } from "./docs/registry.js";
import { route } from "./docs/utils/router.js";

watch(
	() => route.value.path,
	() => {
		window.scrollTo({ top: 0 });
	}
);

const page = computed(() => {
	const path = route.value.path;
	if (path === "/guide/provider") {
		return getPage("provider");
	}
	if (path.startsWith("/components/")) {
		return getPage(path.slice("/components/".length));
	}
	if (path === "/") {
		return null;
	}
	return getPageByLegacy(path) || null;
});

const isHome = computed(() => route.value.path === "/");
</script>

<template>
	<DocsShell>
		<ComponentPage v-if="page" :key="page.slug" :page="page" />
		<OverviewPage v-else-if="isHome" />
		<div v-else class="docs-not-found">
			<h1>页面不存在</h1>
			<p>没有找到这个组件或指南，可能链接已经过期。</p>
			<a class="docs-button docs-button--primary" href="#/">返回组件总览</a>
		</div>
	</DocsShell>
</template>
