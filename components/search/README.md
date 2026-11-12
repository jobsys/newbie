# Search 搜索栏

> 把表格列配置直接变成搜索条件，支持条件运算、展开单选/多选、排序设置、持久化和自定义渲染。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/search.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 列表页需要一套统一风格的搜索栏。
- 搜索条件来自表格列配置，希望减少重复定义。
- 需要展开条件、多选、排序或保存上次查询。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieSearch } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/search`。

## 基础用法

`基础用法`：filterableColumns 定义搜索项，type 决定输入控件。点击搜索后通过 search 事件拿到 newbieQuery。

```vue
<template>
	<Card title="搜索栏">
		<NewbieSearch ref="searchRef" :filterable-columns="columns" @search="onSearch" />
		<pre class="demo-json">{{ result }}</pre>
	</Card>
</template>

<script setup>
import { ref } from "vue";
import { Card, message } from "antdv-next";
import { NewbieSearch } from "jobsys-newbie";

const searchRef = ref(null);
const result = ref("点击“搜索”查看 getQueryForm() 的结果");

const columns = [
	{ title: "姓名", key: "name", type: "input", disableConditions: true },
	{ title: "学号", key: "student_no", type: "textarea" },
	{
		title: "审核状态",
		key: "status",
		type: "select",
		options: [
			{ label: "通过", value: "pass" },
			{ label: "未通过", value: "deny" },
			{ label: "待审核", value: "waiting" },
		],
	},
	{ title: "金额", key: "amount", type: "number", defaultValue: [20, 0] },
	{ title: "注册日期", key: "registered_at", type: "date" },
	{ title: "是否启用", key: "enabled", type: "switch", options: ["启用", "禁用"] },
	{
		title: "所在地区",
		key: "area",
		type: "cascade",
		options: [
			{
				label: "浙江省",
				value: "zhejiang",
				children: [{ label: "杭州市", value: "hangzhou" }],
			},
			{
				label: "江苏省",
				value: "jiangsu",
				children: [{ label: "南京市", value: "nanjing" }],
			},
		],
	},
];

const onSearch = ({ newbieQuery, newbieSort }) => {
	result.value = JSON.stringify({ newbieQuery, newbieSort }, null, 2);
	message.success("已触发 search 事件");
};
</script>

<style scoped>
.demo-json {
	margin: 16px 0 0;
	padding: 12px;
	max-height: 240px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | filterableColumns 定义搜索项，type 决定输入控件。点击搜索后通过 search 事件拿到 newbieQuery。 | [search/basic.vue](../../playground/docs/demos/search/basic.vue) |
| 展开单选与多选 | expandable 为 true 时展开单选，为 "multiple" 时展开多选；多选条件的值会自动使用 include。 | [search/expandable.vue](../../playground/docs/demos/search/expandable.vue) |
| 排序设置 | sortableColumns 会生成排序设置入口，搜索时通过 newbieSort 返回字段与方向。 | [search/sortable.vue](../../playground/docs/demos/search/sortable.vue) |
| 自定义搜索项 | customRender 返回 displayValue 等展示信息，配合以 item.key 命名的插槽渲染真正的输入组件。 | [search/custom.vue](../../playground/docs/demos/search/custom.vue) |
| 持久化 | persistence 支持内存与 localStorage 两种存储，保存搜索条件与排序；localStorage 模式会提供“恢复上次查询”入口。 | [search/persistence.vue](../../playground/docs/demos/search/persistence.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| filterableColumns | 搜索项配置 | `SearchItemConfig[]` \| `() => SearchItemConfig[]` | `[]` |
| sortableColumns | 可排序的字段配置，通常与 filterableColumns 相同 | `SearchItemConfig[]` \| `() => SearchItemConfig[]` | `[]` |
| disableConditions | 是否全局禁用条件选择 | `boolean` | `false` |
| autoQuery | 条件变化后是否自动搜索（约 300ms 防抖，初始化与 `setQueryForm` 不会触发） | `boolean` | `false` |
| gutter | 搜索项间距 | `number` \| `string` | `16` |
| persistence | 持久化配置，支持布尔、字符串 key 或 { key, storage } | `boolean` \| `string` \| `{ key?: string; storage?: 'memory' \| 'local' }` | `false` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| search | 点击搜索或 autoQuery 自动触发时触发，始终包含 `newbieQuery` 与 `newbieSort` 两个字段（空对象也保留） | `({ newbieQuery: object; newbieSort: object }) => void` |

## Slots

| 插槽名 | 说明 |
| --- | --- |
| <item.key> | 以搜索项的 key 命名，用于自定义渲染该搜索项 |

## Methods

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| getQueryForm | 获取当前搜索条件，格式为 { key: { condition, type, value } } | `(skipSave?: boolean) => object` |
| setQueryForm | 设置搜索项的值 | `(fields: Record<string, any>) => void` |
| getSortForm | 获取排序结果，格式为 { key: 'asc' \| 'desc' } | `(skipSave?: boolean) => object` |
| getSearch | 获取可直接提交给后端的 { newbieQuery, newbieSort }，始终包含这两个字段（空对象也保留） | `() => { newbieQuery: object; newbieSort: object }` |

## SearchItemConfig

搜索项配置。

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 搜索项的字段名 | `string` | - |
| title | 搜索项标题 | `string` | - |
| type | 控件类型 | `input` \| `textarea` \| `number` \| `select` \| `cascade` \| `date` \| `switch` | `input` |
| sortOrder | 默认排序，数字越大越靠前 | `number` | `0` |
| expandable | 展开单选或多选 | `boolean` \| `"multiple"` | `false` |
| options | 选项，支持字符串、数字或 { label, value } | `array` \| `() => array` | `[]` |
| inputProps | 透传给输入控件的属性 | `object` | `{}` |
| disableConditions | 是否禁用条件选择 | `boolean` | `false` |
| conditions | 允许的条件白名单 | `string[]` | `[]` |
| defaultValue | 默认值 | `any` | - |
| defaultCondition | 默认条件 | `string` | `equal` |
| customRender | 自定义渲染，返回 { conditions, Component, displayValue, onComponentOpen } | `Function` | - |
| collectItem | 自定义收集值，返回 { value, searchLabel } | `Function` | - |

## 内置条件

不同控件支持的条件不同，可通过 conditions 进一步筛选。

| 控件类型 | 支持的条件 |
| --- | --- |
| input | `equal`、`notEqual`、`include`、`exclude`、`null`、`notNull` |
| textarea | `equal`、`exclude` |
| number | `equal`、`notEqual`、`lessThan`、`greaterThan`、`between` |
| select | `equal`、`notEqual`、`include`、`exclude`、`null`、`notNull` |
| cascade | `equal`、`notEqual`、`include`、`null` |
| date | `equal`、`lessThan`、`greaterThan`、`between`、`null`、`notNull` |
| switch | `equal` |

## 全局配置

通过 `<NewbieProvider :config="{ search: { ... } }">` 覆盖默认值，实例 props 优先级更高。

### search

搜索栏样式类与值格式化。

| 配置项 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| maskClass | 搜索项外层的额外类名 | `string` | `""` |
| inputClass | 弹层中输入框的额外类名 | `string` | `""` |
| valueFormatter | 按搜索项类型索引的格式化函数，如 { date: value => value.format('YYYY-MM-DD') } | `object` | `null` |

## FAQ

### 日期搜索如何格式化成字符串？

通过 `NewbieProvider` 配置 `search.valueFormatter`：

```js
<NewbieProvider :config="{
  search: {
    valueFormatter: {
      date: value => value.format('YYYY-MM-DD'),
    },
  },
}" />
```

格式化只影响 `getQueryForm` / `getSearch` 返回给业务的值，界面仍使用 dayjs 对象。

### 搜索事件里的参数为什么不是 queryForm？

迁移到 4.0 后，`search` 事件统一返回 `{ newbieQuery, newbieSort }`，可以直接提交给后端。仍可以通过 ref 调用 `getQueryForm()` 获取旧的按 key 索引结构。

### 持久化的 key 如何生成？

不传 key 时使用当前 URL hash 的 SM3 摘要；传字符串时使用 `location.pathname + key` 的摘要，避免不同页面互相覆盖。
