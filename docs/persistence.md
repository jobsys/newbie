# 持久化设计

Search 与 Table 的持久化共用一套底层实现，组件只负责“存什么”和“什么时候恢复”。
本文记录这套约定，改动持久化相关代码前请先读完。

## 1. 分层职责

```text
组件（NewbieSearch / NewbieTable）
  ├─ 决定持久化的内容（快照结构）
  ├─ 决定冷数据的恢复策略（auto / manual）
  └─ 决定什么时候写入（onSearch / 分页发生 / 自定义列提交）

usePersistenceScope(scope, prop)
  ├─ 解析 persistence prop
  ├─ 生成命名空间（按路由 + key）
  └─ 返回配置、store、restore 策略

usePersistence(namespace, { storage })
  ├─ 统一读写语义：内存 → localStorage → 默认值
  ├─ localStorage 异常保护（隐私模式、配额、坏数据）
  └─ 版本化存储键：nbp_v2_<namespace>_<key>
```

组件不再自己拼 `location.href`、不再自己判断“要不要读冷存储”，也
不再把 dayjs 对象直接塞进存储。

## 2. 读写语义

| 方法 | 行为 |
| --- | --- |
| `read(key, fallback)` | 内存 → localStorage（命中后回填内存）→ `fallback` |
| `readHot(key, fallback)` | 只读内存，用于 `restore: 'manual'` 时恢复会话内状态 |
| `readCold(key, fallback)` | 只读 localStorage，用于“恢复上次查询”入口 |
| `write(key, value)` | 写内存；`storage: 'local'` 时同时写 localStorage |
| `remove(key)` / `clear(keys)` | 两层一起删除；`clear()` 不传参数时清掉本实例访问过的所有 key |
| `has(key)` / `hasCold(key)` | 任意一层 / 仅冷存储是否有数据 |

写入内容必须是 **JSON 安全**的数据。内存层与 localStorage 层保存同一份快照，
这样恢复逻辑只有一套，不会出现“热数据是 dayjs、冷数据是字符串”的分叉。

## 3. 恢复策略

`persistence` 支持：

```js
false                                        // 关闭
true                                         // 开启，内存存储，路由级 key
"order-list"                                 // 开启，内存存储，指定 key
{ key: "order-list" }                        // 同上
{ key: "order-list", storage: "local" }      // 开启冷存储
{ key: "order-list", storage: "local", restore: "auto" }
```

`restore` 只影响 localStorage 冷数据：

| 值 | Search | Table |
| --- | --- | --- |
| `auto` | 挂载时自动恢复条件 | 挂载时自动恢复分页与列显隐（默认） |
| `manual` | 显示“恢复上次查询”入口（default） | 不适用：表格视图状态始终自动恢复 |

表格自己的分页/列显隐不受 `restore` 影响；但表格上的 `restore` 会传给内部
`NewbieSearch`（除非单独配置 `searchPersistence`），用来决定搜索条件的冷数据
是自动恢复还是交给“恢复上次查询”入口。

内存层永远自动恢复，因为它是当前 SPA 会话的实时状态。

`NewbieTable` 内部的 `NewbieSearch` 由 `searchPersistence` 控制，不传时继承
表格的 `key` / `storage`，但 `restore` 默认为 `manual`，避免旧筛选条件悄悄影响
表格的首次查询。

## 4. 命名空间与存储键

- 未提供 `key`：`<scope>_sm3(location.href)`，即“当前路由一份”；
- 提供 `key`：`<scope>_sm3(location.pathname + "_" + key)`，不同页面同名 key 互不影响；
- `scope` 为 `search` 或 `table`，因此搜索条件与表格视图状态天然隔离；
- 最终存储键：`nbp_v2_<namespace>_state`。

版本号 `PERSISTENCE_VERSION` 递增后旧键不再被读取，快照结构变更时可以安全地
丢弃旧数据，不需要写迁移代码。

## 5. 快照结构

### Search

```js
{
  version: 1,
  form: {
    [key]: { condition: "equal", type: "input", value: "张三" }
  },
  sort: { createdAt: "desc" }
}
```

- 保存的是 **表单态**（`queryForm`），不是 `collectItem()` 产出的接口值；
  select 单选保留数组、switch 保留 `"checked"` / `"unchecked"`，恢复时直接写回；
- 唯一的类型转换是日期：落盘前 `dayjs` → ISO 字符串，恢复时 ISO → `dayjs`；
- `condition` 为 `null` / `notNull` 的项也会保存，因为“为空”本身就是有效条件；
- 值为 `undefined` 的字段不写入，保证内存层与 JSON 结构一致；
- 只恢复当前仍然存在的搜索项，删列、改 key 后的旧值自动丢弃；
- 自定义渲染的搜索项要参与持久化，必须把值写回 `queryForm[key].value`；
  只通过 `collectItem` 返回、没有落到 `queryForm` 的值不会进入快照；
- 写入时机：仅在 `onSearch`（按钮 / 自动查询 / 排序弹窗确定）时写入，
  `getQueryForm()` / `getSearch()` / 分页初始化都不再产生写入副作用。

### Table

```js
{
  version: 1,
  pagination: { currentPage: 2, pageSize: 20 },
  columnKey: { name: true, email: false }
}
```

- 不保存 `totalSize`（随查询结果变化）与表格数据；
- 恢复时分页参数会校验为正整数；
- 首屏返回后如果 `currentPage` 超过实际页数，自动回落到最后一页重新请求；
- 写入时机：请求完成、翻页、修改自定义列后。

## 6. 旧 API 兼容

`usePersistence` 仍保留 `save` / `load` / `loadWithFallback` / `loadLocal` /
`hasLocalData` 作为别名，但它们现在映射到统一的 `read` / `write` / `readCold` /
`hasCold`，语义不再分叉。新代码请直接使用新名字。

## 7. 已知边界

- `persistence` 在实例生命周期内切换 key/storage 不会重新读取快照，
  需要配合 `:key` 重新挂载（示例与文档均按此方式演示）；
- 同一路由下多个表格都使用 `persistence: true` 时会共享同一个命名空间，
  需要为每个实例提供不同的 `key`；
- 持久化只保存视图状态，不保存业务数据；分页恢复依赖后端返回的 `totalSize`。
