# 组件库评审报告

> 评审对象：`jobsys-newbie@4.0.0-alpha.0`（分支 `feat/antdv-next-spike`）
> 评审日期：2026-11-11
> 评审范围：`components/`（14 个组件）、`hooks/`、`utils/`、`directives/`、`tests/`、`index.js`、构建配置
> 评审维度：实现正确性 / 业务逻辑健壮性 / 抽象与 API 设计 / 性能与资源 / 工程化与可维护性

完整问题清单（含复现步骤、根因、修复建议与验证方式）见 **[`reviews/findings.md`](./reviews/findings.md)**。

---

## 1. 结论摘要

整体评价：**架构方向是对的，但实现层存在若干"看起来能跑、实际会炸"的缺陷**。

这轮改造（antd → antdv-next、扁平 key + 嵌套 model 的桥接层、Provider 全局配置）解决了几个非常棘手的问题：

- `components/form/model.js` 用访问器把「扁平 + 点号 key」映射到 antdv-next 要求的嵌套 model，是本仓库最有价值的一块设计；
- `components/provider/config.js` 用 `Symbol.for` 解决多 entry 共享注入 key 的问题，考虑得很到位；
- `NewbieThemeProvider` 把密度/主色/明暗收敛到 Design Token，而不是在组件里写死 px，方向正确。

但**渲染期写数据**这一类问题在表单、搜索、表格三条主线上普遍存在，已经造成 5 个可复现的 P0 缺陷——下面每一条 P0 都用最小用例在 vitest + jsdom 下验证过（复现代码见第 7 节）。

### 1.1 评分卡

评分：优 / 良 / 中 / 差

| 组件 | 实现正确性 | 逻辑健壮性 | 抽象与 API | 性能 | 主要问题 |
| --- | --- | --- | --- | --- | --- |
| `NewbieForm` | 中 | 差 | 中 | 差 | 渲染期写配置、提交回调契约不明确 |
| `NewbieFormDesigner` | 中 | 中 | 差 | 差 | 硬编码中文、属性面板回写链路脆弱 |
| `NewbieTable` | 中 | 中 | 中 | 中 | props 变异、请求竞态、`afterFetched` 缺省崩溃 |
| `NewbieSearch` | 差 | 差 | 中 | 差 | 渲染期注册 watcher、`autoQuery` 未实现 |
| `NewbieModal` | 差 | 中 | 良 | 良 | 事件回调里调用 `useI18n()` |
| `NewbieUploader` | 差 | 中 | 中 | 中 | `defaultFileItem` 改名后 URL 丢失 |
| `NewbieEditor` | 中 | 中 | 中 | 良 | `MENU_CONF` 被整体覆盖、配置不响应变化 |
| `NewbieList` | 中 | 差 | 中 | 中 | setup 阶段发请求、参数变化不生效 |
| `NewbieAddress` | 良 | 良 | 良 | 中 | 211KB JSON 静态打包 |
| `NewbiePassword` | 中 | 差 | 中 | 良 | 空值即报错、强度策略写死 |
| `NewbieSignaturePad` | 中 | 差 | 良 | 良 | 覆盖 `window.onresize` |
| `NewbieCopy` | 良 | 良 | 良 | 良 | 基本无问题 |
| `NewbieButton` | 良 | 良 | 良 | 良 | 基本无问题 |
| `NewbieProvider` | 良 | 良 | 良 | 良 | 与组件侧配置机制不统一 |
| `NewbieThemeProvider` | 良 | 良 | 良 | 良 | 主题切换会重建子树 |

### 1.2 Top 10 必须处理项

| # | ID | 问题 | 级别 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | F-001 | `NewbieModal` 对象式 `beforeClose` 未传文案时抛 `Must be called at the top of a setup function`，弹窗关不掉 | P0 | **已复现** |
| 2 | F-002 | 搜索项 `expandable: true` 且 `options` 为函数时抛 `item.options.map is not a function`，整个搜索栏崩溃 | P0 | **已复现** |
| 3 | F-003 | `NewbieProvider` 深度合并 `uploader.defaultFileItem` 改名后，上传结果里的 URL 被静默丢弃 | P0 | **已复现** |
| 4 | F-004 | 多列布局下渲染期改写表单配置，触发 Vue `Maximum recursive updates exceeded`，表单无法渲染 | P0 | **已复现** |
| 5 | F-005 | README 宣传的「按需引入单个组件」在未 `app.use()` 时直接崩溃（vue-i18n 未安装） | P0 | **已复现** |
| 6 | F-010 | `Group.jsx` 使用 `<NewbieForm>` 却未 import，依赖全局注册才能工作 | P1 | 代码确认 |
| 7 | F-011 | `Group.jsx` 的 `toRef(itemState.editFormRef)` 每次渲染新建 ref，脏数据确认永远不生效 | P1 | 代码确认 |
| 8 | F-012 | `NewbieForm.beforeSubmit` 返回 `undefined` 会把提交体变成 `undefined` | P1 | 代码确认 |
| 9 | F-030 | 全局配置存在三套并行机制，14 个组件里只有 5 个能被 Provider 配置 | P2 | 代码确认 |
| 10 | F-050 | 搜索项在渲染函数里注册 `watch`，watcher 持续泄漏 | P3 | 代码确认 |

### 1.3 一条贯穿全库的主线

> **在渲染期写数据（写 props、写配置对象、写响应式模型）。**

这不是某一个文件的 bug，而是一种反复出现的编码模式：

| 位置 | 写什么 | 后果 |
| --- | --- | --- |
| `NewbieForm.jsx:270` | `item.type = "input"` | 回写调用方配置对象 |
| `Layout.jsx:100,103` | `item.span` / `item.formItemProps` | 回写配置 + 触发递归更新（F-004） |
| `FormItem.jsx:31` | `submitForm[item.key] = ...` | 渲染期写响应式模型 |
| `NewbieTable.jsx:501-512` | `item.key` / `item.RC_TABLE_INTERNAL_COL_DEFINE` | 回写调用方列配置 |
| `Select.jsx:70` / `Cascader.jsx:51` / `Remote.jsx:70` | `item.collectItem = ...` | 把行为挂到配置对象上 |
| `Group.jsx:154` | `formState[key].isCollapse` | 渲染期改 UI 状态 |

**建议**：把"渲染"和"状态变更"彻底分开——渲染函数只读，状态变更一律放到事件回调 / watcher / `nextTick` 里；配置对象一律 `cloneDeep` 后再加工。

---

## 2. 评审方法

1. 逐文件通读 `components/`、`hooks/`、`utils/`、`directives/` 全部源码（约 60 个源文件）；
2. 对可疑路径写最小复现用例，用 `vitest` + `@vue/test-utils` 在 jsdom 下验证；
3. 交叉验证构建配置（`vite.config.js`）、包导出（`package.json`）、文档契约（`components/*/README.md` 与 `playground/docs/pages/*.js`）与实现是否一致；
4. 跑通现有 `pnpm lint`（0 error / 60 warning）与 `pnpm test`（7 文件 / 27 用例全绿），确认基线。

---

## 3. 分领域问题概览

### 3.1 实现正确性

- **P0 集中在"在非 setup 上下文里调用 `useI18n()`"**（F-001）。`hooks/i18n.js` 的 `useT()` 内部调用 `useI18n()`，而 vue-i18n 11 的 `useI18n()` 在 `getCurrentInstance()` 为空时直接抛错。只要 `useT()` 被写在事件回调、Promise 回调、watcher 回调里就会炸。
  当前 `useT()` 的调用点里，`NewbieModal.onCloseModal` 是唯一确定在事件回调里的，其余都在 render / setup 中（安全但脆弱）。
  **建议**：把 `useT` 拆成两个 API——`useT()`（只能在 setup/render 调用）与 `t()`（可在任意位置调用，内部走 `i18n.global.t`）。同时在 `hooks/i18n.js` 里对 `getCurrentInstance()` 为空的情况降级到 `i18n.global.t`。

- **配置项与实现脱节**：README 和 `playground/docs` 里写明的 `autoQuery`（搜索/表格"条件变化时自动查询"）在两个组件里都**声明了但从未消费**（F-016）。`docs/provider-config.md` 里也承认"保留项，组件内暂未消费"。要么实现，要么从公开 API 移除。

- **`props` 变异**：`NewbieTable.totalColumns` 直接给调用方的列对象写 `key` 与 `RC_TABLE_INTERNAL_COL_DEFINE`（F-021）；`NewbieForm.formItems` 与 `Layout` 直接给表单项对象写 `type` / `span` / `formItemProps`（F-004、相关项 F-021）。

### 3.2 业务逻辑健壮性

- **提交/回调契约不明确**（F-012、F-013）：`NewbieForm.beforeSubmit` 的返回值语义（`false` 阻止 / `Object` 替换 / `undefined`？）没有在类型注释与 README 里写清；`NewbieTable.afterFetched` 缺省时是 `TypeError: fetched is not a function` 而不是可读的报错。
- **`NewbieList`**（F-020）：`autoLoad` 在 `setup()` 阶段就发请求；`url` / `extraData` 变化后不会重新初始化；滚动回调没有节流，只靠 `loading` 标志兜底。
- **`NewbiePassword`**（F-017）：空密码即显示错误；强度策略（必须含大小写 + 数字 + 特殊字符）写死在组件里，不可配置，也不符合多数系统的"强度提示而非硬性拦截"惯例。
- **`NewbieSignaturePad`**（F-018）：`window.onresize = resizeCanvas` 直接覆盖全局处理器，既会踩掉宿主应用的同名处理器，也不会在卸载时还原。
- **`NewbieEditor`**（F-019）：`props.config.editorConfig` 的展开位置在 `MENU_CONF` 之后，用户一旦传入自己的 `MENU_CONF`，内置的图片上传处理器就被整体顶掉；`disabled` / `readonly` 在创建时被固化，运行时切换不生效。

### 3.3 抽象与 API 设计

- **全局配置有三套机制**（F-030）：
  - `useMergedProps(rawProps, ns, defaults)`：props + Provider 合并（只有 `NewbieTable` 在用）；
  - `useNewbieConfig(ns, defaults)`：只读 Provider（form / search / uploader / editor 在用）；
  - 裸 `props`：`NewbieModal` / `NewbieList` / `NewbieAddress` / `NewbieCopy` / `NewbiePassword` / `NewbieSignaturePad` / `NewbieButton` 完全无法被 Provider 配置。
  结果是"Provider 看起来能配所有东西，实际上只有 5/14 个组件可以"。

- **`useMergedProps` 的隐式契约**（F-031）：只有声明为 `default: undefined` 的 prop 才能被全局覆盖。`NewbieTable.editable`（`default: false`）与 `submitUrl`（`default: ""`）就无法被 Provider 设置。这个规则目前只存在于实现细节里，文档没有说明。

- **命名冲突**（F-032）：Provider 的 `form.columns` 是"按字段类型索引的默认配置"，而 `NewbieForm` 的 `columns` prop 是"24 栅格布局数组"，两者同名不同义。

- **`use` 前缀被滥用**（F-033）：`useTableActions` / `useTableImage` / `useTableFile` 是纯渲染助手（必须在 render 中调用），却以 `use` 开头，违反 React/Vue hook 约定，误导使用者把它们放进 `computed` 或 `watch` 里。

- **组件间耦合**（F-036）：`components/form/components/Group.jsx` 从 `../../table` 引入 `useTableImage`，导致 Form 依赖整个 Table（进而依赖 Search）。建议把表格渲染助手抽到 `components/table/helpers.jsx`。

- **依赖内部路径**（F-038）：`utils/form-item-context.js` 直接 import `antdv-next/dist/form/context`。构建配置把它 external 掉了，运行时要求使用方的 `antdv-next` 恰好暴露该路径，升级即可能断裂。

- **i18n 冲突**（F-039）：`index.js` 里 `app.use(i18n)` 会强制安装库自带的 vue-i18n 实例。宿主若已有 vue-i18n，会出现两个实例；库内组件用 `useI18n()` 取到的是**最近的那个**（库自己的），宿主切换语言不会影响库内文案。

- **表单设计器全量硬编码中文**（F-040）：`NewbieFormDesigner.jsx` / `GlobalLogicPanel.jsx` / `FormulaEditor.jsx` 里几十处中文字面量，与其它组件的 i18n 体系完全脱节。

### 3.4 性能

| 问题 | 位置 | 影响 |
| --- | --- | --- |
| 渲染函数里注册 `watch` | `search/components/Select.jsx:49`、`Cascader.jsx:29` | 每次重渲染新增一个 watcher，永不停止 → 内存泄漏 + 副作用重复执行 |
| 渲染函数里新建 `debounce` | `form/components/Remote.jsx:44` | 上一次的定时器不会被取消 → 重复请求 |
| 每次渲染新建 props 对象 | `table/NewbieTable.jsx:754,781,816` | antd Table 每次都认为配置变了 → 内部状态重置 |
| 全表单重渲染 | `form/NewbieForm.jsx:267`、`Layout.jsx` | `formItems` 每次重算产生新对象，`createLayout` 未 memo |
| 规则对象每次重建 | `form/components/FormItem.jsx:38` | 每次渲染 `new RegExp()` → antd Form 重复校验 |
| 深 watch 大数组 | `form-designer/NewbieFormDesigner.jsx:185` | 配置数组任意嵌套变化都整体重建画布 |
| 整棵地址树深拷贝 | `address/NewbieAddress.jsx:84` | `limitLevel` 每次计算都重建所有节点 |
| 内存缓存无上限 | `hooks/utils.js:222` | `localCacheSession` 是普通对象，键只增不减 |

### 3.5 工程化与测试

- **测试覆盖严重不足**：目前 7 个测试文件 / 27 个用例，集中在 Provider 与 config 合并。`NewbieForm` / `NewbieTable` / `NewbieSearch` / `NewbieUploader` / `NewbieEditor` / `NewbieModal` / `NewbieList` 全部零覆盖。
- **最该被测的纯函数模块零覆盖**：`components/form/utils/formula-engine.js`（18.6KB）、`components/form/utils/rule-engine.js`、`components/form/model.js`、`components/form/utils.js`。它们无 DOM 依赖，是性价比最高的测试目标。
- **lint 拦不住本次的 P0**：`oxlint` 没有开 `no-undef`，所以 F-001 / F-002 / F-010 这类"用了没导入的标识符"全部漏网。`pnpm lint` 当前 0 error / 58 条 warning（7 处 `no-shadow`、2 处 `no-await-in-loop`、3 处 `no-array-sort`、12 处 `no-unassigned-import`，其余为 `consistent-function-scoping` / `no-shadow` 类提示）。
- **构建产物把 211KB 的 `addressData.json` 打进主入口**（F-037），地址数据明明可以按需加载。

---

## 4. 逐组件小结

### NewbieForm（表单）— 核心，优先级最高

- ✅ `model.js` 的扁平/嵌套桥接是本仓库最好的设计，`.` 号 key、表单项注册、reset 语义都处理得很扎实。
- ❌ 渲染期改写配置对象（F-004 相关）、`submitForm` 在渲染期被写（F-050 同类）。
- ❌ `beforeSubmit` 返回 `undefined` 会吞掉提交体（F-012）。
- ❌ `data` prop 声明支持 `String`，但实现按对象使用（`{...existingData}` 会把字符串展开成字符索引，F-022）。
- ⚠️ `computed` 字段依赖 `watchEffect` 自写自读，有触发"递归更新"上限的风险。
- ⚠️ 隐藏字段被置 `null` 后再显示不会恢复原值（F-024），需要确认是否是有意为之。

### NewbieSearch（搜索栏）

- ❌ `expandable` 搜索项在 `options` 为函数时崩溃（F-002）。
- ❌ 条件切换的 `watch` 写在渲染函数里（F-050）。
- ❌ `autoQuery` 未实现（F-016）。
- ⚠️ `getSearch()` 与 `search` 事件载荷结构不一致（F-023）：前者会省略空的 `newbieQuery` / `newbieSort`，后者总是带上空对象。

### NewbieTable（表格）

- ❌ `afterFetched` 缺省时抛 `TypeError`（F-013）；`rowKey` 为函数时行内编辑索引失效（F-014）。
- ❌ 直接改写调用方的列配置（F-021）。
- ❌ `fetchQueue` 竞态处理不完整（F-015）：只有最新响应会清空队列，旧响应会永久残留队列项。
- ⚠️ `handleTable` / `handlePagination` / `handleRowSelection` 每次渲染新建对象（F-052）。
- ✅ 分页/滚动持久化的双层存储（memory + localStorage）设计清晰，冷恢复入口是亮点。

### NewbieModal（弹窗）

- ❌ 对象式 `beforeClose` 未传文案时抛错（F-001，**P0**）。
- ✅ `styles` 的浅合并处理得当（`wrapper` / `body` 只覆盖用户显式给的字段），拖拽实现参考官方文档。

### NewbieUploader（上传）

- ❌ `defaultFileItem` 改名后 URL 丢失（F-003，**P0**）——`pick(item, Object.values(defaultFileItem))` 把"字段名映射表"当成了"字段名列表"。
- ⚠️ `processFileList` / `handleChange` 两处都要改；`defaultFileItem` 的语义（canonical → actual）应抽成工具函数。
- ⚠️ `map(fileList, pathKey).sort()` 用了会修改原数组的 `sort`（lint 已警告）。

### NewbieEditor（富文本）

- ❌ 用户传入 `editorConfig.MENU_CONF` 会整体覆盖内置的图片上传（F-019）。
- ❌ `disabled` / `readonly` 变化不生效（配置在 setup 期固化）。
- ⚠️ 上传失败只 `console.log`，用户没有任何反馈。

### NewbieFormDesigner（表单设计器）

- ❌ 属性面板回写链路（`getForm()` → `watch` → `propsToFormItem`）耦合在 `deep: true` 的 watch 上，脆弱且昂贵（F-055）。
- ❌ 全部文案硬编码中文（F-040）。
- ⚠️ `typeMaxSeq` 缓存后不再与 `painterItems` 同步，外部替换 `formItems` 时 key 序列可能与实际内容不符。

### NewbieList（滚动列表）

- ❌ `setup()` 阶段就发请求；`url` / `extraData` 变化不重新初始化（F-020）。
- ❌ 滚动监听未节流。

### NewbieAddress / NewbieCopy / NewbieButton

- ✅ 基本没有逻辑问题。
- ⚠️ `NewbieAddress` 静态导入 211KB JSON（F-037）；`limitLevel` 每次重算整棵树。

### NewbiePassword / NewbieSignaturePad

- ❌ 密码强度为空即报错、策略写死（F-017）。
- ❌ `window.onresize` 被覆盖且不清理（F-018）。

### NewbieProvider / NewbieThemeProvider

- ✅ `Symbol.for` 处理多 entry 注入、`readonly` 包裹、废弃 props 的告警都做得很到位。
- ⚠️ 配置合并机制与组件侧不统一（F-030）；`NewbieProvider` 的 `locale` 只能改库自带的 i18n 实例（F-039）。

---

## 5. 建议的改造路线图

分四批，每批都可独立合并、独立验证。

### 第一批：修 P0（约 2～3 天）

目标：把"一用就炸"的路径堵上。

1. **F-001**：拆分 `useT` → `useT`（组件内）+ `t`（任意位置），`NewbieModal` 改用 `t`。
2. **F-002**：`Expand.jsx:17` 改用归一化后的 `options`；顺带把 `options` 为函数时的归一化抽成公共函数（`Select.jsx` / `Cascader.jsx` 也有同样的隐患）。
3. **F-003**：新增 `mapFileItem(source, defaultFileItem)` 工具，把"canonical → actual"的映射写对；补一条单测。
4. **F-004**：`Layout.jsx` 不再回写 `item.span` / `item.formItemProps`，改为在渲染时用局部变量计算。
5. **F-005**：README 与组件文档补上 `app.use(Newbie)`（或 `app.use(i18n)`）的强制说明；或在组件内部对 i18n 未安装做降级。

**验收**：为这 5 条各补一条回归测试。

### 第二批：收敛全局配置与抽象（约 3～5 天）

目标：让"Provider 能配所有组件"这句话成立。

1. 统一到 `useMergedProps(rawProps, namespace, defaults)` 一种机制（F-030）；
2. 所有可被全局覆盖的 prop 统一改成 `default: undefined`，默认值只放在 `config.js`（F-031）；
3. `form.columns` 改名（如 `form.columnPresets`）以消除命名冲突（F-032）；
4. `useTableActions` / `useTableImage` / `useTableFile` 改名为 `renderTableActions` / `renderTableImage` / `renderTableFile`，并标注"只能在 render 中调用"（F-033）；
5. 抽出 `components/table/helpers.jsx`，解除 Form → Table 的耦合（F-036）。

### 第三批：性能与渲染期写入治理（约 3～5 天）

1. 搜索项的条件切换 `watch` 移到 `NewbieSearch` 的 setup 里统一注册（F-050）；
2. `Remote` 的 `debounce` 缓存到 `itemState`（F-051）；
3. `NewbieTable` 的 `handleTable/handlePagination/handleRowSelection` 改 `computed`（F-052）；
4. `NewbieForm` 的 `formItems` 稳定化 + `createLayout` memo（F-053）；`FormItem` 的 `rules` 缓存（F-054）；
5. `NewbieAddress` 的地址数据改为动态 import（F-037）。

### 第四批：健壮性与测试补齐（约 5 天）

1. 纯函数模块补测：`formula-engine` / `rule-engine` / `model` / `form/utils`（F-060）；
2. 组件级冒烟测试：`NewbieForm`（含多列布局、match、rangeKeys）、`NewbieSearch`、`NewbieTable`、`NewbieUploader`；
3. 打开 `oxlint` 的 `no-undef` 规则（F-062），清理 60 条 warning；
4. 表单设计器文案接入 i18n（F-040）；
5. `NewbieForm.beforeSubmit` / `NewbieTable.afterFetched` 的返回值契约写进类型注释与文档（F-012 / F-013）。

---

## 6. 建议补充的工程约定

1. **渲染期只读**：render 函数内不得写 `props`、配置对象、`reactive` 状态；状态变更一律放事件回调或 watcher。
2. **配置只读**：用户传入的 `form` / `columns` / `filterableColumns` 一律视为不可变；需要加工就 `cloneDeep`。
3. **不变量命名**：`use` 前缀只用于 composable；渲染助手用 `render*`；纯工具用 `xxx`。
4. **i18n 分级**：`useT` 只在 setup/render 用；事件回调统一用 `t`（走 `i18n.global`）。
5. **每个组件配一份 `config.js`**：既是默认值来源，也是"该组件支持哪些全局配置"的唯一事实来源，与 `docs/provider-config.md` 的表格一一对应。

---

## 7. 附：本次评审的复现方式

P0 的 4 条都可以用下面的最小用例复现（`vitest` + `@vue/test-utils`，`tests/setup.js` 已装好 i18n 与 jsdom 补丁）：

```jsx
// F-001
mount(NewbieModal, { props: { visible: true, beforeClose: { trigger: true } }, attachTo: document.body });
// → Unhandled Rejection: SyntaxError: Must be called at the top of a `setup` function

// F-002
createExpand({ key: "a", title: "A", expandable: true, options: () => [{ value: 1 }] }, { a: { value: [] } });
// → TypeError: item.options.map is not a function

// F-003
mount(NewbieUploader, {
  props: { value: { url: "https://x/a.png", name: "a.png", path: "p/a.png" } },
  global: { provide: { [Symbol.for("jobsys-newbie.config")]: { uploader: { defaultFileItem: { url: "fileUrl" } } } } },
});
// → emit("update:value") 的值里没有 url 字段

// F-004
mount(NewbieForm, {
  props: {
    columns: [12, 12],
    form: [
      { key: "a", title: "A", type: "input", columnIndex: [0, 1] },
      { key: "b", title: "B", type: "input", columnIndex: 1 },
    ],
  },
});
// → Unhandled Rejection: Maximum recursive updates exceeded
```

> 说明：F-004 的触发与时序相关（同一份用例在不同测试顺序下表现不一致），属于典型的"渲染期写依赖"引起的调度器自旋，根治方式是停止在渲染期改写配置对象。
