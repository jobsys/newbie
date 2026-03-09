<template>
  <div style="height: 100vh">
    <NewbieFormDesigner
      title="助学金申请对象情况调查 - 题目表单"
      :widgets="widgets"
      @submit="onSubmit"
      :form-items="formItems"
      mode="quiz"
    ></NewbieFormDesigner>
  </div>
</template>
<script setup>
import { ref } from "vue";

const widgets = ref([
  {
    title: "拓展组件",
    children: [
      {
        name: "手机号码",
        type: "input",
        props: {
          rules: [
            {
              pattern: "^1[3456789]\\d{9}$",
              message: "手机号码格式不正确",
            },
          ],
        },
      },
    ],
  },
]);
const formItems = ref([
  {
    key: "656gqnzs05cxpulqiihb6",
    placeholder: "请填写内容",
    title: "文本",
    type: "input",
    width: "100%",
  },
]);

const onSubmit = form => {
  console.log(form);
};
</script>
