## 详细参数

### `beforeClose`

| Prop name  | Description          | Type            | Values | Default |
| ---------- | -------------------- | --------------- | ------ | ------- |
| title      | Modal 提示框的 title | string          | -      | ""      |
| content    | Modal 提示框的内容   | string          | -      | ""      |
| okText     | 确认按钮的文字       | string          | -      | "确定"  |
| cancelText | 取消按钮的文字       | string          | -      | "取消"  |
| trigger    | 是否出现提示框       | func \| boolean | -      | false   |

## 示例

---

<script setup>
import { Button } from "ant-design-vue";
import { ref } from "vue";
import NewbieModal from "@components/modal/NewbieModal.jsx"

const modalVisible = ref(false);
const drawerVisible = ref(false);
</script>

<Button @click="modalVisible = true" type="primary">弹出Modal</Button>
<NewbieModal v-model:visible="modalVisible" title="这里是标题">这里是内容</NewbieModal>

```vue
<Button @click="modalVisible = true" type="primary">弹出Modal</Button>
<NewbieModal v-model:visible="modalVisible" title="这里是标题">这里是内容</NewbieModal>
```

---

<Button @click="drawerVisible = true" type="primary" style="margin-top: 20px;">弹出Drawer</Button>
<NewbieModal v-model:visible="drawerVisible" type="drawer" title="这里是标题">这里是内容</NewbieModal>

```vue
<Button @click="drawerVisible = true" type="primary" style="margin-top: 20px;">弹出Drawer</Button>
<NewbieModal
  v-model:visible="drawerVisible"
  type="drawer"
  title="这里是标题"
>这里是内容</NewbieModal>
```
