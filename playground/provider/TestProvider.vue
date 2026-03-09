<template>
  <div>
    <NewbieProvider v-bind="provider">
      <Button @click="onGetContent">获取内容</Button>
      <NewbieEditor v-model:value="content" style="height: 500px"></NewbieEditor>
    </NewbieProvider>
  </div>
</template>
<script setup>
import { NewbieEditor, NewbieProvider } from "../../components";
import { ref } from "vue";
import { Button } from "ant-design-vue";

const content = ref("");

/**
 * @type {ProviderProps}
 */
const provider = {
  table: {
    page: 1,
    pageSize: 10,
    afterFetched: res => ({
      items: res.result.data,
      totalSize: res.result.total,
    }),
  },
};

const onGetContent = () => {
  console.log(content.value);
};
</script>
