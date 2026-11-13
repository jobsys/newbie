/**
 * NewbieFilePreview 的默认值，同时是该组件支持全局配置的 key 清单。
 *
 * renderer 由引用方注入（例如 @file-viewer/vue3 的 FileViewer），
 * 组件本身不依赖任何具体的预览引擎。
 */
export const filePreviewDefaults = {
	width: 1080,
	height: "78vh",
	renderer: null,
	options: {},
	modalProps: {},
};
