export const formDefaults = {
	format: {},
	afterFetched: null,
	// 按字段类型索引的默认配置（如 { switch: { defaultProps: { size: "small" } } }）。
	// 旧名 columns 与 NewbieForm 的 24 栅格 columns prop 冲突，读取侧仍兼容旧名。
	columnPresets: {},
};
