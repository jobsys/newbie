const loaders = import.meta.glob("../demos/**/*.vue");
const sources = import.meta.glob("../demos/**/*.vue", {
	eager: true,
	query: "?raw",
	import: "default",
});

const normalize = path => path.replace(/^.*\/demos\//, "");

const loaderMap = Object.fromEntries(
	Object.entries(loaders).map(([key, value]) => [normalize(key), value])
);

const sourceMap = Object.fromEntries(
	Object.entries(sources).map(([key, value]) => [normalize(key), value])
);

/**
 * 获取演示组件的异步加载函数
 * @param {String} file demos 目录下的相对路径，如 button/basic.vue
 */
export function getDemoLoader(file) {
	return loaderMap[file];
}

/**
 * 获取演示组件的源码
 * @param {String} file
 * @return {String}
 */
export function getDemoSource(file) {
	return sourceMap[file] || "";
}

export const demoFiles = Object.keys(sourceMap);
