# FilePreview 文件预览

> 统一的文件预览弹窗：负责类型识别、弹窗外壳、加载/失败状态和图片兜底；文档渲染器由引用方注入。

> 组件本身不依赖具体预览引擎。推荐把 [File Viewer](https://github.com/flyfish-dev/file-viewer) 的 `FileViewer` 作为渲染器传入。

## 何时使用

- 需要在上传组件、附件列表或详情页里统一预览 PDF、Word、Excel、PPT 和图片。
- 需要替换项目里各自维护的 `FilePreview.vue`，避免每个项目重复处理弹窗、加载态和下载。
- 需要在不把重型渲染器打进组件库的前提下，把渲染引擎交给引用项目选择。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
# 文档渲染器（按需）
pnpm add @file-viewer/vue3 @file-viewer/preset-office @file-viewer/preset-lite
# Vite 项目：复制 Worker / WASM / 字体资产
pnpm add -D @file-viewer/vite-plugin
```

```js
import { NewbieFilePreview } from "jobsys-newbie";
```

也可以在 `app.use(Newbie)` 后直接使用全局组件。

## 基础用法

推荐在 `NewbieProvider` 里统一配置渲染器和选项，业务页面只传文件信息：

```vue
<template>
	<NewbieFilePreview
		v-if="file"
		v-model:open="visible"
		:url="file.url"
		:name="file.name"
		:path="file.path"
	/>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
const file = ref({ name: "合同.pdf", url: "/files/contract.pdf", path: "contract.pdf" });
</script>
```

```js
// main.js 或应用外壳
import { defineAsyncComponent } from "vue";
import officePreset from "@file-viewer/preset-office";
import litePreset from "@file-viewer/preset-lite";

const FileViewer = defineAsyncComponent(() =>
	import("@file-viewer/vue3").then(module => module.FileViewer)
);

const config = {
	filePreview: {
		renderer: FileViewer,
		options: {
			preset: [litePreset, officePreset],
			rendererMode: "replace",
			theme: "light",
			locale: "zh-CN",
			toolbar: { position: "bottom-right" },
		},
	},
};
```

也可以不配置 Provider，直接在实例上传：

```vue
<NewbieFilePreview
	v-model:open="visible"
	url="/files/report.docx"
	name="report.docx"
	:renderer="FileViewer"
	:options="viewerOptions"
/>
```

## 与 Uploader 配合

`NewbieUploader` 的非图片文件会调用 `uploader.defaultPreview`；图片文件仍使用 antdv-next 的图片预览。把 `defaultPreview` 指向本组件即可：

```js
const provider = {
	uploader: {
		defaultPreview(file) {
			previewFile.value = file;
			previewVisible.value = true;
		},
	},
};
```

Word 不需要再转 PDF：`@file-viewer/preset-office` 会直接解析 `.doc` / `.docx`。

## Props

| 参数       | 说明                                                     | 类型                           | 默认值      |
| ---------- | -------------------------------------------------------- | ------------------------------ | ----------- |
| open       | 是否可见，`v-model:open` 绑定                            | `boolean`                      | `false`     |
| url        | 文件地址                                                 | `string`                       | `""`        |
| name       | 文件名，URL 没有扩展名时用于识别类型                     | `string`                       | `""`        |
| path       | 文件路径，优先用于识别扩展名                             | `string`                       | `""`        |
| file       | 文件对象，未传 url/name/path 时从这里读取                | `object`                       | `undefined` |
| loading    | 是否正在准备文件地址（例如后端生成预览文件）             | `boolean`                      | `false`     |
| renderer   | 文档渲染器组件，例如 `@file-viewer/vue3` 的 `FileViewer` | `object \| function`            | `null`      |
| options    | 传给渲染器的配置                                         | `object`                       | `{}`        |
| width      | 弹窗宽度                                                 | `number \| string`             | `1080`      |
| height     | 弹窗内容高度                                             | `number \| string`             | `78vh`      |
| modalProps | 透传给 antdv-next Modal 的配置                           | `object`                       | `{}`        |

## Events

| 事件名      | 说明               | 参数                      |
| ----------- | ------------------ | ------------------------- |
| update:open | 弹窗开关变化时触发 | `(open: boolean) => void` |

## 全局配置

`NewbieProvider` 的 `filePreview` 命名空间可以统一设置 `renderer`、`options`、`width`、`height` 和 `modalProps`，实例 props 优先级更高。

```js
const config = {
	filePreview: {
		renderer: FileViewer,
		options: { preset: [litePreset, officePreset], rendererMode: "replace" },
		width: 1200,
		height: "80vh",
	},
};
```

## 文件类型识别

扩展名依次从 `path`、`name`、`url` 中提取，兼容 `/storage/a.docx`、`/download?path=a.docx` 和 `a.pdf?token=...` 等形式。

- 图片：`jpg`、`jpeg`、`png`、`gif`、`webp`、`bmp`、`svg`、`avif`、`heic` 等。
- 文档：`pdf`、`doc`、`docx`、`xls`、`xlsx`、`ppt`、`pptx`、`ofd`、`rtf`、`csv` 等。
- 其他格式：有渲染器时交给渲染器判断；没有渲染器时显示不支持并提供下载入口。

## 资产部署

`@file-viewer/vite-plugin` 的 `copyAssets: true` 会把 PDF / Office / PPT 需要的 Worker、WASM 和字体复制到 Vite 产物目录。Vite 项目在 `vite.config.js` 注册一次即可：

```js
import { fileViewerRenderers } from "@file-viewer/vite-plugin";

export default {
	plugins: [fileViewerRenderers({ copyAssets: true })],
};
```

Laravel 等由后端提供 HTML 的项目不会执行 Vite 的 `transformIndexHtml`，如果运行时找不到 `/vendor/pdf/...`，在应用入口显式设置资产基址（需要额外安装 `@file-viewer/core`）：

```bash
pnpm add @file-viewer/core@3.3.3
```

```js
import { setDefaultFileViewerAssetBaseUrl } from "@file-viewer/core/assets";

setDefaultFileViewerAssetBaseUrl("/build/manager/vendor/");
```

非 Vite 或需要完全离线部署时，也可以执行：

```bash
npx --no-install file-viewer-copy-assets ./public/file-viewer
```

## FAQ

### 为什么 Word 不再需要转 PDF？

`@file-viewer/preset-office` 的 Word 渲染器会直接在浏览器里解析 `.doc` / `.docx`，不再依赖后端转换接口，预览链路更短，也不会生成额外的临时 PDF。

### 图片为什么没有走 file-viewer？

上传组件的图片预览继续使用 antdv-next 的 `ImagePreviewGroup`，多图切换和手势更轻。`NewbieFilePreview` 在没有渲染器时也会用原生 `<img>` 兜底；需要统一工具栏时，把 `preset-lite` 加入 `options.preset` 即可让图片走 file-viewer。

### 渲染器加载失败怎么办？

组件会捕获渲染器错误，显示「文档加载失败」和下载入口。异步加载渲染器时，建议用 `defineAsyncComponent` 包一层，避免把 viewer 核心打进首屏。
