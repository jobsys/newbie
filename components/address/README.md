## 数据格式

```json
{
        "value": "440000",
        "alias": "广东省",
        "label": "广东",
        "children": [
	            "value": "440100",
                "alias": "广东省广州市",
                "label": "广州",
                "children": [
                    { "value": "440101", "alias": "广东省广州市", "label": "广州" },
                ]
        ]
}
```

## 示例

---

<script setup>
import { ref } from "vue";
import NewbieAddress from "@components/address/NewbieAddress.jsx";

const content = ref(["440000", "440100", "440103"])
</script>

<p>所选地区结果：{{ `[${content ? content.join(",") : ""}]` }}</p>
<NewbieAddress v-model:value="content" style="width: 300px"></NewbieAddress>

```vue
<script setup>
import { ref } from "vue";
import { NewbieAddress } from "jobsys-newbie";

const content = ref(["440000", "440100", "440103"]);
</script>

<template>
  <div>
    <NewbieAddress v-model:value="content" style="width: 300px"></NewbieAddress>
    <p>所选地区结果：{{ `[${content ? content.join(",") : ""}]` }}</p>
  </div>
</template>
```
