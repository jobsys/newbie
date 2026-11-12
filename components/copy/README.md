# Copy 复制

> 点击文本即可复制到剪贴板，默认只在悬停时显示复制图标，也可以自定义渲染内容和复制逻辑。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/copy.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要让用户快速复制订单号、链接、编号等短文本。
- 表格或详情页中需要展示带复制图标的字段。
- 复制前需要加工内容，或复制后需要自定义提示时。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieCopy } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/copy`。

## 基础用法

`基础用法`：传入 text 即可点击复制，复制成功后会给出全局提示。

```vue
<template>
	<Space orientation="vertical">
		<NewbieCopy text="床前明月光" />
		<NewbieCopy text="jobsys-newbie" />
	</Space>
</template>

<script setup>
import { Space } from "antdv-next";
import { NewbieCopy } from "jobsys-newbie";
</script>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | 传入 text 即可点击复制，复制成功后会给出全局提示。 | [copy/basic.vue](../../playground/docs/demos/copy/basic.vue) |
| 常显图标 | showIcon 让复制图标一直显示，适合触屏或需要更明显提示的场景。 | [copy/always.vue](../../playground/docs/demos/copy/always.vue) |
| 自定义渲染与复制 | customRender 控制显示内容，copy 接管复制行为；两者都接收 text 参数。 | [copy/custom.vue](../../playground/docs/demos/copy/custom.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| text | 要复制的内容，默认也作为显示内容 | `string` | `""` |
| showIcon | 是否一直显示复制图标；false 时只在悬停显示 | `boolean` | `false` |
| customRender | 自定义显示内容，参数为 text | `(text: string) => VNode` | `null` |
| copy | 自定义复制方法，参数为 text；不传时使用浏览器剪贴板 | `(text: string) => void \| Promise<void>` | `null` |

## FAQ

### 复制没有反应？

浏览器剪贴板 API 在非安全上下文（非 https / localhost）下可能不可用。组件使用 `useClipboard({ legacy: true })` 做了降级，但如果浏览器完全禁用了剪贴板权限，仍需要提供自定义 `copy` 方法。

### 能否复制 HTML 或富文本？

当前只接受并复制字符串。如果需要复制 HTML，请通过自定义 `copy` 方法自行写入剪贴板。
