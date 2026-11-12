# Button 按钮

> 按钮用于开始一个即时操作。NewbieButton 在 antdv-next Button 的基础上增加了 label、图标位置与 fetcher 加载状态。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/button.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 标记一个操作，例如提交、保存、删除。
- 需要根据请求状态自动展示 loading 时，传入 fetcher。
- 按钮内容需要图标在左或在右时，使用 icon 与 icon-position。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieButton } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/button`。

## 基础用法

`基础用法`：通过 type、size、danger、disabled 控制按钮的语义与状态。

```vue
<template>
	<Space wrap>
		<NewbieButton>默认按钮</NewbieButton>
		<NewbieButton type="primary">主要按钮</NewbieButton>
		<NewbieButton type="dashed">虚线按钮</NewbieButton>
		<NewbieButton type="text">文本按钮</NewbieButton>
		<NewbieButton type="link">链接按钮</NewbieButton>
		<NewbieButton type="ghost">幽灵按钮</NewbieButton>
		<NewbieButton danger>危险按钮</NewbieButton>
		<NewbieButton type="primary" disabled>禁用按钮</NewbieButton>
	</Space>

	<Divider />

	<Space wrap>
		<NewbieButton type="primary" size="large">大号按钮</NewbieButton>
		<NewbieButton type="primary">中号按钮</NewbieButton>
		<NewbieButton type="primary" size="small">小号按钮</NewbieButton>
	</Space>
</template>

<script setup>
import { Divider, Space } from "antdv-next";
import { NewbieButton } from "jobsys-newbie";
</script>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | 通过 type、size、danger、disabled 控制按钮的语义与状态。 | [button/basic.vue](../../playground/docs/demos/button/basic.vue) |
| 图标按钮 | icon 接收的是 VNode，需要在模板中通过 `h(Icon)` 创建；icon-position 控制图标在文字左侧还是右侧。 | [button/icon.vue](../../playground/docs/demos/button/icon.vue) |
| 加载状态 | 传入一个包含 loading 字段的响应式对象，请求开始时把 loading 置为 true，按钮会自动进入加载状态。 | [button/loading.vue](../../playground/docs/demos/button/loading.vue) |
| 透传原生属性 | buttonProps 可以透传 antdv-next Button 的属性，适合 block、shape、htmlType 等场景。同名属性会覆盖组件内置值。 | [button/native.vue](../../playground/docs/demos/button/native.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 按钮类型 | `primary` \| `default` \| `dashed` \| `text` \| `link` \| `ghost` | `default` |
| size | 按钮大小 | `large` \| `middle` \| `small` | `middle` |
| danger | 是否危险按钮 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| label | 按钮文字；不传时使用默认插槽 | `string` | `""` |
| icon | 按钮图标，必须是 VNode，例如 `h(EditOutlined)` | `VNode` | `null` |
| iconPosition | 图标在文字的左侧或右侧 | `left` \| `right` | `left` |
| fetcher | 请求状态对象，读取 `fetcher.loading` 自动展示 loading | `{ loading: boolean }` | `{ loading: false }` |
| buttonProps | 透传给 antdv-next Button，会覆盖同名内置属性 | `object` | `{}` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| click | 点击按钮时触发 | `(event: MouseEvent) => void` |

## Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 按钮内容；label 为空时使用 |

## FAQ

### 为什么图标不显示？

`icon` 的类型是 VNode，不是组件定义。请使用 `:icon="h(EditOutlined)"`，不要直接传 `:icon="EditOutlined"`。

### buttonProps 与组件 props 的优先级？

`buttonProps` 会展开在组件内置属性之后，因此同名属性（如 `loading`、`type`）以 `buttonProps` 为准。
