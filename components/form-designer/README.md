# FormDesigner 表单设计器

> 拖拽式表单设计器。左侧组件面板、中间画布、右侧属性面板，支持字段逻辑、公式、自定义业务组件与知识竞赛模式。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/form-designer.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要让业务人员自己搭建表单或问卷。
- 需要把设计结果保存为 NewbieForm 可用的 JSON 配置。
- 需要在设计器中配置条件显隐、计算公式或题目答案。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieFormDesigner } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/form-designer`。

## 基础用法

`基础设计器`：widgets 追加业务组件分组，formItems 作为初始画布内容。保存时触发 submit，返回字段配置与逻辑规则。

```vue
<template>
	<Space orientation="vertical" style="width: 100%">
		<NewbieFormDesigner
			title="新员工入职登记"
			:height="720"
			:widgets="widgets"
			:form-items="formItems"
			@submit="onSubmit"
		/>
		<pre v-if="output" class="demo-json">{{ output }}</pre>
	</Space>
</template>

<script setup>
import { h, ref } from "vue";
import { Space } from "antdv-next";
import { MobileOutlined, UserOutlined } from "@antdv-next/icons";
import { NewbieFormDesigner } from "jobsys-newbie";

const output = ref("");

const widgets = [
	{
		title: "业务组件",
		children: [
			{
				name: "手机号码",
				type: "input",
				icon: () => h(MobileOutlined),
				props: {
					title: "手机号码",
					rules: [{ pattern: "^1[3-9]\\d{9}$", message: "手机号码格式不正确" }],
				},
			},
			{
				name: "姓名",
				type: "input",
				icon: () => h(UserOutlined),
				props: { title: "姓名", required: true },
			},
		],
	},
];

const formItems = [
	{ key: "name", title: "姓名", type: "input", required: true, width: "100%" },
	{ key: "department", title: "部门", type: "select", options: ["研发中心", "产品部"], width: 300 },
];

const onSubmit = form => {
	output.value = JSON.stringify(form, null, 2);
};
</script>

<style scoped>
.demo-json {
	margin: 0;
	padding: 12px;
	max-height: 260px;
	overflow: auto;
	background: var(--newbie-color-fill-alter, rgba(0, 0, 0, 0.03));
	border-radius: 6px;
	font-size: 12px;
	line-height: 1.6;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础设计器 | widgets 追加业务组件分组，formItems 作为初始画布内容。保存时触发 submit，返回字段配置与逻辑规则。 | [form-designer/basic.vue](../../playground/docs/demos/form-designer/basic.vue) |
| 知识竞赛模式 | mode 为 quiz 时使用题目组件（单选、多选、填空），选项支持分值，保存结构仍为 { fields, logic }。 | [form-designer/quiz.vue](../../playground/docs/demos/form-designer/quiz.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 设计器标题 | `string` | `""` |
| widgets | 额外的业务组件分组 | `FormDesignerWidgetGroup[]` | `[]` |
| formItems | 初始画布字段，兼容 NewbieForm 的字段数组或 { fields, logic } | `NewbieFormItemConfig[]` \| `{ fields, logic }` \| `Function` | `[]` |
| height | 设计器高度，数字按 px 处理 | `number` \| `string` | `100%` |
| mode | 设计模式，quiz 为知识竞赛 | `quiz` | `null` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| submit | 点击保存表单时触发 | `({ fields: NewbieFormItemConfig[]; logic: { rules: LogicRule[] } }) => void` |

## FormDesignerWidget

左侧面板中的单个组件。

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| name | 面板显示名称 | `string` |
| type | 实际字段类型，对应 NewbieForm 的 type | `string` |
| icon | 图标，返回 VNode 的函数 | `() => VNode` |
| props | 拖入画布时预设的字段配置 | `object` |

## FormDesignerWidgetGroup

组件分组，会在默认分组之后追加。

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| title | 分组标题 | `string` |
| children | 分组内的组件 | `FormDesignerWidget[]` |

## FAQ

### 保存的结构能直接给 NewbieForm 用吗？

可以。`submit` 返回的 `{ fields, logic }` 就是 NewbieForm 支持的对象格式：

```vue
<NewbieForm :form="saved" />
```

### 为什么设计器高度不生效？

默认 `height="100%"`，需要父容器有确定高度。文档示例直接传数字，组件会转换成 px；也可以给外层容器设置 `height: 100vh`。

### 自定义组件需要实现什么？

业务组件本质上是 NewbieForm 的字段配置。通过 `widgets[].children[].props` 预设 `type`、`options`、`defaultProps` 等，设计器会把它当成普通字段拖拽和编辑。

### 逻辑规则在哪里配置？

设计器顶部有“表单逻辑”入口，可为字段配置 show / hide 规则；保存时会写入 `logic.rules`，与 NewbieForm 的条件显隐一致。

### 支持暗色模式吗？

支持。设计器的面板、画布、工具栏、属性面板以及「设置选项」「表单逻辑」「公式使用说明」等弹层，颜色都来自 antdv-next 的 Design Token（以 `--newbie-*` CSS 变量下发），跟随当前主题的明暗切换：

```vue
<NewbieThemeProvider scheme="dark">
	<NewbieFormDesigner :form-items="formItems" />
</NewbieThemeProvider>
```

只使用 antdv-next 的 `ConfigProvider` 并配置 `darkAlgorithm` 同样有效；未配置任何主题时回落到浅色。
