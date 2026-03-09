<template>
  <div>
    <p>{{ useAddressFullCode("440103") }}</p>
    <p>所选地区结果：{{ `[${content ? content.join(",") : ""}]` }}</p>
    <NewbieAddress v-model:value="content" style="width: 300px"></NewbieAddress>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { NewbieAddress, useAddressFullCode } from "../../components";

const content = ref(["440000", "440100", "440103"]);
</script>
