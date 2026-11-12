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

## 默认值规则（F-031）

**允许全局覆盖的 prop，其默认值必须为 `undefined`，默认值只写在组件自己的 `config.js` 里。**

原因：组件合并时的判断是「实例 prop 不是 `undefined` 才覆盖全局值」。如果 prop 上还写着 `default: false` / `default: ""` / `default: 0` / `default: []`，未传时实例值就已经是具体默认值，Provider 永远覆盖不到。

- 普通 prop 写 `{ type: String, default: undefined }`；数组/对象默认值也放在 `config.js`，不再写工厂函数。
- Boolean prop 必须保留 `default: undefined`（Vue 只有在**没有**声明 default 时才会把未传值强制成 `false`；声明了 `default: undefined` 时未传值仍是 `undefined`，因此可被全局配置覆盖）。本库已用 `type: Boolean, default: undefined` 覆盖全部 Boolean 可配置项，无需 `[Boolean, Object]` 之类的变通写法。
- `config.js` 同时是该组件「支持哪些全局配置项」的 schema：没有写进 `config.js` 的 prop 不会被 Provider 影响。

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
| autoQuery     | boolean          | `false`    | 搜索条件变化后是否自动查询（透传给 NewbieSearch，约 300ms 防抖） |
| showRefresh   | boolean          | `true`     | 是否显示刷新按钮                   |
| cardWrapper   | boolean          | `false`    | 是否用 `Card` 包裹                 |
| method        | string           | `"get"`    | 请求方式                           |
| rowKey        | string \| function | `"id"`   | 行主键                             |
| afterFetched  | function         | `null`     | 请求返回数据的处理函数，必须返回 `{ items, totalSize }` |
| persistence   | boolean \| string \| object | `false` | 分页与滚动持久化        |

> `table.page` 已废弃：全局初始页码没有实际意义，实例分页请用 `:pagination="{ current: 1 }"`。

### uploader（`NewbieUploader` / 表单的 uploader 字段）

| 配置项           | 类型     | 默认值 | 说明                         |
| ---------------- | -------- | ------ | ---------------------------- |
| uploadUrl        | string   | `""`   | 上传地址                     |
| defaultFileItem  | object   | `{ id: "id", name: "name", url: "url", path: "path", thumbUrl: "thumbUrl" }` | 文件字段映射（标准名→实际名），深合并 |
| defaultPreview   | function | `null` | 非图片文件的默认预览方法     |

`defaultFileItem` 是“标准名→实际名”的映射，深合并：只传 `{ url: "fileUrl" }` 时其余字段保持不变。

### form（`NewbieForm`）

| 配置项       | 类型     | 默认值 | 说明                                             |
| ------------ | -------- | ------ | ------------------------------------------------ |
| format       | object   | `{}`   | `useFormFormat` 的格式化配置，如 `{ date: true }` |
| afterFetched | function | `null` | 远程表单数据获取后的处理函数                     |
| columnPresets | object   | `{}`   | 按字段类型索引的默认配置，如 `{ switch: { defaultProps: { size: "small" } } }`；旧名 `form.columns` 仍兼容 |

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

### modal（`NewbieModal`）

| 配置项      | 类型              | 默认值    | 说明                                                         |
| ----------- | ----------------- | --------- | ------------------------------------------------------------ |
| type        | string            | `"modal"` | 弹窗类型，`modal` 或 `drawer`                                 |
| visible     | boolean           | `false`   | 可见性（受控状态，不建议全局覆盖）                            |
| width       | number \| string  | `800`     | 宽度                                                         |
| height      | number \| string  | `500`     | 高度，仅 `type` 为 `modal` 时有效                             |
| title       | string            | `""`      | 标题                                                         |
| beforeClose | function \| object | `null`   | 关闭前拦截，函数返回 `Promise<boolean>` 或配置确认弹窗对象    |
| modalProps  | object            | `{}`      | 原生 Modal / Drawer 配置，深合并                              |

### list（`NewbieList`）

| 配置项      | 类型     | 默认值 | 说明                                                   |
| ----------- | -------- | ------ | ------------------------------------------------------ |
| url         | string   | `""`   | 加载数据的 URL                                         |
| extraData   | object   | `{}`   | 请求附带参数，深合并                                   |
| height      | number   | `300`  | 列表高度（px）                                         |
| offset      | number   | `50`   | 滚动到底部前触发加载的距离                             |
| finishedText | string  | `""`   | 加载完毕文案，空串时使用内置 i18n 文案                 |
| autoLoad    | boolean  | `true` | 是否在挂载 / url 变化时自动加载第一页                  |
| useStore    | object   | `null` | 外部 store，需提供 `pagination` 与 `initPagination`     |
| listProps   | object   | `{}`   | 原生 List 配置，深合并                                 |

### address（`NewbieAddress`）

| 配置项       | 类型                  | 默认值         | 说明                                        |
| ------------ | --------------------- | -------------- | ------------------------------------------- |
| value        | string \| number \| array | `[]`       | 当前值（受控状态，不建议全局覆盖）          |
| level        | number                | `3`            | 生成级别：1 省、2 省市、3 省市区             |
| disabled     | boolean               | `false`        | 是否禁用                                    |
| placeholder  | string                | `"请选择地区"` | 占位符                                      |
| url          | string                | `""`           | 远程数据地址，空时使用本地数据               |
| afterFetched | function              | `null`         | 远程数据返回后的处理函数                     |
| dataSource   | array                 | `[]`           | 自定义数据源（优先级最高，不建议全局覆盖）   |

### copy（`NewbieCopy`）

| 配置项       | 类型     | 默认值 | 说明                                        |
| ------------ | -------- | ------ | ------------------------------------------- |
| text         | string   | `""`   | 复制内容，同时作为默认显示内容               |
| showIcon     | boolean  | `false` | `true` 图标常显；`false` 仅 hover 显示        |
| customRender | function | `null` | 自定义显示内容的渲染函数                     |
| copy         | function | `null` | 自定义复制方法，参数为待复制文本             |

### password（`NewbiePassword`）

| 配置项       | 类型             | 默认值 | 说明                                                          |
| ------------ | ---------------- | ------ | ------------------------------------------------------------- |
| value        | string           | `""`   | 输入框的值（受控状态，不建议全局覆盖）                         |
| min          | number           | `8`    | 最小长度                                                      |
| max          | number           | `20`   | 最大长度                                                      |
| strengthRules | object          | `{}`   | 强度提示策略，可覆盖 `min` / `max` / `require`，深合并         |
| width        | number \| string | `300`  | 输入框宽度                                                    |

### signaturePad（`NewbieSignaturePad`）

| 配置项    | 类型    | 默认值 | 说明                           |
| --------- | ------- | ------ | ------------------------------ |
| title     | string  | `""`   | 弹窗标题                       |
| readonly  | boolean | `false` | 只读模式，仅显示关闭按钮        |
| agreement | string  | `""`   | 协议文案，非空时要求勾选后才能保存 |
| preset    | string  | `""`   | 预置签名图片（Data URL）        |

### button（`NewbieButton`）

| 配置项       | 类型    | 默认值              | 说明                                   |
| ------------ | ------- | ------------------- | -------------------------------------- |
| type         | string  | `"default"`         | 按钮类型                               |
| size         | string  | `"middle"`          | 按钮大小                               |
| disabled     | boolean | `false`             | 失效状态                               |
| danger       | boolean | `false`             | 危险按钮                               |
| label        | string  | `""`                | 按钮文案                               |
| icon         | object  | `null`              | 按钮图标                               |
| iconPosition | string  | `"left"`            | 图标位置，`left` 或 `right`             |
| fetcher      | object  | `{ loading: false }` | 请求状态控制器，深合并                 |
| buttonProps  | object  | `{}`                | 原生 Button 配置，深合并                |

> `modal.visible`、`address.value`、`address.dataSource`、`password.value` 这类受控状态与数据参数也写在 `config.js` 里（保证默认值只有一个来源），但**不建议**用 Provider 全局覆盖——它们会对所有实例同时生效。

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
	title: "",
	agreement: "",
};
```

2. 在组件的 `setup` 中合并：

```js
// 配置项与组件 props 同名：用 useMergedProps，之后继续写 props.xxx
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { signaturePadDefaults } from "./config.js";

export default defineComponent({
	props: {
		// 可被全局覆盖的 prop 一律 default: undefined，默认值只写在 config.js，
		// 否则「未传」会被实例默认值占住，永远覆盖不到全局配置。
		title: { type: String, default: undefined },
		agreement: { type: String, default: undefined },
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
// 消费处：signaturePadConfig.value.title
```

3. 使用方无需改动 `NewbieProvider`：

```vue
<NewbieProvider :config="{ signaturePad: { title: '电子签名' } }">
```

## 哪些参数不要全局化

- 数据与受控状态：`dataSource`、`columns`（表格列）、`value`、`open`、`loading` 等。
- 事件、slots、ref。
- `NewbieForm` 的实例 prop `columns` 是**栅格列宽数组**（默认 `[24]`），与全局 `form.columnPresets`（按字段类型索引的默认配置映射）语义不同，不要混用；旧名 `form.columns` 仍兼容。

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
