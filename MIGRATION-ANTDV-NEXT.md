# antdv-next 迁移验证（spike）

分支：`feat/antdv-next-spike`

本次 spike 的目标不是完成全部迁移，而是验证两件事：

1. `jobsys-newbie` 换到 `antdv-next` 后能否正常构建、渲染、校验、提交。
2. 高风险 API（尤其是 Form 的嵌套 model、`FormItemRest`、弹层、图标包）需要改到什么程度。

## 已完成

- 依赖：`ant-design-vue` → `antdv-next`，`@ant-design/icons-vue` → `@antdv-next/icons`。
- 构建：`vite.config.js` 改用 `AntdvNextResolver`，external/globals 同步更新；不再需要 antd 的 less 按需样式。
- 源码：`components` / `hooks` / `playground` 共 60+ 个文件的 import 已切换。
- 命名导出适配：`Textarea` → `TextArea`、`RangePicker` → `DateRangePicker`、`List` 移除。
- 表单：
    - 新增 `components/form/model.js`：对外保持「扁平对象 + 点号 key」，内部映射到 antdv-next 需要的嵌套 model。
    - `FormItem` 的 `name` 改为路径数组（`key.split(".")`）。
    - 移除 6 处 `FormItemRest`（antdv-next 不再自动收集未声明 `name` 的子控件）。
    - `reset()` 改为按初始化备份重建模型，避免 `resetFields` 在动态 model 下的差异。
    - 校验失败不再产生未处理的 Promise rejection。
- 弹层：
    - `Modal`：`bodyStyle` → `styles.body`，`wrapStyle` → `styles.wrapper`，`destroyOnClose` → `destroyOnHidden`。
    - `Modal` 的 `modalRender` 参数改为直接接收节点（antdv-next 不再是 `{ originVNode }`，这是本次发现的功能性 breaking change）。
    - `Drawer`：`width` → `size`（数字），非数字宽度保留旧的 `width`。
    - `Image` 预览：`visible/onVisibleChange` → `open/onOpenChange`。
- 其他 API：`Dropdown` 的 `overlay` → `popupRender`、`Table.customRow` → `onRow`、`Select.dropdownMatchSelectWidth` → `popupMatchSelectWidth`、`Space.direction` → `orientation`、`Form.labelAlign="left"` → `"start"`。
- 上传/富文本：`Form.useInjectFormItemContext()` 改为 `utils/form-item-context.js` 统一适配（内部映射到 `triggerChange`）。
- 包信息：版本改为 `4.0.0-alpha.0`，peerDependencies 指向 `antdv-next` / `@antdv-next/icons`。

## 验证结果

在 playground 中实测通过（无 console 报错 / 无 deprecation 警告）：

- Form：点号 key 必填校验、矩阵单选必填校验、扁平数据读取、重置。
- Table：渲染、搜索栏、可编辑列、操作列下拉。
- Search：条件面板与条件下拉（`popupRender`）。
- Modal / Drawer：打开、内容、标题、尺寸。
- FormLayout / FormDesigner / Editor / Uploader / Address / Password / Copy / SignaturePad。

命令：

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build
pnpm lint
```

`lint` 仍剩 3 个错误，均为 `main` 上已存在的历史问题（`NewbieAddress` 的两处正则、`index.js` 的 namespace 校验）。

## 主题体系（NewbieThemeProvider）

设计原则：**不再按旧版像素去“对齐”表头高度和间距**，而是把密度、主色、明暗映射到 antdv-next 的 Design Token，让尺寸由 token 推导。

- `createNewbieTheme({ density, colorPrimary, scheme, token, components })`
  返回 `{ theme, config, cssVariables, preset }`。
- `NewbieThemeProvider`：内置 `StyleProvider` + `ConfigProvider`，默认开启 `cssVar`。
- 密度预设：
    - `compact`：`compactAlgorithm` + Table 单元格 padding 8px
    - `default`：默认算法 + Table padding 12px
    - `loose`：默认算法 + `controlHeight: 40`、`fontSize: 15`、更大的 padding/radius + Table padding 18px
- 主色：`colorPrimary`，其余梯度由算法派生。
- 明暗：`scheme="dark"`，自动叠加 `darkAlgorithm`。
- 组件库自己的面板（搜索栏、表格容器、表单折叠面板、列表、弹窗 body）使用 `--newbie-*` CSS 变量，这些变量由当前 token 生成，因此会跟随密度/主色/暗色变化。

```vue
<NewbieThemeProvider density="compact" color-primary="#c2410c" scheme="dark" :locale="zhCN">
  <NewbieProvider :config="provider">
    <App />
  </NewbieProvider>
</NewbieThemeProvider>
```

如果项目已经有自己的 `ConfigProvider`，也可以只用工厂函数：

```js
const { theme, config, cssVariables } = createNewbieTheme({
	density: "compact",
	colorPrimary: "#c2410c",
});
```

```vue
<ConfigProvider :theme="theme" v-bind="config">
  <div :style="{ display: 'contents', ...cssVariables }">
    <App />
  </div>
</ConfigProvider>
```

暴露的 CSS 变量：

| 变量                                                                                                                                                        | 含义                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `--newbie-padding-sm` / `--newbie-padding` / `--newbie-padding-lg`                                                                                          | 小/中/大间距               |
| `--newbie-radius`                                                                                                                                           | 圆角                       |
| `--newbie-control-height-sm`                                                                                                                                | 小号控件高度               |
| `--newbie-table-pagination-height`                                                                                                                          | 分页行高（由控件高度推导） |
| `--newbie-tag-gap`                                                                                                                                          | Tag 间距                   |
| `--newbie-color-bg-layout` / `--newbie-color-bg-container` / `--newbie-color-bg-elevated` / `--newbie-color-bg-spotlight`                                   | 表面色                     |
| `--newbie-color-fill` / `--newbie-color-fill-secondary` / `--newbie-color-fill-tertiary` / `--newbie-color-fill-quaternary` / `--newbie-color-fill-alter`   | 填充色                     |
| `--newbie-color-text` / `--newbie-color-text-secondary` / `--newbie-color-text-tertiary` / `--newbie-color-text-quaternary`                                 | 文本层级                   |
| `--newbie-color-border` / `--newbie-color-border-secondary` / `--newbie-color-split`                                                                        | 边框与分割线               |
| `--newbie-color-primary` / `--newbie-color-primary-hover` / `--newbie-color-primary-active` / `--newbie-color-primary-bg` / `--newbie-color-primary-border` | 主色梯度                   |
| `--newbie-border-radius` / `--newbie-border-radius-lg` / `--newbie-control-height` / `--newbie-font-size`                                                   | 尺寸                       |
| `--newbie-box-shadow` / `--newbie-box-shadow-secondary`                                                                                                     | 阴影                       |

这些变量同时写进 ConfigProvider 子树与 `:root`，所以 teleport 到 body 的 dropdown / popover / modal 也能读到；需要挂到其它容器时仍可用 `applyThemeVariables(target, variables)`。

> ⚠️ antdv-next 1.8.1 的 `ConfigProvider` 在 `theme` 变化后不会重新生成组件样式。`NewbieThemeProvider` **默认走 cssVar 热更新**（不传 key），切换主题不会重建子树，业务状态得以保留；如果实测样式没有刷新，可以打开 `remount` 让它用 key 重建子树——代价是**子树内的业务状态会被重置**，建议只在应用启动或设置页切换。

## 主题能力补齐（4.0.0-alpha.0）

在迁移验证之后，组件库补齐了 4 项主题相关能力，供主项目接入：

- `NewbieThemeProvider` 新增 `remount`（默认 `false`）：默认不传 key，切换密度/主色/暗色不重建子树；`remount` 为 `true` 时才用 key 重建，是 antdv-next 1.8.1 下样式一定刷新的兜底手段。
- `theme.js` 导出完整的 `--newbie-*` 变量清单（表面 / 填充 / 文字 / 边框 / 主色 / 尺寸 / 阴影），取值全部来自 antdv-next 的 token，暗色模式自动跟随；旧的 `--newbie-color-*` 变量名保持兼容。
- 导出 `applyThemeVariables(target, variables)`：把变量写到任意 DOM 元素（如 `document.documentElement`），突破 ConfigProvider 子树的作用域限制；`variables` 为空时不做任何事。
- 导出 `useNewbieTheme()`：通过 provide/inject 暴露 `density` / `scheme` / `colorPrimary` / `token` / `theme`，没有 Provider 时返回安全默认值。
- `NewbieThemeProvider` 把 `--newbie-*` 变量同时写到 `:root`：dropdown / popover / modal 等 teleport 到 body 的弹层不再回落到写死的浅色兜底值。
- 修正下拉菜单项内按钮的悬停底色：原来写死 `#fff`，暗色下整项变白；改为 `--newbie-color-bg-elevated`，跟随明暗。
- 新增 `NewbieApp`：一次性组合 `StyleProvider` + `ConfigProvider` + `NewbieProvider` + antdv-next 的 `<a-app>`，内部复用 `createNewbieTheme()`，不再重复实现密度预设。

## 剩余工作（Phase 1）

- [ ] 41 处 `.ant-*` 选择器需要视觉回归（重点：form readonly、table 分页对齐、modal body、uploader）。
- [ ] 全面回归 `matrix-*`、`rate-*`、`group`、`combiner` 与可选字段。
- [ ] 把 playground 的验证用例沉淀为自动化测试（至少覆盖点号 key、矩阵、可选字段、上传）。
- [ ] 评估 `zeroRuntime` + `StyleProvider layer`，为业务侧替换 `.ant-*` 覆盖做准备。

## Phase 1 补充验证

- `Input.TextArea` / `Input.Password` 仍然可用（antdv-next 保留了复合组件），2.0 前再切到独立导入。
- `Input` 的 `addonBefore` / `addonAfter` 在 1.8 下仍可用，实测无警告；货币/单位字段保持原样。
- `InputNumber` 的 `addonBefore` / `addonAfter` 在 1.8 已废弃并会打印 “Please use Space.Compact instead”，数字字段改为由库内统一包装 `Space.Compact` + `Space.Addon` 渲染，同时兼容 `prepend` / `append` 写法。
- `Transfer` 的 `listStyle` 实测无警告，暂不改为 `styles.section`。
- `NewbieTable` 的单元格渲染新增 `column.render(text, record, index)` 兼容分支，方便后续按 antdv-next 的列 API 写新代码。
- `NewbieUploader` 的进度条 `strokeWidth` 已改为 `size`。
- Uploader 独立示例页在 `disabled` 下没有内容，是 `uploadBtn()` 的既有逻辑（禁用时不渲染上传按钮），不是迁移回归。
- `Tag` 间距不再写死：普通 Tag 走 ConfigProvider `tag.styles`，CheckableTag 走主题注入的 `--newbie-tag-gap`，随密度变化（6/8/10px）。
- `NewbieTable` 里给每列加的 `resizable: true` 在 antdv-next 会启用原生列宽拖拽，但表格是 `table-layout: auto`，会告警；该能力在 antdv 4 中本来就没有生效，已移除，保持旧行为。需要列宽拖拽时应显式设置 `tableLayout="fixed"` 并作为新特性引入。
- `scroll.x: 1000` 保持原值：antdv-next 会同时应用到 header/body 并同步滚动。表头高度、分页高度现在由密度 token 决定（compact/default/loose 分别为 47/47/60 左右），不再按旧版像素对齐。
- 构建 `external` 改为正则匹配包及其子路径：`antdv-next/dist/form/context` 必须与宿主共用同一份 InjectionKey。`vuedraggable` 改为随库打包，避免消费方解析其源码子路径。
- `createFormModel` 的扁平视图改为 Proxy：动态字段直接写 `submitForm[key]` 时会自动补 `bind`，无 key 的展示项不会再生成 `undefined` 字段。
- 发布包使用 `files` 白名单，只发布 `dist` 下的 js/cjs/css；sourcemap、旧 `.tgz`、源码入口不再进入 npm 包。已打包进 `dist` 的依赖移到 `devDependencies`，运行期只保留 `peerDependencies`。

## NewbieProvider 全局配置变更（4.0）

`NewbieProvider` 从「固定 5 个配置对象」改为「任意命名空间的覆盖包 + 组件自带默认值」：

```vue
<NewbieProvider :config="{ table: { pageSize: 50 }, uploader: { uploadUrl: '/api/upload' } }">
```

- 优先级：组件默认值 < `config[命名空间]` < 实例 props。
- 顶层的 `editor` / `table` / `uploader` / `form` / `search` props 保留一个版本，会输出弃用警告，`config` 优先。
- `table.pageSize` 默认值从 `10` 统一为 `20`（与表格原有实际行为一致）；全局 `table.page` 移除。
- `locale` 默认从 `zh_CN` 改为空字符串，不再覆盖宿主应用语言。
- 配置改为响应式，异步拉取的配置会在到达后自动生效；Provider 不再额外包裹 `<div>`。
- 新增组件命名空间只需新建 `config.js`，不需要修改 `NewbieProvider`。详见 `docs/provider-config.md`。

## 可继续优化的点

- `NewbieForm` 的扁平/嵌套适配层已经统一，后续可以让业务侧逐步改用嵌套数据，减少一层转换。
- `useFormItemChange` 集中了 antdv 内部 hook 的依赖，后续官方若公开 API 只需改一处。
- `NewbieList` 不再依赖已移除的 `List`，但 `listProps` 中的 antd 历史配置已失效，建议在 4.0 文档中标注。
- 已打包的 `@vueuse/*`、`wangeditor` 等依赖现在放在 `devDependencies`；如果后续要减小库产物体积，可以再评估把它们 externalize 成 optional peer。
