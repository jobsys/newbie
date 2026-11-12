<template>
	<div class="docs-overview">
		<section class="docs-hero">
			<div class="docs-hero__content">
				<div class="docs-hero__eyebrow">
					<span class="docs-tag">v{{ version }}</span>
					<span>基于 antdv-next</span>
				</div>
				<h1>Newbie 组件库</h1>
				<p>
					面向企业后台的 Vue 3 组件库。在 antdv-next 之上提供 JSON 配置表单、搜索表格一体化、
					主题 Token、全局配置等能力，让中后台页面保持一致的交互与视觉。
				</p>
				<div class="docs-hero__actions">
					<a class="docs-button docs-button--primary" href="#/components/form">
						开始使用
						<ArrowRightOutlined />
					</a>
					<a class="docs-button" href="#/guide/provider">全局配置</a>
				</div>
			</div>
			<div class="docs-hero__code">
				<div class="docs-hero__code-title">快速安装</div>
				<pre><code>pnpm add jobsys-newbie antdv-next @antdv-next/icons</code></pre>
				<div class="docs-hero__code-title">在应用中注册</div>
				<pre><code>import { createApp } from "vue";
import Newbie from "jobsys-newbie";
import "antdv-next/dist/reset.css";

createApp(App).use(Newbie).mount("#app");</code></pre>
			</div>
		</section>

		<section class="docs-features">
			<article class="docs-feature">
				<h3>配置驱动表单</h3>
				<p>用一份结构化配置生成表单，内置校验、动态显隐、矩阵、评分、公式计算与提交前处理。</p>
			</article>
			<article class="docs-feature">
				<h3>搜索与表格一体</h3>
				<p>列配置同时作为搜索条件，支持展开、排序、可编辑单元格、操作列、持久化与自定义列。</p>
			</article>
			<article class="docs-feature">
				<h3>Design Token 主题</h3>
				<p>密度、主色、明暗模式映射到 antdv-next Token，组件库自身的面板同步跟随。</p>
			</article>
			<article class="docs-feature">
				<h3>全局配置覆盖</h3>
				<p>NewbieProvider 以命名空间合并配置，组件默认值、全局配置、实例 props 三层优先级清晰。</p>
			</article>
		</section>

		<section v-for="group in categories" :key="group.key" class="docs-category">
			<div class="docs-category__head">
				<h2>{{ group.title }}</h2>
				<p>{{ group.description }}</p>
			</div>
			<div class="docs-component-grid">
				<a
					v-for="page in group.pages"
					:key="page.slug"
					class="docs-component-card"
					:href="`#${componentPath(page.slug)}`"
				>
					<span class="docs-component-card__icon">{{ initial(page) }}</span>
					<span class="docs-component-card__body">
						<strong>{{ page.title }}</strong>
						<small>{{ page.description }}</small>
					</span>
					<ArrowRightOutlined class="docs-component-card__arrow" />
				</a>
			</div>
		</section>
	</div>
</template>

<script setup>
import { ArrowRightOutlined } from "@antdv-next/icons";
import { categories, version } from "../registry.js";
import { componentPath } from "../utils/router.js";

const initial = page => page.component.replace(/^Newbie/, "").slice(0, 1);
</script>
