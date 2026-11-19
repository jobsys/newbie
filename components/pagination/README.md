# Pagination 分页列表

> NewbieTable 的搜索、取数与分页能力，配上完全自定义的 item 渲染：卡片、时间轴等任意业务形态。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/pagination.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 列表数据不适合用表格展示，希望渲染成卡片、时间轴等自定义形态。
- 仍需要 NewbieTable 那套搜索、分页、持久化与刷新能力。
- 本地数据想要开箱即用的翻页，或者卡片类列表需要多选与批量操作（批量删除等）。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbiePagination } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/pagination`。

## 基础用法

`卡片列表`：dataSource 传本地数据，#item 插槽自定义每一项的渲染。无 url 且未接管总数时，组件自动按 pageSize 做客户端分页，翻页纯前端完成。

```vue
<template>
	<NewbiePagination
		title="项目卡片"
		:data-source="projects"
		:filterable="false"
		:pagination="{ pageSize: 6 }"
	>
		<template #item="{ item }">
			<div class="demo-project-card">
				<div class="demo-project-card__name">{{ item.name }}</div>
				<div class="demo-project-card__desc">{{ item.description }}</div>
				<div class="demo-project-card__meta">
					{{ item.owner }} · 更新于 {{ item.updated_at }}
				</div>
			</div>
		</template>
	</NewbiePagination>
</template>

<script setup>
import { NewbiePagination } from "jobsys-newbie";

const projects = [
	{
		id: 1,
		name: "设计系统",
		description: "统一组件、主题 Token 与设计规范",
		owner: "Newbie",
		updated_at: "2026-11-01",
	},
	{
		id: 2,
		name: "运营后台",
		description: "活动配置、素材管理与数据看板",
		owner: "Newbie",
		updated_at: "2026-11-03",
	},
	{
		id: 3,
		name: "移动端壳",
		description: "基于 Webview 的混合应用容器",
		owner: "Newbie",
		updated_at: "2026-11-05",
	},
	{
		id: 4,
		name: "表单引擎",
		description: "拖拽式表单设计与逻辑编排",
		owner: "Newbie",
		updated_at: "2026-11-07",
	},
	{
		id: 5,
		name: "权限中心",
		description: "统一的账号、角色与授权管理",
		owner: "Newbie",
		updated_at: "2026-11-09",
	},
	{
		id: 6,
		name: "消息网关",
		description: "站内信、邮件与短信的统一投递",
		owner: "Newbie",
		updated_at: "2026-11-11",
	},
	{
		id: 7,
		name: "任务调度",
		description: "定时任务与异步作业编排",
		owner: "Newbie",
		updated_at: "2026-11-13",
	},
	{
		id: 8,
		name: "日志检索",
		description: "结构化日志的采集与查询",
		owner: "Newbie",
		updated_at: "2026-11-15",
	},
	{
		id: 9,
		name: "监控告警",
		description: "指标采集、阈值告警与值班流转",
		owner: "Newbie",
		updated_at: "2026-11-17",
	},
	{
		id: 10,
		name: "文件服务",
		description: "对象存储封装与直传签名",
		owner: "Newbie",
		updated_at: "2026-11-19",
	},
	{
		id: 11,
		name: "低代码画布",
		description: "可视化页面搭建与物料体系",
		owner: "Newbie",
		updated_at: "2026-11-21",
	},
	{
		id: 12,
		name: "开放平台",
		description: "API 开放与第三方应用接入",
		owner: "Newbie",
		updated_at: "2026-11-23",
	},
];
</script>

<style scoped>
:deep(.newbie-pagination-items) {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 12px;
}

.demo-project-card {
	padding: 16px;
	border: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
	border-radius: var(--newbie-radius, 6px);
	background: var(--newbie-color-bg-container, #fff);
}

.demo-project-card__name {
	margin-bottom: 6px;
	color: var(--newbie-color-text, rgba(0, 0, 0, 0.88));
	font-weight: 500;
}

.demo-project-card__desc {
	margin-bottom: 8px;
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
}

.demo-project-card__meta {
	color: var(--newbie-color-text-tertiary, rgba(0, 0, 0, 0.45));
	font-size: 12px;
}
</style>
```

## 更多示例

| 示例           | 说明                                                                                                                                                                                                                                    | 源码                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 卡片列表       | dataSource 传本地数据，#item 插槽自定义每一项的渲染。无 url 且未接管总数时，组件自动按 pageSize 做客户端分页，翻页纯前端完成。                                                                                                          | [pagination/basic.vue](../../playground/docs/demos/pagination/basic.vue)         |
| 多选与批量操作 | 四个区域各就各位：#prepend 在最上方；#functional 与刷新按钮同行（作用域带 selectedItems / clearSelection / toggleAllSelection），批量操作放这里；#item 作用域带 selected / selectionDisabled / toggleSelect；#append 在底部与分页同行。 | [pagination/selection.vue](../../playground/docs/demos/pagination/selection.vue) |
| 搜索与排序     | filterableColumns 直传 SearchItemConfig 生成搜索栏；无 url 时搜索点击只触发 fetch 事件，由业务自行取数。                                                                                                                                | [pagination/search.vue](../../playground/docs/demos/pagination/search.vue)       |

## Props

| 参数              | 说明                                                                                                                                                                                    | 类型                                                                                                     | 默认值  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| title             | 标题                                                                                                                                                                                    | `string`                                                                                                 | `""`    |
| filterable        | 是否显示搜索栏                                                                                                                                                                          | `boolean`                                                                                                | `true`  |
| filterableColumns | 搜索项配置，直传给内部 NewbieSearch 的 filterableColumns                                                                                                                                | `SearchItemConfig[]` \| `() => SearchItemConfig[]`                                                       | `[]`    |
| sortableColumns   | 可排序的搜索项，直传给内部 NewbieSearch 的 sortableColumns                                                                                                                              | `array` \| `Function`                                                                                    | `[]`    |
| searchSlots       | 透传给 NewbieSearch 的插槽                                                                                                                                                              | `object`                                                                                                 | `{}`    |
| pagination        | 是否分页，或自定义 antdv-next Pagination 配置；无 url 且未通过 setPagination 接管总数时为客户端分页（组件按 pageSize 切片数据），翻页纯前端完成                                         | `boolean` \| `object`                                                                                    | `true`  |
| pageEvents        | 透传给分页组件的事件                                                                                                                                                                    | `object`                                                                                                 | `{}`    |
| autoQuery         | 搜索条件变化后是否自动查询；透传给内部 `NewbieSearch`（约 300ms 防抖）                                                                                                                  | `boolean`                                                                                                | `false` |
| url               | 数据接口                                                                                                                                                                                | `string`                                                                                                 | `""`    |
| method            | 请求方式                                                                                                                                                                                | `get` \| `post`                                                                                          | `get`   |
| extraData         | 请求附加参数                                                                                                                                                                            | `object`                                                                                                 | `{}`    |
| afterFetched      | 接口数据处理函数，必须返回 `{ items, totalSize }`；未提供或不是函数时组件会 `console.error` 并放弃本次结果                                                                              | `(res: any) => { items: any[]; totalSize: number }`                                                      | `null`  |
| itemKey           | 数据项主键，rowSelection 依赖它                                                                                                                                                         | `string` \| `Function`                                                                                   | `id`    |
| rowSelection      | 选择配置：`true` 全默认；对象支持 `onChange(selectedItems, selectedKeys)`、`disabled({ item, index })`、`preserveSelectedKeys`（翻页后保留选中，默认每次取数清空，与 NewbieTable 一致） | `boolean` \| `object`                                                                                    | `false` |
| dataSource        | 本地数据。无 url 且未接管总数时视为全量数据，由组件自动做客户端分页；接管后（setData + setPagination）表示当页数据                                                                      | `any[]`                                                                                                  | `[]`    |
| formData          | dataSource 的别名                                                                                                                                                                       | `any[]`                                                                                                  | `[]`    |
| showRefresh       | 是否显示刷新按钮                                                                                                                                                                        | `boolean`                                                                                                | `true`  |
| persistence       | 持久化配置，保存分页视图状态（当前页与每页条数）；冷数据默认自动恢复                                                                                                                    | `boolean` \| `string` \| `{ key?: string; storage?: 'memory' \| 'local'; restore?: 'auto' \| 'manual' }` | `false` |
| searchPersistence | 内部 NewbieSearch 的持久化配置；不传时沿用 persistence，但冷数据默认交给“恢复上次查询”入口                                                                                              | `boolean` \| `string` \| `{ key?: string; storage?: 'memory' \| 'local'; restore?: 'auto' \| 'manual' }` | -       |
| cardWrapper       | 是否用 Card 包裹                                                                                                                                                                        | `boolean`                                                                                                | `false` |

## Events

| 事件名          | 说明                                                    | 参数                                        |
| --------------- | ------------------------------------------------------- | ------------------------------------------- |
| fetch           | 没有 url 时，搜索或刷新会触发该事件，由业务自行加载数据 | `() => void`                                |
| selectionChange | rowSelection 开启时选择发生变化触发                     | `({ selectedItems, selectedKeys }) => void` |

## Slots

| 插槽名     | 说明                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| item       | 渲染每一项（无默认实现，必须自定义），作用域 `{ item, index, selected, selectionDisabled, toggleSelect }`；rowSelection 关闭时 selected 恒为 false |
| prepend    | 最上方、搜索栏之前的内容，作用域 `{ selectedItems, selectedKeys, clearSelection, toggleAllSelection }`                                             |
| functional | 与刷新按钮同行的内容区（刷新在右），作用域同 prepend，批量操作放这里                                                                               |
| append     | 底部内容，有分页时与分页条同行（分页在右），作用域同 prepend                                                                                       |
| title      | 自定义标题                                                                                                                                         |
| extra      | Card 右上角内容（cardWrapper 时生效）                                                                                                              |
| empty      | 自定义空状态                                                                                                                                       |

## Methods

| 方法                | 说明                                      | 参数                                                                |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| getData             | 获取当前数据                              | `() => any[]`                                                       |
| setData             | 设置当前数据                              | `(items: any[]) => void`                                            |
| setPagination       | 设置分页信息                              | `(total?: number, currentPage?: number, pageSize?: number) => void` |
| getPagination       | 获取分页状态                              | `() => object`                                                      |
| getSelection        | 获取选中的数据项                          | `() => any[]`                                                       |
| setSelection        | 整体替换选中项                            | `(items: any[]) => void`                                            |
| toggleSelection     | 切换某一项的选中状态                      | `(item: any, index?: number) => void`                               |
| toggleAllSelection  | 全选 / 取消全选当前页可选项               | `() => void`                                                        |
| clearSelection      | 清空选中                                  | `() => void`                                                        |
| getQueryData        | 获取当前搜索条件与分页参数                | `() => object`                                                      |
| setQueryData        | 设置搜索条件                              | `(fields: object) => void`                                          |
| doFetch             | 重新请求数据，传 true 时回到第一页        | `(refresh?: boolean) => Promise<void>`                              |
| setLoading          | 设置 loading                              | `(loading: boolean) => void`                                        |
| refreshStatusCounts | 刷新状态分段计数，转发给内部 NewbieSearch | `(force?: boolean) => Promise<object>`                              |

## FAQ

### 和 NewbieTable 什么时候选哪个？

数据适合表格（列对齐、列宽、固定列）时用 NewbieTable；希望按卡片、时间轴等业务形态展示，但仍要搜索、分页、持久化时用 NewbiePagination。两者取数、搜索与分页参数的行为保持一致，业务代码可以低成本切换。

### 为什么翻页后选中被清空了？

与 NewbieTable 保持一致：每次取数后默认清空选中，避免跨页累积造成误删。需要跨页批量操作时配置 `:row-selection="{ preserveSelectedKeys: true }"`。

### 本地数据怎么分页？什么时候需要 setPagination？

无 url 且没有通过 setPagination 设置总数时，dataSource 被视为全量数据，组件自动按 pageSize 做客户端分页，翻页纯前端完成。只有在手动模式（监听 fetch 事件自行取数）下，才需要在回调里 setData 提供当页数据并 setPagination(total, currentPage, pageSize) 提供总数。
