<script setup>
import NewbieProvider from "../components/provider/NewbieProvider.jsx";
import TestAddress from "./address/TestAddress.vue";
import TestPassword from "./password/TestPassword.vue";
import TestSearch from "./search/TestSearch.vue";
import TestTable from "./table/TestTable.vue";
import TestArrayDataIndex from "./table/TestArrayDataIndex.vue";
import TestEmptyOverflow from "./table/TestEmptyOverflow.vue";
import TestUploader from "./uploader/TestUploader.vue";
import TestModal from "./modal/TestModal.vue";
import TestForm from "./form/TestForm.vue";
import TestFormLayout from "./form/TestFormLayout.vue";
import TestFormDesigner from "./form-designer/TestFormDesigner.vue";
import TestEditor from "./editor/TestEditor.vue";
import TestCopy from "./copy/TestCopy.vue";
import TestSignaturePad from "./signature-pad/TestSignaturePad.vue";

import zhCN from "antdv-next/locale/zh_CN"; // 引入中文语言包
import enUS from "antdv-next/locale/en_US"; // 引入英文语言包
import { reactive, ref, shallowRef } from "vue";
import {find} from "lodash-es";

// 定义支持的语言
const locales = {
  zh_CN: zhCN,
  en_US: enUS,
};

const providers = reactive({
  config: {
    table: {
      pageSizeKey: "page_size",
      afterFetched: res => ({
        items: res.result.data,
        totalSize: res.result.total,
      }),
    },
    form: {
      columns: {},
    },
    search: {
      valueFormatter: {
        date(value) {
          return value.format("YYYY-MM-DD");
        },
      },
    },
    uploader: {
      uploadUrl: "/index.php/tool/test_upload",
      // 只覆盖 url，其余字段由 uploader 默认值深合并
      defaultFileItem: {
        url: "url",
      },
    },
  },
  locale: "zh_CN",
});

const checked = ref("Form");
const density = ref("default");
const primaryColor = ref("#1677ff");
const dark = ref(false);
const densityOptions = [
  { label: "紧凑", value: "compact" },
  { label: "默认", value: "default" },
  { label: "宽松", value: "loose" },
];
const colorOptions = [
  { label: "拂晓蓝", value: "#1677ff" },
  { label: "暖橙", value: "#c2410c" },
  { label: "青绿", value: "#0b6b4d" },
  { label: "紫罗兰", value: "#7048e8" },
];
const isComponent = shallowRef();
const options = shallowRef([
  {
    label: "Form",
    value: "Form",
    component: TestForm,
  },
  {
    label: "FormLayout",
    value: "FormLayout",
    component: TestFormLayout,
  },
  {
    label: "Address",
    value: "Address",
    component: TestAddress,
  },
  {
    label: "Modal",
    value: "Modal",
    component: TestModal,
  },
  {
    label: "Editor",
    value: "Editor",
    component: TestEditor,
  },
  {
    label: "Search",
    value: "Search",
    component: TestSearch,
  },
  {
    label: "Uploader",
    value: "Uploader",
    component: TestUploader,
  },
  {
    label: "Password",
    value: "Password",
    component: TestPassword,
  },
  {
    label: "Table",
    value: "Table",
    component: TestTable,
  },
  {
    label: "ArrayDataIndex",
    value: "ArrayDataIndex",
    component: TestArrayDataIndex,
  },
  {
    label: "EmptyOverflow",
    value: "EmptyOverflow",
    component: TestEmptyOverflow,
  },
  {
    label: "FormDesigner",
    value: "FormDesigner",
    component: TestFormDesigner,
  },
  {
    label: "Copy",
    value: "Copy",
    component: TestCopy,
  },
  {
    label: "SignaturePad",
    value: "SignaturePad",
    component: TestSignaturePad,
  },
]);

if (window.location.hash) {
  checked.value = window.location.hash.replace("#", "");
}

const showComponent = () => {
  isComponent.value = find(options.value, { value: checked.value }).component;
};

showComponent();
const changeComponent = e => {
  window.location.hash = e.target.value;
  showComponent();
};
</script>

<template>
  <NewbieThemeProvider :locale="locales[providers.locale]" :density="density" :color-primary="primaryColor" :scheme="dark ? 'dark' : 'light'">
    <NewbieProvider v-bind="providers">
      <div style="display: flex; gap: 12px; align-items: center; padding: 12px 20px 0;">
        <span>密度：</span>
        <a-segmented v-model:value="density" :options="densityOptions" />
        <span>主色：</span>
        <a-select v-model:value="primaryColor" :options="colorOptions" style="width: 160px" />
        <span>暗色：</span>
        <a-switch v-model:checked="dark" />
        <span style="color: #999">{{ density }} / {{ primaryColor }}</span>
      </div>
      <div>
        <a-select
          v-model:value="providers.locale"
          :options="[
            {
              label: '中文',
              value: 'zh_CN',
            },
            {
              label: '英文',
              value: 'en_US',
            },
          ]"
        ></a-select>
      </div>
      <div
        style="
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 20px 0;
          background-color: #f0f0f0;
        "
      >
        <a-radio-group v-model:value="checked" button-style="solid" @change="changeComponent">
          <a-radio-button v-for="item in options" :key="item.value" :value="item.value"
            >{{ item.label }}
          </a-radio-button>
        </a-radio-group>
      </div>

      <div style="padding: 20px; background-color: #f0f0f0;">
        <component v-if="isComponent" :is="isComponent"></component>
      </div>
    </NewbieProvider>
  </NewbieThemeProvider>
</template>

<style>
/**
 * Temporary fix antd modal issue
 */
.ant-modal div[aria-hidden="true"] {
  display: none !important;
}
</style>
