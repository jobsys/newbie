export const paginationDefaults = {
	pageSize: 20,
	pageKey: "page",
	pageSizeKey: "pageSize",
	filterable: true,
	pagination: true,
	autoQuery: false,
	showRefresh: true,
	cardWrapper: false,
	method: "get",
	itemKey: "id",
	afterFetched: null,
	persistence: false,
	// 内部 NewbieSearch 的持久化配置；不传时沿用 persistence（冷数据默认手动恢复）
	searchPersistence: undefined,
	// 选择能力默认关闭；prop 声明为 default: undefined 才能被 Provider 覆盖
	rowSelection: false,
};
