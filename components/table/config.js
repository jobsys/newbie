export const tableDefaults = {
	pageSize: 20,
	pageKey: "page",
	pageSizeKey: "pageSize",
	filterable: true,
	pagination: true,
	autoQuery: false,
	showRefresh: true,
	cardWrapper: false,
	method: "get",
	rowKey: "id",
	afterFetched: null,
	persistence: false,
	// 单元格编辑：默认值放这里，组件 prop 声明为 default: undefined 才能被 Provider 覆盖
	editable: false,
	submitUrl: "",
	beforeCellSubmit: null,
};
