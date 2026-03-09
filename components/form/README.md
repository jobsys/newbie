## 详细参数

### `NewbieFormItemConfig` 表单项配置

| Prop name     | Description                                                                                                                  | Type                          | Values                                | Default |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------- | ------- |
| key           | 数据库关联名称                                                                                                               | string                        | -                                     | ""      |
| title         | 显示的 Label 名字                                                                                                            | string                        | -                                     | ""      |
| type          | 支持的组件类型                                                                                                               | string                        | [见下表](#formitem-type-支持组件类型) | "input" |
| options       | 组件选项                                                                                                                     | array \| func                 | -                                     | []      |
| placeholder   | 组件里的提示                                                                                                                 | string                        | -                                     | ""      |
| help          | form item里的提示                                                                                                            | string \| func                | -                                     | ""      |
| width         | 组件宽度                                                                                                                     | string                        | -                                     | ""      |
| style         | 样式                                                                                                                         | string                        | -                                     | ""      |
| class         | 类名                                                                                                                         | string                        | -                                     | ""      |
| init          | 初始化函数，用于初始化表单项的值: `init({ submitForm, value })`                                                              | func                          | -                                     | -       |
| beforeSubmit  | 在提交前修改表单项的值，该函数会在 NewbieForm 的 beforeSubmit 之前调用: `beforeSubmit({ submitForm, value })`                | func                          | -                                     | -       |
| readonly      | 是否只读                                                                                                                     | boolean                       | -                                     | false   |
| required      | 是否必填, 函数用法见下方[FAQ](#faq)                                                                                          | boolean \| func               | -                                     | false   |
| disabled      | 组件不可编辑状态, 函数用法见下方[FAQ](#faq)                                                                                  | boolean \| func               | -                                     | false   |
| hidden        | 组件是否隐藏, 函数用法见下方[FAQ](#faq)                                                                                      | boolean \| func               | -                                     | false   |
| optional      | 表单项是否开启后才可以输入, 用法见下方[FAQ](#faq)                                                                            | boolean \| Array              | -                                     | false   |
| match         | 支持根据条件返回不同的配置进行动态渲染, 用法见下方[FAQ](#faq)                                                                | Function                      | -                                     | -       |
| columnIndex   | 渲染在哪一列                                                                                                                 | number \| string              | -                                     |         |
| break         | 是否新起一行，如果为String则以 Divider 分割                                                                                  | boolean \| string             | -                                     | false   |
| defaultProps  | 组件的配置                                                                                                                   | object                        | -                                     | {}      |
| formItemProps | 同原生 [FormItem](https://www.antdv.com/components/form-cn#form-item) 配置, 并可以直接使用 `slots` 属性定义 FormItem 的 slot | object                        | -                                     | {}      |
| defaultValue  | 默认值                                                                                                                       | any                           | -                                     | ""      |
| children      | 子组件配置                                                                                                                   | array\<NewbieFormItemConfig\> | -                                     | -       |
| cellProps     | 子组件渲染的[单元格配置](https://www.antdv.com/components/table-cn#column)                                                   | object                        | -                                     | -       |
| customRender  | 自定义渲染函数                                                                                                               | func                          | -                                     | -       |

### `NewbieFormItemConfig.type` 支持组件类型

| Type        | Description          |
| ----------- | -------------------- |
| input       | 输入框               |
| select      | 选择框               |
| remote      | 远程检索             |
| tree-select | 树状选择             |
| date        | 日期选择             |
| time        | 时间选择             |
| switch      | 开关                 |
| radio       | 单选                 |
| checkbox    | 多选                 |
| tag         | 标签输入             |
| address     | 地址选择             |
| cascade     | 级联选择             |
| number      | 数字                 |
| html        | HTML内容             |
| uploader    | 文件上传             |
| editor      | 富文本编辑           |
| text        | 文本显示             |
| group       | 数组组件，用法见示例 |
| slot        | 自定义插槽           |

### `NewbieFormItemConfig.type.remote` 远程搜索特有参数

| Prop name | Description              | Type   | Values        | Default   |
| --------- | ------------------------ | ------ | ------------- | --------- |
| keyword   | 检索时的关键词           | string | -             | "keyword" |
| url       | 检索的url                | string | -             | -         |
| method    | 检索的方法               | string | `get`, `post` | "get"     |
| params    | 检索时的附带参数         | object | -             | {}        |
| onSearch  | 服务器返回参数的处理函数 | func   | -             | null      |

## 方法

| 名称              | 参数                      | 说明                   |
| ----------------- | ------------------------- | ---------------------- |
| isInitializing    | (loading:boolean) => void | 设置表单加载状态       |
| reset             | () => void                | 重置表单               |
| getFormStandalone | () => Object              | 获取一份表单值的复制   |
| getForm           | () => Object              | 获取表单值             |
| setForm           | ({key: value}) => void    | 设置表单一项或多项的值 |
| isDirty           | () => boolean             | 表单是否被污染         |

## Provider

| 名称                             | 参数     | 说明                                                                                             |
| -------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| format                           | Object   | 用于格式化提示的表单数据, 同[useFormFormat](/hooks.html#form-useformformat-form-format-⇒-object) |
| afterFetched(response) => Object | Function | 表单数据获取数据后的回调函数, 参数为请求的 `response`                                            |

```html
<NewbieProvider :form="{format: {boolean: true, date: 'YYYY-MM-DD'}}" />
```

## FAQ

### 如果需要表单使用自定义组件，如何配置？

使用 `formItem.type` 的 `slot` 或者是 `formItem.customRender` 进行自定义组件的渲染 ，示例如下：

1. 使用 `slot` 自定义组件

```html
<NewbieForm>
  <template #input="{submitForm}">
    <a-form-item>blabla</a-form-item>
  </template>
</NewbieForm>
```

```js
{
	key: "input",
	title: "自定义组件",
	type: "slot",
}
```

2. 使用 `customRender` 自定义组件

```js
{
	key: "input",
	title: "自定义组件",
	customRender({submitForm, item}){
	    return h("div", {}, "whatever you want")
	}
}
```

### 如何动态控制表单项是否可见/是否必填/是否禁用？

使用 `formItem.hidden`、`formItem.required`、`formItem.disabled` 控制表单项是否可见/是否必填/是否禁用，这三个参数均可直接传入一个
boolean 值，也可以传入一个函数，函数接收一个参数 `submitForm`，返回一个 boolean 值，示例如下：

```js
{
	key: "input",
	title: "输入 Input",
	hidden: (submitForm) => submitForm.other_item === 'make me hidden', //为 true 时当前表单项隐藏
	required: (submitForm) => submitForm.other_item ==='make me required', //为 true 当前表单项必填
	disabled: (submitForm) => submitForm.other_item ==='make me disabled', //为 true 当前表单项禁用
}
```

### `Group` 数组组件如何使用？

`Group` 数组组件, 其 `type` 为 `group`, 并且使用 `children` 对象数组对子表单进行定义, 定义方式与普通表单项一致,
其 `value` 为一个对象数组, 组件内部自带基础的 `编辑`, `新增`, `删除`功能, 支持通过 `childrenOperations` 属性传入自定义操作,
示例如下：

```js
{
	key: "data_sources",
	title: "数据源",
	type: "group",
	childrenOperations: [{
        name: "推荐",
        props: {
            icon: h(LikeOutlined),
            size: "small",
        },
        action() {},
    }],
	children: [
		{
			title: "数据",
			type: "tree-select",
			key: "category_id",
			width: 300,
			options: [
				{
				}
			}
		}
	]
```

### FormItem的 `match` 如何使用?

当一个字段需要根据不同的条件进行动态渲染时，`match` 方法以 `submitForm` 为参数，返回一个选项配置, 该配置将与 `FormItem`
本身的属性进行合并后重新进行渲染, 也就是相同的属性可以直接定义在 `FormItem` 上, 而不需要再定义在 `match` 上,
相同属性将以 `match` 的配置为准 。示例：

```js
{
    key: "match",
    title: "匹配 Match",
    columnIndex: 1,
    match(submitForm) {
       if (submitForm.input === "1") {
            return { type: "input", placeholder: "这只能一句话" }
       } else {
            return { type: "textarea", placeholder: "这里可以是一段话" }
       }
    },
}
```

### FormItem的 `optional` 如何使用?

有时候一些限制项, 譬如 `是否限制人数`, 需要先选择 `是` 与 `否`, 如果选择`是`之后再填写需要限制的具体人数,
如果 `optional` 为 `true`, 则会渲染一个 `Switch`,
当用户选择`是`以后, 才会展示定义的输入组件（本示例中为 `number`）, 可以填写具体的限制人数. `optional` 参数也可以传一个长度为2的数组,
如: `['限制', '不限制']`,
该参数将做为 `Switch` 的 `checkChildren` 与 `unCheckChildren`

> 注意: 如果 `optional` 搭配的输入组件为 `number`, 那不开启的时候, 该组件会将默认的 `value` 设置为 `0`

```js
{
	key: "limit_num",
	title: "限制人数",
	type: "number",
	optional: true,
}
```

### 如何自定义 FromItem 的属性/slot

`FormItem` 中的 `fromItemProps` 与原生 [FormItem](https://www.antdv.com/components/form-cn#form-item) 的配置相同,
并支持直接传入 `slots` 对象, 用于自定义 `FormItem` 的 `slot`，示例如下：

```js
{
    colon: true,
	slots: {
		tooltip: () => h("div", {}, "whatever you want")
	}
}
```

## 示例

---

<script setup>
import {h} from "vue"; 
import NewbieForm from "@components/form/NewbieForm.jsx";


const getForm = () => {
	return [
        {
            key: "limit_num",
            title: "限制人数 Optional",
            type: "number",
            optional: ['限制', '不限制'],
        },
		{
			key: "address",
			title: "地址 Address",
			type: "address",
		},
		{
			key: "text",
			title: "文本 Text",
			type: "text",
			defaultValue: "默认值",
		},
		{
			key: "input",
			title: "输入 Input",
			columnIndex: 1,
		},
		{
			title: "数据源",
			key: "data_sources",
			type: "group",
			children: [
				{
					title: "数据",
					type: "tree-select",
					key: "category_id",
					width: 300,
					options: [
						{ id: 1, name: "test", children: [{ id: 2, name: "child1" }] },
						{ id: 3, name: "test2" },
					],
					defaultProps: {
						multiple: true,
						treeNodeFilterProp: "name",
						fieldNames: {
							children: "children",
							label: "name",
							value: "id",
						},
					},
				},
				{
					title: "是否分页",
					key: "is_pagination_required",
					type: "switch",
	                width: 200,
					defaultValue: true,
				},
			],
		},
		{
			key: "textarea",
			title: "长文本 Textarea",
			type: "textarea",
			break: "一个新的行",
		},
		{
			key: "password",
			title: "密码 Password",
			type: "password",
			columnIndex: 3,
		},
		{
			key: "editor",
			title: "富文本 Editor",
			type: "editor",
			columnIndex: [0, 1],
		},
		{
			key: "html",
			title: "HTML",
			type: "html",
			defaultValue: "<p style='color: #ff0000; margin: 0;'>插播一条 HTML</p>",
		},
		{
			key: "number",
			title: "数字 Number",
			type: "number",
			columnIndex: 1,
		},
		{
			key: "radio",
			title: "单选 Radio",
			type: "radio",
			options: ["选项1", "选项2"],
			defaultValue: "选项1",
		},
		{
			key: "checkbox",
			title: "多选 Checkbox",
			type: "Checkbox",
			options: ["选项1", "选项2"],
			defaultValue: ["选项1"],
			columnIndex: 1,
		},
		{
			key: "address",
			title: "地址 Address",
			type: "address",
		},
		{
			key: "cascade",
			title: "级联选择器 Cascader",
			type: "cascade",
			columnIndex: 1,
			options: [
				{
					value: "zhejiang",
					label: "Zhejiang",
					children: [
						{
							value: "hangzhou",
							label: "Hangzhou",
							children: [
								{
									value: "xihu",
									label: "West Lake",
								},
							],
						},
					],
				},
				{
					value: "jiangsu",
					label: "Jiangsu",
					children: [
						{
							value: "nanjing",
							label: "Nanjing",
							children: [
								{
									value: "zhonghuamen",
									label: "Zhong Hua Men",
								},
							],
						},
					],
				},
			],
		},
		{
			key: "switch",
			title: "开关 switch",
			type: "switch",
			options: ["开", "关"],
		},
		{
			key: "date",
			title: "日期 Date",
			type: "date",
			defaultProps: {
				onChange: (val) => {
					console.log(val)
				},
			},
		},
		{
			key: "time",
			title: "时间 Time",
			type: "time",
			defaultProps: {
				onChange: (val) => {
					console.log(val)
				},
			},
		},
		{
			key: "tag",
			title: "标签 Tag",
			type: "tag",
		},
		{
			key: "remote",
			title: "远程检索 Remote",
			type: "remote",
			url: "https://suggest.taobao.com/sug",
			keyword: "q",
			onSearch: (res) => {
				return res.result.map((item) => {
					return {
						label: item[0],
						value: item[1],
					}
				})
			},
		},
		{
			key: "select",
			title: "选择 Select",
			type: "select",
			options: [
				{
					label: "选项1",
					value: "1",
				},
				{
					label: "选项2",
					value: "2",
				},
			],
		},
		{
			key: "tree-select",
			title: "树型选择 TreeSelect",
			type: "tree-select",
			options: [
				{
					label: "parent",
					value: "parent",
					children: [
						{
							label: "parent 1",
							value: "parent 1",
							children: [
								{
									label: "parent 1-0",
									value: "parent 1-0",
									children: [
										{
											label: "my leaf",
											value: "leaf1",
										},
										{
											label: "your leaf",
											value: "leaf2",
										},
									],
								},
								{
									label: "parent 1-1-1",
									value: "parent 1-1-1",
								},
							],
						},
						{
							label: "parent 1-1",
							value: "parent 1-1",
						},
					],
				},
			],
		},
	]
}
</script>

<NewbieForm :form="getForm()" :columns="[24]" card-wrapper title="测试表单" :closable="false">
    <template #prepend>
        <p>Prepend</p>
    </template>
    <template #append>
        <p>Append</p>
    </template>
</NewbieForm>

```vue
<template>
  <NewbieForm :form="getForm()" :columns="[24]" card-wrapper title="测试表单" :closable="false">
    <template #prepend>
      <p>Prepend</p>
    </template>
    <template #append>
      <p>Append</p>
    </template>
  </NewbieForm>
</template>

<script setup>
import { h } from "vue";
import { NewbieForm } from "jobsys-newbie";

const getForm = () => {
  return [
    {
      key: "limit_num",
      title: "限制人数 Optional",
      type: "number",
      optional: ["限制", "不限制"],
    },
    {
      key: "address",
      title: "地址 Address",
      type: "address",
    },
    {
      key: "text",
      title: "文本 Text",
      type: "text",
      defaultValue: "默认值",
    },
    {
      key: "input",
      title: "输入 Input",
      columnIndex: 1,
    },
    {
      title: "数据源",
      key: "data_sources",
      type: "group",
      children: [
        {
          title: "数据",
          type: "tree-select",
          key: "category_id",
          width: 300,
          options: [
            { id: 1, name: "test", children: [{ id: 2, name: "child1" }] },
            { id: 3, name: "test2" },
          ],
          defaultProps: {
            multiple: true,
            treeNodeFilterProp: "name",
            fieldNames: {
              children: "children",
              label: "name",
              value: "id",
            },
          },
        },
        {
          title: "是否分页",
          key: "is_pagination_required",
          type: "switch",
          defaultValue: true,
        },
      ],
    },
    {
      key: "textarea",
      title: "长文本 Textarea",
      type: "textarea",
      break: "一个新的行",
    },
    {
      key: "password",
      title: "密码 Password",
      type: "password",
      columnIndex: 3,
    },
    {
      key: "editor",
      title: "富文本 Editor",
      type: "editor",
      columnIndex: [0, 1],
    },
    {
      key: "html",
      title: "HTML",
      type: "html",
      defaultValue: "<p style='color: #ff0000; margin: 0;'>插播一条 HTML</p>",
    },
    {
      key: "number",
      title: "数字 Number",
      type: "number",
      columnIndex: 1,
    },
    {
      key: "radio",
      title: "单选 Radio",
      type: "radio",
      options: ["选项1", "选项2"],
      defaultValue: "选项1",
    },
    {
      key: "checkbox",
      title: "多选 Checkbox",
      type: "Checkbox",
      options: ["选项1", "选项2"],
      defaultValue: ["选项1"],
      columnIndex: 1,
    },
    {
      key: "address",
      title: "地址 Address",
      type: "address",
    },
    {
      key: "cascade",
      title: "级联选择器 Cascader",
      type: "cascade",
      columnIndex: 1,
      options: [
        {
          value: "zhejiang",
          label: "Zhejiang",
          children: [
            {
              value: "hangzhou",
              label: "Hangzhou",
              children: [
                {
                  value: "xihu",
                  label: "West Lake",
                },
              ],
            },
          ],
        },
        {
          value: "jiangsu",
          label: "Jiangsu",
          children: [
            {
              value: "nanjing",
              label: "Nanjing",
              children: [
                {
                  value: "zhonghuamen",
                  label: "Zhong Hua Men",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: "switch",
      title: "开关 switch",
      type: "switch",
      options: ["开", "关"],
    },
    {
      key: "date",
      title: "日期 Date",
      type: "date",
      defaultProps: {
        onChange: val => {
          console.log(val);
        },
      },
    },
    {
      key: "time",
      title: "时间 Time",
      type: "time",
      defaultProps: {
        onChange: val => {
          console.log(val);
        },
      },
    },
    {
      key: "tag",
      title: "标签 Tag",
      type: "tag",
    },
    {
      key: "remote",
      title: "远程检索 Remote",
      type: "remote",
      url: "https://suggest.taobao.com/sug",
      keyword: "q",
      onSearch: res => {
        return res.result.map(item => {
          return {
            label: item[0],
            value: item[1],
          };
        });
      },
    },
    {
      key: "select",
      title: "选择 Select",
      type: "select",
      options: [
        {
          label: "选项1",
          value: "1",
        },
        {
          label: "选项2",
          value: "2",
        },
      ],
    },
    {
      key: "tree-select",
      title: "树型选择 TreeSelect",
      type: "tree-select",
      options: [
        {
          label: "parent",
          value: "parent",
          children: [
            {
              label: "parent 1",
              value: "parent 1",
              children: [
                {
                  label: "parent 1-0",
                  value: "parent 1-0",
                  children: [
                    {
                      label: "my leaf",
                      value: "leaf1",
                    },
                    {
                      label: "your leaf",
                      value: "leaf2",
                    },
                  ],
                },
                {
                  label: "parent 1-1-1",
                  value: "parent 1-1-1",
                },
              ],
            },
            {
              label: "parent 1-1",
              value: "parent 1-1",
            },
          ],
        },
      ],
    },
  ];
};
</script>
```

## 开发

### 如何添加一个新的表单组件?

1. 添加初始化值的处理 `form/utils/initItemDefaultValue`
2. 编写组件主体 `form/compeonnts/NewComponent.jsx`
3. 将组件添加到 `form/components/index.js`
4. 在 `FormItem` 中添加新的类型渲染 `form/components/FormItem.jsx`
