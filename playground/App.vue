<script setup>
import NewbieProvider from "../components/provider/NewbieProvider.jsx";
import TestAddress from "./address/TestAddress.vue";
import TestPassword from "./password/TestPassword.vue";
import TestSearch from "./search/TestSearch.vue";
import TestTable from "./table/TestTable.vue";
import TestUploader from "./uploader/TestUploader.vue";
import TestModal from "./modal/TestModal.vue";
import TestForm from "./form/TestForm.vue";
import TestFormDesigner from "./form-designer/TestFormDesigner.vue";
import TestEditor from "./editor/TestEditor.vue";
import TestCopy from "./copy/TestCopy.vue";
import TestSignaturePad from "./signature-pad/TestSignaturePad.vue";

import zhCN from "ant-design-vue/es/locale/zh_CN"; // 引入中文语言包
import enUS from "ant-design-vue/es/locale/en_US"; // 引入英文语言包

import { reactive, ref, shallowRef } from "vue";
import { find } from "lodash-es";

// 定义支持的语言
const locales = {
  zh_CN: zhCN,
  en_US: enUS,
};

const providers = reactive({
  table: {
    pageSizeKey: "page_size",
    afterFetched: res => ({
      items: res.result.data,
      totalSize: res.result.total,
    }),
  },
  form: {
    columns: {
      /*	switch: {
                    defaultProps: {
                        checkedValue: 1,
                        unCheckedValue: 0,
                    },
                    defaultValue: 1,
                },*/
    },
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
    defaultFileItem: {
      id: "id",
      name: "name",
      url: "url",
      path: "path",
      thumbUrl: "thumbUrl",
    },
  },
  locale: "zh_CN",
});

const checked = ref("Form");
const isComponent = shallowRef();
const options = shallowRef([
  {
    label: "Form",
    value: "Form",
    component: TestForm,
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
  <a-config-provider :locale="locales[providers.locale]">
    <NewbieProvider v-bind="providers">
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

      <div style="padding: 20px">
        <component v-if="isComponent" :is="isComponent"></component>
      </div>
    </NewbieProvider>
  </a-config-provider>
</template>

<style>
/**
 * Temporary fix antd modal issue
 */
.ant-modal div[aria-hidden="true"] {
  display: none !important;
}
</style>
