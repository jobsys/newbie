# Address 地址选择

> 基于 Cascader 的省市区选择器，内置本地行政区划数据，也支持远程接口和自定义数据源。

> 本文件由 `pnpm docs:readme` 根据 `playground/docs/pages/address.js` 生成，请修改页面配置后重新生成，不要直接编辑。

## 何时使用

- 需要录入省、市、区三级行政区划。
- 希望开箱即用，不额外维护一份地区数据。
- 已有地区接口，需要按统一格式接入。

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { NewbieAddress } from "jobsys-newbie";
```

也可以全局注册整个组件库：

```js
import Newbie from "jobsys-newbie";
app.use(Newbie);
```

完整交互示例：本地运行 `pnpm dev` 后访问 `#/components/address`。

## 基础用法

`基础用法`：v-model:value 绑定选中的地区编码数组，默认使用组件内置的完整省市区数据。

```vue
<template>
	<div class="demo-row">
		<NewbieAddress v-model:value="value" style="width: 320px" />
		<div class="demo-result">
			当前值：<code>{{ value.length ? value.join(" / ") : "未选择" }}</code>
		</div>
	</div>
</template>

<script setup>
import { ref } from "vue";
import { NewbieAddress } from "jobsys-newbie";

const value = ref(["440000", "440100", "440103"]);
</script>

<style scoped>
.demo-row {
	display: flex;
	flex-direction: column;
	gap: 12px;
	align-items: flex-start;
}

.demo-result {
	color: var(--newbie-color-text-secondary, rgba(0, 0, 0, 0.65));
	font-size: 13px;
}
</style>
```

## 更多示例

| 示例 | 说明 | 源码 |
| --- | --- | --- |
| 基础用法 | v-model:value 绑定选中的地区编码数组，默认使用组件内置的完整省市区数据。 | [address/basic.vue](../../playground/docs/demos/address/basic.vue) |
| 选择层级 | level 控制可选深度：1 只选省，2 选到市，3 选到区。切换层级会重新裁剪数据，不会改动原始数据。 | [address/level.vue](../../playground/docs/demos/address/level.vue) |
| 自定义数据源 | dataSource 的数据结构为 { code, name, children }。传入后不会再请求内置数据。 | [address/datasource.vue](../../playground/docs/demos/address/datasource.vue) |

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 选中的地区编码，v-model:value 绑定 | `string[]` | `[]` |
| level | 选择层级：1 省、2 省市、3 省市区 | `number` | `3` |
| disabled | 是否禁用 | `boolean` | `false` |
| placeholder | 未选择时的占位文字 | `string` | `请选择地区` |
| url | 地区数据接口；未传 dataSource 时生效，不传则使用本地数据 | `string` | `""` |
| afterFetched | 接口数据处理函数，返回值需符合 { code, name, children } 结构 | `(response: any) => AreaNode[]` | `null` |
| dataSource | 自定义地区数据，优先级高于 url 与本地数据 | `AreaNode[]` | `[]` |

## Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:value | 选中地区变化时触发，参数为编码数组 | `(value: string[]) => void` |

## AreaNode 数据格式

自定义数据源或接口返回值必须使用 code / name / children 三个字段。

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| code | 地区编码，最终提交的值 | `string` |
| name | 展示名称 | `string` |
| children | 下级地区，可选 | `AreaNode[]` |

## 工具函数

组件同时导出 `useAddressFullCode(code, level?)`，用于把单个地区编码补全成完整路径：

```js
import { useAddressFullCode } from "jobsys-newbie";

useAddressFullCode("440103"); // ['440000', '440100', '440103']
useAddressFullCode("440103", 2); // ['440000', '440100']
```

## FAQ

### 接口返回的不是 code / name 结构怎么办？

通过 `afterFetched` 转换成 `{ code, name, children }` 即可；组件内部使用固定的 fieldNames，不提供额外的字段映射配置。

### 为什么修改 level 后已选值还在？

层级只影响可选项，不会主动清空已有的 value。如果新层级下旧值不在候选范围内，请监听 `update:value` 自行裁剪。
