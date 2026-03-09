<template>
  <div>
    <NewbieProvider v-bind="provider">
      <NewbieUploader
        v-model:value="fileList"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      ></NewbieUploader>
      <NewbieUploader
        v-model:value="files"
        type="file"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
      ></NewbieUploader>
    </NewbieProvider>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { NewbieProvider, NewbieUploader } from "../../components";

const fileList = ref([
  {
    uid: "-1",
    name: "image.png",
    status: "done",
    url: "https://aliyuncdn.antdv.com/logo.png",
  },
  {
    uid: "-5",
    name: "image.png",
    status: "error",
  },
]);

const files = ref(null);

const provider = {
  uploader: {
    uploadUrl: "",
    defaultFileItem: {
      id: "id",
      name: "name",
      url: "url",
      path: "path",
      thumbUrl: "thumbUrl",
    },
  },
};
</script>
