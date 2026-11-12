# SignaturePad 手写签名

> 基于 signature_pad 的手写签名板，以弹窗形式打开，支持协议勾选、只读预览和预设签名。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/signature-pad.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要用户手写签名并保存为图片（data URL）。
- 需要在签名前要求用户勾选协议。
- 需要只读展示已有签名。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieSignaturePad } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/signature-pad`。

## 基础用法

`基础用法`：通过 ref.open() 打开签名板，点击保存后触发 save 事件并返回 PNG 的 data URL。

```vue
<template>
	<Space orientation="vertical">
		<Button type="primary" @click="signatureRef?.open()">打开签名板</Button>
		<NewbieSignaturePad
			ref="signatureRef"
			title="请在下方签名"
			agreement="我已阅读并同意《用户协议》"
			@save="onSave"
		/>
		<div v-if="signature" class="demo-signature">
			<div class="demo-signature__label">最近一次签名：</div>
			<img :src="signature" alt="签名结果" />
		</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Button, message, Space } from "antdv-next";
import { NewbieSignaturePad } from "jobsys-newbie";

const signatureRef = ref(null);
const signature = ref("");

const onSave = dataUrl => {
	signature.value = dataUrl;
	message.success("签名已保存");
};
</script>

<style scoped>
.demo-signature__label {
	margin-bottom: 8px;
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}

.demo-signature img {
	max-width: 320px;
	border: 1px solid var(--newbie-color-border-secondary, #f0f0f0);
	border-radius: 6px;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | 通过 ref.open() 打开签名板，点击保存后触发 save 事件并返回 PNG 的 data URL。 | [signature-pad/basic.vue](../../playground/docs/demos/signature-pad/basic.vue) |
| 只读与预设签名 | readonly 会禁用绘制，preset 传入 data URL 作为初始签名，适合查看已签名内容。 | [signature-pad/readonly.vue](../../playground/docs/demos/signature-pad/readonly.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 签名板标题 | `string` | `""` |
| readonly | 是否只读；只读时隐藏清空与保存按钮 | `boolean` | `false` |
| agreement | 协议文本；传入后需要在保存前勾选 | `string` | `""` |
| preset | 预设签名图片（data URL），初始化后绘制到画布 | `string` | `""` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| save | 保存签名时触发，参数为 PNG data URL | `(dataUrl: string) => void` |

## Slots

| 插槽名 | 说明 |
| --- | --- |
| title | 自定义标题，优先级高于 title 属性 |

## Methods

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| open | 打开签名弹窗 | `() => void` |

## FAQ

### 签名保存后拿到的是什么格式？

`save` 事件返回 `canvas.toDataURL()` 生成的 PNG data URL，可以直接作为 `<img src>` 使用，也可以提交给后端后转存文件。

### 为什么保存按钮没有反应？

画布为空时不会触发保存；如果配置了 `agreement`，还需要先勾选协议。

### 页面尺寸变化后签名错位？

组件按 CSS 尺寸 × 设备像素比重设画布位图并缩放坐标系，监听 `window.resize` 后重绘已有笔迹，因此笔迹始终与鼠标位置对齐。嵌在可伸缩容器中时，请确保打开弹窗时容器已完成布局。
