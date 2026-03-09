<template>
  <NewbieTable
    title="话题列表"
    :form-data="state.data"
    submit-url="http://xx.com"
    row-selection
    :columns="columns()"
    :card-wrapper="false"
    :editable="true"
    :before-cell-submit="onBeforeCellSubmit"
    :search-slots="searchSlots"
    @row-click="({ record }) => console.log(record)"
  >
    <template #functional>
      <Space>
        <Button type="primary">Functional1</Button>
        <Button type="default">Functional2</Button>
      </Space>
    </template>
    <template #prepend>
      <Space>
        <Button type="primary">Prepend1</Button>
        <Button type="default">Prepend2</Button>
      </Space>
    </template>
    <template #append>
      <Space>
        <Button type="primary">Append1</Button>
        <Button type="default">Append2</Button>
      </Space>
    </template>
  </NewbieTable>
</template>
<script setup>
import { useTableActions } from "../../components";
import { h, reactive } from "vue";
import { Button, message, Space } from "ant-design-vue";
import NewbieTable, { useTableFile } from "../../components/table/NewbieTable.jsx";

import { DeleteOutlined, EditOutlined, LikeOutlined, QrcodeOutlined } from "@ant-design/icons-vue";

const state = reactive({
  data: [
    { id: 1, name: "话题1", switch: true, number: 123 },
    { id: 2, name: "话题2", switch: false, number: 234 },
    /*{ id: 3, name: "话题3" },
        { id: 4, name: "话题4" },
        { id: 5, name: "话题5" },*/
  ],

  options: [
    { label: "话题1", value: 1 },
    { label: "话题2", value: 2 },
  ],
});

const openModal = () => {
  state.showModal = true;
};

const searchSlots = {
  number: ({ item }) => h("div", {}, item.title),
};

const onBeforeCellSubmit = data => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 5000);
  });
};

const columns = () => {
  return [
    {
      title: "#",
      dataIndex: "id",
      width: 40,
      onCopy: true,
    },
    {
      title: "学号",
      dataIndex: "number",
      width: 100,
      filterable: {},
    },
    {
      title: "Switch",
      dataIndex: "switch",
      width: 100,
      align: "center",
      editable: {
        type: "switch",
        options: ["激活", "失活"],
      },
      customRender: ({ record }) => {
        return record.switch ? "激活" : "失活";
      },
    },
    {
      title: "话题名称",
      dataIndex: "name",
      tooltip: () => h("div", { style: { paddingLeft: "20px" } }, "话题名称12312312"),
      //minWidth: 100,
      width: 100,
      editable: {
        type: "select",
        options: state.options,
      },
      align: "center",
      /*onClick: ({ record }) => {
                message.success(record.name)
            },*/
    },
    {
      title: "操作",
      width: 300,
      key: "operation",
      align: "center",
      fixed: "right",
      customRender() {
        return useTableActions([
          {
            name: "二维码",
            props: {
              icon: h(QrcodeOutlined),
              size: "small",
            },
            action() {
              console.log("二维码");
            },
          },
          {
            name: "推荐至分类",
            props: {
              icon: h(LikeOutlined),
              size: "small",
            },
            action() {
              console.log("推荐至分类");
            },
          },
          {
            name: "更多",
            children: [
              {
                name: "编辑",
                props: {
                  icon: h(EditOutlined),
                  size: "small",
                },
                action() {
                  console.log("edit");
                },
              },
              {
                name: "删除",
                props: {
                  icon: h(DeleteOutlined),
                  size: "small",
                },
                action() {
                  console.log("delete");
                },
              },
            ],
          },
        ]);
      },
    },
  ];
};
</script>
