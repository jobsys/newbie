## 示例

---

<script setup>
import { ref, h } from "vue";
import {Space} from "antdv-next";
import {EditOutlined, SaveOutlined} from "@antdv-next/icons";
import NewbieButton from "@components/button/NewbieButton.jsx";

const fetcher = ref({loading: false});

const onSave = () => {
    fetcher.value.loading = true;

    setTimeout(() => {
        fetcher.value.loading = false
    }, 2000)
}
</script>

<Space>

<NewbieButton>默认</NewbieButton>
<NewbieButton type="primary">点我</NewbieButton>
<NewbieButton type="primary" size="small">小点</NewbieButton>
<NewbieButton type="primary" size="large">大点</NewbieButton>
<NewbieButton type="primary" danger>危险</NewbieButton>
<NewbieButton type="primary" danger disabled>禁用</NewbieButton>

</Space>

```vue
<NewbieButton>默认</NewbieButton>
<NewbieButton type="primary">点我</NewbieButton>
<NewbieButton type="primary" size="small">点我</NewbieButton>
<NewbieButton type="primary" size="larger">点我</NewbieButton>
<NewbieButton type="primary" danger>危险</NewbieButton>
<NewbieButton type="primary" danger disabled>危险</NewbieButton>
```

---

<Space>
<NewbieButton type="primary" :icon="h(EditOutlined)" label="编辑"></NewbieButton>
<NewbieButton type="primary" :icon="h(EditOutlined)" label="编辑" icon-position="right"></NewbieButton>
</Space>

```vue
<NewbieButton type="primary" :icon="h(EditOutlined)" label="编辑"></NewbieButton>
<NewbieButton
  type="primary"
  :icon="h(EditOutlined)"
  icon-position="right"
  label="编辑"
></NewbieButton>
```

---

<NewbieButton type="primary" :fetcher="fetcher" :icon="h(SaveOutlined)" label="保存" @click="onSave"></NewbieButton>

```vue
<template>
  <NewbieButton
    type="primary"
    :fetcher="fetcher"
    :icon="h(SaveOutlined)"
    label="保存"
    @click="onSave"
  ></NewbieButton>
</template>

<script setup>
import { NewbieButton } from "jobsys-newbie";
import { h } from "vue";
import { SaveOutlined } from "@antdv-next/icons";

const fetcher = ref({ loading: false });

const onSave = () => {
  fetcher.value.loading = true;

  setTimeout(() => {
    fetcher.value.loading = false;
  }, 2000);
};
</script>
```
