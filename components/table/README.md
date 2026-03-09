## 详细参数

### `TableColumnConfig` 配置

| Prop name      | Description                                                                                                                                                                                                               | Type             | Values | Default |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ | ------- |
| title          | 列标题                                                                                                                                                                                                                    | string           | -      | ""      |
| dataIndex      | 列数据在数据项中对应的 key，支持 a.b.c 的嵌套写法                                                                                                                                                                         | string           | -      | ""      |
| key            | Vue 需要的 key，如果已经设置了唯一的 dataIndex，可以忽略这个属性                                                                                                                                                          | string           | -      | ""      |
| width          | 列宽度                                                                                                                                                                                                                    | string           | -      | ""      |
| align          | 对齐方式                                                                                                                                                                                                                  | string           | -      | ""      |
| ellipsis       | 是否自动缩略                                                                                                                                                                                                              | boolean          | -      | ""      |
| fixed          | 列是否固定，可选 true(等效于 left) 'left' 'right'                                                                                                                                                                         | boolean          | -      | ""      |
| filterable     | 是否可过滤，如果是对象，则为过滤配置，为 true 时 `filterable.type = 'input'` <br /> [详细配置见 Search](/components/search/NewbieSearch.html#searchitemconfig-配置), key 与 title 如果不传,会直接使用 Column 的这两个属性 | boolean \|Object | -      | ""      |
| isOnlyForQuery | 是否只用于搜索                                                                                                                                                                                                            | boolean          | -      | ""      |
