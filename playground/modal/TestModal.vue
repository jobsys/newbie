<template>
  <div>
    <Space>
      <Button type="primary" @click="showModal = true">Modal</Button>
      <Button type="primary" @click="showDrawer = true">Drawer</Button>
    </Space>
    <NewbieModal
      title="Modal"
      v-model:visible="showModal"
      type="modal"
      :before-close="onBeforeClose"
    ></NewbieModal>
    <NewbieModal
      title="Drawer"
      v-model:visible="showDrawer"
      type="drawer"
      :modal-props="{ maskClosable: true }"
    >
      <Button type="primary" @click="showInnerDrawer = true">Drawer</Button>
      <NewbieModal
        title="Drawer"
        v-model:visible="showInnerDrawer"
        type="drawer"
        :before-close="{ content: '表单已修改，是否放弃本次修改？', trigger: formRef?.isDirty }"
      >
        第二层内容
      </NewbieModal>
    </NewbieModal>
    <!-- <NewbieModal
			title="Drawer"
			v-model:visible="showDrawer"
			type="drawer"
			:before-close="{ content: '表单已修改，是否放弃本次修改？', trigger: formRef?.isDirty }"
		>
			<Button type="primary" @click="showInnerDrawer = true">Drawer</Button>
			<NewbieModal
				title="Drawer"
				v-model:visible="showInnerDrawer"
				type="drawer"
				:before-close="{ content: '表单已修改，是否放弃本次修改？', trigger: formRef?.isDirty }"
			>
				第二层内容
			</NewbieModal>
		</NewbieModal> -->
  </div>
</template>
<script setup>
import { h, ref } from "vue";
import { Button, Modal, Space } from "ant-design-vue";
import NewbieModal from "../../components/modal/NewbieModal";
import NewbieForm from "../../components/form/NewbieForm";
import { SmileOutlined } from "@ant-design/icons-vue";

const formRef = ref(null);

const showModal = ref(false);
const showDrawer = ref(false);
const showInnerDrawer = ref(false);

const onBeforeClose = () =>
  new Promise(resolve => {
    if (formRef.value.isDirty()) {
      Modal.confirm({
        content: "表单已修改，是否放弃本次修改？",
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    } else {
      resolve(true);
    }
  });

const getForm = () => [
  {
    title: "用户名",
    key: "name",
    required: true,
    help: () =>
      h("div", [
        h(SmileOutlined, { style: { color: "red", display: "inline-block" } }),
        h("span", { style: { display: "inline-block" } }, " 请输入用户名"),
      ]),
  },
  { title: "密码", key: "password" },
];
</script>
