# Modal 弹窗

> 同时封装 Modal 与 Drawer，支持全屏、拖动、统一的关闭前确认，以及透传原生配置。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/modal.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要在不离开当前页面的情况下承载表单、详情或确认操作。
- 需要 Modal 与 Drawer 使用一致的外壳和关闭逻辑。
- 关闭前需要拦截并提示未保存内容。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieModal } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/modal`。

## 基础用法

`Modal 与 Drawer`：type 切换 modal / drawer。Modal 支持右上角全屏与标题栏拖动，Drawer 使用相同的 props。

```vue
<template>
	<Space>
		<Button type="primary" @click="modalVisible = true">打开 Modal</Button>
		<Button @click="drawerVisible = true">打开 Drawer</Button>
	</Space>

	<NewbieModal v-model:visible="modalVisible" title="Modal 标题" :width="640">
		<p>这是 Modal 内容。点击右上角图标可以全屏，按住标题栏可以拖动。</p>
		<p>底部没有默认按钮，提交逻辑由业务自己控制。</p>
	</NewbieModal>

	<NewbieModal
		v-model:visible="drawerVisible"
		type="drawer"
		title="Drawer 标题"
		:width="520"
	>
		<p>Drawer 与 Modal 使用同一套 props，type 切换为 drawer 即可。</p>
	</NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { Button, Space } from "antdv-next";
import { NewbieModal } from "jobsys-newbie";

const modalVisible = ref(false);
const drawerVisible = ref(false);
</script>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| Modal 与 Drawer | type 切换 modal / drawer。Modal 支持右上角全屏与标题栏拖动，Drawer 使用相同的 props。 | [modal/basic.vue](../../playground/docs/demos/modal/basic.vue) |
| 函数式关闭拦截 | beforeClose 为函数时返回 Promise：resolve(true) 允许关闭，resolve(false) 阻止关闭。 | [modal/before-close.vue](../../playground/docs/demos/modal/before-close.vue) |
| 配置式关闭确认 | beforeClose 为对象时自动弹出确认框，trigger 决定是否需要确认，可传布尔值或函数。 | [modal/before-close-object.vue](../../playground/docs/demos/modal/before-close-object.vue) |
| 透传原生属性 | modalProps 会透传给 antdv-next Modal / Drawer；styles.body 会与组件内置的高度和滚动配置合并。 | [modal/modal-props.vue](../../playground/docs/demos/modal/modal-props.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 弹层类型 | `modal` \| `drawer` | `modal` |
| visible | 是否可见，v-model:visible 绑定 | `boolean` | `false` |
| width | 宽度。Drawer 模式下数字按 size 处理，百分比等字符串回退到 width；Modal 模式按 CSS 宽度处理 | `number` \| `string` | `800` |
| height | 内容区最大高度，仅 Modal 模式生效 | `number` \| `string` | `500` |
| title | 标题 | `string` | `""` |
| beforeClose | 关闭前拦截；函数返回 Promise，对象配置见下方 BeforeCloseConfig | `Function` \| `BeforeCloseConfig` | `null` |
| modalProps | 透传给 antdv-next Modal / Drawer 的属性 | `object` | `{}` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:visible | 可见性变化时触发 | `(visible: boolean) => void` |
| close | 关闭时触发 | `() => void` |

## Slots

| 插槽名 | 说明 |
| --- | --- |
| default | 弹层内容 |

## BeforeCloseConfig

beforeClose 传对象时的确认框配置。

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 确认框标题 | `string` | `操作提示` |
| content | 确认框内容 | `string` | `确认关闭吗？` |
| okText | 确认按钮文字 | `string` | `确定` |
| cancelText | 取消按钮文字 | `string` | `取消` |
| trigger | 是否需要确认 | `boolean` \| `() => boolean` | `false` |

## FAQ

### 为什么 Drawer 宽度设置百分比不生效？

antdv-next Drawer 的 `size` 只接受数字，组件对数字宽度走 `size`，对百分比等字符串仍走旧的 `width`。如果同时设置 `modalProps.width`，其优先级更高。

### 如何自定义底部按钮？

组件默认 `footer={null}`，底部按钮由内容自行提供；也可以传入 `modalProps.footer` 覆盖。

### Modal 全屏后内容高度不对？

全屏通过 `wrapClassName` 上的 `full-modal` 类实现，内容区最大高度仍由 `height` 控制。可以结合 `modalProps.styles.body` 调整。
