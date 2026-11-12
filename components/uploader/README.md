# Uploader 上传

> 文件与图片上传组件，支持单文件/多文件、数量与大小限制、图片预览、分块上传和文件字段映射。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/uploader.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要上传附件、图片、合同等文件。
- 需要限制文件类型、大小、数量。
- 需要大文件分块上传或自定义预览方式。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieUploader } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/uploader`。

## 基础用法

`单文件上传`：v-model:value 在 maxNum 为 1 时绑定单个文件对象；上传成功后对象中会包含接口返回的字段。

```vue
<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieUploader
			v-model:value="file"
			action="#"
			:max-num="1"
			:upload-props="{ customRequest: mockUpload }"
		/>
		<div class="demo-result">v-model：{{ file ? file.name : "空" }}</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbieUploader } from "jobsys-newbie";

const file = ref(null);

// 文档演示不依赖后端，模拟一次成功上传
const mockUpload = ({ file: rawFile, onProgress, onSuccess }) => {
	let percent = 0;
	const timer = window.setInterval(() => {
		percent += 20;
		onProgress({ percent });
		if (percent >= 100) {
			window.clearInterval(timer);
			onSuccess({
				status: 0,
				result: {
					id: Date.now(),
					name: rawFile.name,
					url: URL.createObjectURL(rawFile),
					path: rawFile.name,
					thumbUrl: URL.createObjectURL(rawFile),
				},
			});
		}
	}, 160);
	return {
		abort() {
			window.clearInterval(timer);
		},
	};
};
</script>

<style scoped>
.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 单文件上传 | v-model:value 在 maxNum 为 1 时绑定单个文件对象；上传成功后对象中会包含接口返回的字段。 | [uploader/basic.vue](../../playground/docs/demos/uploader/basic.vue) |
| 图片上传 | type 为 picture / picture-card 时展示图片墙，支持点击预览；初始值可以是文件对象数组。 | [uploader/images.vue](../../playground/docs/demos/uploader/images.vue) |
| 数量、大小与禁用 | maxSize 单位为 MB，maxNum 控制数量上限，accept 控制可选文件类型；disabled 时不会渲染上传按钮。 | [uploader/limits.vue](../../playground/docs/demos/uploader/limits.vue) |
| 自定义预览 | 非图片文件默认会打开链接；传入 preview 后改为调用自定义方法，适合在弹窗或新标签页中预览。 | [uploader/preview.vue](../../playground/docs/demos/uploader/preview.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 文件或文件数组，v-model:value 绑定；maxNum 为 1 时为单个对象 | `object` \| `object[]` | `{}` |
| name | 上传文件的字段名 | `string` | `file` |
| headers | 上传请求头 | `object` | `{}` |
| accept | 可接受的文件类型，同 input accept | `string` | `""` |
| type | 上传列表样式 | `text` \| `file` \| `picture` \| `picture-card` | `file` |
| disabled | 是否禁用；禁用时不渲染上传按钮 | `boolean` | `false` |
| maxSize | 单个文件大小上限，单位 MB | `number` | `20` |
| maxNum | 文件数量上限 | `number` | `1` |
| multiple | 是否支持多选 | `boolean` | `false` |
| multipart | 是否使用 resumable.js 分块上传 | `boolean` | `false` |
| action | 上传地址；不传时读取全局 uploader.uploadUrl | `string` | `""` |
| extraData | 上传附加参数 | `object` | `{}` |
| uploadText | 上传按钮文字 | `string` | `上传` |
| disk | 上传盘符标识，会作为 `_disk` 字段提交 | `string` | `""` |
| preview | 非图片文件的自定义预览方法 | `(file: UploadFile) => void` | `null` |
| uploadProps | 透传给 antdv-next Upload 的属性 | `object` | `{}` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:value | 文件列表变化时触发；maxNum 为 1 时返回单个文件对象或 null | `(value: object \| object[] \| null) => void` |
| success | 所有文件上传完成后触发 | `(fileList: object[]) => void` |

## 全局配置

通过 `<NewbieProvider :config="{ uploader: { ... } }">` 覆盖默认值，实例 props 优先级更高。

### uploader

上传地址、文件字段映射与默认预览方法。defaultFileItem 是“标准名→实际名”的映射，会深合并；上传成功后返回值按映射写入实际字段名。

| 配置项 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| uploadUrl | 默认上传地址 | `string` | `""` |
| defaultFileItem | 文件字段映射（标准名→实际名），默认 { id, name, url, path, thumbUrl } | `object` | 见左 |
| defaultPreview | 非图片文件的默认预览方法 | `(file) => void` | `null` |

## 分块上传

设置 `multipart` 后组件使用 resumable.js 按 1MB 分块上传，并发 3 个分块，并展示进度条：

```vue
<NewbieUploader
  v-model:value="file"
  multipart
  action="/api/upload/chunk"
  :max-size="500"
/>
```

分块上传的接口需要支持分块合并，具体字段由 resumable.js 约定。

## FAQ

### 接口返回的字段名和默认值不一致怎么办？

通过 `NewbieProvider` 配置 `uploader.defaultFileItem`，例如 `{ url: 'fileUrl', name: 'fileName' }`。该配置是深合并的，只覆盖传入的字段。

### 禁用状态下为什么看不到任何内容？

这是当前实现的行为：`disabled` 时 `uploadBtn()` 返回 null。如果需要只读展示已有文件，可以关闭 disabled，并通过 `uploadProps.disabled` 或只读样式处理。

### 上传成功但 v-model 没有更新？

组件依赖接口返回中的 `result` 字段，并会按 `defaultFileItem` 映射字段。上传成功后所有文件状态都为 done 时才会触发 `update:value`；`result` 里用标准字段名（如 `path`），只有存在 `path` 才会认为上传成功。
