import address from "./pages/address.js";
import button from "./pages/button.js";
import copy from "./pages/copy.js";
import editor from "./pages/editor.js";
import formDesigner from "./pages/form-designer.js";
import form from "./pages/form.js";
import list from "./pages/list.js";
import modal from "./pages/modal.js";
import password from "./pages/password.js";
import provider from "./pages/provider.js";
import search from "./pages/search.js";
import signaturePad from "./pages/signature-pad.js";
import table from "./pages/table.js";
import theme from "./pages/theme.js";
import uploader from "./pages/uploader.js";

export const version = "4.0.0-alpha.0";

export const categories = [
	{
		key: "general",
		title: "通用",
		description: "跨业务复用的基础交互组件。",
		pages: [button, copy],
	},
	{
		key: "data-entry",
		title: "数据录入",
		description: "表单、搜索与各类数据录入控件。",
		pages: [form, formDesigner, search, address, uploader, editor, password, signaturePad],
	},
	{
		key: "data-display",
		title: "数据展示",
		description: "以表格、列表等结构化方式展示数据。",
		pages: [table, list],
	},
	{
		key: "feedback",
		title: "反馈",
		description: "承载确认、编辑与信息展示的弹层。",
		pages: [modal],
	},
	{
		key: "global",
		title: "全局配置",
		description: "配置组件默认值与主题 Token。",
		pages: [provider, theme],
	},
];

export const pages = categories.flatMap(category =>
	category.pages.map(page => ({
		...page,
		category: category.key,
		categoryTitle: category.title,
	}))
);

const pageMap = new Map(pages.map(page => [page.slug, page]));

const legacyMap = new Map();
pages.forEach(page => {
	legacyMap.set(page.slug.replace(/-/g, "").toLowerCase(), page);
	legacyMap.set(page.component.replace(/^Newbie/, "").toLowerCase(), page);
});

/**
 * @param {String} slug
 * @return {Object|undefined}
 */
export function getPage(slug) {
	return pageMap.get(slug);
}

/**
 * 兼容旧 hash，如 #Form、#FormDesigner
 * @param {String} path
 * @return {Object|undefined}
 */
export function getPageByLegacy(path) {
	const key = String(path)
		.replace(/^\/+/, "")
		.replace(/\/+$/, "")
		.replace(/-/g, "")
		.toLowerCase();
	return legacyMap.get(key);
}

/**
 * 返回当前页面的上一篇 / 下一篇
 * @param {String} slug
 */
export function getAdjacent(slug) {
	const index = pages.findIndex(page => page.slug === slug);
	return {
		prev: index > 0 ? pages[index - 1] : null,
		next: index >= 0 && index < pages.length - 1 ? pages[index + 1] : null,
	};
}

export { pageMap };
