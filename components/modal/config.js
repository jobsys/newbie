/**
 * NewbieModal 的默认值，同时是该组件支持全局配置的 key 清单。
 * F-031：默认值只写在这里，props 声明不再保留具体 default，
 * 否则「未传」会被实例默认值占住，Provider 永远覆盖不到。
 */
export const modalDefaults = {
	type: "modal",
	visible: false,
	width: 800,
	height: 500,
	title: "",
	beforeClose: null,
	modalProps: {},
};
