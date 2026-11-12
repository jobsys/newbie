# Newbie 文档站

文档站与 playground 共用入口，运行 `pnpm dev` 后访问 http://localhost:3000。

## 目录结构

```
playground/docs/
  registry.js            # 分类与页面注册、上一篇/下一篇
  pages/                 # 页面元数据：标题、说明、演示列表、API 表格、FAQ
  demos/                 # 可运行的 .vue 示例，按组件分目录
  components/            # 文档站外壳、示例卡片、API 表格、代码块
  utils/                 # hash 路由、Markdown、代码高亮、demo 加载
  styles/docs.less       # 文档站样式
```

## 新增一个组件文档

1. 在 `pages/` 新建 `xxx.js`：

```js
export default {
  slug: "xxx",
  component: "NewbieXxx",
  title: "Xxx 组件",
  description: "一句话说明。",
  category: "data-entry",
  since: "1.0.0",
  whenToUse: ["使用场景一"],
  demos: [
    {
      id: "basic",
      title: "基础用法",
      description: "说明这段示例演示什么。",
      file: "xxx/basic.vue",
    },
  ],
  api: {
    props: [
      { name: "value", description: "绑定值", type: "`string`", default: '`""`' },
    ],
    events: [],
    slots: [],
    methods: [],
    types: [],
  },
  faq: [],
};
```

2. 在 `demos/xxx/` 放示例组件。示例必须自包含，直接 import 组件库和 antdv-next：

```vue
<script setup>
import { NewbieXxx } from "../../../../components/index.js";
</script>
```

3. 在 `registry.js` 的分类 `pages` 中加入页面。

4. 重新生成组件 README：

```bash
pnpm docs:readme
```

API 表格由页面元数据生成，不要在 README 里手写参数表；需要更新说明时改 `pages/*.js`。

## 构建

```bash
pnpm docs:build    # 输出到 dist-docs
pnpm docs:preview
```
