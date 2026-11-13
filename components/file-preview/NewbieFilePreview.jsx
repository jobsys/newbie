import { computed, defineComponent, h, onErrorCaptured, ref, watch } from "vue";
import { Button, Empty, Spin } from "antdv-next";
import { DownloadOutlined, FileUnknownOutlined } from "@antdv-next/icons";
import { isObject } from "lodash-es";
import NewbieModal from "../modal/NewbieModal.jsx";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { useLocale, useT } from "../../hooks";
import { mergeConfig } from "../provider/config.js";
import { filePreviewDefaults } from "./config.js";
import { getFileExtension, getPreviewKind, getPreviewSource } from "./utils.js";
import { genPixel } from "../../utils/style.js";
import "./index.less";

/**
 * 文件预览
 *
 * 负责统一的预览弹窗外壳、文件类型识别、图片兜底和加载失败状态。
 * 具体文档渲染器由引用方注入（推荐 @file-viewer/vue3 的 FileViewer），
 * 组件本身不绑定任何预览引擎。
 *
 * @version 1.0.0
 */
export default defineComponent({
	name: "NewbieFilePreview",
	props: {
		/**
		 * 是否可见，`v-model:open`
		 */
		open: { type: Boolean, default: false },

		/**
		 * 文件地址
		 */
		url: { type: String, default: "" },

		/**
		 * 文件名
		 */
		name: { type: String, default: "" },

		/**
		 * 文件路径，用于在 URL 没有扩展名时识别类型
		 */
		path: { type: String, default: "" },

		/**
		 * 文件对象，未传 url / name / path 时从这里读取
		 */
		file: { type: Object, default: undefined },

		/**
		 * 是否正在准备文件地址（例如后端生成预览文件）
		 */
		loading: { type: Boolean, default: false },

		/**
		 * 文档渲染器组件，例如 @file-viewer/vue3 的 FileViewer
		 */
		renderer: { type: [Object, Function], default: undefined },

		/**
		 * 传给渲染器的配置
		 */
		options: { type: Object, default: undefined },

		/**
		 * 弹窗宽度
		 */
		width: { type: [Number, String], default: undefined },

		/**
		 * 弹窗内容高度
		 */
		height: { type: [Number, String], default: undefined },

		/**
		 * 原生 [Modal](https://www.antdv-next.com/components/modal-cn#props) 配置
		 */
		modalProps: { type: Object, default: undefined },
	},

	emits: [
		/**
		 * @event update:open
		 * @param {Boolean} open 是否可见
		 */
		"update:open",
	],

	setup(rawProps, { emit }) {
		const props = useMergedProps(rawProps, "filePreview", filePreviewDefaults);

		const { locale } = useLocale();
		const renderError = ref(false);

		const source = computed(() =>
			getPreviewSource(props.file, {
				url: props.url,
				name: props.name,
				path: props.path,
			})
		);

		const extension = computed(() => getFileExtension(source.value));
		const kind = computed(() => getPreviewKind(extension.value));
		const rendererComponent = computed(() => props.renderer || null);
		const hasSource = computed(() => !!source.value.url);
		const canUseViewer = computed(
			() => hasSource.value && !!rendererComponent.value && !renderError.value
		);

		const fileName = computed(() => {
			if (source.value.name) {
				return source.value.name;
			}
			const target = source.value.path || source.value.url;
			return target.split("?")[0].split("#")[0].split(/[\\/]/).pop() || "";
		});

		const viewerLocale = computed(() => {
			const value = typeof locale === "string" ? locale : locale?.value;
			return String(value || "").startsWith("en") ? "en-US" : "zh-CN";
		});

		const viewerOptions = computed(() =>
			mergeConfig(
				{
					locale: viewerLocale.value,
					toolbar: { position: "bottom-right" },
				},
				isObject(props.options) ? props.options : {}
			)
		);

		const modalProps = computed(() => {
			const user = isObject(props.modalProps) ? props.modalProps : {};
			const styles = isObject(user.styles) ? user.styles : {};

			return {
				centered: true,
				maskClosable: true,
				...user,
				styles: {
					...styles,
					body: {
						padding: 0,
						height: genPixel(props.height),
						maxHeight: "none",
						overflow: "hidden",
						...(isObject(styles.body) ? styles.body : {}),
					},
				},
			};
		});

		onErrorCaptured(error => {
			console.error("[NewbieFilePreview] 渲染失败", error);
			renderError.value = true;
			return false;
		});

		watch(
			() => [props.open, source.value.url, rendererComponent.value],
			() => {
				renderError.value = false;
			}
		);

		const renderFallback = () => (
			<div class="newbie-file-preview-fallback">
				<FileUnknownOutlined class="newbie-file-preview-fallback-icon" />
				<span>
					{renderError.value
						? useT("file-preview.failed")
						: useT("file-preview.unsupported")}
				</span>
				{hasSource.value ? (
					<Button
						type="link"
						icon={<DownloadOutlined />}
						href={source.value.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						{useT("file-preview.download")}
					</Button>
				) : null}
			</div>
		);

		const renderContent = () => {
			if (!props.open) {
				return null;
			}

			if (props.loading) {
				return (
					<div class="newbie-file-preview-loading">
						<Spin size="large" />
						<span>{useT("file-preview.loading")}</span>
					</div>
				);
			}

			if (!hasSource.value) {
				return <Empty description={useT("common.no-content")} />;
			}

			if (canUseViewer.value) {
				return (
					<div class="newbie-file-preview-viewer">
						{h(rendererComponent.value, {
							url: source.value.url,
							filename: fileName.value,
							options: viewerOptions.value,
						})}
					</div>
				);
			}

			if (kind.value === "image") {
				return (
					<div class="newbie-file-preview-image">
						<img src={source.value.url} alt={fileName.value} />
					</div>
				);
			}

			return renderFallback();
		};

		return () => (
			<NewbieModal
				type="modal"
				visible={props.open}
				title={fileName.value || useT("form.attachment")}
				width={props.width}
				height={props.height}
				modalProps={modalProps.value}
				onUpdate:visible={visible => emit("update:open", visible)}
			>
				{renderContent()}
			</NewbieModal>
		);
	},
});
