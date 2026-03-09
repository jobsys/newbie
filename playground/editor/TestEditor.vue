<template>
  <div>
    <Button @click="onGetContent">获取内容</Button>
    <NewbieEditor v-model:value="content" style="height: 500px"></NewbieEditor>
  </div>
</template>
<script setup>
import NewbieEditor from "../../components/editor/NewbieEditor";
import { ref } from "vue";
import { Button } from "ant-design-vue";

const content = ref("");

const onGetContent = () => {
  console.log(content.value);
};
</script>
