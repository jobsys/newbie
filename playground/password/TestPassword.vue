<template>
  <div>
    <Button @click="onGetContent">获取内容</Button>
    <NewbiePassword v-model:value="content" style="height: 500px"></NewbiePassword>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { Button } from "ant-design-vue";
import NewbiePassword from "../../components/password/NewbiePassword.jsx";

const content = ref("");

const onGetContent = () => {
  console.log(content.value);
};
</script>
