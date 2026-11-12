# 评审整改执行计划（多 Agent 并行）

> 依据：[`../REVIEW.md`](../REVIEW.md)、[`findings.md`](./findings.md)
> 原则：先修正确性，再治理抽象与性能，最后补测试与工程约束。
> 本文件同时作为并行 Agent 之间的**文件所有权契约**，避免同文件并发修改。

## 全局约定（所有 Agent 必须遵守）

1. **只改自己名下的文件**。需要改别人名下的文件时，在最终报告中说明，不要直接改。
2. 不改 `package.json` / 依赖版本 / `vite.config.js`（除非任务明确要求）。
3. 不执行 `pnpm build`、`git` 写操作；可以执行 `pnpm vitest run <自己的测试目录>`。
4. 不做与任务无关的格式化；保持现有中文注释与代码风格（tab 缩进、双引号）。
5. 用户传入的 `form` / `columns` / `filterableColumns` 视为**只读**；需要加工先浅拷贝或 `cloneDeep`。
6. 渲染函数只读：不得在 render 中写 props、配置对象、`reactive` 状态。
7. 每个修复尽量配一条回归测试，放在自己的 `tests/<域>/` 下。
8. 修改后报告：变更文件、验证命令与结果、未完成项/风险。

## 文件所有权

| Agent | 负责目录/文件 | 主要问题 |
| --- | --- | --- |
| A i18n/modal | `hooks/i18n.js`、`i18n.js`、`index.js`、`components/modal/**`、`tests/i18n/**`、`tests/modal/**`、根 `README.md` 的 i18n 段落 | F-001、F-005、F-039 |
| B search | `components/search/**`、`tests/search/**` | F-002、F-016、F-023、F-034、F-050 |
| C uploader | `components/uploader/**`、`tests/uploader/**` | F-003、F-061（sort） |
| D form | `components/form/**`、`tests/form/**`、`utils/form-item-context.js` | F-004、F-010、F-011、F-012、F-022、F-024、F-038、F-051、F-054 |
| E table | `components/table/**`、`tests/table/**` | F-013、F-014、F-015、F-021、F-033、F-036、F-052 |
| F misc | `components/password/**`、`components/signature-pad/**`、`components/editor/**`、`components/list/**`、`components/address/**`、`hooks/network.js`、`hooks/utils.js`、`tests/password/**`、`tests/list/**` | F-017、F-018、F-019、F-020、F-025、F-037、F-057 |

## 跨 Agent 契约

- `components/table/helpers.jsx`（Agent E 创建）必须导出：
  - `renderTableActions`、`renderTableImage`、`renderTableFile`（新名字，行为不变）
  - 同时保留 `useTableActions`、`useTableImage`、`useTableFile` 作为别名（向后兼容）
- Agent D 的 `Group.jsx` 改为从 `../../table/helpers.jsx` 导入 `renderTableImage`。
- `components/search/utils.js`（Agent B 创建）导出 `normalizeOptions(options)`：
  - 函数式 options 调用一次；字符串/数字归一化为 `{ value, label }`；非数组返回 `[]`。
- `components/uploader/utils.js`（Agent C 创建）导出 `toActualNames(source, mapping)`。

## 第二轮（并行）所有权

| Agent | 负责目录/文件 | 主要问题 |
| --- | --- | --- |
| G form-designer | `components/form-designer/**`、`locales/*.json`、`components/form-designer/README.md`、`playground/docs/pages/form-designer.js`（若存在） | F-040、F-035 |
| H1 provider 覆盖 | `components/modal/**`、`components/list/**`、`components/address/**`、`components/copy/**`、`components/password/**`、`components/signature-pad/**`、`components/button/**`、各自新增 `config.js`、`docs/provider-config.md`、`tests/provider/config-coverage.test.jsx` | F-030、F-031（这些组件） |
| H2 核心配置/安装 | `components/form/config.js`、`components/form/NewbieForm.jsx`、`components/table/config.js`、`components/table/NewbieTable.jsx`、`hooks/useMergedProps.js`、`utils/withInstall.js`、`index.js`、`components/*/index.js`、`tests/provider/merge-defaults.test.jsx` | F-031（table）、F-032、F-041 |
| I 测试与工程化 | `tests/form/formula-engine.test.js`、`tests/form/rule-engine.test.js`、`tests/form/model.test.js`、`tests/form/utils.test.js`、`.oxlintrc.json`、`scripts/generate-component-readmes.mjs`、`components/table/README.md`、`README.md` 的契约段落 | F-060、F-061、F-062、F-063 |

- 第二轮不改第一轮已改的测试文件；新增测试用新文件名。
- H1/H2 不得互相修改对方文件；README 归 I，`docs/provider-config.md` 归 H1。

## 验收门槛

- `pnpm test` 全绿；
- `pnpm lint` 不新增 error（warning 可减少）；
- 新增回归测试覆盖：F-001/F-002/F-003/F-004/F-012/F-013/F-014/F-021。

---

## 整改结果（2026-11-12）

### 验证基线

| 项目 | 整改前 | 整改后 |
| --- | --- | --- |
| `pnpm test` | 7 文件 / 27 用例 | **24 文件 / 204 用例，全绿** |
| `pnpm lint` | 0 error / 58 warning | **0 error / 1 warning**（测试文件风格提示） |
| `pnpm build` | 主入口包含 211KB 地址 JSON | 成功；地址数据拆为独立异步 chunk |
| 文档生成 | README 与页面源不同步 | `pnpm docs:readme` 幂等通过 |

### 已关闭

- **P0**：F-001、F-002、F-003、F-004、F-005
- **P1**：F-010 ~ F-025（含 beforeSubmit/afterFetched 契约、rowKey 函数、请求竞态、列配置只读、data 字符串、隐藏值恢复、password、signature-pad、editor、list）
- **P2**：F-030 ~ F-041（Provider 覆盖 14 个组件、默认值规则、`form.columnPresets`、`render*` 助手、`helpers.jsx` 解耦、地址按需加载、i18n 复用/降级、设计器 i18n、withInstall 标记）
- **P3**：F-050 ~ F-057（渲染期 watcher/debounce、table computed、rules 缓存、地址裁剪缓存、LRU）
- **P4**：F-060、F-062、F-063；F-061 收敛到 1 条 warning

### 额外修复（本轮新发现）

- `formula-engine` 一元负号 tokenize 死循环（`-5` / `1 + -2`）。
- `DATE()` 使用 UTC 导致 UTC+ 时区差一天。
- `afterFetched` 返回非 `{ items }` 结构时的 `TypeError`。
- `FormItem` 渲染期回写 `type/readonly/disabled`。
- `NewbieSignaturePad` 在无 canvas 2D 上下文时初始化崩溃。

### 仍建议后续单独立项

1. **F-042 字段类型注册表**：`FormItem` / `widgetProps` / `defaultWidgets` 三处定义统一，属于结构性重构，需要配套视觉回归。
2. **F-053 / F-055**：表单 `formItems` 引用稳定化、设计器深 watch 拆分，收益主要在超大表单，风险高于本轮收益。
3. **F-040 剩余部分**：设计器 `defaultWidgets.jsx` 的名称与业务预设数据耦合，需先拆分数据与文案。
4. **F-038 边界**：`antdv-next` 子路径被大版本移除的场景仍需收紧 peer 范围或在 CI 增加导入存在性检查。
