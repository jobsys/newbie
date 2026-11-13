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
| Drawer + Form 固定底部按钮 | NewbieForm 设置 buttonsInFooter 后，保存 / 关闭按钮由 NewbieModal 渲染在 Drawer 底部固定区，表单内容单独滚动；confirmOnClose 会在存在未保存修改时二次确认。 | [modal/form-drawer.vue](../../playground/docs/demos/modal/form-drawer.vue) |

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
| footer | 底部固定区内容，Modal 与 Drawer 都会渲染；NewbieForm 的 buttonsInFooter 也会把按钮注册到同一区域 |
| extra | Drawer 标题栏右侧内容（Modal 不支持，Modal 标题栏右侧为全屏 / 关闭按钮） |

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

不传 `footer` 插槽时 Modal 不渲染底部区域；需要自定义时使用 `footer` 插槽。`NewbieForm` 放在弹层内并设置 `buttonsInFooter`，保存 / 关闭按钮会自动注册到该区域，按钮逻辑仍由表单负责。

### Drawer 里的表单按钮为什么固定在底部？

按钮渲染在 Drawer 的 `footer` 区域，不随内容滚动。按钮的提交状态、校验、i18n 与关闭回调都来自 `NewbieForm`，`NewbieModal` 只负责位置，因此表单不需要知道自己是放在 Modal 还是 Drawer 里。

### Drawer 表单有未保存修改时如何拦截关闭？

给 `NewbieForm` 设置 `confirmOnClose`：点底部的关闭按钮时先用 `isDirty()` 判断，没有修改直接关闭，有修改弹出「数据有变动 / 是否放弃当前编辑内容？」确认框（`title` / `content` / `okText` / `cancelText` 可自定义）。同一个表单在 `NewbieModal` 内时，右上角关闭、点击遮罩和 ESC 也会复用这套判断；已配置 `beforeClose` 时以 `beforeClose` 为准，避免重复确认。

### Modal 全屏后内容高度不对？

全屏通过 `wrapClassName` 上的 `full-modal` 类实现：面板容器（`.ant-modal-container`）用 flex 撑满视口，内容区自动解除 `height` 限制并独立滚动；进入 / 退出全屏时会清除拖动位移，全屏状态下标题栏不可拖动。
