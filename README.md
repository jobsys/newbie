# Newbie

基于 [antdv-next](https://www.antdv-next.com/) 的企业级 Vue 3 组件库，面向中后台场景提供：

- JSON 配置驱动的表单与表单设计器
- 搜索栏与表格一体化
- 地址、密码、上传、富文本、手写签名等业务组件
- 基于 Design Token 的密度、主色、明暗主题
- 按命名空间合并的全局配置
- 一站式应用外壳 `NewbieApp`（样式层 + 主题 + 全局配置 + antdv-next App）

## 安装

```bash
pnpm add jobsys-newbie antdv-next @antdv-next/icons
```

```js
import { createApp } from "vue";
import Newbie from "jobsys-newbie";
import "antdv-next/dist/reset.css";

createApp(App).use(Newbie).mount("#app");
```

也可以按需引入单个组件：

```js
import { NewbieForm, NewbieTable } from "jobsys-newbie";
```

按需引入时建议仍然注册一次库插件，由它负责安装库内置的 i18n：

```js
import Newbie from "jobsys-newbie";

app.use(Newbie);
```

若既没有 `app.use(Newbie)` 也没有自行安装 vue-i18n，库内的 `useT` / `t` 会降级到内置的 i18n 实例，通过它们获取的文案仍可正常显示。宿主已经安装过 vue-i18n 时，`app.use(Newbie)` 不会重复安装，库内组件在 setup / render 中会复用宿主实例，宿主切换语言即可同步生效。

## 组件

### 通用

- [Button 按钮](./components/button/README.md)
- [Copy 复制](./components/copy/README.md)

### 数据录入

- [Form 表单](./components/form/README.md)
- [FormDesigner 表单设计器](./components/form-designer/README.md)
- [Search 搜索栏](./components/search/README.md)
- [Address 地址选择](./components/address/README.md)
- [Uploader 上传](./components/uploader/README.md)
- [Editor 富文本编辑器](./components/editor/README.md)
- [Password 密码输入](./components/password/README.md)
- [SignaturePad 手写签名](./components/signature-pad/README.md)

### 数据展示

- [Table 表格](./components/table/README.md)
- [List 滚动列表](./components/list/README.md)

### 反馈

- [Modal 弹窗](./components/modal/README.md)

### 全局配置

- [Provider 全局配置](./components/provider/README.md)
- [Theme 主题](./components/provider/THEME.md)

应用入口推荐用 `NewbieApp` 一次性组合样式层、主题、全局配置与 antdv-next 的 App：

```vue
<template>
	<NewbieApp :config="providerConfig" density="compact" color-primary="#c2410c">
		<RouterView />
	</NewbieApp>
</template>

<script setup>
import { NewbieApp } from "jobsys-newbie";

const providerConfig = { table: { pageSize: 50 } };
</script>
```

### 设计与维护

- [全局配置说明](./docs/provider-config.md)
- [组件库评审报告](./docs/REVIEW.md)（含优先级清单与改造路线图）
- [评审问题清单](./docs/reviews/findings.md)（逐条问题、复现方式与修复建议）

## 回调契约

两个最容易被误用的回调，返回值语义固定如下（完整说明见对应组件文档）：

- **`NewbieForm.beforeSubmit`**：`false` 阻止提交；返回对象替换提交体；返回 `undefined` / `null`（或只做副作用不返回）沿用原提交数据。参数为 `{ formatForm, originalForm }`，详见 [Form 文档](./components/form/README.md#props)。
- **`NewbieTable.afterFetched`**：配置 `url` 时**必须**提供，且必须返回 `{ items, totalSize }`；未提供或不是函数时组件会 `console.error` 并丢弃本次响应，而不是静默渲染空表。详见 [Table 文档](./components/table/README.md#afterfetched-返回什么)。

## 本地开发

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 查看文档站。组件文档位于 `playground/docs`：

- `playground/docs/pages/*.js`：页面结构、API 表格与文字说明
- `playground/docs/demos/**/*.vue`：可运行的交互示例
- 组件的 `README.md` 由 `pnpm docs:readme` 根据页面配置生成

常用命令：

```bash
pnpm dev          # 文档站
pnpm docs:build   # 构建静态文档到 dist-docs
pnpm docs:readme  # 从文档页面重新生成组件 README
pnpm build        # 构建组件库
pnpm test         # 运行单元测试
pnpm lint
```

## 迁移

从 ant-design-vue 迁移到 antdv-next 的验证记录见 [MIGRATION-ANTDV-NEXT.md](./MIGRATION-ANTDV-NEXT.md)。
