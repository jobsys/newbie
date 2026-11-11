# NewbieProvider 全局配置

`NewbieProvider` 不再维护「参数清单」，而是把一个**任意命名空间的覆盖包**提供给子组件。每个组件在自己的 `config.js` 里声明默认值，并决定自己支持哪些全局配置项。新增组件或新增参数时，不需要修改 `NewbieProvider`。

## 优先级

```
组件默认值（components/<组件>/config.js）
        ↓ 被覆盖
NewbieProvider 的 config[命名空间]
        ↓ 被覆盖
组件实例 props（显式传入，含 false / 0 / ""）
```

- 普通对象**递归合并**；数组、函数、`null`、标量整体替换；`undefined` 视为未传，不会覆盖已有值。
- 实例 props 整体覆盖全局值，不做深合并。
- 全局配置是响应式的：初始化后异步替换 `config`，组件会自动生效。

## 命名空间与可配置项

命名空间默认就是组件名的小驼峰形式，也可以由组件自己决定。

### table（`NewbieTable`）

| 配置项        | 类型             | 默认值     | 说明                               |
| ------------- | ---------------- | ---------- | ---------------------------------- |
| pageSize      | number           | `20`       | 每页条数（实例分页对象仍然优先）   |
| pageKey       | string           | `"page"`   | 页码请求参数名                     |
| pageSizeKey   | string           | `"pageSize"` | 每页条数请求参数名               |
| filterable    | boolean          | `true`     | 是否显示搜索栏                     |
| pagination    | boolean \| object | `true`    | 是否分页；对象表示自定义分页        |
| autoQuery     | boolean          | `false`    | 保留项，组件内暂未消费             |
| showRefresh   | boolean          | `true`     | 是否显示刷新按钮                   |
| cardWrapper   | boolean          | `false`    | 是否用 `Card` 包裹                 |
| method        | string           | `"get"`    | 请求方式                           |
| rowKey        | string \| function | `"id"`   | 行主键                             |
| afterFetched  | function         | `null`     | 请求返回数据的处理函数             |
| persistence   | boolean \| string \| object | `false` | 分页与滚动持久化        |

> `table.page` 已废弃：全局初始页码没有实际意义，实例分页请用 `:pagination="{ current: 1 }"`。

### uploader（`NewbieUploader` / 表单的 uploader 字段）

| 配置项           | 类型     | 默认值 | 说明                         |
| ---------------- | -------- | ------ | ---------------------------- |
| uploadUrl        | string   | `""`   | 上传地址                     |
| defaultFileItem  | object   | `{ id: "id", name: "name", url: "url", path: "path", thumbUrl: "thumbUrl" }` | 文件字段映射，深合并 |
| defaultPreview   | function | `null` | 非图片文件的默认预览方法     |

`defaultFileItem` 是深合并的，只传 `{ url: "fileUrl" }` 时其余字段保持不变。

### form（`NewbieForm`）

| 配置项       | 类型     | 默认值 | 说明                                             |
| ------------ | -------- | ------ | ------------------------------------------------ |
| format       | object   | `{}`   | `useFormFormat` 的格式化配置，如 `{ date: true }` |
| afterFetched | function | `null` | 远程表单数据获取后的处理函数                     |
| columns      | object   | `{}`   | 按字段类型索引的默认配置，如 `{ switch: { defaultProps: { size: "small" } } }` |

### search（`NewbieSearch`）

| 配置项         | 类型     | 默认值 | 说明                             |
| -------------- | -------- | ------ | -------------------------------- |
| maskClass      | string   | `""`   | 搜索栏样式类                     |
| inputClass     | string   | `""`   | 弹层中 Input 的样式类            |
| valueFormatter | object   | `null` | 按字段类型索引的格式化函数映射   |

### editor（`NewbieEditor`）

| 配置项    | 类型   | 默认值 | 说明     |
| --------- | ------ | ------ | -------- |
| uploadUrl | string | `""`   | 上传地址 |

## 初始化示例

同步配置：

```vue
<template>
  <NewbieProvider :config="config">
    <App />
  </NewbieProvider>
</template>

<script setup>
const config = {
  table: { pageSize: 50, pageSizeKey: "page_size" },
  uploader: {
    uploadUrl: "/api/upload",
    defaultFileItem: { url: "fileUrl" },
  },
  form: { format: { date: true } },
  search: {
    valueFormatter: {
      date: value => value.format("YYYY-MM-DD"),
    },
  },
};
</script>
```

异步拉取配置（拉取完成后组件自动生效）：

```vue
<template>
  <NewbieProvider :config="config">
    <App />
  </NewbieProvider>
</template>

<script setup>
import { reactive } from "vue";

const config = reactive({});

fetch("/api/ui-config")
  .then(res => res.json())
  .then(data => Object.assign(config, data));
</script>
```

语言：`locale` 默认是空字符串，**不会修改宿主应用的语言**；只有显式传入时才会同步到 vue-i18n。

```vue
<NewbieProvider :config="config" locale="en_US">
  <App />
</NewbieProvider>
```

## 给新组件新增命名空间

1. 在组件目录新建 `config.js`，声明该组件的默认值（同时充当「支持哪些全局配置」的 schema）：

```js
export const signaturePadDefaults = {
	penColor: "#000",
	backgroundColor: "#fff",
};
```

2. 在组件的 `setup` 中合并：

```js
// 配置项与组件 props 同名：用 useMergedProps，之后继续写 props.xxx
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { signaturePadDefaults } from "./config.js";

export default defineComponent({
	props: {
		// 白名单 prop 不要保留 Vue default，Boolean 必须写 default: undefined，
		// 否则「未传」会被当成 false，永远覆盖全局配置。
		penColor: { type: String },
		backgroundColor: { type: String },
	},
	setup(rawProps) {
		const props = useMergedProps(rawProps, "signaturePad", signaturePadDefaults);
		// ...
	},
});
```

```js
// 配置项与组件 props 不同名/结构不同：用 useNewbieConfig 只读全局配置
import { useNewbieConfig } from "../../hooks/useMergedProps.js";

const signaturePadConfig = useNewbieConfig("signaturePad", signaturePadDefaults);
// 消费处：signaturePadConfig.value.penColor
```

3. 使用方无需改动 `NewbieProvider`：

```vue
<NewbieProvider :config="{ signaturePad: { penColor: '#c2410c' } }">
```

## 哪些参数不要全局化

- 数据与受控状态：`dataSource`、`columns`（表格列）、`value`、`open`、`loading` 等。
- 事件、slots、ref。
- `NewbieForm` 的实例 prop `columns` 是**栅格列宽数组**（默认 `[24]`），与全局 `form.columns`（按字段类型索引的默认配置映射）语义不同，不要混用。

## 从旧 API 迁移

旧写法仍然可用一个版本，但会输出弃用警告；`config` 优先于旧 props。

| 旧写法                              | 新写法                                        |
| ----------------------------------- | --------------------------------------------- |
| `:table="{ pageSize: 50 }"`          | `:config="{ table: { pageSize: 50 } }"`        |
| `:uploader="{ uploadUrl: '/u' }"`    | `:config="{ uploader: { uploadUrl: '/u' } }"`  |
| `:form="{ format: {...} }"`          | `:config="{ form: { format: {...} } }"`        |
| `:search="{ maskClass: 'x' }"`       | `:config="{ search: { maskClass: 'x' } }"`     |
| `:editor="{ uploadUrl: '/u' }"`      | `:config="{ editor: { uploadUrl: '/u' } }"`    |

行为变化：

- `table.pageSize` 默认值从 `10` 统一为 `20`（与表格原有实际行为一致）。
- 移除全局 `table.page`，初始页码由实例分页控制。
- `locale` 默认不再覆盖宿主语言（旧默认 `zh_CN`）。
- Provider 不再额外包裹 `<div>`，`class` / `style` 落在子节点上。
- 所有配置改为响应式，异步拉取的配置会在到达后自动生效。
