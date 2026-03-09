<template>
  <div>
    <Button @click="() => counter++">获取内容</Button>

    <Button @click="() => (visible = !visible)">获取内容</Button>

    <DatePicker v-model:value="content"></DatePicker>

    <Button @click="() => (showEditorModal = true)">展示</Button>

    <NewbieForm
      :form="getForm"
      break-mode="collapse"
      card-wrapper
      title="测试表单"
      :before-submit="onBeforeSubmit"
      :extra-data="{ id: '' }"
      :closable="false"
      :card-slots="cardSlots"
    >
      <template #prepend>
        <p>Prepend</p>
      </template>
      <template #append>
        <p>Append</p>
      </template>
    </NewbieForm>

    <NewbieModal
      v-model:visible="showEditorModal"
      type="drawer"
      width="1400"
      title="物资编辑"
    ></NewbieModal>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { Button, DatePicker } from "ant-design-vue";
import { useModalConfirm } from "../../hooks/index.js";

const content = ref("");
const counter = ref(0);
const visible = ref(false);
const showEditorModal = ref(false);

const onBeforeSubmit = ({ formatForm }) => {
  useModalConfirm("确定提交吗？", () => {
    console.log(formatForm);
  });
  return false;
};

const cardSlots = {
  extra: () => {
    return "extra";
  },
};

const getForm = () => {
  return [
    {
      title: "Shipping Number",
      key: "area",
      type: "address",
    },
    {
      title: "Combine Time",
      type: "group",
      key: "group_time",
      children: [
        {
          key: "time",
          type: "time",
          defaultProps: {
            format: "HH:mm",
            type: "range",
          },
        },
        {
          key: "time1",
          type: "time",
          defaultProps: {
            format: "HH:mm",
          },
        },
      ],
    },
    {
      title: "年度",
      type: "combiner",
      children: [
        {
          type: "date",
          key: "start_year",
        },
        {
          type: "plain",
          key: "decorator",
          defaultValue: "至",
        },
        {
          type: "date",
          key: "end_year",
        },
      ],
    },
    /*{
            key: "rate-radio",
            title: "RateRadio",
            type: "rate-radio",
            options: [
                { value: "选项一", rate: 1 },
                { value: "选项二", rate: 2 },
                { value: "选项三", rate: 3 },
            ],
            defaultValue: {
                value: "选项二",
                rate: 2,
            },
            defaultProps: {
                optionType: "outlined",
            },
            style: {
                display: "flex",
                flexDirection: "column",
            },
        },
        {
            key: "rate-checkbox",
            title: "RateCheckbox",
            type: "rate-checkbox",
            options: [
                { value: "选项一", rate: 1 },
                { value: "选项二", rate: 2 },
                { value: "选项三", rate: 3 },
            ],
            defaultValue: [
                {
                    value: "选项二",
                    rate: 2,
                },
                {
                    value: "选项三",
                    rate: 3,
                },
            ],
        },*/
    /*{
            key: "avatar",
            title: "头像",
            type: "uploader",
            tips: "不超过10M",
            required: true,
            defaultValue: [{ url: "https://aliyuncdn.antdv.com/logo.png", path: "logo.png" }],
            defaultProps: {
                accept: ".png,.jpg,.jpeg",
                action: "http://transit.test/api/v1/driver/tool/upload",
                maxSize: 10,
                maxNum: 3,
                disk: "private",
                multipart: true,
                type: "text",
            },
        },
        {
            title: "正则测试",
            key: "regex",
            rules: [useRegexRule("ip", { mode: "positive" })],
        },*/
    /*{
            break: "test",
            key: "defaultPeriods",
            title: "默认预约时段",
            type: "tag",
            defaultProps: {
                inputType: "timerange",
            },
        },
        {
            break: "基本信息",
            key: "cascade",
            title: "级联选择器 Cascader",
            type: "cascade",
            columnIndex: 1,
            defaultValue: "xihu",
            options: [
                {
                    value: "zhejiang",
                    label: "Zhejiang",
                    children: [
                        {
                            value: "hangzhou",
                            label: "Hangzhou",
                            children: [
                                {
                                    value: "xihu",
                                    label: "West Lake",
                                },
                            ],
                        },
                    ],
                },
                {
                    value: "jiangsu",
                    label: "Jiangsu",
                    children: [
                        {
                            value: "nanjing",
                            label: "Nanjing",
                            children: [
                                {
                                    value: "zhonghuamen",
                                    label: "Zhong Hua Men",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            key: "optional",
            title: "可选 Optional",
            optional: ["是", "否"],
            width: 300,
            type: "select",
            options: ["很好", "一般", "很差"],
            help: "如果开启将需要申请者先完成该调查问卷",
        },
        {
            break: "AAAA",
            key: "review-optional",
            title: "院系审核时间限制",
            type: "date",
            width: 400,
            optional: ["是", "否"],
            defaultProps: {
                type: "range",
                showTime: { format: "HH:mm" },
                format: "YYYY-MM-DD HH:mm",
            },
        },
        {
            key: "matrix-checkbox",
            type: "matrix-checkbox",
            title: "矩阵多选",
            rows: ["质量", "外观"],
            options: ["很好", "一般", "很差"],
            //required: true,
            //defaultValue: { 质量: ["很好", "一般"] },
        },
        {
            break: "Group",
            key: "specialPeriods",
            title: "特殊时段设置",
            type: "group",
            help: "可根据具体情况设置多少个特殊时段",
            children: [
                {
                    key: "tag",
                    title: "标签",
                    type: "tag",
                },
                {
                    key: "day",
                    title: "星期",
                    type: "select",
                    options: [
                        { label: "星期一", value: 1 },
                        { label: "星期二", value: 2 },
                        { label: "星期三", value: 3 },
                        { label: "星期四", value: 4 },
                        { label: "星期五", value: 5 },
                        { label: "星期六", value: 6 },
                        { label: "星期日", value: 7 },
                    ],
                    help: "特殊星期，留空表示不做限制",
                },
                {
                    key: "date",
                    title: "日期",
                    type: "date",
                    help: "指定特殊日期，留空表示不做限制，该条件与星期冲突时会覆盖星期设置",
                },

                {
                    key: "type",
                    title: "是否开启",
                    type: "switch",
                    options: ["开启", "关闭"],
                    defaultProps: {
                        checkedValue: "allow",
                        unCheckedValue: "deny",
                    },
                    defaultValue: "allow",
                },
            ],
        },*/
    /*	{
        key: "matrix-scale",
        type: "matrix-scale",
        title: "矩阵量表",
        rows: ["质量", "外观"],
        options: ["很好", "一般", "很差"],
        defaultProps: {
            level: 10,
            showScale: true,
        },
        required: true,
    },
    {
        key: "matrix-radio",
        type: "matrix-radio",
        title: "矩阵单选",
        rows: ["质量", "外观"],
        options: ["很好", "一般", "很差"],
        //defaultValue: { 质量: "很好", 外观: "一般" },
        //required: true,
    },

    {
        key: "avatar",
        title: "头像",
        type: "uploader",
        tips: "不超过10M",
        required: true,
        defaultProps: {
            accept: ".png,.jpg,.jpeg",
            action: "http://uni-affair.test/api/tool/uploadFile",
            maxSize: 10,
            multipart: true,
            type: "picture-card",
        },
    },
{
            key: "avatar",
            title: "头像",
            type: "uploader",
            tips: "不超过10M",
            defaultProps: {
                accept: ".png,.jpg,.jpeg",
                action: "http://campus-life.test/api/upload",
                maxSize: 10,
                multipart: true,
                type: "picture-card",
            },
        },

        {
            key: "match",
            title: "匹配 Match",
            columnIndex: 1,
            match(submitForm) {
                if (submitForm.input === "1") {
                    return { type: "input", placeholder: "这只能一句话" }
                } else {
                    return { type: "textarea", placeholder: "这里可以是一段话" }
                }
            },
        },

        {
            key: "headcount_limit",
            title: "限制人数",
            optional: ["限制", "不限制"],
            type: "number",
            defaultValue: 20,
        },
        {
            key: "address",
            title: "地址 Address",
            type: "address",
            defaultValue: ["440000", "440100", "440103"],
            hidden(submitForm) {
                return submitForm["input"] === "hide"
            },
        },
        {
            key: "text",
            title: "文本 Text",
            type: "text",
            defaultValue: "默认值",
        },
        {
            key: "input",
            title: "输入 Input",
            defaultValue: "这里是内容",
            columnIndex: 1,
        },
        {
            title: "数据源",
            key: "data_sources",
            type: "group",
            children: [
                {
                    title: "数据",
                    type: "tree-select",
                    key: "category_id",
                    width: 300,
                    options: [
                        { id: 1, name: "test", children: [{ id: 2, name: "child1" }] },
                        { id: 3, name: "test2" },
                    ],
                    defaultProps: {
                        multiple: true,
                        treeNodeFilterProp: "name",
                        fieldNames: {
                            children: "children",
                            label: "name",
                            value: "id",
                        },
                    },
                },
                {
                    title: "是否分页",
                    key: "is_pagination_required",
                    type: "switch",
                    defaultValue: true,
                },
            ],
        },
        {
            key: "textarea",
            title: "长文本 Textarea",
            type: "textarea",
            break: "一个新的行",
        },
        {
            key: "password",
            title: "密码 Password",
            type: "password",
            columnIndex: 3,
        },
        {
            key: "editor",
            title: "富文本 Editor",
            type: "editor",
            columnIndex: [0, 1],
        },
        {
            key: "html",
            title: "HTML",
            type: "html",
            defaultValue: "<p style='color: #ff0000; margin: 0;'>插播一条 HTML</p>",
        },
        {
            key: "number",
            title: "数字 Number",
            type: "number",
            columnIndex: 1,
        },
        {
            key: "radio",
            title: "单选 Radio",
            type: "radio",
            options: ["选项1", "选项2"],
            defaultValue: "选项1",
        },
        {
            key: "checkbox",
            title: "多选 Checkbox",
            type: "Checkbox",
            options: ["选项1", "选项2"],
            defaultValue: ["选项1", "选项2"],
            columnIndex: 1,
        },

        {
            key: "switch",
            title: "开关 switch",
            type: "switch",
            options: ["开", "关"],
        },
        {
            key: "date",
            title: "日期 Date",
            type: "date",
            defaultProps: {
                onChange: (val) => {
                    console.log(val)
                },
            },
        },
        {
            key: "time",
            title: "时间 Time",
            type: "time",
            defaultProps: {
                onChange: (val) => {
                    console.log(val)
                },
            },
        },
        {
            key: "tag",
            title: "标签 Tag",
            type: "tag",
        },
        {
            key: "remote",
            title: "远程检索 Remote",
            type: "remote",
            url: "https://suggest.taobao.com/sug",
            keyword: "q",
            onSearch: (res) => {
                return res.result.map((item) => {
                    return {
                        label: item[0],
                        value: item[1],
                    }
                })
            },
        },
        {
            key: "select",
            title: "选择 Select",
            type: "select",
            options: [
                {
                    label: "选项1",
                    value: "1",
                },
                {
                    label: "选项2",
                    value: "2",
                },
            ],
        },
        {
            key: "tree-select",
            title: "树型选择 TreeSelect",
            type: "tree-select",
            options: [
                {
                    label: "parent",
                    value: "parent",
                    children: [
                        {
                            label: "parent 1",
                            value: "parent 1",
                            children: [
                                {
                                    label: "parent 1-0",
                                    value: "parent 1-0",
                                    children: [
                                        {
                                            label: "my leaf",
                                            value: "leaf1",
                                        },
                                        {
                                            label: "your leaf",
                                            value: "leaf2",
                                        },
                                    ],
                                },
                                {
                                    label: "parent 1-1-1",
                                    value: "parent 1-1-1",
                                },
                            ],
                        },
                        {
                            label: "parent 1-1",
                            value: "parent 1-1",
                        },
                    ],
                },
            ],
            defaultSlots: {
                title: ({ label }) => {
                    return h("span", { style: { color: "red" } }, label)
                },
            },
        },*/
  ];
};
</script>
