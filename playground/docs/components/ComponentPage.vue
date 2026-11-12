<template>
	<div class="docs-page">
		<article ref="articleRef" class="docs-article">
			<div class="docs-breadcrumb">
				<a href="#/">组件</a>
				<span>/</span>
				<span>{{ page.categoryTitle }}</span>
				<span>/</span>
				<span>{{ page.title }}</span>
			</div>

			<header class="docs-page__header">
				<h1>{{ page.title }}</h1>
				<p class="docs-page__lead">{{ page.description }}</p>
				<div class="docs-page__meta">
					<span class="docs-tag">{{ page.component }}</span>
					<span v-if="page.since" class="docs-meta-text">自 {{ page.since }}</span>
					<a
						v-if="page.source"
						class="docs-meta-link"
						:href="page.source"
						target="_blank"
						rel="noreferrer"
					>
						查看源码
					</a>
				</div>
			</header>

			<div v-if="page.notice" class="docs-callout">
				<InfoCircleOutlined />
				<div v-html="inlineMarkdown(page.notice)"></div>
			</div>

			<section v-if="page.whenToUse?.length" id="when-to-use" class="docs-section">
				<h2>何时使用</h2>
				<ul class="docs-when-list">
					<li v-for="item in page.whenToUse" :key="item">{{ item }}</li>
				</ul>
			</section>

			<section v-if="page.demos?.length" class="docs-section">
				<h2 id="demos">代码演示</h2>
				<DemoBlock v-for="demo in page.demos" :key="demo.id" :demo="demo" />
			</section>

			<section v-if="page.guide" :id="page.guide.id || 'guide'" class="docs-section">
				<h2>{{ page.guide.title }}</h2>
				<MarkdownContent :content="page.guide.content" />
			</section>

			<section v-if="hasApi" id="api" class="docs-section">
				<h2>API</h2>

				<ApiTable
					id="api-props"
					title="Props"
					:columns="['参数', '说明', '类型', '默认值']"
					:rows="propRows"
				/>
				<ApiTable
					id="api-events"
					title="Events"
					:columns="['事件名', '说明', '参数']"
					:rows="eventRows"
				/>
				<ApiTable
					id="api-slots"
					title="Slots"
					:columns="['插槽名', '说明']"
					:rows="slotRows"
				/>
				<ApiTable
					id="api-methods"
					title="Methods"
					:columns="['方法', '说明', '参数']"
					:rows="methodRows"
				/>

				<template v-for="type in page.api?.types || []" :key="type.id || type.title">
					<ApiTable
						:id="`api-type-${type.id || type.title}`"
						:title="type.title"
						:description="type.description"
						:columns="type.columns"
						:rows="type.rows"
					/>
				</template>
			</section>

			<section v-if="page.faq?.length" id="faq" class="docs-section">
				<h2>FAQ</h2>
				<div v-for="(item, index) in page.faq" :key="item.title" class="docs-faq">
					<h3 :id="`faq-${index}`">{{ item.title }}</h3>
					<MarkdownContent :content="item.content" />
				</div>
			</section>

			<section v-if="page.provider?.length" id="provider" class="docs-section">
				<h2>全局配置</h2>
				<p class="docs-section__intro">
					以下配置可以通过
					<code>&lt;NewbieProvider :config="..."&gt;</code>
					全局覆盖，实例 props 的优先级更高。
				</p>
				<ApiTable
					v-for="group in page.provider"
					:id="`provider-${group.namespace}`"
					:key="group.namespace"
					:title="group.namespace"
					:description="group.description"
					:columns="['配置项', '说明', '类型', '默认值']"
					:rows="group.rows"
				/>
			</section>

			<nav class="docs-pager">
				<a v-if="prev" class="docs-pager__item" :href="`#${componentPath(prev.slug)}`">
					<span class="docs-pager__label">上一篇</span>
					<span class="docs-pager__title">{{ prev.title }}</span>
				</a>
				<span v-else></span>
				<a
					v-if="next"
					class="docs-pager__item docs-pager__item--next"
					:href="`#${componentPath(next.slug)}`"
				>
					<span class="docs-pager__label">下一篇</span>
					<span class="docs-pager__title">{{ next.title }}</span>
				</a>
			</nav>
		</article>

		<aside class="docs-toc">
			<div class="docs-toc__title">本页目录</div>
			<a
				v-for="item in toc"
				:key="item.id"
				:href="`#${route.path}?anchor=${item.id}`"
				:class="{ active: activeAnchor === item.id, 'is-sub': item.sub }"
				@click.prevent="scrollTo(item.id)"
			>
				{{ item.title }}
			</a>
		</aside>
	</div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { InfoCircleOutlined } from "@antdv-next/icons";
import ApiTable from "./ApiTable.vue";
import DemoBlock from "./DemoBlock.vue";
import MarkdownContent from "./MarkdownContent.vue";
import { getAdjacent } from "../registry.js";
import { inlineMarkdown } from "../utils/markdown.js";
import { componentPath, route } from "../utils/router.js";

const props = defineProps({
	page: { type: Object, required: true },
});

const articleRef = ref(null);
const activeAnchor = ref("");

const propRows = computed(
	() =>
		props.page.api?.props?.map(item => [
			item.name,
			item.description,
			item.type,
			item.default,
		]) || []
);

const eventRows = computed(
	() =>
		props.page.api?.events?.map(item => [item.name, item.description, item.params]) || []
);

const slotRows = computed(
	() => props.page.api?.slots?.map(item => [item.name, item.description]) || []
);

const methodRows = computed(
	() =>
		props.page.api?.methods?.map(item => [item.name, item.description, item.params]) || []
);

const hasApi = computed(
	() =>
		propRows.value.length ||
		eventRows.value.length ||
		slotRows.value.length ||
		methodRows.value.length ||
		props.page.api?.types?.length
);

const adjacent = computed(() => getAdjacent(props.page.slug));
const prev = computed(() => adjacent.value.prev);
const next = computed(() => adjacent.value.next);

const toc = computed(() => {
	const items = [];
	if (props.page.whenToUse?.length) {
		items.push({ id: "when-to-use", title: "何时使用" });
	}
	if (props.page.demos?.length) {
		items.push({ id: "demos", title: "代码演示" });
	}
	if (props.page.guide) {
		items.push({ id: props.page.guide.id || "guide", title: props.page.guide.title });
	}
	if (hasApi.value) {
		items.push({ id: "api", title: "API" });
	}
	if (props.page.faq?.length) {
		items.push({ id: "faq", title: "FAQ" });
	}
	if (props.page.provider?.length) {
		items.push({ id: "provider", title: "全局配置" });
	}
	return items;
});

const scrollTo = id => {
	const element = document.getElementById(id);
	if (element) {
		const top = element.getBoundingClientRect().top + window.scrollY - 88;
		window.scrollTo({ top, behavior: "smooth" });
	}
};

let ticking = false;

const updateActiveAnchor = () => {
	if (!articleRef.value) {
		return;
	}
	const headings = Array.from(
		articleRef.value.querySelectorAll("h2[id], h3[id]")
	).filter(element =>
		toc.value.some(item => item.id === element.id || element.id.startsWith("api-"))
	);
	let current = "";
	for (const heading of headings) {
		if (heading.getBoundingClientRect().top <= 120) {
			current = heading.id.startsWith("api-") ? "api" : heading.id;
		}
	}
	activeAnchor.value = current;
};

const onScroll = () => {
	if (ticking) {
		return;
	}
	ticking = true;
	requestAnimationFrame(() => {
		updateActiveAnchor();
		ticking = false;
	});
};

const setupScrollSpy = () => {
	window.removeEventListener("scroll", onScroll);
	window.addEventListener("scroll", onScroll, { passive: true });
	updateActiveAnchor();
};

onMounted(() => setupScrollSpy());
onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));

watch(
	() => props.page.slug,
	() => {
		activeAnchor.value = "";
		nextTick(() => {
			setupScrollSpy();
			window.scrollTo({ top: 0 });
		});
	}
);
</script>
