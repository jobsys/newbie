# Form 表单

> 通过一份 JSON 配置生成表单，内置校验、动态显隐、多列布局、矩阵/评分、条件逻辑、公式计算、远程数据与提交处理。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/form.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要按字段配置快速生成后台表单，而不是手写大量 a-form-item。
- 需要统一的必填校验、只读/禁用、动态显隐、分组和数组字段。
- 需要把表单数据以点号 key 或嵌套对象与后端交互。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieForm } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/form`。

## 基础用法

`基础表单`：form 是一个字段配置数组，type 决定控件类型；点号 key 会自动映射到嵌套数据。

```vue
<template>
	<NewbieForm
		ref="formRef"
		:form="form"
		:columns="[12, 12]"
		:card-wrapper="false"
		break-mode="divider"
		hide-buttons
	/>
</template>

<script setup>
import { NewbieForm } from "jobsys-newbie";

const form = [
	{ title: "姓名（点号 key）", key: "major.name", required: true },
	{
		title: "专业层次",
		key: "major.level",
		type: "select",
		options: ["本科", "硕士", "博士"],
	},
	{ title: "金额", key: "amount", defaultProps: { prepend: "¥", append: "元" } },
	{ title: "人数", key: "people", type: "number" },
	{ title: "密码", key: "password", type: "password" },
	{ title: "生日", key: "birthday", type: "date" },
	{ title: "入学时间", key: "enrolled_at", type: "time" },
	{ title: "开关", key: "enabled", type: "switch", options: ["启用", "停用"] },
	{
		title: "性别",
		key: "gender",
		type: "radio",
		options: ["男", "女"],
		defaultValue: "男",
	},
	{
		title: "兴趣",
		key: "hobbies",
		type: "checkbox",
		options: ["阅读", "运动", "音乐"],
		defaultValue: ["阅读"],
	},
	{ title: "标签", key: "tags", type: "tag", width: 300 },
	{
		title: "所在地区",
		key: "area",
		type: "cascade",
		options: [
			{ label: "浙江省", value: "zhejiang", children: [{ label: "杭州市", value: "hangzhou" }] },
			{ label: "江苏省", value: "jiangsu", children: [{ label: "南京市", value: "nanjing" }] },
		],
	},
	{
		title: "部门（树选择）",
		key: "department",
		type: "tree-select",
		options: [
			{
				label: "研发中心",
				value: "rd",
				children: [
					{ label: "前端组", value: "fe" },
					{ label: "后端组", value: "be" },
				],
			},
			{ label: "产品部", value: "product" },
		],
	},
	{ title: "地址", key: "address", type: "address", width: 320 },
	{ title: "备注", key: "remark", type: "textarea", columnIndex: [0, 1] },
	{ title: "只读文本", key: "text", type: "text", defaultValue: "文本展示" },
	{
		title: "HTML",
		key: "html",
		type: "html",
		defaultValue: '<p style="margin: 0; color: #c2410c">这里可以放一段自定义 HTML。</p>',
		columnIndex: [0, 1],
	},
];
</script>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础表单 | form 是一个字段配置数组，type 决定控件类型；点号 key 会自动映射到嵌套数据。 | [form/basic.vue](../../playground/docs/demos/form/basic.vue) |
| 多列布局与分组 | columns 按 24 栅格分配列宽，columnIndex 指定字段列位置，rowSpan 让字段跨行；break 新起一行并可显示分隔标题，breakMode 支持 divider / collapse。 | [form/layout.vue](../../playground/docs/demos/form/layout.vue) |
| 动态显隐、必填与禁用 | hidden、required、disabled 都可以传函数，参数是当前 submitForm；match 可以根据条件切换控件类型。 | [form/dynamic.vue](../../playground/docs/demos/form/dynamic.vue) |
| 数组字段 Group | type 为 group 时用 children 定义子表单，组件自带新增、编辑、删除，并支持 childrenOperations 扩展行操作。 | [form/group.vue](../../playground/docs/demos/form/group.vue) |
| 矩阵与评分 | matrix-radio / matrix-checkbox / matrix-scale 用于矩阵题，rate / rate-radio / rate-checkbox 用于评分。 | [form/matrix.vue](../../playground/docs/demos/form/matrix.vue) |
| 嵌套数据与表单方法 | data 支持点号 key 的扁平数据；通过 ref 可以获取、设置、重置表单，并判断是否有未保存修改。 | [form/nested.vue](../../playground/docs/demos/form/nested.vue) |
| 条件逻辑与公式 | form 也可以传 { fields, logic }，logic.rules 控制显隐；computed 字段根据公式计算并写入提交数据。 | [form/logic.vue](../../playground/docs/demos/form/logic.vue) |
| 提交前处理 | 字段级 beforeSubmit 先执行，随后处理 rangeKeys、全局 format 和表单级 beforeSubmit；返回 false 可以阻止提交。 | [form/submit.vue](../../playground/docs/demos/form/submit.vue) |
| 自定义组件 | 渲染优先级为 slot > customRender > type；type 为 slot 时使用与字段 key 同名的插槽。 | [form/custom.vue](../../playground/docs/demos/form/custom.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 表单标题，Card 模式下生效 | `string` | `""` |
| data | 初始表单数据，支持点号 key；也接受 JSON 字符串（按 JSON 解析，解析失败会忽略并告警）；变化时会重新初始化 | `object` \| `string` | `""` |
| autoLoad | 是否自动加载远程数据；传字符串或数组时，要求 extraData 中对应字段非空才加载 | `boolean` \| `string` \| `string[]` | `true` |
| fetchUrl | 获取表单数据的地址 | `string` | `""` |
| extraData | 仅用于 fetch 参数和 autoLoad 判断，不会合并进提交数据 | `object` | `{}` |
| submitUrl | 提交地址 | `string` | `""` |
| submitButtonText | 提交按钮文字 | `string` | `保存` |
| submitConfirmText | 提交前确认框内容；传值后提交前弹确认 | `string` | `""` |
| closable | 是否显示关闭按钮 | `boolean` | `true` |
| closeButtonText | 关闭按钮文字 | `string` | `关闭` |
| closeButtonFirst | 关闭按钮是否在提交按钮前面 | `boolean` | `false` |
| hideButtons | 是否隐藏底部按钮 | `boolean` | `false` |
| buttonsInFooter | 把保存 / 关闭按钮交给外层 NewbieModal 渲染，固定在 Modal / Drawer 底部；不在 NewbieModal 内时自动回退到表单底部 | `boolean` | `false` |
| confirmOnClose | 关闭前检测脏数据：有未保存修改时二次确认（默认「数据有变动 / 是否放弃当前编辑内容？」），没有修改直接关闭。传对象可自定义 `{ title, content, okText, cancelText }`；在 NewbieModal 内时右上角关闭 / 遮罩关闭同样生效 | `boolean` \| `object` | `false` |
| disabled | 是否禁用整个表单 | `boolean` | `false` |
| readonly | 是否只读整个表单 | `boolean` | `false` |
| submitDisabled | 是否禁用提交按钮 | `boolean` | `false` |
| breakMode | break 分隔样式 | `divider` \| `collapse` | `divider` |
| dividerProps | Divider 配置 | `object` | `{}` |
| columns | 栅格列宽数组，总和必须为 24 | `number[]` | `[24]` |
| fixedColumns | columnIndex 为 fixed 时的宽度 | `number` | `6` |
| labelWrap | Label 是否自动换行；开启后超长 Label 换行显示而不是被截断，可通过 `formProps.labelWrap` 覆盖 | `boolean` | `true` |
| cardWrapper | 是否用 Card 包裹 | `boolean` | `true` |
| cardProps | 透传给 Card | `object` | `{}` |
| cardSlots | 透传给 Card 的插槽 | `object` | `{}` |
| form | 表单配置，字段数组或 { fields, logic } | `NewbieFormItemConfig[]` \| `{ fields: NewbieFormItemConfig[]; logic?: { rules: LogicRule[] } }` \| `() => ...` | `[]` |
| afterFetched | 远程数据处理函数，返回值用于初始化表单 | `(res: any) => object` | `null` |
| beforeSubmit | 提交前处理：返回 `false` 阻止提交，返回对象替换提交数据，返回 `undefined` / `null` 沿用原提交数据 | `({ formatForm, originalForm }) => boolean \| object \| undefined \| null \| Promise<...>` | `null` |
| close | 点击关闭按钮的回调 | `() => void` | `null` |
| afterSubmit | 提交成功后的回调；传入后不再执行默认成功提示 | `(res: any) => void` | `null` |
| formProps | 透传给 antdv-next Form | `object` | `{}` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| success | 使用内置提交并成功后触发 | `(res: any) => void` |

## Slots

| 插槽名 | 说明 |
| --- | --- |
| prepend | 表单之前的内容 |
| append | 表单之后的内容 |
| footer | 表单底部区域（按钮之外） |
| <item.key> | type 为 slot 的字段使用同名插槽渲染 |

## Methods

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| submit | 触发表单校验与提交 | `() => Promise<void>` |
| getForm | 获取表单数据的深拷贝，等同于 getFormStandalone | `() => object` |
| getFormStandalone | 获取表单数据的深拷贝 | `() => object` |
| getFormRealtime | 获取实时表单对象，修改会影响内部状态 | `() => object` |
| getField | 获取单个字段的深拷贝 | `(key: string) => any` |
| setForm | 设置一个或多个字段 | `(fields: object) => void` |
| reset | 重置到初始化时的数据并清空校验 | `() => void` |
| isDirty | 与初始化备份比较，判断是否有修改 | `() => boolean` |
| isInitializing | 设置初始化 loading 状态 | `(loading: boolean) => void` |

## NewbieFormItemConfig

表单项配置。

| 字段 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| key | 字段名，支持 a.b.c 点号路径 | `string` | `""` |
| title | 显示标签 | `string` | `""` |
| type | 控件类型，见下方类型表 | `string` | `input` |
| options | 选项，支持字符串/数字/对象或函数 | `array` \| `Function` | `[]` |
| rows | 矩阵题的行标题 | `array` \| `Function` | - |
| placeholder | 控件占位文字 | `string` | `""` |
| help | 标签后的提示文字 | `string` \| `Function` | `""` |
| rules | antdv-next 校验规则 | `array` | `[]` |
| required | 是否必填 | `boolean` \| `(form) => boolean` | `false` |
| requiredMessage | 必填提示 | `string` | - |
| readonly | 是否只读 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` \| `(form) => boolean` | `false` |
| hidden | 是否隐藏 | `boolean` \| `(form) => boolean` | `false` |
| optional | 开关式可选字段，数组表示 [开, 关] 文案 | `boolean` \| `[string, string]` | `false` |
| init | 初始化值，参数为 { submitForm, value } | `Function` | - |
| beforeSubmit | 字段级提交前处理，返回新值 | `Function` | - |
| match | 根据表单数据返回合并后的配置 | `(form) => object` | - |
| formula | computed 字段使用的公式 | `string` | - |
| columnIndex | 所在列，数组表示跨列 | `number` \| `number[]` \| `fixed` | `0` |
| rowSpan | 多列布局下占用的行数 | `number` | `1` |
| break | 新起一行，字符串会作为分隔标题 | `boolean` \| `string` | `false` |
| defaultProps | 透传给控件 | `object` | `{}` |
| defaultSlots | 透传给控件插槽 | `object` | `{}` |
| formItemProps | 透传给 FormItem | `object` | `{}` |
| formItemSlots | 透传给 FormItem 插槽 | `object` | `{}` |
| defaultValue | 默认值 | `any` | `""` |
| children | group / combiner 的子字段配置 | `NewbieFormItemConfig[]` \| `Function` | - |
| childrenOperations | group 每行的额外操作 | `array` | `[]` |
| cellProps | group 子字段的表格列配置 | `object` | - |
| rangeKeys | date/time range 拆分写入的字段名 | `[string, string]` | - |
| customRender | 自定义渲染，参数为 { submitForm, item } | `Function` | - |

## 字段类型

type 不区分大小写，未设置时默认为 input。

| type | 说明 |
| --- | --- |
| input | 单行输入框 |
| textarea | 多行输入框 |
| password | 密码输入框 |
| select | 下拉选择 |
| remote | 远程搜索下拉，需要 url |
| tree-select | 树选择 |
| date | 日期；defaultProps.type 为 range 时为区间 |
| time | 时间；defaultProps.type 为 range 时为区间 |
| switch | 开关，options 为 [开, 关] 文案 |
| radio | 单选 |
| checkbox | 多选 |
| tag | 标签输入 |
| address | 省市区选择 |
| cascade | 级联选择 |
| number | 数字输入；defaultProps.prepend/append 或 addonBefore/addonAfter 显示前后缀 |
| html | 渲染 defaultValue 中的 HTML |
| uploader | 文件/图片上传 |
| editor | 富文本编辑器 |
| text | 只读文本（Tag） |
| plain | 纯展示内容，defaultValue 可为函数 |
| group | 数组字段，children 定义子表单 |
| combiner | 组合字段，children 直接横向排列 |
| rate | 星级评分 |
| matrix-radio | 矩阵单选 |
| matrix-checkbox | 矩阵多选 |
| matrix-scale | 矩阵量表 |
| rate-radio | 单选评分 |
| rate-checkbox | 多选评分 |
| computed | 计算字段，不在表单中渲染，但会写入提交数据 |
| slot | 使用与 key 同名的插槽渲染 |

## LogicRule 条件显隐

form 传 { fields, logic } 时生效。任一 show 规则满足即显示；否则任一 hide 规则满足则隐藏；隐藏字段的值会被置为 null，字段重新显示时会回填隐藏前的值。

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| targetField | 受控字段 key | `string` |
| action | 满足条件时显示或隐藏 | `show` \| `hide` |
| logicGate | 条件组合方式 | `and` \| `or` |
| conditions | 条件数组 | `LogicCondition[]` |
| conditions[].field | 依赖字段 key | `string` |
| conditions[].operator | 比较操作符 | `string` |
| conditions[].value | 比较值 | `any` |

## 条件操作符

conditions[].operator 支持的值。

| 操作符 | 说明 |
| --- | --- |
| equals | 宽松相等 |
| notEquals | 不相等 |
| isEmpty | 为空（null / undefined / 空字符串） |
| isNotEmpty | 不为空 |
| gt / gte | 大于 / 大于等于（数值） |
| lt / lte | 小于 / 小于等于（数值） |
| contains / notContains | 字符串或数组包含 / 不包含 |
| startsWith / endsWith | 字符串前缀 / 后缀 |
| in / notIn | 数组包含 / 不包含 |

## 公式函数

computed 字段的 formula 使用 [字段key] 引用其他字段。支持 + - * / 与括号，以及以下函数。

| 类别 | 函数 |
| --- | --- |
| 条件 | `IF(条件, 真值, 假值)` |
| 聚合 | `SUM`、`AVG`、`MAX`、`MIN`、`COUNT` |
| 数学 | `ABS`、`ROUND(值, 小数位)`、`MOD`、`POWER`、`SQRT`、`PERCENT` |
| 字符串 | `CONCAT`、`LEN`、`UPPER`、`LOWER` |
| 逻辑 | `AND`、`OR`、`NOT`、`XOR` |
| 日期 | `TODAY()`、`NOW()`、`DATE(年, 月, 日)`、`YEAR`、`MONTH`、`DAY`、`HOUR`、`MINUTE`、`DATEDIF` |

## 全局配置

通过 `<NewbieProvider :config="{ form: { ... } }">` 覆盖默认值，实例 props 优先级更高。

### form

表单全局默认值。

| 配置项 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| format | 提交前的格式化配置，如 { date: true, boolean: true } | `object` | `{}` |
| afterFetched | 默认远程数据处理函数 | `Function` | `null` |
| columnPresets | 按字段类型索引的默认配置，如 { switch: { defaultProps: { size: 'small' } } }；旧名 `form.columns` 仍兼容 | `object` | `{}` |

## 远程数据与自动加载

传入 `fetchUrl` 后，组件会 GET 数据并调用 `afterFetched`，然后用返回值初始化表单：

```vue
<NewbieForm
  fetch-url="/api/forms/1"
  :auto-load="['id']"
  :extra-data="{ id: route.query.id }"
  :form="form"
  :after-fetched="res => res.result"
  submit-url="/api/forms/1"
/>
```

`autoLoad` 为 `true` 时自动请求；传字符串或字符串数组时，只有 `extraData` 中对应字段都非空才会请求。`extraData` 同时作为 GET 参数，但**不会**合并进提交数据。

提交顺序：字段校验 → 字段级 `beforeSubmit` → `rangeKeys` 拆分 → 全局 `format` → 表单级 `beforeSubmit` → POST。

表单级 `beforeSubmit` 的返回值契约：

| 返回值 | 行为 |
| --- | --- |
| `false` | 阻止本次提交，不会发出请求 |
| 对象 | 用返回的对象替换提交数据（`formatForm` 已经过字段级处理与 `format`） |
| `undefined` / `null` | 沿用原提交数据，适合只做副作用（如补字段）后不返回 |

```js
const beforeSubmit = async ({ originalForm }) => {
	// 只做副作用：不返回（undefined），提交数据保持 formatForm 的结果不变
	localStorage.setItem("last-submit", JSON.stringify(originalForm));
};
```

## FAQ

### 点号 key 的值如何提交？

表单内部会把点号 key 映射到嵌套 model，但对外始终是扁平对象：`getForm()` 返回 `{ "major.name": "计算机" }`，提交时也按扁平 key 提交。如果后端需要嵌套结构，请在 `beforeSubmit` 中转换。

### hidden 和 logic 规则有什么区别？

`hidden` 只决定是否渲染，不会清空字段值；`logic.rules` 在字段被隐藏时会把值置为 `null`，但会暂存隐藏前的值，字段重新显示时自动回填。如果需要“隐藏即不提交”，使用 logic 规则或在 `beforeSubmit` 中删除字段。

### computed 字段为什么不显示？

`computed` 是计算字段，不在填写表单中渲染，但会实时计算并写入提交数据。需要展示结果时，增加一个 `plain` 字段，用 `defaultValue: ({ submitForm }) => ...` 读取计算值。

### plain 展示字段需要写 key 吗？

只用于展示时不要写 `key`。写了 `key` 的 `plain` 字段会被初始化并进入 `getForm()` 的提交数据，而且它的值是初始化时的展示结果，不会随其他字段变化。

### extraData 会一起提交吗？

不会。`extraData` 当前只用于 `fetchUrl` 的 GET 参数和 `autoLoad` 的非空判断。需要随表单提交的固定字段，请合并到 `beforeSubmit` 返回的对象中。

### 表单按钮为什么点击后提示网络错误？

组件默认会 POST 到 `submitUrl`。没有配置后端时，可以用 `hideButtons` 隐藏按钮，或在 `beforeSubmit` 中返回 `false` 阻止真实请求。
