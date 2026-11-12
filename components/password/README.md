# Password 密码输入

> 带强度指示的密码输入框。按数字、小写字母、大写字母、特殊字符四类字符计算强度，并校验长度区间。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/password.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 注册、修改密码等需要提示密码强度的场景。
- 需要限制密码最小和最大长度时。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbiePassword } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/password`。

## 基础用法

`基础用法`：v-model:value 绑定密码值。输入过程中会实时计算强度；空值不显示提示，输入后按策略提示缺少的字符类型。

```vue
<template>
	<Space orientation="vertical">
		<NewbiePassword v-model:value="password" width="320" />
		<div class="demo-result">当前值：{{ password || "空" }}</div>
	</Space>
</template>

<script setup>
import { ref } from "vue";
import { Space } from "antdv-next";
import { NewbiePassword } from "jobsys-newbie";

const password = ref("");
</script>

<style scoped>
.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | v-model:value 绑定密码值。输入过程中会实时计算强度；空值不显示提示，输入后按策略提示缺少的字符类型。 | [password/basic.vue](../../playground/docs/demos/password/basic.vue) |
| 自定义长度 | 通过 min、max 调整长度限制，width 支持数字（px）或任意 CSS 宽度字符串。 | [password/custom-length.vue](../../playground/docs/demos/password/custom-length.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 密码值，v-model:value 绑定 | `string` | `""` |
| min | 最小长度 | `number` | `8` |
| max | 最大长度 | `number` | `20` |
| strengthRules | 强度提示策略：`min` / `max` 默认沿用 min、max；`require` 支持 `digit`、`lower`、`upper`、`symbol`，只作提示、不阻止输入与提交 | `{ min?: number; max?: number; require?: string[] }` | `{ require: ["digit", "lower", "upper", "symbol"] }` |
| width | 输入框宽度，数字按 px 处理 | `number` \| `string` | `300` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:value | 输入值变化时触发 | `(value: string) => void` |
| change | 原生输入变化事件 | `(event: Event) => void` |

## Methods

| 方法 | 说明 | 参数 |
| --- | --- | --- |
| strength | 通过 ref 获取当前密码强度，0 最弱、4 最强 | `ComputedRef<number>` |

## FAQ

### 强度是如何计算的？

数字、小写字母、大写字母、特殊字符各算 1 分，满分 4 分，用于强度条着色。提示策略由 `strengthRules.require` 决定，默认要求四类字符全部包含；传入空数组即可只校验长度，不提示字符组合。所有提示都只用于展示，不会阻止输入或提交。

### 为什么初始为空时不显示提示？

空值交给表单的必填校验处理，组件只在用户输入内容后提示长度或字符组合问题。如果希望空值也提示，请在表单字段上设置 `required`。

### 可以在表单里用吗？

可以。表单的 `password` 类型使用 antdv-next 的 `Input.Password`，不包含强度条；如果需要强度提示，请用 `type: "slot"` 或 `customRender` 嵌入 `NewbiePassword`。
