import { h } from "vue";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  DownSquareOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FieldBinaryOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FormOutlined,
  MailOutlined,
  MobileOutlined,
  NumberOutlined,
  SmileFilled,
  StarOutlined,
  SwitcherOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";

/**
 * 获取默认的表单组件
 *
 * @param {string} mode 模式
 * @returns {Array}
 * @param mode
 */
export function getDefaultWidgets(mode) {
  if (mode && mode === "quiz") {
    return [
      {
        title: "题目类型",
        children: [
          {
            name: "单选",
            type: "radio",
            icon: () => h(CheckCircleOutlined),
            props: {
              defaultProps: { optionType: "outlined" },
              options: ["A. 选项一", "B. 选项二", "C. 选项三", "D. 选项四"],
            },
          },
          {
            name: "多选",
            type: "checkbox",
            icon: () => h(CheckSquareOutlined),
            props: {
              options: ["A. 选项一", "B. 选项二", "C. 选项三", "D. 选项四"],
            },
          },
          {
            name: "填空",
            type: "input",
            icon: () => h(EditOutlined),
            props: {
              width: "100%",
            },
          },
        ],
      },
    ];
  }

  return [
    {
      title: "选择",
      children: [
        {
          name: "单选",
          type: "radio",
          icon: () => h(CheckCircleOutlined),
          props: {
            defaultProps: { optionType: "outlined" },
            options: ["选项一", "选项二"],
          },
        },
        {
          name: "多选",
          type: "checkbox",
          icon: () => h(CheckSquareOutlined),
          props: {
            options: ["选项一", "选项二"],
          },
        },
        {
          name: "下拉选择",
          type: "select",
          icon: () => h(DownSquareOutlined),
          props: {
            options: ["选项一", "选项二"],
            width: 300,
          },
        },
        {
          name: "开关",
          icon: () => h(SwitcherOutlined),
          type: "switch",
        },

        {
          name: "图片上传",
          type: "uploader",
          icon: () => h(FileImageOutlined),
          props: {
            //disabled: true,
            defaultProps: {
              accept: ".png,.jpg,.jpeg",
            },
          },
        },
        {
          name: "文件上传",
          type: "uploader",
          icon: () => h(FilePdfOutlined),
          props: {
            //disabled: true,
            defaultProps: {
              accept: ".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.png,.jpg,jpeg",
              type: "text",
            },
          },
        },
      ],
    },
    {
      title: "填空",
      children: [
        {
          name: "文本",
          type: "input",
          icon: () => h(EditOutlined),
          props: {
            width: "100%",
          },
        },
        {
          name: "多行文本",
          icon: () => h(FormOutlined),
          type: "textarea",
        },

        {
          name: "日期",
          icon: () => h(CalendarOutlined),
          type: "date",
        },
        {
          name: "日期范围",
          type: "date",
          icon: () => h(CalendarOutlined),
          props: {
            width: 300,
            defaultProps: {
              type: "range",
            },
          },
        },
        {
          name: "时间",
          icon: () => h(ClockCircleOutlined),
          type: "time",
        },
        {
          name: "时间范围",
          type: "time",
          icon: () => h(ClockCircleOutlined),
          props: {
            width: 300,
            defaultProps: {
              type: "range",
            },
          },
        },
        {
          name: "数字",
          icon: () => h(FieldBinaryOutlined),
          type: "number",
        },
      ],
    },
    {
      title: "评分",
      children: [
        {
          name: "星级评分",
          icon: () => h(StarOutlined),
          type: "rate",
        },
        {
          name: "单选评分",
          type: "rate-radio",
          icon: () => h(CheckCircleOutlined),
          props: {
            defaultProps: { optionType: "outlined" },
            options: [
              { value: "选项一", rate: 1 },
              { value: "选项二", rate: 2 },
              { value: "选项三", rate: 3 },
            ],
          },
        },
        {
          name: "多选评分",
          type: "rate-checkbox",
          icon: () => h(CheckSquareOutlined),
          props: {
            options: [
              { value: "选项一", rate: 1 },
              { value: "选项二", rate: 2 },
              { value: "选项三", rate: 3 },
            ],
          },
        },
      ],
    },
    {
      title: "矩阵",
      children: [
        {
          name: "矩阵单选",
          type: "matrix-radio",
          icon: () => h(CheckCircleOutlined),
          props: {
            options: ["好", "一般", "差"],
            rows: ["质量", "外观"],
          },
        },
        {
          name: "矩阵多选",
          type: "matrix-checkbox",
          icon: () => h(CheckSquareOutlined),
          props: {
            options: ["好", "一般", "差"],
            rows: ["质量", "外观"],
          },
        },
        {
          name: "矩阵量表",
          type: "matrix-scale",
          icon: () => h(NumberOutlined),
          props: {
            defaultProps: { showScale: true },
            options: [],
            rows: ["质量", "外观"],
          },
        },
      ],
    },
    {
      title: "个人信息",
      children: [
        {
          name: "姓名",
          type: "input",
          icon: () => h(UserOutlined),
          props: {
            title: "您的姓名",
          },
        },
        {
          name: "性别",
          type: "radio",
          icon: () => h(SmileFilled),
          props: {
            title: "您的性别",
            options: ["男", "女"],
          },
        },
        {
          name: "手机号码",
          type: "input",
          icon: () => h(MobileOutlined),
          props: {
            title: "请输入您的手机号码",
            rules: [
              {
                pattern: "^1[3456789]\\d{9}$",
                message: "手机号码格式不正确",
              },
            ],
          },
        },
        {
          name: "邮箱",
          type: "input",
          icon: () => h(MailOutlined),
          props: {
            title: "请输入您的邮箱地址",
            rules: [
              {
                pattern:
                  '^(([^<>()[\\]\\\\.,;:\\s@"]+(\\.[^<>()[\\]\\\\.,;:\\s@"]+)*)|.(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
                message: "邮箱地址格式不正确",
              },
            ],
          },
        },
        {
          name: "省市区",
          type: "address",
          icon: () => h(EnvironmentOutlined),
          props: {
            title: "请选择省份城市与地区",
          },
        },
      ],
    },
  ];
}
