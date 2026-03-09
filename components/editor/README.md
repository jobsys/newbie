## 方法

| 名称       | 参数                     | 说明           |
| ---------- | ------------------------ | -------------- |
| setContent | (content:string) => void | 设置编辑器内容 |

## Provider

| 名称      | 参数   | 说明                        |
| --------- | ------ | --------------------------- |
| uploadUrl | string | 编辑器中的图片,文件上传路径 |

```html
<NewbieProvider :eidtor="{uploadeUrl: 'somewhere-that-can-upload-files'}" />
```

## 示例

---

<script setup>  
import { message, Button } from "ant-design-vue";
import { ref } from "vue";
import NewbieEditor from "@components/editor/NewbieEditor.jsx";

const content = ref('');

const getContent = () => {
    message.success(content.value)
}
</script>

<Button type="primary" @click="getContent">获取内容</Button>

---

<NewbieEditor v-model:value="content" placeholder="来吧，写吧" />

```vue
<template>
  <Button type="primary" @click="getContent">获取内容</Button>
  <NewbieEditor v-model:value="content" placeholder="来吧，写吧" />
</template>

<script setup>
import { NewbieEditor } from "jobsys-newbie";
import { message, Button } from "ant-design-vue";
import { ref } from "vue";

const content = ref("");

const getContent = () => {
  message.success(content.value);
};
</script>
```
