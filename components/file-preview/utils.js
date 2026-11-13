const IMAGE_EXTENSIONS = new Set([
	"avif",
	"bmp",
	"gif",
	"heic",
	"heif",
	"ico",
	"jpeg",
	"jpg",
	"png",
	"svg",
	"tif",
	"tiff",
	"webp",
]);

const DOCUMENT_EXTENSIONS = new Set([
	"csv",
	"doc",
	"docx",
	"dot",
	"odp",
	"ods",
	"odt",
	"ofd",
	"pdf",
	"pps",
	"ppsx",
	"ppt",
	"pptx",
	"rtf",
	"xls",
	"xlsx",
]);

/**
 * 从 URL / path / 文件名中提取扩展名。
 *
 * 兼容以下形式：
 * - /storage/contract.docx
 * - /api/download?path=private/contract.docx&sign=...
 * - contract.docx?token=...
 *
 * @param {String} value
 * @returns {String} 小写扩展名，取不到时返回空字符串
 */
const getExtensionFromValue = value => {
	if (!value) {
		return "";
	}

	let target = String(value);
	const pathParam = /[?&]path=([^&]+)/.exec(target);
	if (pathParam) {
		try {
			target = decodeURIComponent(pathParam[1]);
		} catch {
			target = pathParam[1];
		}
	}

	const basename = target.split("?")[0].split("#")[0].split(/[\\/]/).pop() || "";
	const match = /\.([a-zA-Z0-9]+)$/.exec(basename);
	return match ? match[1].toLowerCase() : "";
};

/**
 * 依次从 path、文件名、URL 中取扩展名，避免签名 URL 丢后缀时误判。
 *
 * @param {Object} source
 * @param {String} [source.url]
 * @param {String} [source.name]
 * @param {String} [source.path]
 * @returns {String}
 */
export function getFileExtension({ url, name, path } = {}) {
	return getExtensionFromValue(path) || getExtensionFromValue(name) || getExtensionFromValue(url);
}

/**
 * 判断预览类型。
 *
 * image 走图片兜底或图片渲染器；
 * document 是当前明确支持的业务文档；
 * other 交给注入的 renderer 自行判断，没有 renderer 时显示不支持。
 *
 * @param {String} extension
 * @returns {"image"|"document"|"other"}
 */
export function getPreviewKind(extension) {
	if (!extension) {
		return "other";
	}
	if (IMAGE_EXTENSIONS.has(extension)) {
		return "image";
	}
	if (DOCUMENT_EXTENSIONS.has(extension)) {
		return "document";
	}
	return "other";
}

/**
 * 统一文件数据的读取顺序，兼容上传组件返回的标准字段和业务自定义字段。
 *
 * @param {Object} [file]
 * @param {Object} [props]
 * @returns {{url: String, name: String, path: String}}
 */
export function getPreviewSource(file = {}, props = {}) {
	return {
		url: props.url || file?.url || file?.fileUrl || "",
		name: props.name || file?.name || file?.fileName || "",
		path: props.path || file?.path || file?.filePath || "",
	};
}
