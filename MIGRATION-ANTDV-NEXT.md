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
  <NewbieProvider v-bind="provider">
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

| 变量 | 含义 |
| --- | --- |
| `--newbie-padding-sm` / `--newbie-padding` / `--newbie-padding-lg` | 小/中/大间距 |
| `--newbie-radius` | 圆角 |
| `--newbie-control-height-sm` | 小号控件高度 |
| `--newbie-table-pagination-height` | 分页行高（由控件高度推导） |
| `--newbie-tag-gap` | Tag 间距 |
| `--newbie-color-bg-container` / `--newbie-color-border` / `--newbie-color-fill-alter` / `--newbie-color-text` / `--newbie-color-text-secondary` / `--newbie-color-text-tertiary` / `--newbie-color-primary` / `--newbie-color-primary-bg` | 当前主题色板 |

> ⚠️ antdv-next 1.8.1 的 `ConfigProvider` 在 `theme` 变化后不会重新生成组件样式（实测：颜色/控件高度都不会更新）。`NewbieThemeProvider` 内部用 `themeKey` 触发重挂载，因此**运行时切换主题会重建子树**，业务状态会重置。建议在设置页或应用启动时切换；如果必须保留状态，需要等官方修复后移除这个 workaround。

## 剩余工作（Phase 1）

- [ ] 41 处 `.ant-*` 选择器需要视觉回归（重点：form readonly、table 分页对齐、modal body、uploader）。
- [ ] 全面回归 `matrix-*`、`rate-*`、`group`、`combiner` 与可选字段。
- [ ] 把 playground 的验证用例沉淀为自动化测试（至少覆盖点号 key、矩阵、可选字段、上传）。
- [ ] 评估 `zeroRuntime` + `StyleProvider layer`，为业务侧替换 `.ant-*` 覆盖做准备。

## Phase 1 补充验证

- `Input.TextArea` / `Input.Password` 仍然可用（antdv-next 保留了复合组件），2.0 前再切到独立导入。
- `Input` 的 `addonBefore` / `addonAfter` 在 1.8 下仍可用，实测无警告；货币/单位字段保持原样。
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

## 可继续优化的点

- `NewbieForm` 的扁平/嵌套适配层已经统一，后续可以让业务侧逐步改用嵌套数据，减少一层转换。
- `useFormItemChange` 集中了 antdv 内部 hook 的依赖，后续官方若公开 API 只需改一处。
- `NewbieList` 不再依赖已移除的 `List`，但 `listProps` 中的 antd 历史配置已失效，建议在 4.0 文档中标注。
- 已打包的 `@vueuse/*`、`wangeditor` 等依赖现在放在 `devDependencies`；如果后续要减小库产物体积，可以再评估把它们 externalize 成 optional peer。
