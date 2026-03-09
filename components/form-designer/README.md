## 详细参数

### `widget`

| Prop name | Description    | Type   | Values | Default |
| --------- | -------------- | ------ | ------ | ------- |
| name      | 组件名称       | string | -      | ""      |
| type      | 组件实际类型   | string | -      | ""      |
| icon      | 组件图标       | string | -      | ""      |
| props     | 组件的预设配置 | obj    | -      | null    |

```json
{
    name: "年龄",
    type: "number",
    icon: h(SmileOutlined),
    props: {
        min: 18
    }
}
```

## 示例

<script setup>
import {ref} from "vue";
import NewbieFormDesigner from "@components/form-designer/NewbieFormDesigner.jsx";

const widgets = ref([]);

const onSubmit = (form) => {
    console.log(form)
}
</script>

<NewbieFormDesigner height="500" :widgets="widgets" @submit="onSubmit"/>

```vue
<script setup>
import NewbieFormDesigner from "jobsys-newbie";

const widgets = ref([]);

const onSubmit = form => {
  console.log(form);
};
</script>

<NewbieFormDesigner height="500" :widgets="widgets" @submit="onSubmit" />
```
