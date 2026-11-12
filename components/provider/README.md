# Provider 全局配置

> 以命名空间覆盖包的形式向所有组件提供全局默认值。组件默认值 < 全局配置 < 实例 props，支持响应式异步配置。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/provider.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 项目需要统一修改表格分页参数、上传地址、表单格式等默认行为。
- 配置需要从接口异步加载，并在到达后自动生效。
- 希望新增组件时不再修改 Provider 的参数清单。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieProvider } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/guide/provider`。

## 基础用法

`覆盖组件默认值`：这里的 table.pageSize 改为 4、pageSizeKey 改为 page_size，只影响 Provider 子树内的表格。

```vue
<template>
	<NewbieProvider :config="{ table: { pageSize: 4, pageSizeKey: 'page_size' } }">
		<NewbieTable
			title="Provider 配置 pageSize = 4"
			:columns="columns"
			:data-source="data"
			:filterable="false"
			:pagination="{ showSizeChanger: false }"
			:table-props="{ scroll: { x: 800, y: 260 } }"
		/>
	</NewbieProvider>
</template>

<script setup>
import { NewbieProvider, NewbieTable } from "jobsys-newbie";

const columns = [
	{ title: "#", dataIndex: "id", width: 60 },
	{ title: "姓名", dataIndex: "name", width: 140 },
	{ title: "部门", dataIndex: "department", width: 160 },
	{ title: "邮箱", dataIndex: "email" },
];

const data = Array.from({ length: 12 }, (_, index) => ({
	id: index + 1,
	name: `用户 ${index + 1}`,
	department: ["研发中心", "产品部", "设计部"][index % 3],
	email: `user${index + 1}@example.com`,
}));
</script>
```

## 更多示例

| 示例           | 说明                                                                                     | 源码                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 覆盖组件默认值 | 这里的 table.pageSize 改为 4、pageSizeKey 改为 page_size，只影响 Provider 子树内的表格。 | [provider/config.vue](../../playground/docs/demos/provider/config.vue) |

## Props

| 参数                                      | 说明                                                              | 类型     | 默认值      |
| ----------------------------------------- | ----------------------------------------------------------------- | -------- | ----------- |
| config                                    | 任意命名空间的覆盖包，key 由组件自己定义                          | `object` | `{}`        |
| locale                                    | vue-i18n 语言；留空表示不修改宿主语言                             | `string` | `""`        |
| table / uploader / form / search / editor | 旧版顶层配置，仍可用一个版本，会输出弃用警告；新代码请使用 config | `object` | `undefined` |

## Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 应用内容 |

## 内置命名空间

完整配置项见各组件文档的“全局配置”章节。

| 命名空间 | 对应组件                            | 常用配置                                                            |
| -------- | ----------------------------------- | ------------------------------------------------------------------- |
| table    | NewbieTable                         | `pageSize`、`pageKey`、`pageSizeKey`、`afterFetched`、`persistence` |
| uploader | NewbieUploader / 表单 uploader 字段 | `uploadUrl`、`defaultFileItem`、`defaultPreview`                    |
| form     | NewbieForm                          | `format`、`afterFetched`、`columns`                                 |
| search   | NewbieSearch                        | `maskClass`、`inputClass`、`valueFormatter`                         |
| editor   | NewbieEditor                        | `uploadUrl`                                                         |
| theme    | NewbieThemeProvider                 | 由 Theme Provider 单独处理，见主题文档                              |

## 优先级与合并规则

```
组件默认值（components/<组件>/config.js）
        ↓ 被覆盖
NewbieProvider 的 config[命名空间]
        ↓ 被覆盖
组件实例 props
```

- 普通对象递归合并，数组、函数、null、标量整体替换。
- `undefined` 视为未传，不会覆盖已有值。
- 实例 props 整体覆盖全局值，不做深合并。
- 配置是响应式的：初始化后异步替换 `config`，组件会自动生效。

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

## FAQ

### 旧写法还能用吗？

`<NewbieProvider :table="{ pageSize: 50 }">` 仍然可用一个版本，但会输出弃用警告；`config` 优先于旧 props。迁移时改为 `:config="{ table: { pageSize: 50 } }"`。

### 为什么 locale 默认不生效？

4.0 起 `locale` 默认是空字符串，不会覆盖宿主应用的语言。只有显式传入时才同步到 vue-i18n，例如 `locale="en_US"`。

### 新增组件需要改 Provider 吗？

不需要。组件在自己的 `config.js` 中声明默认值，并通过 `useNewbieConfig(namespace, defaults)` 读取；Provider 只负责合并任意命名空间。

## 主题

密度、主色、暗色模式与 CSS 变量由 `NewbieThemeProvider` 提供，详见 [THEME.md](./THEME.md)。
