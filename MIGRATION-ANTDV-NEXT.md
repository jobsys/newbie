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

## 剩余工作（Phase 1）

- [ ] `NewbieTable` 的 `onResizeColumn` 仍是 deprecated，2.0 前改为 `onResize`。
- [ ] 41 处 `.ant-*` 选择器需要视觉回归（重点：form readonly、table 分页对齐、modal body、uploader）。
- [ ] `Tag` 默认外边距被 antdv-next 移除，需要确认搜索/表格/详情页的间距。
- [ ] 全面回归 `matrix-*`、`rate-*`、`group`、`combiner` 与可选字段。
- [ ] 把 playground 的验证用例沉淀为自动化测试（至少覆盖点号 key、矩阵、可选字段、上传）。
- [ ] 评估 `zeroRuntime` + `StyleProvider layer`，为业务侧替换 `.ant-*` 覆盖做准备。

## 可继续优化的点

- `NewbieForm` 的扁平/嵌套适配层已经统一，后续可以让业务侧逐步改用嵌套数据，减少一层转换。
- `useFormItemChange` 集中了 antdv 内部 hook 的依赖，后续官方若公开 API 只需改一处。
- `NewbieList` 不再依赖已移除的 `List`，但 `listProps` 中的 antd 历史配置已失效，建议在 4.0 文档中标注。
- 构建产物尚未 externalize `@vueuse/*`、`wangeditor` 等依赖，4.0 可以顺手收敛包体积。
