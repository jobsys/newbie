/**
 * NewbieList 的默认值，同时是该组件支持全局配置的 key 清单。
 * F-031：默认值只写在这里，props 声明不再保留具体 default。
 */
export const listDefaults = {
	url: "",
	extraData: {},
	height: 300,
	offset: 50,
	finishedText: "",
	autoLoad: true,
	useStore: null,
	listProps: {},
};
