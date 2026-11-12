# 评审问题清单

> 配套文档：[`../REVIEW.md`](../REVIEW.md)
> 级别定义：**P0** 功能不可用 / 数据丢失 · **P1** 逻辑错误、契约不符 · **P2** 抽象与 API 设计问题 · **P3** 性能与资源 · **P4** 工程化与可维护性
> 状态标注：**已复现** = 已用最小用例在 vitest + jsdom 下验证；**代码确认** = 通过源码路径分析确认

目录：

- [P0 缺陷（5 条）](#p0-缺陷5-条)
- [P1 逻辑与正确性（16 条）](#p1-逻辑与正确性16-条)
- [P2 抽象与 API 设计（13 条）](#p2-抽象与-api-设计13-条)
- [P3 性能与资源（8 条）](#p3-性能与资源8-条)
- [P4 工程化与测试（4 条）](#p4-工程化与测试4-条)

---

## P0 缺陷（5 条）

### F-001 `NewbieModal` 对象式 `beforeClose` 抛错，弹窗无法关闭

- **位置**：`components/modal/NewbieModal.jsx:129`（`onCloseModal`）、`hooks/i18n.js:12`（`useT`）
- **级别**：P0 · **状态**：已复现
- **现象**

  `beforeClose` 传对象且未显式提供 `title` / `okText` / `cancelText` 时，点击关闭会抛出

  ```
  Unhandled Rejection: SyntaxError: Must be called at the top of a `setup` function
      at useI18n (vue-i18n)
      at useT (hooks/i18n.js:12)
      at onCloseModal (components/modal/NewbieModal.jsx:129)
  ```

  结果是二次确认框不弹出，弹窗也关不掉。

- **根因**

  `useT()` 内部调用 vue-i18n 的 `useI18n()`，而 `useI18n()` 依赖 `getCurrentInstance()`，在 setup / render 之外调用会直接抛错。
  `onCloseModal` 是事件回调，运行在组件渲染上下文之外。

  ```js
  // hooks/i18n.js
  export function useT(key, options) {
    const { t } = useI18n();   // ← 非 setup 上下文会抛错
    ...
  }
  ```

- **建议**

  1. 在 `hooks/i18n.js` 中拆出两个 API：
     - `useT(key, options)` —— 只能在 setup / render 中调用，保持现有行为；
     - `t(key, options)` —— 任意位置可用，内部走 `i18n.global.t`。
  2. `NewbieModal.onCloseModal` 改用 `t`。
  3. 顺带排查其它"事件回调 / Promise 回调 / watcher 回调"里的 `useT` 调用（当前只有这一处，但模式脆弱）。

---

### F-002 搜索项 `expandable` + 函数式 `options` 崩溃

- **位置**：`components/search/components/Expand.jsx:15,17`
- **级别**：P0 · **状态**：已复现
- **现象**

  ```js
  { key: "a", title: "A", expandable: true, options: () => [{ value: 1 }] }
  ```

  渲染时抛 `TypeError: item.options.map is not a function`，整个搜索栏渲染失败。

- **根因**

  第 15 行已经正确地把函数式 `options` 归一化成数组：

  ```js
  let options = isFunction(item.options) ? item.options() : item.options;
  ```

  但第 17 行仍然用了**原始的** `item.options`：

  ```js
  const checkedOptions = ref(item.options.map(() => false));
  ```

- **建议**

  ```js
  const checkedOptions = ref(options.map(() => false));
  ```

  并把"函数式 options 归一化"抽成公共函数（`Select.jsx:28`、`Cascader.jsx:15`、`Group.jsx` 也有同样的模式），避免各处重复实现。

---

### F-003 `uploader.defaultFileItem` 改名后上传结果丢失 URL

- **位置**：`components/uploader/NewbieUploader.jsx:161,253`
- **级别**：P0 · **状态**：已复现
- **现象**

  通过 `NewbieProvider` 配置 `uploader: { defaultFileItem: { url: "fileUrl" } }` 后，已有附件在回填时被过滤掉，`update:value` 抛出的对象里 **没有 url 字段**：

  ```js
  // 期望 { name, url, path, ... }
  // 实际 { name, path, _type, _disk }
  ```

- **根因**

  `defaultFileItem` 的语义是 **"标准字段名 → 实际字段名"** 的映射表：

  ```js
  export const defaultFileItem = {
    id: "id", name: "name", url: "url", path: "path", thumbUrl: "thumbUrl",
  };
  ```

  但代码用 `Object.values(defaultFileItem)` 当成了"字段名列表"来 `pick`：

  ```js
  // components/uploader/NewbieUploader.jsx:161
  ...pick(item, Object.values(defaultFileItem)),        // 取的是 "url"（值），不是映射
  // components/uploader/NewbieUploader.jsx:253
  item = { ...item, ...pick(res.result, Object.values(defaultFileItem)) };
  ```

  默认配置下"键 == 值"，所以看不出问题；一旦改名就整体失效。
  读侧（`item[urlKey]`）用的是映射后的名字，写侧用的是未映射的名字，两边不一致。

- **建议**

  抽一个明确的映射工具，把"源对象（标准名）→ 目标对象（实际名）"写清楚：

  ```js
  // components/uploader/utils.js
  export function toActualNames(source, mapping = defaultFileItem) {
    const result = {};
    for (const [canonical, actual] of Object.entries(mapping)) {
      if (source?.[canonical] !== undefined) result[actual] = source[canonical];
    }
    return result;
  }
  ```

  `processFileList` 与 `handleChange` 都改用它，并补一条"改名后仍能正确读写"的单测（`tests/uploader/config.test.js` 目前只覆盖了 `mergeConfig` 本身）。

---

### F-004 多列布局下渲染期改写配置，触发 `Maximum recursive updates exceeded`

- **位置**：`components/form/components/Layout.jsx:100,103`
- **级别**：P0 · **状态**：已复现
- **现象**

  ```js
  mount(NewbieForm, {
    props: {
      columns: [12, 12],
      form: [
        { key: "a", title: "A", type: "input", columnIndex: [0, 1] },
        { key: "b", title: "B", type: "input", columnIndex: 1 },
      ],
    },
  });
  ```

  抛出 13 次 `Maximum recursive updates exceeded`（Vue 调度器 100 次自旋上限），表单无法正常渲染。

- **根因**

  `Layout` 在**渲染期**把计算结果写回表单项配置对象：

  ```js
  item.span = span;                        // 第 100 行
  item.formItemProps = {                   // 第 103 行
    labelCol: { span: ... },
    ...item.formItemProps,
  };
  ```

  写回导致依赖被反复改写 → 触发新一轮渲染 → 再次写回，形成自旋。
  注释掉第 103 行的写回后，递归错误消失（已验证）。

  同时这两个写回也会**污染调用方传入的配置对象**（`form[0].span`、`form[0].formItemProps` 会被写进去，已用断言验证）。

- **附带问题**

  `item.formItemProps = { labelCol: {...}, ...item.formItemProps }` 的展开顺序意味着：第一次渲染算出的 `labelCol` 会被后续渲染沿用，导致"按列数动态计算的 labelCol"实际只在第一次生效。

- **建议**

  1. 不再回写配置对象，改为渲染时用局部变量：

     ```js
     const span = ...;
     const formItemProps = { labelCol: { span: ... }, ...item.formItemProps };
     // 传给 createFormItem 的是 { ...item, span, formItemProps }
     ```

  2. `NewbieForm.formItems` 里的 `item.type = "input"`（`NewbieForm.jsx:270`）同样改成不写回：`{ type: "input", ...item }`。

  3. 统一约定：**用户传入的 `form` / `columns` 一律视为只读**。

---

### F-005 「按需引入单个组件」在未 `app.use()` 时崩溃

- **位置**：`index.js:7`、`hooks/i18n.js:12`、README.md「也可以按需引入单个组件」
- **级别**：P0 · **状态**：已复现
- **现象**

  ```js
  import { NewbieForm } from "jobsys-newbie";
  // 未 app.use(Newbie) / app.use(i18n)
  ```

  渲染时抛 `SyntaxError: Need to install with `app.use` function`（vue-i18n）。

- **根因**

  所有组件都在 setup / render 中调用 `useI18n()`，vue-i18n 要求先 `app.use(i18n)`。
  库把 i18n 的安装放在**插件默认导出**的 `install` 里（`index.js:7`），按需引入路径绕过了它。

- **建议（二选一）**

  1. **文档层**：README 与各组件文档明确写出"按需引入时也必须 `app.use(Newbie)`（它负责安装 i18n），或自行 `app.use(i18n)`"。同时在 `components/*/README.md` 里加同样的提示。
  2. **代码层（更稳）**：让 `useT` 在没有 i18n 实例时降级——检测 `getCurrentInstance()` 为空或 i18n 未安装时回退到内置的 `i18n.global.t`；并把 i18n 实例从 `provide` 而非 `app.use` 的角度解耦。

  > 顺带提醒：`index.js` 里 `app.use(i18n)` 会在宿主已有 vue-i18n 时安装**第二个实例**，库内组件用 `useI18n()` 拿到的是最近的那个（库自己的），宿主切语言不影响库内文案（见 F-039）。

---

## P1 逻辑与正确性（16 条）

### F-010 `Group.jsx` 使用 `<NewbieForm>` 但未 import

- **位置**：`components/form/components/Group.jsx:313`
- **级别**：P1 · **状态**：代码确认

`@vue/babel-plugin-jsx` 对"作用域内找不到的大写标识符"会生成 `resolveComponent("NewbieForm")`，它只在**全局注册**时才能解析。

- 通过 `app.use(Newbie)`（默认导出）安装时，`NewbieForm` 会被全局注册 → 可用；
- 通过 `import { NewbieFormDesigner } from "jobsys-newbie"` 按需引入时 → 解析失败，dev 下报 `Failed to resolve component: NewbieForm`，分组编辑抽屉渲染不出来。

**建议**：显式 import。需要注意 `Group.jsx → NewbieForm.jsx → Layout.jsx → FormItem.jsx → components/index.js → Group.jsx` 会形成循环依赖，可改用 `defineAsyncComponent(() => import("../../form/NewbieForm.jsx"))` 打断，或者把字段渲染器从 barrel 文件 `components/form/components/index.js` 改为逐文件引用（见 F-042）。

### F-011 `Group.jsx` 的 `toRef` 用法导致 `isDirty` 永远失效

- **位置**：`components/form/components/Group.jsx:44`
- **级别**：P1 · **状态**：代码确认

```js
const editFormRef = toRef(itemState.editFormRef);   // 每次渲染都新建一个 ref（值为 null）
```

`toRef(value)` 的语义是"把当前值包成一个新 ref"，不是属性 ref。渲染时拿到的临时 ref 会被 Vue 写入子组件实例，但 `itemState.editFormRef` 永远是 `null`。

后果：`onBeforeCloseEditModal` 里的 `editFormRef.value?.isDirty()` 恒为 `undefined` → "有未保存修改"的二次确认永远不弹。

**建议**：改成属性 ref `toRef(itemState, "editFormRef")`，或直接把 `ref()` 存在 `itemState` 里。

### F-012 `NewbieForm.beforeSubmit` 返回 `undefined` 会把提交体变成 `undefined`

- **位置**：`components/form/NewbieForm.jsx:480`
- **级别**：P1 · **状态**：代码确认

```js
form = await props.beforeSubmit({ formatForm: form, originalForm: submitForm });
if (form === false) { return resolve(); }
```

若回调只做了副作用（改字段）而没有 `return`，`form` 变成 `undefined`，随后 `useFetch().post(props.submitUrl, undefined)` 提交空体。

**建议**：明确契约——`false` 阻止提交、对象替换提交体、`undefined` 视为"沿用原表单"：

```js
const result = await props.beforeSubmit?.({ formatForm: form, originalForm: submitForm });
if (result === false) return resolve();
if (result && typeof result === "object") form = result;
```

并在 README / 类型注释里写清。

### F-013 `NewbieTable` 未提供 `afterFetched` 时抛 `TypeError`

- **位置**：`components/table/NewbieTable.jsx:394`
- **级别**：P1 · **状态**：代码确认

```js
const fetched = props.afterFetched;   // 默认 tableDefaults.afterFetched = null
const result = fetched(res);          // TypeError: fetched is not a function
```

文档要求"有 url 时必须传 afterFetched"，但失败形态是不可读的 TypeError。

**建议**：缺省时给出明确报错或使用内置默认解析：

```js
if (typeof fetched !== "function") {
  console.error("[NewbieTable] 使用 url 时必须提供 afterFetched");
  return;
}
const result = fetched(res);
```

### F-014 `NewbieTable` 的 `rowKey` 为函数时，行内编辑与行点击失效

- **位置**：`components/table/NewbieTable.jsx:769,838,845,857,896`
- **级别**：P1 · **状态**：代码确认

`rowKey` 声明为 `String | Function`，但内部一律用 `record[props.rowKey]` 取行标识。函数型 `rowKey` 时 `record[fn]` 为 `undefined` → 所有行共用一个编辑态 key。

**建议**：抽 `const getRowKey = record => isFunction(props.rowKey) ? props.rowKey(record) : record[props.rowKey];`，统一使用。

### F-015 `NewbieTable.fetchItems` 的请求竞态处理不完整

- **位置**：`components/table/NewbieTable.jsx:369-401`
- **级别**：P1 · **状态**：代码确认

`state.fetchQueue` 用数组模拟"只认最后一次请求"，但只有当**最新**响应回来时才清空队列。若最新请求失败或被丢弃，旧队列项会永久残留，队列长度单调增长。

**建议**：改用单调递增的 `requestId`，只保留最后一次：

```js
const requestId = ++state.lastRequestId;
// ...
if (requestId !== state.lastRequestId) return;   // 丢弃过期响应
```

### F-016 `autoQuery` 声明了但从未消费

- **位置**：`components/table/NewbieTable.jsx:106`、`components/search/NewbieSearch.jsx:66`
- **级别**：P1 · **状态**：代码确认

两个组件都声明了 `autoQuery`，`tableDefaults.autoQuery` 也存在，但代码里没有任何一处读取它。而 `components/table/README.md:100` 写的是"搜索条件变化时是否自动查询"，`components/search/README.md:124` 同样。

**建议**：二选一——实现（在 `NewbieSearch` 里 watch `queryForm` 并节流触发 `onSearch`），或从 props / defaults / 文档中一并移除（`docs/provider-config.md:32` 已注明是"保留项"）。

### F-017 `NewbiePassword` 空密码即报错，且强度策略写死

- **位置**：`components/password/NewbiePassword.jsx:89-109`
- **级别**：P1 · **状态**：代码确认

```js
const showError = computed(() => {
  return (
    (password.value.length > 0 && password.value.length < props.min) ||
    password.value.length > props.max ||
    strength.value < 4            // ← 空密码时 strength = 0
  );
});
```

空密码时 `strength = 0 < 4` → 组件一挂载就显示"密码必须包含数字、小写字母、大写字母和特殊符号"。

另外"必须同时包含 4 类字符"是写死的策略，既不能配置，也没有"仅提示不拦截"的能力。

**建议**：空值不报错；把策略抽成可配置项（如 `rules: [{ type: "length", min: 8 }, { type: "charset", required: ["digit","lower","upper","symbol"] }]`）。

### F-018 `NewbieSignaturePad` 覆盖全局 `window.onresize`

- **位置**：`components/signature-pad/NewbieSignaturePad.jsx:52`
- **级别**：P1 · **状态**：代码确认

```js
window.onresize = resizeCanvas;
```

在 `setup()` 里直接赋值，会**覆盖**宿主应用已有的 `onresize` 处理器，且组件卸载后不会还原；同一页面多个签名板时互相覆盖。

**建议**：用 `@vueuse/core` 的 `useEventListener(window, "resize", resizeCanvas)`（该库已是依赖），自动解绑。

### F-019 `NewbieEditor` 的 `MENU_CONF` 被整体覆盖，配置不响应变化

- **位置**：`components/editor/NewbieEditor.jsx:71-93`
- **级别**：P1 · **状态**：代码确认

1. `editorConfig` 的展开顺序是 `MENU_CONF` 在前、`...props.config?.editorConfig` 在后 → 用户只要传了 `MENU_CONF`，内置的 `uploadImage`（图片上传）处理器就被整体顶掉，且没有任何提示。
2. `editorConfig` / `toolbarConfig` 在 setup 期用 `ref` 固化 → 运行时修改 `props.config` 不会生效。
3. `readOnly: props.disabled || props.readonly` 同理，`disabled` / `readonly` 变化后不生效。
4. 图片上传失败只 `console.log(e)`（第 87 行），用户没有任何反馈。

**建议**：`MENU_CONF` 做深合并；`editorConfig` / `toolbarConfig` 改为 `computed`；上传失败用 `message.error` 提示。

### F-020 `NewbieList` 在 setup 阶段发请求，参数变化不生效

- **位置**：`components/list/NewbieList.jsx:64-96`
- **级别**：P1 · **状态**：代码确认

- `if (props.autoLoad) loadMore();` 写在 `setup()` 里（不是 `onMounted`），组件还没挂载就发请求。
- `pagination` 只在 setup 时根据 `props.url` / `props.extraData` 初始化一次，之后这两个 prop 变化不会重新初始化。
- `watch(y, ...)` 没有节流，只靠 `pagination.loading` 兜底；快速滚动时可能连续触发。
- `containerRef.value.scrollHeight` 没有 null 保护。

**建议**：把初始化移到 `onMounted`；`url` / `extraData` 变化时 `watch` 重置 `pagination` 并重新加载；滚动回调加节流。

### F-021 `NewbieTable` 直接改写调用方的列配置

- **位置**：`components/table/NewbieTable.jsx:501-512`
- **级别**：P1 · **状态**：代码确认

```js
return columns.map(item => {
  if (item.minWidth) {
    item.RC_TABLE_INTERNAL_COL_DEFINE = { style: { "min-width": `${item.minWidth}px` } };
    item.width = item.minWidth;
  }
  item.key = getKey(item);
  return item;                 // ← 返回的还是调用方的对象
});
```

**建议**：`return columns.map(item => ({ ...item, key: getKey(item), ...(item.minWidth ? {...} : {}) }))`。

### F-022 `NewbieForm.data` 支持 `String` 但按对象使用

- **位置**：`components/form/NewbieForm.jsx:37,399-402`
- **级别**：P1 · **状态**：代码确认

`data` 的类型是 `[Object, String]`，但 `initFormData` 里 `extractFormData = { ...existingData, ...extractFormData }` 会把字符串展开成字符索引对象（`{0:'a',1:'b'}`）。

**建议**：要么去掉 `String` 类型，要么明确按 JSON 字符串解析。

### F-023 `NewbieSearch.getSearch()` 与 `search` 事件载荷结构不一致

- **位置**：`components/search/NewbieSearch.jsx:276,477-493`
- **级别**：P1 · **状态**：代码确认

- `search` 事件：始终返回 `{ newbieQuery, newbieSort }`（可能是空对象）；
- `getSearch()`：空的 `newbieQuery` / `newbieSort` 会被省略。

`NewbieTable.initFetch` 用的是 `getSearch()`，后续搜索用事件 → **首次请求与后续请求的参数结构不同**。

**建议**：统一为一种结构。

### F-024 隐藏字段的值被置 `null` 后，重新显示不会恢复

- **位置**：`components/form/NewbieForm.jsx:329-342`
- **级别**：P1 · **状态**：代码确认

`applyFieldVisibility` 把隐藏字段写成 `null`，字段重新显示时不会恢复原值。

**建议**：明确这是产品决策还是缺陷。若是缺陷，可在隐藏时暂存到 `state.hiddenValues`，显示时回填。

### F-025 `useFetch` 缺少错误处理、超时、取消与拦截器入口

- **位置**：`hooks/network.js:39`
- **级别**：P1 · **状态**：代码确认

- `useFetch()` 不带参数时 `fetcher` 是临时对象，`loading` 状态无处可读；
- 没有 `timeout`、没有 `AbortController`、没有暴露 axios 实例，业务侧无法挂拦截器（鉴权头、统一错误处理）；
- `get` / `post` 各自 `new Promise` 包一层 axios，语义上等价于直接返回 axios 的 Promise。

**建议**：暴露一个可配置的 axios 实例（`setAxiosInstance` / `createFetch`），并在 `useFetch` 里支持 `signal` 与 `timeout`。

---

## P2 抽象与 API 设计（13 条）

### F-030 全局配置存在三套并行机制

- **位置**：`hooks/useMergedProps.js`、`components/provider/config.js`
- **级别**：P2

| 机制 | 使用者 | 语义 |
| --- | --- | --- |
| `useMergedProps(rawProps, ns, defaults)` | 仅 `NewbieTable` | props > Provider > defaults |
| `useNewbieConfig(ns, defaults)` | form / search / uploader / editor | Provider > defaults（不含 props） |
| 裸 `props` | modal / list / address / copy / password / signature-pad / button | 无全局配置能力 |

结果：**14 个组件里只有 5 个能被 `NewbieProvider` 配置**。

**建议**：统一到 `useMergedProps`，所有组件在各自 `config.js` 里声明默认值，未声明的 prop 自然不受 Provider 影响。

### F-031 `useMergedProps` 的隐式契约：只有 `default: undefined` 的 prop 可被全局覆盖

- **位置**：`hooks/useMergedProps.js:19-24`
- **级别**：P2

`useMergedProps` 只在 `rawProps[key] !== undefined` 时用实例 prop 覆盖 Provider 值，因此声明了具体默认值（如 `default: false` / `default: ""`）的 prop **永远**拿不到 Provider 的值。

`NewbieTable.editable`（`default: false`）与 `submitUrl`（`default: ""`）就是这种情况。

**建议**：所有"允许全局配置"的 prop 统一写 `default: undefined`，默认值只放在 `config.js`；并在 `docs/provider-config.md` 写明这条规则。

### F-032 `form.columns` 命名冲突

- **位置**：`components/form/config.js:3` vs `components/form/NewbieForm.jsx:125`
- **级别**：P2

- Provider 的 `form.columns`：`{ switch: { defaultProps: { size: "small" } } }`（按字段类型索引）
- `NewbieForm` 的 `columns` prop：`[24]`（24 栅格布局）

同名不同义，且 Provider 里的 `form.columns` 还无法表达布局列数。

**建议**：Provider 侧改名 `form.columnPresets`；布局列数单独给 `form.layoutColumns`。

### F-033 `use` 前缀被用于渲染助手

- **位置**：`components/table/NewbieTable.jsx:1208,1302,1340`
- **级别**：P2

`useTableActions` / `useTableImage` / `useTableFile` 是**必须在 render 中调用**的渲染助手，却以 `use` 开头 —— 违反 hook 约定，使用者容易误放进 `computed` / `watch`。

**建议**：重命名为 `renderTableActions` / `renderTableImage` / `renderTableFile`，并在注释里写明"只能在 render 中调用"。

### F-034 把行为挂到配置对象上（`item.collectItem = ...`）

- **位置**：`components/search/components/Select.jsx:70`、`Cascader.jsx:51`、`Number.jsx:47`、`Date.jsx:37`、`Input.jsx:35`、`Textarea.jsx:37`、`Switch.jsx:32`、`Expand.jsx:55`
- **级别**：P2

搜索项的渲染函数把 `collectItem` 赋值回配置对象。`NewbieSearch.init()` 里对列做了 `cloneDeep`，所以没有污染用户数据，但"配置 + 行为"混在同一个对象里，让配置无法序列化、无法比较，也让 `init()` 每次都要重建全部搜索项。

**建议**：把 `collectItem` 收进 `searchState`（`searchState[item.key].collectItem`），配置对象保持纯数据。

### F-035 `GlobalLogicPanel` 用 props 模拟事件

- **位置**：`components/form-designer/GlobalLogicPanel.jsx:46,49`
- **级别**：P2

`onChange` / `onClose` 声明为 props 而非 `emits`，绕过了 Vue 的事件校验与 `$attrs` 透传。

**建议**：改为 `emits: ["change", "close"]`。

### F-036 Form 依赖整个 Table

- **位置**：`components/form/components/Group.jsx:23`
- **级别**：P2

```js
import { useTableImage } from "../../table";
```

`components/table/index.js` → `NewbieTable.jsx` → `NewbieSearch` → 整个搜索栈。只为了一个图片渲染助手，让 Form 打包进了 Table + Search。

**建议**：抽出 `components/table/helpers.jsx`（`renderTableActions` / `renderTableImage` / `renderTableFile`），Form 只依赖这个文件。

### F-037 `NewbieAddress` 静态导入 211KB JSON

- **位置**：`components/address/NewbieAddress.jsx:3`
- **级别**：P2

```js
import localData from "./addressData.json";
```

被直接打进主入口 chunk。地址数据是典型的"可按需加载"资源。

**建议**：改为 `const localData = await import("./addressData.json")`（异步），或放到独立 entry / CDN。

### F-038 依赖 antdv-next 内部路径

- **位置**：`utils/form-item-context.js:1`
- **级别**：P2

```js
import { useFormItemContext } from "antdv-next/dist/form/context";
```

`vite.config.js` 把 `^antdv-next(\/|$)` 全部 external 掉，运行时要求使用方的 `antdv-next` 恰好暴露该路径。小版本升级就可能断裂。

**建议**：加一层兜底（try/catch + 公开 API fallback），或在 `package.json` 里把 `antdv-next` 的版本范围收紧，并在 CI 里加一条"导入路径存在性"检查。

### F-039 库强制安装自己的 vue-i18n 实例

- **位置**：`index.js:7`、`i18n.js`
- **级别**：P2

宿主若已装 vue-i18n，`app.use(Newbie)` 会再装一个实例。库内组件的 `useI18n()` 解析到**最近**的实例（库自己的），宿主切换语言不会影响库内文案；`NewbieProvider` 的 `locale` prop 也只能改库自己的实例。

**建议**：优先复用宿主实例（`app.config.globalProperties.$i18n` 或 `getCurrentInstance().appContext.app` 上已有的 i18n），仅在宿主未安装时才安装自带实例。

### F-040 表单设计器全量硬编码中文

- **位置**：`components/form-designer/NewbieFormDesigner.jsx`、`GlobalLogicPanel.jsx`、`FormulaEditor.jsx`
- **级别**：P2

"清空表单"、"保存表单"、"表单逻辑"、"请至少设置一个选项"、"分页栏"、"计算字段"…… 几十处中文字面量，与库内其它组件的 i18n 体系完全脱节。

**建议**：抽到 `locales/*.json`（如 `form-designer.*`），走 `useT`。

### F-041 `withInstall` 变异组件对象，安装逻辑靠"有没有 install 方法"判断

- **位置**：`utils/withInstall.js`、`index.js:11-16`
- **级别**：P2

```js
export default component => {
  component.install = app => { app.component(component.name || component.__name, component); };
  return component;
};
```

- 直接给组件对象挂 `install`（变异），`withInstall(NewbieProvider)` 与 `withInstall(_NewbieThemeProvider)` 的处理还不一致（后者没再包一层）；
- `index.js` 的安装循环用 `typeof component.install === "function"` 判断是否注册 —— 业务组件如果恰好有 `install` 方法会被误注册。

**建议**：用一个显式的注册清单（数组）或 `Symbol` 标记来区分"库组件"和"普通导出"。

### F-042 表单项类型的定义分散在三处

- **位置**：`components/form/components/FormItem.jsx:92-252`（渲染分发）、`components/form-designer/widgetProps.js`（属性面板）、`components/form-designer/defaultWidgets.jsx`（组件面板）
- **级别**：P2

新增一种字段类型需要改三个文件，且三处的类型名是字符串字面量，没有统一常量。

**建议**：抽出 `components/form/field-types.js`，导出 `{ key, label, icon, defaultProps, create, propPanel }` 的注册表，三处都从注册表派生。

---

## P3 性能与资源（8 条）

### F-050 渲染函数里注册 `watch`

- **位置**：`components/search/components/Select.jsx:49-63`、`Cascader.jsx:29-36`
- **级别**：P3

```jsx
// Select.jsx —— 在 render() 内部
watch(() => queryForm[item.key].condition, val => { ... });
```

`createSearchItem` 在每次渲染时被调用 → 每次渲染都注册一个新 watcher，且**永不停止**。搜索项越多、重渲染次数越多，泄漏越严重；同时条件切换的副作用会被执行多次。

**建议**：把条件切换的处理集中到 `NewbieSearch` 的 setup 里统一注册（按 key 维护一张 watcher 表），或改用 `watch` 的 `onCleanup` / 组件化改造。

### F-051 渲染函数里新建 `debounce`

- **位置**：`components/form/components/Remote.jsx:44`
- **级别**：P3

```js
const onSearch = debounce(async name => { ... }, 1000);
```

每次渲染都新建一个 debounced 函数，上一次的定时器不会被取消 → 连续输入可能发出多次请求。

**建议**：缓存到 `itemState`（`itemState.debouncedSearch ??= debounce(...)`）。

### F-052 `NewbieTable` 每次渲染新建 props 对象

- **位置**：`components/table/NewbieTable.jsx:754,781,816`
- **级别**：P3

`handleTable()` / `handlePagination()` / `handleRowSelection()` 每次渲染都返回新对象 → antd Table 认为配置变了，内部状态（展开行、滚动位置、列宽）可能被重置。

**建议**：改为 `computed`。

### F-053 `NewbieForm` 的表单项每次重算都产生新对象

- **位置**：`components/form/NewbieForm.jsx:267-283`、`components/form/components/Layout.jsx`
- **级别**：P3

`formItems` computed 每次重算都 `map` 出新数组（元素在无 per-type 覆盖时是原对象、有覆盖时是新对象），`createLayout(...)` 又在 render 中直接调用 → 父组件任意一次重渲染都会导致整个表单重渲染。

**建议**：`formItems` 用 `computed` 且保持引用稳定；`createLayout` 的结果用 `computed` 缓存（需要把 `submitBtnElem` 也变成稳定的引用）。

### F-054 校验规则每次渲染重建

- **位置**：`components/form/components/FormItem.jsx:38-48`
- **级别**：P3

```js
rules = item.rules?.length ? item.rules.map(rule => rule.pattern ? { ...rule, pattern: new RegExp(rule.pattern) } : { ...rule }) : [];
```

每次渲染都 `new RegExp` → antd Form 认为规则变了 → 触发重复校验。

**建议**：按 `item.key` 缓存编译后的规则。

### F-055 表单设计器深 watch 配置数组

- **位置**：`components/form-designer/NewbieFormDesigner.jsx:185-189`
- **级别**：P3

```js
watch(() => props.formItems, () => prepareFormItems(), { deep: true });
```

配置数组任意嵌套变化都会整体重建画布（`prepareFormItems` → `cloneDeep` + 重建 `painterItems`），并且会**丢弃用户正在编辑的字段属性**（因为 painterItems 被整体替换）。

**建议**：只 watch 数组的引用与长度，字段级变更用显式的事件回写。

### F-056 `NewbieAddress` 每次计算都重建整棵地址树

- **位置**：`components/address/NewbieAddress.jsx:58-84`
- **级别**：P3

`items` computed 每次都跑 `limitLevel` → 为每个节点创建新对象。

**建议**：按 `level` 缓存结果（`level` 变化时才重算）。

### F-057 内存缓存没有上限

- **位置**：`hooks/utils.js:222-233`
- **级别**：P3

`localCacheSession` 是一个普通对象，`usePersistence` 的 namespace 来自 URL hash，每个不同的搜索/表格都会新增一批 key，只增不减。

**建议**：换成 `Map` 并加 LRU / TTL，或在 namespace 变化时清理旧数据。

---

## P4 工程化与测试（4 条）

### F-060 测试覆盖严重不足

- **位置**：`tests/`
- **级别**：P4

现状：7 个测试文件 / 27 个用例，集中在 `Provider` 与 `mergeConfig`。
零覆盖的组件：`NewbieForm` / `NewbieTable` / `NewbieSearch` / `NewbieUploader` / `NewbieEditor` / `NewbieModal` / `NewbieList` / `NewbieAddress` / `NewbiePassword` / `NewbieSignaturePad` / `NewbieFormDesigner`。

**性价比最高的起点**（纯函数、无 DOM 依赖）：

| 模块 | 大小 | 建议用例 |
| --- | --- | --- |
| `components/form/utils/formula-engine.js` | 18.6 KB | 词法/语法/函数/自引用/错误分支 |
| `components/form/utils/rule-engine.js` | 5 KB | 操作符矩阵、and/or 组合、show/hide 冲突 |
| `components/form/model.js` | 3.9 KB | 点号 key 读写、bind/replace/clear |
| `components/form/utils.js` | 6.9 KB | `initItemDefaultValue` 各类型、`applyRangeKeys` |

### F-061 lint warning 长期未清理

- **位置**：全库
- **级别**：P4

`pnpm lint` 当前 0 error / 58 warning，其中包括：

- 7 处 `no-shadow`（`item` / `index` / `option` 等局部变量遮蔽外层参数）；
- 2 处 `no-await-in-loop`（`NewbieForm.jsx:462` 的 `beforeSubmit` 串行 await、`scripts/generate-component-readmes.mjs:240`）；
- 3 处 `no-array-sort`（`NewbieUploader.jsx:206` 的两处 `map(...).sort()` 会修改原数组、`scripts/generate-component-readmes.mjs:237`）；
- 12 处 `no-unassigned-import`（副作用导入如 `import "./index.less"`）与若干 `consistent-function-scoping`。

### F-062 lint 规则拦不住这类 P0

- **位置**：`.oxlintrc.json`
- **级别**：P4

当前没有开启 `no-undef`（或等价的"未定义标识符"检查），所以 F-001 / F-002 / F-010 这类"用了没导入 / 在错误上下文调用"的缺陷在 CI 里不会失败。

**建议**：开启 `no-undef`（JSX 场景需要确认 `@vue/babel-plugin-jsx` 的 `resolveComponent` 兜底不会误报，必要时加 `ignoreGlobals`）。

### F-063 文档与实现存在偏差

- **位置**：`components/*/README.md`、`playground/docs/pages/*.js`、`docs/provider-config.md`
- **级别**：P4

- `autoQuery` 在 README 里描述为可用功能，实现里没有（F-016）；
- README 的"按需引入单个组件"缺少 i18n 安装前提（F-005）；
- `NewbieForm.beforeSubmit` 的返回值语义没有成文的契约（F-012）；
- `NewbieTable` 的 `afterFetched` 在 README 里没有给出返回值结构示例（应明确 `{ items, totalSize }`）。

---

## 附：新增建议的工程约定

1. **渲染期只读** —— render 函数内不写 `props`、配置对象、`reactive` 状态。
2. **配置只读** —— 用户传入的 `form` / `columns` / `filterableColumns` 视为不可变对象，需要加工先 `cloneDeep`。
3. **i18n 分级** —— `useT` 只在 setup/render；事件回调统一用 `t`（`i18n.global`）。
4. **命名不变量** —— `use*` 只用于 composable；渲染助手用 `render*`；纯工具用普通函数名。
5. **每个组件一份 `config.js`** —— 既是默认值来源，也是"该组件支持哪些全局配置"的唯一事实来源，与 `docs/provider-config.md` 一一对应。
