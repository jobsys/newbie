# Newbie 组件库使用指南

> 基于 Vue 3 + Ant Design Vue 4 的业务组件库

## 安装

```bash
npm install jobsys-newbie
# or
pnpm add jobsys-newbie
```

```javascript
import { createApp } from 'vue'
import Newbie from 'jobsys-newbie'
import 'jobsys-newbie/dist/jobsys-newbie.css'

const app = createApp(App)
app.use(Newbie)
app.mount('#app')
```

## 快速引用

### 组件导入

```javascript
import {
  NewbieButton,
  NewbieForm,
  NewbieTable,
  NewbieModal,
  NewbieUploader,
  NewbieEditor,
  NewbieSearch,
  NewbieList,
  NewbiePassword,
  NewbieAddress,
  NewbieSignaturePad,
  NewbieFormDesigner,
  NewbieCopy,
  NewbieProvider,
} from 'jobsys-newbie'
```

### Hooks 导入

```javascript
import {
  useFetch,
  usePage,
  useFormFormat,
  useRules,
  useT,
  STATUS,
  useDatetime,
  useCipher,
} from 'jobsys-newbie/hooks'
```

### 指令导入

```javascript
import { auth, setDefaultPermissions } from 'jobsys-newbie/directives'
```

---

## 组件速查

### NewbieButton - 增强按钮

```vue
<NewbieButton
  type="primary"
  label="保存"
  :fetcher="fetcher"
  :icon="h(SaveOutlined)"
  @click="handleSave"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | String | 'default' | primary/ghost/dashed/link/text |
| label | String | '' | 按钮文字 |
| fetcher | Object | {loading:false} | 请求状态控制器 |
| icon | Object | null | Ant Design 图标组件 |
| iconPosition | String | 'left' | left/right |

### NewbieForm - JSON 配置表单

```vue
<NewbieForm
  :form="formConfig"
  :fetch-url="'/api/detail'"
  :submit-url="'/api/submit'"
  :extra-data="{ id: 123 }"
  @success="handleSuccess"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| form | Array/Function | 表单配置项数组 |
| fetchUrl | String | 获取数据接口 |
| submitUrl | String | 提交数据接口 |
| extraData | Object | 额外提交数据 |
| autoLoad | Boolean/Array | 自动加载，Array时做字段非空校验 |
| columns | Array | 布局列宽 [24] 或 [12,12] |

**表单项配置:**

```javascript
const formConfig = [
  {
    key: 'name',           // 字段名 (必填)
    title: '姓名',         // 显示标签 (必填)
    type: 'input',         // 组件类型
    required: true,        // 必填
    placeholder: '请输入',
    rules: [{ type: 'email', message: '邮箱格式错误' }],
    width: 200,            // 组件宽度
    disabled: false,       // 禁用
    readonly: false,       // 只读
    hidden: false,         // 隐藏
    defaultValue: '',      // 默认值
    defaultProps: {},      // 组件原生属性
    options: [],           // 选项 (select/checkbox等)
    columnIndex: 0,        // 列位置
  }
]
```

**支持的 type 类型:**
- `input` - 文本输入
- `number` - 数字输入
- `textarea` - 多行文本
- `password` - 密码
- `select` - 下拉选择
- `radio` - 单选
- `checkbox` - 复选框
- `switch` - 开关
- `date`/`datetime`/`time` - 日期时间
- `upload` - 文件上传
- `editor` - 富文本编辑器
- `signature` - 签名板
- `address` - 地址选择
- `matrix` - 矩阵组件
- `group` - 分组容器
- `custom` - 自定义组件

**Expose 方法:**

```javascript
const formRef = ref()

formRef.value.submit()           // 提交表单
formRef.value.getForm()          // 获取表单数据
formRef.value.setForm({...})     // 设置表单数据
formRef.value.reset()            // 重置表单
formRef.value.isDirty()          // 是否已修改
formRef.value.getField('name')   // 获取字段值
```

### NewbieTable - 增强表格

```vue
<NewbieTable
  title="用户列表"
  :filterable="true"
  :columns="columns"
  :fetch-url="'/api/users'"
  :search-fields="searchConfig"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| title | String | 表格标题 |
| filterable | Boolean | 是否启用搜索表单 |
| fetchUrl | String | 数据接口 |
| columns | Array | 列配置 |
| searchFields | Array | 搜索字段配置 |
| tableProps | Object | Ant Table 原生属性 |

**列配置:**

```javascript
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 120,
    sorter: true,           // 排序
    editable: true,         // 可编辑
    fixed: 'left',          // 固定列
    customRender: ({ value, record }) => h('span', value)
  }
]
```

### NewbieModal - 弹窗组件

```vue
<NewbieModal
  title="编辑"
  :width="600"
  :footer="true"
  :destroy-on-close="true"
  @ok="handleOk"
  @cancel="handleCancel"
>
  <MyFormComponent />
</NewbieModal>
```

| Prop | Type | Description |
|------|------|-------------|
| title | String | 弹窗标题 |
| width | Number/String | 弹窗宽度 |
| footer | Boolean | 是否显示底部按钮 |
| destroyOnClose | Boolean | 关闭时销毁内容 |
| closable | Boolean | 显示关闭按钮 |
| maskClosable | Boolean | 点击蒙层关闭 |

### NewbieUploader - 文件上传

```vue
<NewbieUploader
  v-model:value="fileList"
  action="/api/upload"
  :multiple="true"
  :max-count="5"
  accept="image/*"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| action | String | 上传接口地址 |
| multiple | Boolean | 多文件上传 |
| maxCount | Number | 最大文件数 |
| accept | String | 接受文件类型 |
| directory | Boolean | 文件夹上传 |
| resumable | Boolean | 断点续传 |

### NewbieEditor - 富文本编辑器

```vue
<NewbieEditor
  v-model:value="content"
  :upload-url="'/api/upload'"
  :height="400"
  :placeholder="'请输入内容'"
/>
```

| Prop | Type | Description |
|------|------|-------------|
| value | String | 内容 (v-model) |
| uploadUrl | String | 图片上传接口 |
| height | Number | 编辑器高度 |
| placeholder | String | 占位提示 |
| toolbar | Array | 自定义工具栏 |

### NewbieSearch - 搜索表单

```vue
<NewbieSearch
  :fields="searchFields"
  :fetcher="fetcher"
  :columns="[8, 8, 8]"
  @search="handleSearch"
/>
```

### NewbieList - 列表组件

```vue
<NewbieList
  :fetch-url="'/api/items'"
  :item-component="ListItem"
  :pagination="true"
/>
```

### NewbiePassword - 密码强度

```vue
<NewbiePassword
  v-model:value="password"
  :level="3"
  :show-strength="true"
/>
```

### NewbieAddress - 地址选择

```vue
<NewbieAddress
  v-model:value="address"
  level="2"  // 省市区三级
/>
```

### NewbieSignaturePad - 签名板

```vue
<NewbieSignaturePad
  ref="signatureRef"
  :width="600"
  :height="200"
  @confirm="handleSignature"
/>
```

```javascript
signatureRef.value.open()   // 打开签名板
signatureRef.value.clear()  // 清空
signatureRef.value.getData() // 获取签名数据
```

### NewbieCopy - 复制组件

```vue
<NewbieCopy text="要复制的文本" />
```

### NewbieProvider - 全局配置

```vue
<NewbieProvider
  :editor="{ uploadUrl: '/api/upload' }"
  :table="{ page: 1, pageSize: 20 }"
  :uploader="{ uploadUrl: '/api/upload' }"
  :locale="'zh_CN'"
>
  <YourApp />
</NewbieProvider>
```

---

## Hooks 速查

### useFetch - HTTP 请求

```javascript
import { useFetch } from 'jobsys-newbie/hooks'

const fetcher = ref({ loading: false })
const { get, post, put, delete: del } = useFetch(fetcher)

// GET
const res = await get('/api/users', { params: { page: 1 } })

// POST
const res = await post('/api/users', { name: 'John' })

// 请求配置
const res = await post('/api/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 30000,
  onUploadProgress: (progress) => {}
})
```

### usePage - 分页处理

```javascript
import { usePage } from 'jobsys-newbie/hooks'

const pagination = ref({
  uri: '/api/users',
  params: { status: 'active' },
  page: 1,
  pageSize: 10,
  items: [],
  finished: false,
  loading: false,
})

// 加载更多
await usePage(pagination.value)

// 刷新
await usePage(pagination.value, true)
```

### useFormFormat - 表单数据处理

```javascript
import { useFormFormat } from 'jobsys-newbie/hooks'

const { formatBeforeSubmit, formatAfterFetch } = useFormFormat()

// 提交前格式化日期
const data = formatBeforeSubmit(formData, {
  'birthday': 'date',      // Date 转字符串
  'price': 'number',       // 字符串转数字
  'tags': 'array',         // 数组序列化
})

// 获取后格式化
const formData = formatAfterFetch(rawData, {
  'birthday': 'date',
  'price': 'number',
})
```

### useRules - 表单验证规则

```javascript
import { useRules } from 'jobsys-newbie/hooks'

const { required, email, phone, idCard, range, pattern } = useRules()

const rules = [
  required('请输入用户名'),
  email('邮箱格式不正确'),
  phone('手机号格式不正确'),
  idCard('身份证号格式不正确'),
  range(1, 100, '范围1-100'),
  pattern(/^[a-z]+$/, '只能小写字母'),
]
```

### useT - 国际化

```javascript
import { useT } from 'jobsys-newbie/hooks'

const t = useT()

t('common.save')      // 翻译
 t('hello', { name: 'World' }) // 带参数
```

### useDatetime - 日期时间

```javascript
import { useDatetime } from 'jobsys-newbie/hooks'

const { format, parse, diff, add, subtract } = useDatetime()

format(new Date(), 'YYYY-MM-DD HH:mm:ss')
parse('2024-01-01')
diff(date1, date2, 'day')
add(date, 1, 'day')
```

### useCipher - 加密解密

```javascript
import { useCipher } from 'jobsys-newbie/hooks'

const { sm2, sm3, sm4, aes, rsa, md5 } = useCipher()

// SM2 国密
const encrypted = sm2.encrypt(data, publicKey)
const decrypted = sm2.decrypt(encrypted, privateKey)

// SM4 对称加密
const encrypted = sm4.encrypt(data, key)
const decrypted = sm4.decrypt(encrypted, key)

// AES
const encrypted = aes.encrypt(data, key)
const decrypted = aes.decrypt(encrypted, key)

// MD5
const hash = md5(data)
```

### STATUS 常量

```javascript
import { STATUS } from 'jobsys-newbie/hooks'

STATUS.STATE_CODE_SUCCESS           // 'SUCCESS'
STATUS.STATE_CODE_FAIL              // 'FAIL'
STATUS.STATE_CODE_NOT_FOUND         // 'NOT_FOUND'
STATUS.STATE_CODE_INFO_NOT_COMPLETE // 'INCOMPLETE'
STATUS.STATE_CODE_NOT_ALLOWED       // 'NOT_ALLOWED'
STATUS.STATE_CODE_UNAUTHORIZED      // 'UNAUTHORIZED'
```

---

## 指令

### v-auth - 权限控制

```vue
<!-- 需要 permission: 'user:edit' -->
<button v-auth="'user:edit'">编辑</button>

<!-- 多个权限，满足任一 -->
<button v-auth="['user:edit', 'user:admin']">编辑</button>

<!-- 配置默认权限 -->
<script>
import { setDefaultPermissions } from 'jobsys-newbie/directives'

setDefaultPermissions(['user:view', 'order:view'])
</script>
```

---

## 完整示例

### 带搜索的表格页面

```vue
<template>
  <NewbieTable
    title="用户管理"
    :fetch-url="'/api/users'"
    :columns="columns"
    :search-fields="searchFields"
    :filterable="true"
    :extra-data="{ orgId: currentOrgId }"
  >
    <template #actions>
      <NewbieButton
        type="primary"
        label="新增用户"
        @click="showModal = true"
      />
    </template>
  </NewbieTable>

  <NewbieModal
    title="新增用户"
    :width="600"
    :visible="showModal"
    @ok="handleSubmit"
    @cancel="showModal = false"
  >
    <NewbieForm
      ref="formRef"
      :form="formConfig"
      :card-wrapper="false"
    />
  </NewbieModal>
</template>

<script setup>
import { ref } from 'vue'
import {
  NewbieTable,
  NewbieButton,
  NewbieModal,
  NewbieForm,
} from 'jobsys-newbie'

const showModal = ref(false)
const formRef = ref()
const currentOrgId = ref(1)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: '姓名', dataIndex: 'name', editable: true },
  { title: '邮箱', dataIndex: 'email' },
  { title: '状态', dataIndex: 'status' },
]

const searchFields = [
  { key: 'name', title: '姓名', type: 'input' },
  { key: 'status', title: '状态', type: 'select', options: [
    { value: 'active', label: '启用' },
    { value: 'disabled', label: '禁用' },
  ]},
]

const formConfig = [
  { key: 'name', title: '姓名', type: 'input', required: true },
  { key: 'email', title: '邮箱', type: 'input', required: true },
  { key: 'phone', title: '手机', type: 'input' },
]

const handleSubmit = async () => {
  const data = await formRef.value.getForm()
  // 提交数据
}
</script>
```

### 表单详情页

```vue
<template>
  <NewbieForm
    ref="formRef"
    :form="formConfig"
    :fetch-url="'/api/detail'"
    :submit-url="'/api/save'"
    :extra-data="{ id: route.params.id }"
    :auto-load="['id']"
    :submit-confirm-text="'确定保存吗?'"
    @success="handleSuccess"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { NewbieForm } from 'jobsys-newbie'

const route = useRoute()
const formRef = ref()

const formConfig = [
  { key: 'name', title: '名称', type: 'input', required: true },
  { key: 'content', title: '内容', type: 'editor', height: 300 },
  { key: 'attachment', title: '附件', type: 'upload', multiple: true },
  { key: 'signature', title: '签名', type: 'signature' },
]

const handleSuccess = () => {
  // 保存成功
}
</script>
```

---

## 注意事项

1. **样式引入**: 必须引入 `jobsys-newbie/dist/jobsys-newbie.css`
2. **图标**: 使用 Ant Design Vue 图标时需要通过 `h()` 函数包装
3. **日期**: 表单日期字段会自动进行格式转换 (dayjs ↔ string)
4. **文件上传**: 上传组件依赖全局配置或 NewbieProvider 的 uploader 配置
5. **富文本**: Editor 组件需要配置 uploadUrl 才能上传图片
6. **权限指令**: v-auth 需要配合 setDefaultPermissions 设置用户权限列表
