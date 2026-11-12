import { ref } from "vue";

const normalizePath = path => {
	if (!path || path === "/") {
		return "/";
	}
	// 兼容旧 hash（如 #Form）与无前导斜杠的地址
	const value = path.startsWith("/") ? path : `/${path}`;
	return value.replace(/\/+$/, "") || "/";
};

const parseHash = () => {
	const raw = window.location.hash.replace(/^#/, "");
	const [path, queryString] = raw.split("?");
	return {
		path: normalizePath(path),
		query: Object.fromEntries(new URLSearchParams(queryString || "")),
	};
};

export const route = ref(parseHash());

window.addEventListener("hashchange", () => {
	route.value = parseHash();
});

/**
 * 跳转到文档内部路由
 * @param {String} path
 */
export function navigate(path) {
	window.location.hash = path;
}

/**
 * 组件页地址
 * @param {String} slug
 */
export function componentPath(slug) {
	return `/components/${slug}`;
}
