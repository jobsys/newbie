# Theme 主题

> 把密度、品牌主色、明暗模式映射到 antdv-next Design Token，并把当前 token 暴露成 --newbie-* CSS 变量，组件库自身的面板也会跟随。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/theme.js` 生成，请修改页面配置后重新生成，不要直接编辑。

> **注意**：默认走 antdv-next 的 cssVar 热更新，切换主题不会重建子树，业务状态得以保留；antdv-next 1.8.1 的 ConfigProvider 在 theme 变化后不会重新生成组件样式，需要强制刷新时把 remount 设为 true，代价是子树内的组件状态会被重置。

## 何时使用

- 需要统一控制紧凑 / 默认 / 宽松三种密度。
- 需要品牌主色、暗色模式与组件库面板保持一致。
- 已有自己的 ConfigProvider，只想复用主题计算逻辑。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieThemeProvider } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/theme`。

## 基础用法

`密度、主色与暗色`：外层控制 density / color-primary / scheme，内层 ThemeProvider 包裹一段组件，切换后所有 token 与组件库样式同步更新。

```vue
<template>
	<Space orientation="vertical" style="width: 100%">
		<Space wrap>
			<span>密度：</span>
			<Segmented v-model:value="density" :options="densityOptions" size="small" />
			<span>主色：</span>
			<Select
				v-model:value="primary"
				:options="colorOptions"
				size="small"
				style="width: 120px"
			/>
			<span>暗色：</span>
			<Switch v-model:checked="dark" size="small" />
		</Space>

		<NewbieThemeProvider
			:density="density"
			:color-primary="primary"
			:scheme="dark ? 'dark' : 'light'"
		>
			<div class="demo-surface">
				<Space wrap style="margin-bottom: 16px">
					<Button type="primary">主要按钮</Button>
					<Button>默认按钮</Button>
					<Button danger>危险按钮</Button>
				</Space>
				<Space wrap style="margin-bottom: 16px">
					<Input placeholder="输入框" style="width: 200px" />
					<Select :options="selectOptions" style="width: 160px" />
					<DatePicker />
				</Space>
				<Table
					size="small"
					:pagination="false"
					:columns="columns"
					:data-source="data"
					:scroll="{ y: 120 }"
				/>
			</div>
		</NewbieThemeProvider>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Button, DatePicker, Input, Segmented, Select, Space, Switch, Table } from "antdv-next";
import { NewbieThemeProvider } from "jobsys-newbie";

const density = ref("default");
const primary = ref("#1677ff");
const dark = ref(false);

const densityOptions = ["compact", "default", "loose"];
const colorOptions = [
	{ label: "拂晓蓝", value: "#1677ff" },
	{ label: "暖橙", value: "#c2410c" },
	{ label: "青绿", value: "#0b6b4d" },
	{ label: "紫罗兰", value: "#7048e8" },
];

const columns = [
	{ title: "姓名", dataIndex: "name" },
	{ title: "状态", dataIndex: "status" },
];

const selectOptions = [
	{ label: "选项一", value: "1" },
	{ label: "选项二", value: "2" },
];

const data = [
	{ id: 1, name: "张三", status: "启用" },
	{ id: 2, name: "李四", status: "停用" },
	{ id: 3, name: "王五", status: "启用" },
];
</script>

<style scoped>
.demo-surface {
	padding: 20px;
	background: var(--newbie-color-bg-container, #fff);
	border: 1px solid var(--newbie-color-border, #f0f0f0);
	border-radius: 8px;
}
</style>
```

## 更多示例

| 示例             | 说明                                                                                                                | 源码                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 密度、主色与暗色 | 外层控制 density / color-primary / scheme，内层 ThemeProvider 包裹一段组件，切换后所有 token 与组件库样式同步更新。 | [provider/theme.vue](../../playground/docs/demos/provider/theme.vue) |

## Props

| 参数         | 说明                                                                       | 类型                              | 默认值    |
| ------------ | -------------------------------------------------------------------------- | --------------------------------- | --------- |
| density      | 密度预设                                                                   | `compact` \| `default` \| `loose` | `default` |
| colorPrimary | 品牌主色，其余梯度由算法派生                                               | `string`                          | `""`      |
| theme        | 额外的 antdv-next theme 配置，与密度预设合并                               | `object`                          | `{}`      |
| locale       | antdv-next locale 对象                                                     | `object`                          | `null`    |
| scheme       | 明暗模式                                                                   | `light` \| `dark`                 | `light`   |
| cssVar       | 是否启用 CSS 变量，默认 { key: 'newbie' }                                  | `object` \| `boolean`             | `null`    |
| tagGap       | Tag 间距，不传时跟随密度                                                   | `number`                          | `null`    |
| layer        | 是否使用 @layer 降低 antd 样式优先级                                       | `boolean`                         | `false`   |
| hashPriority | 选择器优先级                                                               | `string`                          | `low`     |
| remount      | 主题变化时是否用 key 重建整棵子树；默认 false 走 cssVar 热更新，状态不丢失 | `boolean`                         | `false`   |

## Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 应用内容 |

## createNewbieTheme(options)

主题工厂参数。

| 参数         | 说明                   | 类型                              | 默认值              |
| ------------ | ---------------------- | --------------------------------- | ------------------- |
| density      | 密度预设               | `compact` \| `default` \| `loose` | `default`           |
| colorPrimary | 品牌主色               | `string`                          | -                   |
| token        | 额外 token，优先级最高 | `object`                          | -                   |
| components   | 额外组件 token         | `object`                          | -                   |
| algorithm    | 覆盖密度预设的算法     | `array` \| `Function`             | -                   |
| scheme       | 明暗模式               | `light` \| `dark`                 | `light`             |
| cssVar       | 是否启用 CSS 变量      | `object` \| `false`               | `{ key: 'newbie' }` |
| tagGap       | Tag 间距               | `number`                          | 跟随密度            |

## CSS 变量

ThemeProvider 会把当前主题 token 与密度预设写成 CSS 变量，同时挂到 Provider 子树与 `:root`：dropdown / popover / modal 这类弹层默认 teleport 到 body，只有 `:root` 上的副本能让它们跟随明暗与密度。

| 变量                                                                                                                                                        | 含义                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `--newbie-padding-sm` / `--newbie-padding` / `--newbie-padding-lg`                                                                                          | 小 / 中 / 大间距           |
| `--newbie-radius`                                                                                                                                           | 圆角                       |
| `--newbie-control-height-sm`                                                                                                                                | 小号控件高度               |
| `--newbie-table-pagination-height`                                                                                                                          | 分页行高                   |
| `--newbie-tag-gap`                                                                                                                                          | Tag 间距                   |
| `--newbie-color-bg-layout` / `--newbie-color-bg-container` / `--newbie-color-bg-elevated` / `--newbie-color-bg-spotlight`                                   | 表面色                     |
| `--newbie-color-fill` / `--newbie-color-fill-secondary` / `--newbie-color-fill-tertiary` / `--newbie-color-fill-quaternary`                                 | 填充色                     |
| `--newbie-color-fill-alter`                                                                                                                                 | 替代填充色（兼容旧变量名） |
| `--newbie-color-text` / `--newbie-color-text-secondary` / `--newbie-color-text-tertiary` / `--newbie-color-text-quaternary`                                 | 文本层级                   |
| `--newbie-color-border` / `--newbie-color-border-secondary` / `--newbie-color-split`                                                                        | 边框与分割线               |
| `--newbie-color-primary` / `--newbie-color-primary-hover` / `--newbie-color-primary-active` / `--newbie-color-primary-bg` / `--newbie-color-primary-border` | 主色梯度                   |
| `--newbie-border-radius` / `--newbie-border-radius-lg` / `--newbie-control-height` / `--newbie-font-size`                                                   | 尺寸                       |
| `--newbie-box-shadow` / `--newbie-box-shadow-secondary`                                                                                                     | 阴影                       |

## applyThemeVariables(target, variables)

把 CSS 变量写到指定 DOM 元素，用于挂到 :root 或任意容器，突破 ConfigProvider 子树的作用域限制；variables 为空时不做任何事。

| 参数      | 说明                                         | 类型          | 默认值 |
| --------- | -------------------------------------------- | ------------- | ------ |
| target    | 目标 DOM 元素，如 `document.documentElement` | `HTMLElement` | -      |
| variables | CSS 变量名 -> 值                             | `object`      | -      |

## useNewbieTheme()

读取当前主题上下文，返回只读对象；没有 NewbieThemeProvider 时返回安全默认值，不会抛异常。

| 字段         | 说明                              | 类型                                |
| ------------ | --------------------------------- | ----------------------------------- |
| density      | 当前密度                          | `"compact" \| "default" \| "loose"` |
| scheme       | 当前明暗模式                      | `"light" \| "dark"`                 |
| colorPrimary | 当前生效的主色                    | `string`                            |
| token        | antdv-next 的 token 对象          | `object`                            |
| theme        | 传给 ConfigProvider 的 theme 配置 | `object`                            |

## NewbieApp

应用外壳：一次性组合 StyleProvider + ConfigProvider + NewbieProvider + antdv-next 的 App（运行时样式容器），并复用同一套密度预设。

| 参数         | 说明                                         | 类型                              | 默认值    |
| ------------ | -------------------------------------------- | --------------------------------- | --------- |
| density      | 密度预设                                     | `compact` \| `default` \| `loose` | `default` |
| colorPrimary | 品牌主色                                     | `string`                          | `""`      |
| scheme       | 明暗模式                                     | `light` \| `dark`                 | `light`   |
| theme        | 额外的 antdv-next theme 配置，与密度预设合并 | `object`                          | `{}`      |
| locale       | antdv-next locale 对象                       | `object`                          | `null`    |
| configLocale | 组件库内部 i18n 的语言                       | `string`                          | `""`      |
| config       | 传给 NewbieProvider 的全局配置               | `object`                          | `{}`      |
| layer        | 是否使用 @layer 降低 antd 样式优先级         | `boolean`                         | `false`   |
| hashPriority | 选择器优先级                                 | `string`                          | `low`     |
| remount      | 主题变化时是否用 key 重建整棵子树            | `boolean`                         | `false`   |

## 只使用主题工厂

如果项目已有自己的 `ConfigProvider`，可以直接使用 `createNewbieTheme()`：

```js
import { createNewbieTheme } from "jobsys-newbie";

const { theme, config, cssVariables } = createNewbieTheme({
	density: "compact",
	colorPrimary: "#c2410c",
	scheme: "dark",
});
```

```vue
<ConfigProvider :theme="theme" v-bind="config">
  <div :style="{ display: 'contents', ...cssVariables }">
    <App />
  </div>
</ConfigProvider>
```

`createNewbieTheme` 返回的 `preset` 是当前密度预设，可用于调试。

## FAQ

### 切换主题后表单内容为什么被重置？

默认不会。ThemeProvider 不再无条件用 key 重建子树，而是走 antdv-next 的 cssVar 热更新，子树内的业务状态会保留。只有显式设置 `:remount="true"` 时才会重建子树——这是 antdv-next 1.8.1 下样式一定刷新的兜底手段，代价是表单内容、展开状态等会被清空。

### CSS 变量在弹层里为什么可用？

ThemeProvider 会把 `--newbie-*` 变量同时写到 ConfigProvider 子树与 `:root`，所以 teleport 到 body 的 dropdown / popover / modal 也能读到，不需要业务侧再做兜底。需要把变量挂到别的容器时，仍可用 `applyThemeVariables(target, variables)`。

### 密度预设具体改了什么？

`compact` 使用 compactAlgorithm 并收敛 Table 单元格 padding；`default` 使用默认算法；`loose` 放大 `controlHeight`、字号、padding、圆角与 Table padding。主色与暗色由 antdv-next 算法派生。

### 如何只改某个组件的 token？

可以给 ThemeProvider 传 `:theme="{ components: { Table: { headerBg: '#fafafa' } } }"`，或直接使用 `createNewbieTheme({ components: ... })`。密度预设中的 Table padding 会与自定义值合并。
