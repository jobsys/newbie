# Editor 富文本编辑器

> 基于 WangEditor 5 的富文本编辑器，支持 v-model、只读/禁用、自定义工具栏与图片上传地址。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/editor.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要录入带格式的公告、说明、邮件正文等内容。
- 需要在表单中以富文本方式编辑某个字段。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieEditor } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/editor`。

## 基础用法

`基础用法`：v-model:value 绑定 HTML 字符串。通过 ref 可以调用 setContent、getEditor 等方法。

```vue
<template>
	<Space orientation="vertical" style="width: 100%">
		<Space wrap>
			<Button type="primary" @click="setContent">写入内容</Button>
			<Button @click="getContent">读取内容</Button>
			<Button @click="editorRef?.getEditor()?.focus()">聚焦编辑器</Button>
		</Space>
		<NewbieEditor ref="editorRef" v-model:value="content" placeholder="在这里输入内容…" />
		<Alert
			type="info"
			show-icon
			message="当前 HTML"
			:description="content || '（空）'"
		/>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Alert, Button, message, Space } from "antdv-next";
import { NewbieEditor } from "jobsys-newbie";

const editorRef = ref(null);
const content = ref("<p>Hello <strong>Newbie</strong></p>");

const setContent = () => {
	editorRef.value?.setContent("<p>内容由 <code>setContent()</code> 写入。</p>");
};

const getContent = () => {
	message.info(content.value || "编辑器为空");
};
</script>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | v-model:value 绑定 HTML 字符串。通过 ref 可以调用 setContent、getEditor 等方法。 | [editor/basic.vue](../../playground/docs/demos/editor/basic.vue) |
| 只读模式 | readonly 会隐藏工具栏并禁止输入；disabled 除了禁止输入，还会走表单禁用态的处理。 | [editor/readonly.vue](../../playground/docs/demos/editor/readonly.vue) |
| 裁剪工具栏 | config.toolbarConfig 与 config.editorConfig 会分别合并到 WangEditor 的工具栏和编辑器配置。 | [editor/config.vue](../../playground/docs/demos/editor/config.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 编辑器 HTML 内容，v-model:value 绑定 | `string` | `""` |
| placeholder | 占位文字 | `string` | `请输入内容` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| config | WangEditor 配置，包含 toolbarConfig 与 editorConfig | `{ toolbarConfig?: object; editorConfig?: object }` | `{ toolbarConfig: {}, editorConfig: {} }` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:value | 内容变化时触发，值为 HTML 字符串 | `(html: string) => void` |

## Methods

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| setContent | 设置编辑器内容 | `(content: string) => void` |
| getEditor | 获取 WangEditor 实例，可用于 focus 等原生操作 | `() => Editor` |

## 全局配置

通过 `<NewbieProvider :config="{ editor: { ... } }">` 覆盖默认值，实例 props 优先级更高。

### editor

编辑器中图片、文件上传使用的接口地址。

| 配置项 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| uploadUrl | 图片/文件上传地址 | `string` | `""` |

## FAQ

### 图片上传失败？

编辑器会把图片以 `file` 字段 POST 到全局配置的 `editor.uploadUrl`，并要求返回结构中的 `result` 包含 `{ url, alt, href }`。请先通过 `NewbieProvider` 配置上传地址。

### 编辑器高度可以调整吗？

当前内容区固定为 400px 高，暂不提供 height 属性。可以在外层容器中通过 CSS 覆盖 `.w-e-text-container` 的高度。

### 为什么工具栏里没有视频和表情？

默认 `toolbarConfig.excludeKeys` 排除了 `group-video` 与 `emotion`。需要时在 `config.toolbarConfig.excludeKeys` 中移除对应项。
