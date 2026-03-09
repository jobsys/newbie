# Newbie 组件库 AI API 文档

> 本文档专为 AI Agent 设计，提供完整的组件、Hooks 和 Directives API 说明，以便准确理解和使用 Newbie 组件库。

## 目录

1. [项目概述](#项目概述)
2. [安装和使用](#安装和使用)
3. [组件文档](#组件文档)
4. [Hooks 文档](#hooks-文档)
5. [Directives 文档](#directives-文档)
6. [配置和全局方法](#配置和全局方法)
7. [类型定义](#类型定义)

---

## 项目概述

Newbie 是一个基于 Vue 3 和 Ant Design Vue 4 的增强组件库，提供了丰富的业务组件和工具函数。

### 基本信息

- **包名**: `jobsys-newbie`
- **版本**: 2.2.3
- **主要依赖**:
  - Vue 3.5.13
  - Ant Design Vue 4.2.6
  - dayjs 1.11.13
  - lodash-es 4.17.21
  - axios 1.7.9

### 入口文件

- **主入口**: `index.js` - 导出所有组件和默认安装插件
- **Hooks**: `hooks/index.js` - 导出所有 Hooks
- **Directives**: `directives/index.js` - 导出所有指令
- **样式**: `dist/jobsys-newbie.css`

### 导出方式

```javascript
// 默认导出（Vue 插件）
import Newbie from "jobsys-newbie";
app.use(Newbie);

// 组件导入
import { NewbieForm, NewbieTable, NewbieButton } from "jobsys-newbie";

// Hooks 导入
import { useFetch, useFormFormat, useT } from "jobsys-newbie/hooks";

// Directives 导入
import { auth, setDefaultPermissions } from "jobsys-newbie/directives";
```

---

## 安装和使用

### 安装

```bash
npm install jobsys-newbie
# 或
yarn add jobsys-newbie
# 或
pnpm add jobsys-newbie
```

### 基本使用

```javascript
import { createApp } from "vue";
import Newbie from "jobsys-newbie";
import "jobsys-newbie/dist/jobsys-newbie.css";

const app = createApp(App);
app.use(Newbie);
app.mount("#app");
```

### 全局配置

```javascript
import Newbie from "jobsys-newbie";

Newbie.config({
  httpStatus: {
    STATE_CODE_SUCCESS: "SUCCESS",
    STATE_CODE_FAIL: "FAIL",
    // ... 自定义状态码
  },
});
```

---

## 组件文档

### NewbieButton - 增强按钮组件

基于 Ant Design Vue Button 的增强版本，支持自动 loading 状态管理。

#### Props

| 属性名       | 类型    | 默认值             | 说明                                                                    |
| ------------ | ------- | ------------------ | ----------------------------------------------------------------------- |
| type         | String  | 'default'          | 按钮类型，可选: 'primary', 'ghost', 'dashed', 'link', 'text', 'default' |
| size         | String  | 'middle'           | 按钮大小，可选: 'large', 'middle', 'small'                              |
| disabled     | Boolean | false              | 是否禁用                                                                |
| danger       | Boolean | false              | 是否设置为危险按钮                                                      |
| label        | String  | ''                 | 按钮标签文字                                                            |
| icon         | Object  | null               | 按钮图标（Vue 组件对象）                                                |
| iconPosition | String  | 'left'             | 图标位置，可选: 'left', 'right'                                         |
| fetcher      | Object  | { loading: false } | 请求状态控制器，配合 useFetch 使用                                      |
| buttonProps  | Object  | {}                 | 原生 Button 组件配置                                                    |

#### Events

| 事件名 | 参数           | 说明     |
| ------ | -------------- | -------- |
| click  | (event: Event) | 点击事件 |

#### 使用示例

```vue
<template>
  <NewbieButton
    type="primary"
    :fetcher="fetcher"
    :icon="h(SaveOutlined)"
    label="保存"
    @click="handleSave"
  />
</template>

<script setup>
import { ref, h } from "vue";
import { NewbieButton } from "jobsys-newbie";
import { SaveOutlined } from "@ant-design/icons-vue";
import { useFetch } from "jobsys-newbie/hooks";

const fetcher = ref({ loading: false });

const handleSave = async () => {
  const { post } = useFetch(fetcher);
  await post("/api/save", { data: "xxx" });
};
</script>
```

---

### NewbieForm - 表单组件

通过 JSON 配置生成表单，集成表单验证、数据获取、提交等功能。

#### Props

| 属性名            | 类型                 | 默认值    | 说明                                                             |
| ----------------- | -------------------- | --------- | ---------------------------------------------------------------- |
| title             | String               | ''        | 表单标题（Card 模式下生效）                                      |
| data              | Object/String        | ''        | 表单数据，用于初始化表单                                         |
| autoLoad          | Boolean/Array/String | true      | 是否自动加载，Array/String 时会对 extraData 相关字段进行非空验证 |
| fetchUrl          | String               | ''        | 获取表单数据的 URL                                               |
| extraData         | Object               | {}        | 额外的数据，提交时会合并到表单数据中                             |
| submitUrl         | String               | ''        | 提交数据 URL                                                     |
| submitButtonText  | String               | ''        | 提交按钮文字                                                     |
| submitConfirmText | String               | ''        | 提交确认提示内容                                                 |
| closable          | Boolean              | true      | 是否显示关闭按钮                                                 |
| closeButtonText   | String               | ''        | 关闭按钮文字                                                     |
| closeButtonFirst  | Boolean              | false     | 是否将关闭按钮放在提交按钮前面                                   |
| hideButtons       | Boolean              | false     | 是否隐藏按钮                                                     |
| disabled          | Boolean              | false     | 是否禁用表单                                                     |
| readonly          | Boolean              | false     | 是否只读                                                         |
| submitDisabled    | Boolean              | false     | 是否禁用提交按钮                                                 |
| breakMode         | String               | 'divider' | 分隔类型，可选: 'divider', 'collapse'                            |
| dividerProps      | Object               | {}        | Divider 配置（当 breakMode 为 divider 时）                       |
| columns           | Array                | [24]      | 表单布局，按 24 栅格布局，如 [12, 12]                            |
| fixedColumns      | Number               | 6         | fixed 列的宽度                                                   |
| cardWrapper       | Boolean              | true      | 是否用 Card 包裹                                                 |
| cardProps         | Object               | {}        | Card 的配置                                                      |
| cardSlots         | Object               | {}        | Card 的 Slots                                                    |
| form              | Array/Function       | []        | 表单配置，详见 NewbieFormItemConfig                              |
| afterFetched      | Function             | null      | fetch 返回数据处理函数                                           |
| beforeSubmit      | Function             | null      | 提交数据处理函数，返回 false 阻止提交，返回 Object 替换提交数据  |
| close             | Function             | null      | 点击关闭时的回调                                                 |
| afterSubmit       | Function             | null      | 提交成功后的回调                                                 |
| formProps         | Object               | {}        | 原生 Form 配置                                                   |

#### Events

| 事件名  | 参数          | 说明           |
| ------- | ------------- | -------------- |
| success | (res: Object) | 提交成功后触发 |

#### Expose 方法

| 方法名            | 参数             | 返回值  | 说明                                   |
| ----------------- | ---------------- | ------- | -------------------------------------- |
| submit            | -                | Promise | 提交表单                               |
| getForm           | -                | Object  | 获取表单数据（独立副本）               |
| getFormStandalone | -                | Object  | 获取表单数据（独立副本）               |
| getFormRealtime   | -                | Object  | 获取表单实时数据（慎用，会改变内部值） |
| getField          | (key: String)    | \*      | 获取表单字段值                         |
| setForm           | (fields: Object) | -       | 设置表单数据                           |
| reset             | -                | -       | 重置表单                               |
| isDirty           | -                | Boolean | 判断表单是否被修改                     |
| isInitializing    | (value: Boolean) | -       | 设置是否正在初始化                     |

#### 表单项配置 (NewbieFormItemConfig)

| 属性名             | 类型                | 默认值  | 说明                               |
| ------------------ | ------------------- | ------- | ---------------------------------- |
| key                | String              | -       | 数据库关联名称（必需）             |
| title              | String              | -       | 显示的名字（必需）                 |
| type               | String              | 'input' | 组件类型                           |
| rows               | Array/Function      | -       | 矩阵组件行标题                     |
| options            | Array/Function      | -       | 组件选项                           |
| placeholder        | String              | -       | 组件提示文字                       |
| help               | String/Function     | -       | FormItem 提示                      |
| rules              | Array               | -       | 验证规则                           |
| width              | String/Number       | -       | 组件宽度                           |
| style              | String              | -       | 样式                               |
| class              | String              | -       | 类名                               |
| required           | Boolean/Function    | false   | 是否必填                           |
| requiredMessage    | String              | -       | 必填项提示消息                     |
| readonly           | Boolean             | false   | 是否只读                           |
| disabled           | Boolean/Function    | false   | 组件不可编辑状态                   |
| hidden             | Boolean/Function    | false   | 组件是否隐藏                       |
| optional           | Boolean/Array       | -       | 表单项是否开启后才可以输入         |
| init               | Function            | -       | 初始化函数                         |
| beforeSubmit       | Function            | -       | 提交前修改表单项的值               |
| match              | Function            | -       | 根据条件返回不同的配置进行动态渲染 |
| columnIndex        | Number/Array/String | 0       | 渲染在哪一列                       |
| break              | Boolean/String      | false   | 新起一行，String 时以 Divider 分割 |
| defaultProps       | Object              | -       | 组件的配置                         |
| defaultSlots       | Object              | -       | 组件的默认插槽                     |
| formItemProps      | Object              | -       | FormItem 的原生配置                |
| formItemSlots      | Object              | -       | FormItem 的原生 Slot 配置          |
| defaultValue       | \*                  | ''      | 默认值                             |
| children           | Array/Function      | -       | 子表单配置                         |
| childrenOperations | Array               | -       | 子表单操作                         |
| cellProps          | Object              | -       | 单元格的配置                       |

#### 使用示例

```vue
<template>
  <NewbieForm
    :form="formConfig"
    :submit-url="/api/submit"
    :fetch-url="/api/fetch"
    @success="handleSuccess"
  />
</template>

<script setup>
import { NewbieForm } from "jobsys-newbie";

const formConfig = [
  {
    key: "name",
    title: "姓名",
    type: "input",
    required: true,
    placeholder: "请输入姓名",
  },
  {
    key: "age",
    title: "年龄",
    type: "number",
    rules: [{ type: "number", min: 0, max: 120, message: "年龄必须在0-120之间" }],
  },
];

const handleSuccess = res => {
  console.log("提交成功", res);
};
</script>
```

---

### NewbieTable - 表格组件

增强的表格组件，集成搜索、分页、编辑等功能。

#### Props

| 属性名           | 类型            | 默认值 | 说明                                |
| ---------------- | --------------- | ------ | ----------------------------------- |
| title            | String          | ''     | 表格标题                            |
| filterable       | Boolean         | true   | 是否使用表单搜索                    |
| tableProps       | Object          | {}     | 原生表格属性                        |
| tableEvents      | Object          | {}     | 原生表格事件                        |
| tableSlots       | Object          | {}     | 原生 slots                          |
| searchSlots      | Object          | {}     | NewbieSearch slots                  |
| pagination       | Boolean/Object  | true   | 是否使用分页，Object 时为自定义分页 |
| pageEvents       | Object          | {}     | 原生翻页事件                        |
| autoQuery        | Boolean         | false  | 是否在搜索条件变化时自动搜索        |
| url              | String          | ''     | 表格数据请求 URL                    |
| editable         | Boolean         | false  | 是否可编辑                          |
| submitUrl        | String          | ''     | 编辑后保存的 URL                    |
| beforeCellSubmit | Function        | null   | 单元格编辑提交的前置方法            |
| method           | String          | 'get'  | 表格请求方式，可选: 'get', 'post'   |
| extraData        | Object          | {}     | 请求数据时额外提交的参数            |
| afterFetched     | Function        | null   | 请求后 Res 的处理方法               |
| columns          | Array/Function  | []     | 表格列定义，详见 TableColumnConfig  |
| rowSelection     | Boolean/Object  | null   | 选择功能的配置                      |
| rowKey           | String/Function | 'id'   | 数据值需要指定 key 值               |
| dataSource       | Array           | []     | 表格数据                            |
| formData         | Array           | []     | 表格数据（alias of dataSource）     |
| expandRender     | String/Function | null   | 额外的展开行                        |
| expandedRowKeys  | Array           | null   | 展开的行                            |
| showRefresh      | Boolean         | true   | 是否显示刷新按钮                    |
| persistence      | Boolean/String  | false  | 持久化，传入 localStorage 的 key    |
| cardWrapper      | Boolean         | true   | 是否用 Card 包裹                    |

#### Events

| 事件名     | 参数                       | 说明                        |
| ---------- | -------------------------- | --------------------------- |
| fetch      | (params: Object)           | 未传入 url 时的手动请求方法 |
| rowClick   | ({ record, index, event }) | 行点击事件                  |
| cellSubmit | ({ record, key, value })   | 单元格编辑事件              |

#### Expose 方法

| 方法名          | 参数                                                      | 返回值  | 说明                                         |
| --------------- | --------------------------------------------------------- | ------- | -------------------------------------------- |
| getData         | -                                                         | Array   | 获取当前页的数据                             |
| setData         | (items: Array)                                            | -       | 设置数据                                     |
| setPagination   | (total?: number, currentPage?: number, pageSize?: number) | -       | 设置翻页数据                                 |
| getPagination   | -                                                         | Object  | 获取翻页数据                                 |
| getSelection    | -                                                         | Array   | 获取已选择的行数据                           |
| getQueryData    | -                                                         | Object  | 获取查询参数（包含搜索条件和分页信息）       |
| setQueryData    | (fields: Object)                                          | -       | 设置查询参数（会更新搜索表单的值）           |
| doFetch         | (refresh?: boolean)                                       | Promise | 执行获取数据，refresh 为 true 时重置到第一页 |
| setTableLoading | (loading: boolean)                                        | -       | 设置表格 loading 状态                        |

#### 表格列配置 (TableColumnConfig)

| 属性名         | 类型                        | 默认值 | 说明                                                                                   |
| -------------- | --------------------------- | ------ | -------------------------------------------------------------------------------------- |
| title          | String                      | -      | 列标题（必需）                                                                         |
| dataIndex      | String                      | -      | 列数据在数据项中对应的 key，支持 a.b.c 嵌套写法（必需）                                |
| key            | String                      | -      | Vue 需要的 key                                                                         |
| width          | String                      | -      | 列宽度                                                                                 |
| minWidth       | String                      | -      | 最小宽度，支持占满其它空位（与 onClick 冲突）                                          |
| align          | String                      | -      | 对齐方式                                                                               |
| tooltip        | String/Function             | -      | 提示                                                                                   |
| onClick        | Function                    | -      | 生成链接可点击（有 minWidth 冲突失效）                                                 |
| onCopy         | Function/Boolean            | -      | 自动生成 copy 图标并支持单击复制                                                       |
| editable       | Boolean/TableColumnEditable | -      | 是否可编辑                                                                             |
| ellipsis       | Boolean                     | -      | 是否自动缩略                                                                           |
| fixed          | Boolean/String              | -      | 列是否固定，可选 true(等效于 left) 'left' 'right'                                      |
| filterable     | Boolean/SearchItemConfig    | -      | 是否可过滤                                                                             |
| sortable       | Boolean/String/Object       | -      | 是否可排序，为 'asc'/'ASC' 时默认升序，为 'desc'/'DESC' 时默认降序，为对象时配置排序项 |
| isOnlyForQuery | Boolean                     | -      | 是否只用于搜索                                                                         |

#### 单元格编辑配置 (TableColumnEditable)

| 属性名           | 类型     | 默认值  | 说明                                                                                            |
| ---------------- | -------- | ------- | ----------------------------------------------------------------------------------------------- |
| type             | String   | 'input' | 编辑类型，可选: 'input', 'number', 'select', 'switch'                                           |
| key              | String   | -       | 字段 key，默认与 dataIndex 一致                                                                 |
| options          | Array    | -       | 选项（type 为 select 时必填，type 为 switch 时 options[0] 为 checked，options[1] 为 unchecked） |
| beforeCellSubmit | Function | -       | 单元格编辑提交的前置方法                                                                        |
| defaultValue     | \*       | -       | 默认编辑时的值                                                                                  |
| defaultProps     | Object   | -       | 编辑项配置                                                                                      |
| defaultSlots     | Object   | -       | 编辑项 Slot                                                                                     |

#### 使用示例

```vue
<template>
  <NewbieTable ref="tableRef" :columns="columns" :url="/api/table" :after-fetched="afterFetched" />
</template>

<script setup>
import { ref } from "vue";
import { NewbieTable } from "jobsys-newbie";

const tableRef = ref();

const columns = [
  {
    title: "姓名",
    dataIndex: "name",
    filterable: { type: "input" },
  },
  {
    title: "年龄",
    dataIndex: "age",
    editable: { type: "number" },
  },
];

const afterFetched = res => {
  return {
    data: res.result.data,
    total: res.result.total,
  };
};

// 使用 expose 方法
const handleRefresh = () => {
  tableRef.value.doFetch(true); // 刷新数据
};

const getTableData = () => {
  const data = tableRef.value.getData(); // 获取当前页数据
  const selection = tableRef.value.getSelection(); // 获取选中的行
  const pagination = tableRef.value.getPagination(); // 获取分页信息
};
</script>
```

---

### NewbieSearch - 搜索组件

提供强大的搜索表单功能，支持多种搜索类型和排序。

#### Props

| 属性名            | 类型           | 默认值 | 说明                                |
| ----------------- | -------------- | ------ | ----------------------------------- |
| filterableColumns | Array/Function | []     | 搜索项的配置，详见 SearchItemConfig |
| sortableColumns   | Array/Function | []     | 可排序的搜索项                      |
| disableConditions | Boolean        | false  | 是否禁用搜索条件                    |
| autoQuery         | Boolean        | false  | 是否在搜索条件变化时自动搜索        |
| gutter            | String/Number  | 16     | 搜索项的间距                        |
| persistence       | Boolean/String | false  | 持久化，传入 localStorage 的 key    |

#### Events

| 事件名 | 参数                          | 说明           |
| ------ | ----------------------------- | -------------- |
| search | ({ newbieQuery, newbieSort }) | 点击搜索时触发 |

#### Expose 方法

| 方法名       | 参数             | 返回值 | 说明               |
| ------------ | ---------------- | ------ | ------------------ |
| getQueryForm | -                | Object | 获取表单实时数据   |
| setQueryForm | (fields: Object) | -      | 设置搜索项的值     |
| getSortForm  | -                | Object | 获取排序表单数据   |
| getSearch    | -                | Object | 获取搜索和排序数据 |

#### 搜索项配置 (SearchItemConfig)

| 属性名            | 类型           | 默认值  | 说明                 |
| ----------------- | -------------- | ------- | -------------------- |
| key               | String         | -       | 搜索项的 key（必需） |
| title             | String         | -       | 搜索项的标题（必需） |
| type              | String         | 'input' | 搜索项的类型         |
| sortOrder         | Number         | 0       | 排序，数字越大越靠前 |
| expandable        | Boolean/Object | -       | 搜索项是否展开       |
| options           | Array/Function | -       | 搜索项的选项         |
| inputProps        | Object         | -       | 搜索项的输入框属性   |
| disableConditions | Boolean        | -       | 是否禁用搜索条件     |
| conditions        | Array          | -       | 搜索项的条件         |
| defaultValue      | \*             | -       | 默认搜索值           |
| defaultCondition  | \*             | -       | 默认搜索条件         |
| customRender      | Function       | -       | 自定义渲染搜索项     |
| collectItem       | Function       | -       | 收集搜索项的内容     |

#### 使用示例

```vue
<template>
  <NewbieSearch :filterable-columns="searchColumns" @search="handleSearch" />
</template>

<script setup>
import { NewbieSearch } from "jobsys-newbie";

const searchColumns = [
  {
    key: "name",
    title: "姓名",
    type: "input",
  },
  {
    key: "status",
    title: "状态",
    type: "select",
    options: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 },
    ],
  },
];

const handleSearch = ({ newbieQuery, newbieSort }) => {
  console.log("搜索条件", newbieQuery);
  console.log("排序条件", newbieSort);
};
</script>
```

---

### NewbieModal - 模态框/抽屉组件

支持 Modal 和 Drawer 两种模式，Modal 支持全屏和拖动。

#### Props

| 属性名      | 类型            | 默认值  | 说明                                                             |
| ----------- | --------------- | ------- | ---------------------------------------------------------------- |
| type        | String          | 'modal' | 弹窗类型，可选: 'modal', 'drawer'                                |
| visible     | Boolean         | false   | 可见性控制（v-model:visible）                                    |
| width       | Number/String   | 800     | 宽度                                                             |
| height      | Number/String   | 500     | 高度（仅当 type 为 modal 时有效）                                |
| title       | String          | ''      | 标题                                                             |
| beforeClose | Function/Object | null    | 关闭前的处理，Function 时返回 Promise，resolve(false) 可阻止关闭 |
| modalProps  | Object          | {}      | 原生 Modal 或 Drawer 配置                                        |

#### Events

| 事件名         | 参数               | 说明           |
| -------------- | ------------------ | -------------- |
| update:visible | (visible: Boolean) | 更新可见性     |
| close          | -                  | 关闭弹窗时回调 |

#### beforeClose 配置（Object 模式）

| 属性名     | 类型             | 默认值 | 说明                 |
| ---------- | ---------------- | ------ | -------------------- |
| title      | String           | ''     | Modal 提示框的 title |
| content    | String           | ''     | Modal 提示框的内容   |
| okText     | String           | '确定' | 确认按钮的文字       |
| cancelText | String           | '取消' | 取消按钮的文字       |
| trigger    | Function/Boolean | false  | 是否出现提示框       |

#### Slots

| Slot 名 | 说明     |
| ------- | -------- |
| default | 弹窗内容 |

#### 使用示例

```vue
<template>
  <NewbieModal v-model:visible="visible" title="标题" type="modal">
    <div>内容</div>
  </NewbieModal>
</template>

<script setup>
import { ref } from "vue";
import { NewbieModal } from "jobsys-newbie";

const visible = ref(false);
</script>
```

---

### NewbieAddress - 地址选择组件

三级地址选择组件。

#### Props

| 属性名       | 类型                | 默认值       | 说明                                          |
| ------------ | ------------------- | ------------ | --------------------------------------------- |
| value        | String/Number/Array | []           | 地址值（v-model:value）                       |
| level        | Number              | 3            | 生成哪个级别的数据，1: 省, 2: 省市, 3: 省市区 |
| disabled     | Boolean             | false        | 是否禁用选择器                                |
| placeholder  | String              | '请选择地区' | 占位符                                        |
| url          | String              | ''           | 获取数据的链接，不传则使用本地数据            |
| afterFetched | Function            | null         | 返回数据处理函数                              |
| dataSource   | Array               | []           | 自定义数据源                                  |

#### Events

| 事件名       | 参数           | 说明       |
| ------------ | -------------- | ---------- |
| update:value | (value: Array) | 更新地址值 |

#### 相关工具函数

**useAddressFullCode**

根据地址编码获取完整的地址编码路径。

**函数签名**

```javascript
function useAddressFullCode(code: string | number, level?: number): Array<string>
```

**参数**

- `code` (String/Number, 必需): 地址编码（6位数字）
- `level` (Number, 可选): 地址级别，1: 省, 2: 省市, 3: 省市区。如果不传，会根据 code 自动判断

**返回值**

地址编码数组，如 `['440000', '440100', '440113']`

**使用示例**

```javascript
import { useAddressFullCode } from "jobsys-newbie";

// 自动判断级别
const codes = useAddressFullCode("440113"); // ['440000', '440100', '440113']

// 指定级别
const provinceCode = useAddressFullCode("440113", 1); // ['440000']
```

#### 使用示例

```vue
<template>
  <NewbieAddress v-model:value="address" :level="3" />
</template>

<script setup>
import { ref } from "vue";
import { NewbieAddress } from "jobsys-newbie";

const address = ref([]);
</script>
```

---

### NewbiePassword - 密码输入组件

带强度提示的密码输入组件。

#### Props

| 属性名 | 类型          | 默认值 | 说明                        |
| ------ | ------------- | ------ | --------------------------- |
| value  | String        | ''     | 输入框的值（v-model:value） |
| min    | Number        | 8      | 最小长度                    |
| max    | Number        | 20     | 最大长度                    |
| width  | Number/String | 300    | 宽度                        |

#### Events

| 事件名       | 参数            | 说明                   |
| ------------ | --------------- | ---------------------- |
| update:value | (value: String) | 更新密码值             |
| change       | (event: Event)  | 输入框内容变化时的回调 |

#### Expose

| 属性名   | 类型                | 说明                         |
| -------- | ------------------- | ---------------------------- |
| strength | ComputedRef<Number> | 密码强度，0 为最弱，4 为最强 |

#### 使用示例

```vue
<template>
  <NewbiePassword v-model:value="password" :min="8" :max="20" />
</template>

<script setup>
import { ref } from "vue";
import { NewbiePassword } from "jobsys-newbie";

const password = ref("");
</script>
```

---

### NewbieUploader - 文件上传组件

支持普通上传和分块上传的文件上传组件。

#### Props

| 属性名      | 类型                | 默认值 | 说明                                                              |
| ----------- | ------------------- | ------ | ----------------------------------------------------------------- |
| value       | Object/Array/String | {}     | 上传文件值（v-model:value）                                       |
| name        | String              | 'file' | 上传文件字段名                                                    |
| headers     | Object              | {}     | 上传的请求头部                                                    |
| accept      | String              | ''     | 接受上传的文件类型                                                |
| type        | String              | 'file' | 上传列表的内建样式，可选: 'text\|file', 'picture', 'picture-card' |
| disabled    | Boolean             | false  | 是否禁用                                                          |
| maxSize     | Number              | 20     | 单个文件大小上限（MB）                                            |
| maxNum      | Number              | 1      | 上传文件个数上限                                                  |
| multiple    | Boolean             | false  | 是否支持多选文件                                                  |
| multipart   | Boolean             | false  | 是否使用分块上传                                                  |
| action      | String              | ''     | 上传文件的服务器地址                                              |
| extraData   | Object              | {}     | 上传时的附加参数                                                  |
| uploadText  | String              | ''     | 上传按钮文本                                                      |
| disk        | String              | ''     | 上传盘符标志                                                      |
| uploadProps | Object              | {}     | 原生 Upload 配置                                                  |

#### Events

| 事件名       | 参数                     | 说明           |
| ------------ | ------------------------ | -------------- |
| update:value | (fileList: Array/Object) | 更新文件列表   |
| success      | (fileList: Array)        | 上传成功时触发 |

#### 使用示例

```vue
<template>
  <NewbieUploader
    v-model:value="fileList"
    :action="/api/upload"
    :max-size="20"
    :max-num="5"
    type="picture-card"
  />
</template>

<script setup>
import { ref } from "vue";
import { NewbieUploader } from "jobsys-newbie";

const fileList = ref([]);
</script>
```

---

### NewbieEditor - 富文本编辑器

基于 WangEditor 的富文本编辑器组件。

#### Props

| 属性名      | 类型    | 默认值 | 说明                                           |
| ----------- | ------- | ------ | ---------------------------------------------- |
| value       | String  | ''     | 输入框的值（v-model:value）                    |
| placeholder | String  | ''     | 占位符                                         |
| disabled    | Boolean | false  | 是否禁用                                       |
| readonly    | Boolean | false  | 是否只读                                       |
| config      | Object  | {}     | 编辑器配置，包含 toolbarConfig 和 editorConfig |

#### Events

| 事件名       | 参数           | 说明     |
| ------------ | -------------- | -------- |
| update:value | (html: String) | 更新内容 |

#### Expose

| 方法名     | 参数              | 返回值 | 说明           |
| ---------- | ----------------- | ------ | -------------- |
| setContent | (content: String) | -      | 设置编辑器内容 |
| getEditor  | -                 | Editor | 获取编辑器实例 |

#### 使用示例

```vue
<template>
  <NewbieEditor v-model:value="content" />
</template>

<script setup>
import { ref } from "vue";
import { NewbieEditor } from "jobsys-newbie";

const content = ref("");
</script>
```

---

### NewbieCopy - 复制组件

一键复制组件。

#### Props

| 属性名       | 类型     | 默认值 | 说明                                           |
| ------------ | -------- | ------ | ---------------------------------------------- |
| text         | String   | ''     | 复制内容，默认也作为显示内容                   |
| showIcon     | Boolean  | false  | true: 复制图标一直显示; false: 仅 hover 时显示 |
| customRender | Function | null   | 自定义渲染内容                                 |
| copy         | Function | null   | 自定义复制方法                                 |

#### 使用示例

```vue
<template>
  <NewbieCopy text="要复制的内容" />
</template>

<script setup>
import { NewbieCopy } from "jobsys-newbie";
</script>
```

---

### NewbieList - 列表组件

支持滚动加载的列表组件。

#### Props

| 属性名       | 类型    | 默认值 | 说明             |
| ------------ | ------- | ------ | ---------------- |
| url          | String  | ''     | 加载数据的 URL   |
| extraData    | Object  | {}     | 请求附带参数     |
| height       | Number  | 300    | 高度             |
| offset       | Number  | 50     | 加载触发距离     |
| finishedText | String  | ''     | 加载完毕提示文案 |
| autoLoad     | Boolean | true   | 是否自动加载     |
| useStore     | Object  | null   | 是否使用 store   |
| listProps    | Object  | {}     | 原生 List 参数   |

#### Expose

| 方法名     | 参数               | 返回值 | 说明         |
| ---------- | ------------------ | ------ | ------------ |
| loadMore   | (refresh: Boolean) | -      | 加载更多     |
| items      | -                  | Array  | 获取列表数据 |
| pagination | -                  | Object | 分页对象     |

#### Slots

| Slot 名    | 参数              | 说明             |
| ---------- | ----------------- | ---------------- |
| default    | -                 | 列表项内容       |
| renderItem | ({ item, index }) | 自定义列表项渲染 |

#### 使用示例

```vue
<template>
  <NewbieList :url="/api/list" :height="400">
    <template #renderItem="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </NewbieList>
</template>

<script setup>
import { NewbieList } from "jobsys-newbie";
</script>
```

---

### NewbieSignaturePad - 签名板组件

电子签名组件。

#### Props

| 属性名    | 类型    | 默认值 | 说明                   |
| --------- | ------- | ------ | ---------------------- |
| title     | String  | ''     | 标题                   |
| readonly  | Boolean | false  | 是否只读               |
| agreement | String  | ''     | 协议文本               |
| preset    | String  | ''     | 预设签名图片（base64） |

#### Events

| 事件名 | 参数              | 说明                             |
| ------ | ----------------- | -------------------------------- |
| save   | (dataUrl: String) | 保存签名时触发，返回 base64 图片 |

#### Expose

| 方法名 | 参数 | 返回值 | 说明       |
| ------ | ---- | ------ | ---------- |
| open   | -    | -      | 打开签名板 |

#### Slots

| Slot 名 | 说明       |
| ------- | ---------- |
| title   | 自定义标题 |

#### 使用示例

```vue
<template>
  <NewbieSignaturePad ref="signatureRef" title="请签名" @save="handleSave" />
</template>

<script setup>
import { ref } from "vue";
import { NewbieSignaturePad } from "jobsys-newbie";

const signatureRef = ref();

const handleSave = dataUrl => {
  console.log("签名图片", dataUrl);
};

// 打开签名板
signatureRef.value.open();
</script>
```

---

### NewbieFormDesigner - 表单设计器

可视化表单设计组件。

#### Props

| 属性名    | 类型           | 默认值 | 说明                                   |
| --------- | -------------- | ------ | -------------------------------------- |
| title     | String         | ''     | 标题                                   |
| widgets   | Array          | []     | 额外的业务组件                         |
| formItems | Array/Function | []     | 表单项                                 |
| height    | String/Number  | '100%' | 组件高度                               |
| mode      | String         | null   | 设计类型，可选: 'quiz'（知识竞赛设计） |

#### Events

| 事件名 | 参数               | 说明         |
| ------ | ------------------ | ------------ |
| submit | (formItems: Array) | 提交设计结果 |

#### 使用示例

```vue
<template>
  <NewbieFormDesigner :form-items="formItems" @submit="handleSubmit" />
</template>

<script setup>
import { NewbieFormDesigner } from "jobsys-newbie";

const formItems = ref([]);

const handleSubmit = items => {
  console.log("表单配置", items);
};
</script>
```

---

### NewbieProvider - 配置提供者组件

用于全局配置其他组件。

#### Props

| 属性名   | 类型   | 默认值                                    | 说明                |
| -------- | ------ | ----------------------------------------- | ------------------- |
| editor   | Object | { uploadUrl: '' }                         | NewbieEditor 配置   |
| table    | Object | { page: 1, pageSize: 10, ... }            | NewbieTable 配置    |
| uploader | Object | { uploadUrl: '', defaultFileItem: {...} } | NewbieUploader 配置 |
| form     | Object | { format: {}, ... }                       | NewbieForm 配置     |
| search   | Object | { maskClass: '', ... }                    | NewbieSearch 配置   |
| locale   | String | 'zh_CN'                                   | 语言配置            |

#### 使用示例

```vue
<template>
  <NewbieProvider :uploader="{ uploadUrl: '/api/upload' }" :form="{ format: { date: true } }">
    <NewbieForm :form="formConfig" />
  </NewbieProvider>
</template>

<script setup>
import { NewbieProvider, NewbieForm } from "jobsys-newbie";
</script>
```

---

## Hooks 文档

### Network Hooks

#### useFetch

通用 AJAX 请求 Hook。

**函数签名**

```javascript
function useFetch(fetcher?: { loading: boolean }): {
  get(url: string, config?: AxiosConfig): Promise<AxiosResponse>
  post(url: string, data?: any, config?: AxiosConfig): Promise<AxiosResponse>
}
```

**参数**

- `fetcher` (Object, 可选): 用于存储请求状态的对象，包含 `loading` 属性

**返回值**

包含 `get` 和 `post` 方法的对象。

**使用示例**

```javascript
import { useFetch } from "jobsys-newbie/hooks";

const fetcher = ref({ loading: false });
const { get, post } = useFetch(fetcher);

// GET 请求
const res = await get("/api/users", { params: { page: 1 } });

// POST 请求
const res = await post("/api/users", { name: "John" });
```

---

#### usePage

分页请求 Hook。

**函数签名**

```javascript
async function usePage(
  pagination: {
    uri: string
    params?: object
    page?: number
    finishedText?: string
    loading?: boolean
    finished?: boolean
    error?: boolean
    errorText?: string
    empty?: boolean
    items?: array
  },
  refresh?: boolean,
  process?: (res: AxiosResponse) => object
): Promise<object>
```

**参数**

- `pagination` (Object, 必需): 分页对象
- `refresh` (Boolean, 可选): 是否刷新
- `process` (Function, 可选): 数据处理函数

**返回值**

更新后的 pagination 对象。

**使用示例**

```javascript
import { usePage } from "jobsys-newbie/hooks";

const pagination = ref({
  uri: "/api/users",
  params: {},
  items: [],
});

await usePage(pagination.value, true);
```

---

#### STATUS

请求返回状态码常量。

```javascript
import { STATUS } from "jobsys-newbie/hooks";

STATUS.STATE_CODE_SUCCESS; // 'SUCCESS' - 成功
STATUS.STATE_CODE_FAIL; // 'FAIL' - 失败
STATUS.STATE_CODE_NOT_FOUND; // 'NOT_FOUND' - 找不到资源
STATUS.STATE_CODE_INFO_NOT_COMPLETE; // 'INCOMPLETE' - 信息不完整
STATUS.STATE_CODE_NOT_ALLOWED; // 'NOT_ALLOWED' - 无权限
```

---

### Form Hooks

#### useFormFormat

处理表单数据格式化。

**函数签名**

```javascript
function useFormFormat(
  form: object,
  format?: {
    date?: boolean | string | Function
    boolean?: boolean | Array
    attachment?: string | Function
  }
): object
```

**参数**

- `form` (Object, 必需): 表单数据
- `format` (Object, 可选): 格式化配置
  - `date`: `true` 转成时间戳，`string` 为 Format 格式（如 `"YYYY-MM-DD"`），`function` 自定义处理函数
  - `boolean`: `true` 时 `true` 转成 1，`false` 转成 0；`Array` 时自定义转换值
  - `attachment`: `string` 附件字段名，`function` 自定义处理函数

**返回值**

格式化后的表单对象。

**使用示例**

```javascript
import { useFormFormat } from "jobsys-newbie/hooks";

const formattedForm = useFormFormat(form, {
  date: "YYYY-MM-DD",
  boolean: true,
  attachment: "url",
});
```

---

#### useProcessStatus

处理请求结果。

**函数签名**

```javascript
function useProcessStatus(
  res: { status: string, result: any },
  ops: object
): void
```

**参数**

- `res` (Object, 必需): 请求结果
  - `status`: 请求结果状态
  - `result`: 请求结果信息
- `ops` (Object, 必需): 状态的处理对象，key 为状态码，value 为字符串或函数

**使用示例**

```javascript
import { useProcessStatus, STATUS } from "jobsys-newbie/hooks";

useProcessStatus(res, {
  [STATUS.STATE_CODE_SUCCESS]: "操作成功",
  [STATUS.STATE_CODE_FAIL]: () => {
    console.error("操作失败");
  },
});
```

---

#### useProcessStatusSuccess

处理正确请求结果。

**函数签名**

```javascript
function useProcessStatusSuccess(
  res: { status: string, result: any },
  success: string | Function
): void
```

**使用示例**

```javascript
import { useProcessStatusSuccess } from "jobsys-newbie/hooks";

useProcessStatusSuccess(res, () => {
  console.log("成功");
});
```

---

#### useFormFail

处理表单提交失败。

**函数签名**

```javascript
function useFormFail(e: Error): void
```

**使用示例**

```javascript
import { useFormFail } from "jobsys-newbie/hooks";

try {
  await submitForm();
} catch (e) {
  useFormFail(e);
}
```

---

#### useHiddenForm

创建一个隐藏的表单。

**函数签名**

```javascript
function useHiddenForm(options: {
  url: string
  data?: object
  method?: string
  csrfToken?: string
}): HTMLFormElement
```

**使用示例**

```javascript
import { useHiddenForm } from "jobsys-newbie/hooks";

const form = useHiddenForm({
  url: "/api/export",
  data: { id: 1 },
  method: "post",
});
form.submit();
```

---

#### formLabel

表单布局常量。

```javascript
import { formLabel } from "jobsys-newbie/hooks";

formLabel.commonLabelCol; // { span: 8, xxl: 6 }
formLabel.commonWrapperCol; // { span: 12, xxl: 14 }
formLabel.commonWrapperOffset; // { xs: { offset: 8, span: 12 }, xxl: { offset: 6, span: 14 } }
// ... 更多布局配置
```

---

### Datetime Hooks

#### useDayjs

根据格式创建 Dayjs 对象。

**函数签名**

```javascript
function useDayjs(date: string | number, format?: string): dayjs.Dayjs
```

**使用示例**

```javascript
import { useDayjs } from "jobsys-newbie/hooks";

const date = useDayjs("2023-01-01", "YYYY-MM-DD");
```

---

#### useDateFormat

格式化日期。

**函数签名**

```javascript
function useDateFormat(
  date: dayjs.Dayjs | Date,
  format?: string
): string
```

**使用示例**

```javascript
import { useDateFormat } from "jobsys-newbie/hooks";

const formatted = useDateFormat(new Date(), "YYYY-MM-DD HH:mm");
```

---

#### useDateUnix

获取日期的 Unix 时间戳。

**函数签名**

```javascript
function useDateUnix(date: dayjs.Dayjs | Date): number | string
```

**使用示例**

```javascript
import { useDateUnix } from "jobsys-newbie/hooks";

const timestamp = useDateUnix(new Date());
```

---

### Cipher Hooks

#### useSm2

国密 SM2。

**函数签名**

```javascript
function useSm2(): object
```

**返回值**

SM2 加密对象。

---

#### useSm3

国密 SM3 加密（杂凑）。

**函数签名**

```javascript
function useSm3(msg: string, options?: object): string
```

---

#### useSm4Encrypt

国密 SM4 加密。

**函数签名**

```javascript
function useSm4Encrypt(msg: string, key: string, options?: object): Uint8Array
```

---

#### useSm4Decrypt

国密 SM4 解密。

**函数签名**

```javascript
function useSm4Decrypt(encryptData: string, key: string, options?: object): Uint8Array
```

---

### Regex Hooks

#### useRegexRule

生成正则验证规则。

**函数签名**

```javascript
function useRegexRule(
  type: string,
  options?: {
    message?: string
    mode?: string
    version?: string
    strict?: string
    en?: boolean
    english?: boolean
  }
): { pattern: RegExp, message: string }
```

**支持的 type 值**

- `email`: 邮箱
- `phone`: 手机号码（mode: 'strict' 或默认）
- `tel` / `telephone`: 座机号码
- `id` / `ID`: 身份证号码（mode: 'china'/'cn'/'hk'/'macau'/'taiwan', version: 'v1'/'v2'）
- `passport`: 护照
- `credit-code` / `uscc`: 统一社会信用代码
- `bank-account` / `bank`: 银行账号
- `stock`: 股票代码
- `url`: 链接（mode: 'image'/'video'）
- `md5`: MD5 值
- `base64`: Base64 值
- `currency` / `money`: 货币（mode: 'positive'）
- `chinese`: 中文
- `name`: 姓名（en/english: true 为英文姓名）
- `decimal`: 小数
- `number`: 数字
- `date`: 日期
- `time`: 时间（mode: '12'）
- `car` / `plate-number` / `car-number`: 车牌号（mode: 'green'/'newEnergy'/'notNewEnergy'）
- `version`: 版本号
- `ip` / `IP`: IP 地址（mode: 'v6'/'ipv6'）
- `qq`: QQ 号
- `wechat`: 微信号
- `alpha-numeric` / `numeric-alpha`: 字母数字
- `alpha`: 字母（mode: 'lower'/'upper'）
- `username`: 用户名
- `password`: 密码
- `zip`: 邮政编码
- `mac` / `MAC`: MAC 地址

**使用示例**

```javascript
import { useRegexRule } from "jobsys-newbie/hooks";

const emailRule = useRegexRule("email");
const phoneRule = useRegexRule("phone", { mode: "strict" });
```

---

### Utils Hooks

#### useLabelFromOptionsValue

从 options 中根据 value 获取 label。

**函数签名**

```javascript
function useLabelFromOptionsValue(value: string | number, options: Array): string
```

**使用示例**

```javascript
import { useLabelFromOptionsValue } from "jobsys-newbie/hooks";

const label = useLabelFromOptionsValue(1, [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
]); // '启用'
```

---

#### useFindLabelsInValues

从嵌套的 options 中根据 value 获取 label。

**函数签名**

```javascript
function useFindLabelsInValues(
  options: Array,
  values: Array,
  adapter?: { value: string, label: string, children: string }
): Array<string>
```

---

#### useFindOptionByValue

从嵌套的 options 中根据 value 递归找出该 option。

**函数签名**

```javascript
function useFindOptionByValue(
  options: Array,
  value: number | string,
  adapter?: { value: string, label: string, children: string }
): Object | null
```

---

#### useFindLabelsFromPath

从嵌套的 options 中根据 value 路径获取 label 路径。

**函数签名**

```javascript
function useFindLabelsFromPath(
  options: Array,
  path: Array,
  adapter?: { value: string, label: string, children: string }
): Array<string>
```

---

#### useFindParentLabels

从嵌套的 options 中根据 value 获取 label 路径。

**函数签名**

```javascript
function useFindParentLabels(
  options: Array,
  value: number | string,
  adapter?: { value: string, label: string, children: string }
): Array<string>
```

---

#### useFindParentValues

从嵌套的 options 中根据 value 获取整个 values 路径。

**函数签名**

```javascript
function useFindParentValues(
  options: Array,
  value: number | string,
  adapter?: { value: string, label: string, children: string }
): Array
```

---

#### useFindPropertyRecursive

从嵌套的对象中递归获取某个属性。

**函数签名**

```javascript
function useFindPropertyRecursive(
  item: object,
  propertyKey: string,
  nestedKey: string
): Array
```

---

#### useCache

用于储存缓存的值。

**函数签名**

```javascript
function useCache(
  key: string,
  sessionType?: Storage
): {
  get(defaultValue?: any): any
  set(value: any): void
  remove(): void
}
```

**使用示例**

```javascript
import { useCache } from "jobsys-newbie/hooks";

const cache = useCache("myKey", localStorage);
cache.set({ name: "John" });
const value = cache.get({});
cache.remove();
```

---

#### useNumber

精度安全的数值处理函数。

**函数签名**

```javascript
function useNumber(value: number | string, precision?: number): number
```

**使用示例**

```javascript
import { useNumber } from "jobsys-newbie/hooks";

const num = useNumber(1.23456789, 2); // 1.23
```

---

#### useAddressFullCode

根据地址编码获取完整的地址编码路径。

**函数签名**

```javascript
function useAddressFullCode(code: string | number, level?: number): Array<string>
```

**参数**

- `code` (String/Number, 必需): 地址编码（6位数字）
- `level` (Number, 可选): 地址级别，1: 省, 2: 省市, 3: 省市区。如果不传，会根据 code 自动判断

**返回值**

地址编码数组，如 `['440000', '440100', '440113']`

**使用示例**

```javascript
import { useAddressFullCode } from "jobsys-newbie";

// 自动判断级别
const codes = useAddressFullCode("440113"); // ['440000', '440100', '440113']

// 指定级别
const provinceCode = useAddressFullCode("440113", 1); // ['440000']
```

---

### Interact Hooks

#### useModalConfirm

确认弹窗。

**函数签名**

```javascript
function useModalConfirm(
  msg: string,
  onOk?: Function,
  loading?: boolean,
  onCancel?: Function
): Modal
```

**使用示例**

```javascript
import { useModalConfirm } from "jobsys-newbie/hooks";

useModalConfirm(
  "确定要删除吗？",
  () => {
    console.log("确认");
  },
  false,
  () => {
    console.log("取消");
  }
);
```

---

### I18n Hooks

#### useT

用于处理 i18n 翻译。

**函数签名**

```javascript
function useT(key: string | Array, options?: object): string
```

**使用示例**

```javascript
import { useT } from "jobsys-newbie/hooks";

const text = useT("common.save");
const texts = useT(["common.", "save"]); // 拼接翻译
```

---

#### useI18nJoin

用于处理 i18n 文本拼接情况。

**函数签名**

```javascript
function useI18nJoin(
  first: string,
  second: string,
  options?: {
    capitalizeFirst?: boolean
    uncapitalizeSecond?: boolean
    uncapitalizeSecondAll?: boolean
    locale?: string
  }
): string
```

**使用示例**

```javascript
import { useI18nJoin } from "jobsys-newbie/hooks";

const text = useI18nJoin("保存", "成功"); // '保存成功' 或 'Save success'（英文环境）
```

---

## Directives 文档

### v-auth - 权限控制指令

根据权限控制元素的显示/隐藏。

#### 使用方式

```vue
<template>
  <!-- 单个权限 -->
  <div v-auth="'permission1'">需要 permission1 权限</div>

  <!-- 多个权限，全部需要（默认） -->
  <div v-auth:all="['permissions', ['permission1', 'permission2']]">
    需要 permission1 和 permission2 权限
  </div>

  <!-- 多个权限，任意一个 -->
  <div v-auth:any="['permissions', ['permission1', 'permission2']]">
    需要 permission1 或 permission2 权限
  </div>

  <!-- 多个权限，都不需要 -->
  <div v-auth:none="['permissions', ['permission1', 'permission2']]">
    不需要 permission1 和 permission2 权限
  </div>
</template>
```

#### 参数说明

- **v-auth**: 单个权限字符串，或 `[permissions数组, 用户权限数组]` 格式的数组
- **v-auth:all**: 全部权限都需要（默认模式）
- **v-auth:any**: 任意一个权限即可
- **v-auth:none**: 都不需要这些权限

#### setDefaultPermissions

设置默认权限集合。

**函数签名**

```javascript
function setDefaultPermissions(permissions: Array): void
```

**使用示例**

```javascript
import { setDefaultPermissions } from "jobsys-newbie/directives";

setDefaultPermissions(["permission1", "permission2", "permission3"]);
```

#### $auth 全局方法

在组件中可以使用 `$auth` 方法进行权限判断。

**函数签名**

```javascript
function $auth(value: string | Array, arg?: 'all' | 'any' | 'none'): boolean
```

**使用示例**

```javascript
// 在 setup 中需要通过 getCurrentInstance 获取
import { getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
if (proxy.$auth("permission1")) {
  // 有权限
}
```

---

## 配置和全局方法

### config 方法

用于配置全局的工具参数。

**函数签名**

```javascript
function config(options: {
  httpStatus?: object
}): void
```

**使用示例**

```javascript
import Newbie from "jobsys-newbie";

Newbie.config({
  httpStatus: {
    STATE_CODE_SUCCESS: "SUCCESS",
    STATE_CODE_FAIL: "FAIL",
    STATE_CODE_NOT_FOUND: "NOT_FOUND",
    STATE_CODE_INFO_NOT_COMPLETE: "INCOMPLETE",
    STATE_CODE_NOT_ALLOWED: "NOT_ALLOWED",
  },
});
```

---

### i18n 配置

Newbie 使用 vue-i18n 进行国际化，支持中文（zh_CN）和英文（en_US）。

**默认语言**: zh_CN

**使用示例**

```javascript
import { useI18n } from "vue-i18n";

const { locale } = useI18n();
locale.value = "en_US"; // 切换为英文
```

---

## 类型定义

### NewbieFormItemConfig

表单项配置接口，详见 [NewbieForm - 表单项配置](#表单项配置-newbieformitemconfig)。

### TableColumnConfig

表格列配置接口，详见 [NewbieTable - 表格列配置](#表格列配置-tablecolumnconfig)。

### SearchItemConfig

搜索项配置接口，详见 [NewbieSearch - 搜索项配置](#搜索项配置-searchitemconfig)。

### ExposedFormData

表单暴露的数据接口。

```typescript
interface ExposedFormData {
  formatForm: object; // Format后的表单数据
  originalForm: object; // 原生的表单数据
}
```

---

## 常见使用场景

### 1. 表单 + 表格组合

```vue
<template>
  <NewbieProvider :form="{ format: { date: true } }">
    <NewbieSearch :filterable-columns="searchColumns" @search="handleSearch" />
    <NewbieTable :columns="tableColumns" :url="/api/table" />
  </NewbieProvider>
</template>
```

### 2. 表单提交

```vue
<template>
  <NewbieForm ref="formRef" :form="formConfig" :submit-url="/api/submit" @success="handleSuccess" />
</template>

<script setup>
import { ref } from "vue";
import { NewbieForm } from "jobsys-newbie";

const formRef = ref();

// 手动提交
formRef.value.submit();

// 获取表单数据
const formData = formRef.value.getForm();
</script>
```

### 3. 表格编辑

```vue
<template>
  <NewbieTable
    :columns="columns"
    :url="/api/table"
    :editable="true"
    :submit-url="/api/table/update"
  />
</template>

<script setup>
const columns = [
  {
    title: "姓名",
    dataIndex: "name",
    editable: { type: "input" },
  },
  {
    title: "状态",
    dataIndex: "status",
    editable: {
      type: "switch",
      options: ["启用", "禁用"],
    },
  },
];
</script>
```

---

## 注意事项

1. **样式引入**: 使用组件前需要引入样式文件 `jobsys-newbie/dist/jobsys-newbie.css`
2. **依赖要求**: 确保已安装 peerDependencies 中的所有依赖
3. **Vue 版本**: 仅支持 Vue 3.x
4. **TypeScript**: 组件库提供了基本的类型定义，但建议在实际使用中进行类型补充
5. **权限指令**: v-auth 指令需要先调用 `setDefaultPermissions` 设置默认权限，或在指令值中传入用户权限数组

---

## 版本信息

- **当前版本**: 2.2.3
- **Vue 版本要求**: >= 3.5.13
- **Ant Design Vue 版本要求**: 4.2.6

---

**文档生成时间**: 2024年
**文档版本**: 1.0.0
