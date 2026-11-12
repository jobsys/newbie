# List 滚动列表

> 固定高度的无限滚动列表。滚动到底部自动请求下一页，自带加载中、空状态和加载完成提示。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/list.js` 生成，请修改页面配置后重新生成，不要直接编辑。

> **注意**：该组件依赖接口返回结构，文档中的交互示例使用静态插槽展示布局；远程用法请参考下方 guide。

## 何时使用

- 需要在一个固定高度的容器中展示可无限加载的列表。
- 接口按页返回数据，并带有 last_page / total 等分页字段。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieList } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/list`。

## 基础用法

`静态布局`：关闭 autoLoad 后组件不发起请求，可以直接使用默认插槽渲染内容。远程模式会使用 pagination.items 渲染。

```vue
<template>
	<NewbieList :auto-load="false" :height="280" finished-text="演示数据 · 没有更多了">
		<div v-for="item in items" :key="item.id" class="demo-list-item">
			<div class="demo-list-item__title">{{ item.title }}</div>
			<div class="demo-list-item__meta">{{ item.time }} · {{ item.author }}</div>
		</div>
	</NewbieList>
</template>

<script setup>
import { NewbieList } from "jobsys-newbie";

const items = [
	{ id: 1, title: "如何配置一份多列表单？", time: "2026-11-01", author: "Newbie" },
	{ id: 2, title: "表格的搜索条件从哪里来？", time: "2026-11-03", author: "Newbie" },
	{ id: 3, title: "上传组件如何开启分块上传？", time: "2026-11-05", author: "Newbie" },
	{ id: 4, title: "主题密度会影响哪些组件？", time: "2026-11-07", author: "Newbie" },
	{ id: 5, title: "如何在表单中接入自定义组件？", time: "2026-11-09", author: "Newbie" },
];
</script>

<style scoped>
.demo-list-item {
	padding: 12px 16px;
	border-bottom: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
}

.demo-list-item__title {
	margin-bottom: 6px;
	color: var(--newbie-color-text, rgba(0, 0, 0, 0.88));
	font-weight: 500;
}

.demo-list-item__meta {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 静态布局 | 关闭 autoLoad 后组件不发起请求，可以直接使用默认插槽渲染内容。远程模式会使用 pagination.items 渲染。 | [list/basic.vue](../../playground/docs/demos/list/basic.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | 列表数据接口 | `string` | `""` |
| extraData | 请求附带参数 | `object` | `{}` |
| height | 列表容器高度，单位 px | `number` | `300` |
| offset | 距离底部多少 px 时触发加载 | `number` | `50` |
| finishedText | 加载完成提示文案 | `string` | `加载完成` |
| autoLoad | 是否在挂载后自动加载第一页 | `boolean` | `true` |
| useStore | 自定义分页 store，需提供 initPagination 与 pagination | `object` | `null` |
| listProps | 兼容旧配置，目前只读取 header / footer | `{ header?: VNode; footer?: VNode }` | `{}` |

## Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 静态内容；远程模式下通常使用 renderItem |
| renderItem | 渲染每一项，参数为 { item, index } |

## Methods

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| loadMore | 手动加载下一页 | `(refresh?: boolean) => Promise<void>` |
| items | 获取当前已加载的数据 | `() => any[]` |
| pagination | 当前分页状态（loading / finished / items 等） | `Ref<PaginationState>` |

## 远程数据用法

设置 `url`（以及可选的 `extraData`）后，组件会在挂载时请求第一页，并在滚动到底部时继续请求下一页。接口返回需要包含 `data`、`last_page`、`total` 等字段：

```vue
<NewbieList
  url="/api/articles"
  :extra-data="{ category: 'notice' }"
  :height="420"
  finished-text="没有更多了"
>
  <template #renderItem="{ item, index }">
    <ArticleItem :item="item" :index="index" />
  </template>
</NewbieList>
```

如果项目里有自己的分页 store，可以传入 `useStore`，store 需要提供 `initPagination(options)` 与 `pagination`。

## FAQ

### 为什么列表一直显示加载中？

列表通过全局 axios 实例请求数据，接口返回的 `status` 必须等于项目约定的成功码，且 `result` 中包含 `data`、`last_page` 等字段。可以在 `main.js` 中通过 `Newbie.config({ httpStatus })` 调整成功码。

### listProps 里的其它属性为什么无效？

迁移到 antdv-next 后 List 组件不再可用，NewbieList 改为完全自绘，`listProps` 目前只保留 `header` 与 `footer`。
