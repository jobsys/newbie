<template>
	<NewbieThemeProvider
		:density="density"
		:color-primary="primaryColor"
		:scheme="dark ? 'dark' : 'light'"
		:locale="locales[locale]"
	>
		<NewbieProvider :config="providerConfig" :locale="locale">
			<div class="docs-shell">
				<header class="docs-header">
					<a class="docs-brand" href="#/" @click="closeSider">
						<span class="docs-brand__mark">N</span>
						<span class="docs-brand__text">
							<strong>Newbie</strong>
							<small>Vue 3 组件库</small>
						</span>
					</a>

					<nav class="docs-header__nav">
						<a
							href="#/"
							:class="{ active: isHome || route.path.startsWith('/components') }"
						>
							组件
						</a>
						<a
							href="#/guide/provider"
							:class="{ active: route.path === '/guide/provider' }"
						>
							全局配置
						</a>
					</nav>

					<div class="docs-header__settings">
						<a-segmented
							v-model:value="density"
							size="small"
							:options="densityOptions"
						/>
						<a-select
							v-model:value="primaryColor"
							size="small"
							:options="colorOptions"
							style="width: 112px"
						/>
						<a-tooltip :title="dark ? '切换到浅色模式' : '切换到暗色模式'">
							<a-switch v-model:checked="dark" size="small" />
						</a-tooltip>
						<a-select
							v-model:value="locale"
							size="small"
							:options="localeOptions"
							style="width: 92px"
						/>
					</div>

					<div class="docs-header__mobile">
						<a-switch v-model:checked="dark" size="small" />
						<button
							class="docs-menu-button"
							type="button"
							aria-label="打开组件导航"
							@click="siderOpen = !siderOpen"
						>
							<MenuOutlined />
						</button>
					</div>
				</header>

				<div class="docs-body">
					<aside
						class="docs-sider"
						:class="{ 'is-open': siderOpen }"
						:style="siderOpen ? { transform: 'translateX(0)' } : undefined"
					>
						<div class="docs-sider__search">
							<a-input
								v-model:value="keyword"
								placeholder="搜索组件"
								allow-clear
								size="middle"
							>
								<template #prefix>
									<SearchOutlined />
								</template>
							</a-input>
						</div>

						<nav class="docs-sider__nav" aria-label="组件导航">
							<a
								href="#/"
								class="docs-sider__overview"
								:class="{ active: isHome }"
								@click="closeSider"
							>
								<AppstoreOutlined />
								<span>组件总览</span>
							</a>

							<div v-for="group in filteredCategories" :key="group.key" class="docs-sider__group">
								<div class="docs-sider__group-title">{{ group.title }}</div>
								<a
									v-for="page in group.pages"
									:key="page.slug"
									:href="`#${componentPath(page.slug)}`"
									class="docs-sider__link"
									:class="{ active: route.path === componentPath(page.slug) }"
									@click="closeSider"
								>
									{{ page.title }}
								</a>
							</div>

							<div v-if="!filteredCategories.length" class="docs-sider__empty">
								没有找到匹配的组件
							</div>
						</nav>
					</aside>

					<div v-if="siderOpen" class="docs-sider-mask" @click="siderOpen = false"></div>

					<main class="docs-main">
						<slot />
					</main>
				</div>
			</div>
		</NewbieProvider>
	</NewbieThemeProvider>
</template>

<script setup>
import { computed, ref } from "vue";
import zhCN from "antdv-next/locale/zh_CN";
import enUS from "antdv-next/locale/en_US";
import { AppstoreOutlined, MenuOutlined, SearchOutlined } from "@antdv-next/icons";
import { NewbieProvider, NewbieThemeProvider } from "../../../components/index.js";
import { categories } from "../registry.js";
import { componentPath, route } from "../utils/router.js";

const locales = { zh_CN: zhCN, en_US: enUS };

const density = ref("default");
const primaryColor = ref("#1677ff");
const dark = ref(false);
const locale = ref("zh_CN");
const keyword = ref("");
const siderOpen = ref(false);

const providerConfig = {
	// 文档示例均为本地数据，这里只演示 Provider 的挂载方式
	table: { pageSize: 20 },
};

const densityOptions = [
	{ label: "紧凑", value: "compact" },
	{ label: "默认", value: "default" },
	{ label: "宽松", value: "loose" },
];

const colorOptions = [
	{ label: "拂晓蓝", value: "#1677ff" },
	{ label: "暖橙", value: "#c2410c" },
	{ label: "青绿", value: "#0b6b4d" },
	{ label: "紫罗兰", value: "#7048e8" },
];

const localeOptions = [
	{ label: "中文", value: "zh_CN" },
	{ label: "English", value: "en_US" },
];

const isHome = computed(() => route.value.path === "/");

const filteredCategories = computed(() => {
	const query = keyword.value.trim().toLowerCase();
	if (!query) {
		return categories;
	}
	return categories
		.map(group => ({
			...group,
			pages: group.pages.filter(page => {
				const text = `${page.title} ${page.component} ${page.slug}`.toLowerCase();
				return text.includes(query);
			}),
		}))
		.filter(group => group.pages.length);
});

const closeSider = () => {
	siderOpen.value = false;
};
</script>
