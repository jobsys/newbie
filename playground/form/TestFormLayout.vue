<template>
  <NewbieForm
    :form="getForm"
    :columns="[12, 12]"
    card-wrapper
    title="双列布局 · 跨行字段"
    :closable="false"
  />

  <NewbieForm
    :form="getGroupForm"
    break-mode="collapse"
    :columns="[12, 12]"
    card-wrapper
    title="分组折叠样式"
    :closable="false"
  />
</template>

<script setup>
import NewbieForm from "../../components/form/NewbieForm.jsx";

const avatarField = override => ({
  key: "avatar",
  title: "头像",
  // 多列布局下让该字段占用两行
  rowSpan: 2,
  type: "uploader",
  required: true,
  columnIndex: 1,
  defaultProps: {
    type: "picture-card",
    accept: ".png,.jpg,.jpeg",
    maxNum: 1,
  },
  ...override,
});

const getForm = () => [
  {
    key: "name",
    title: "姓名",
    required: true,
  },
  avatarField(),
  {
    key: "phone",
    title: "手机号",
  },
  {
    key: "email",
    title: "邮箱",
    columnIndex: 1,
  },
  {
    key: "address",
    title: "地址",
    type: "address",
  },
  {
    key: "intro",
    title: "简介",
    type: "textarea",
  },
];

const getGroupForm = () => [
  {
    break: "基本信息",
    key: "name2",
    title: "姓名",
    required: true,
  },
  avatarField({ key: "avatar2" }),
  {
    key: "phone2",
    title: "手机号",
  },
  {
    key: "email2",
    title: "邮箱",
    columnIndex: 1,
  },
  {
    break: "学籍信息",
    key: "school",
    title: "学校",
  },
  {
    key: "major",
    title: "专业",
    columnIndex: 1,
  },
  {
    key: "remark",
    title: "备注",
    type: "textarea",
  },
];
</script>
