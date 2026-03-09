/**
 * 将 widget 的参数转换成属性页面的配置项
 * @param widget
 * @param [mode] 表单模式，默认为编辑模式
 */
const widgetToProps = (widget, mode) => {
  let props = [
    {
      title: "标题",
      key: "title",
      required: true,
      type: "textarea",
    },
    {
      title: "必填",
      key: "required",
      type: "switch",
      defaultValue: false,
    },
    {
      title: "备注/提示",
      key: "help",
    },
    {
      title: "添加分页栏",
      type: "switch",
      key: "break",
      defaultValue: false,
    },
  ];

  if (["input", "select", "textarea"].includes(widget.type)) {
    props = props.concat([
      {
        title: "输入框提示",
        key: "placeholder",
      },
    ]);
  }

  if (["matrix-radio", "matrix-checkbox", "matrix-scale"].includes(widget.type)) {
    props = props.concat([
      {
        title: "行标题",
        key: "rows",
        type: "slot",
      },
    ]);
  }

  if (
    [
      "radio",
      "checkbox",
      "select",
      "matrix-radio",
      "matrix-checkbox",
      "matrix-scale",
      "rate-radio",
      "rate-checkbox",
    ].includes(widget.type)
  ) {
    props = props.concat([
      {
        title: "选项",
        key: "options",
        type: "slot",
      },
    ]);
  }

  if ("matrix-scale" === widget.type) {
    props = props.concat([
      {
        title: "量表等级",
        type: "number",
        key: "level",
        defaultProps: {
          min: 1,
          max: 10,
        },
        defaultValue: 5,
      },
    ]);
  }

  if ("rate" === widget.type) {
    props = props.concat([
      {
        title: "星星总数",
        type: "number",
        key: "count",
        defaultProps: {
          min: 1,
          max: 10,
        },
        defaultValue: 5,
      },
      {
        title: "是否允许半选",
        type: "switch",
        key: "allowHalf",
        defaultValue: false,
      },
    ]);
  }

  if ("uploader" === widget.type) {
    props = props.concat([
      {
        title: "最大上传数",
        key: "maxNum",
        type: "number",
        defaultValue: 1,
        defaultProps: {
          min: 1,
          max: 9,
        },
      },
      {
        title: "文件权限",
        key: "privacy",
        type: "radio",
        options: [
          { label: "公开", value: "public" },
          { label: "隐私", value: "private" },
        ],
        help: "公开：如新闻图片，通知文件等对所有人可见；隐私：如个人照片，私密文件等会进行访问限制",
        defaultValue: "public",
      },
    ]);
  }

  if (mode && mode === "quiz") {
    props = props.concat([
      {
        title: "分值",
        key: "quiz_score",
        type: "number",
        required: true,
        defaultValue: 1,
      },
    ]);
    if (!widget.type || widget.type === "input") {
      props = props.concat([
        {
          break: true,
          title: "正确答案",
          key: "__quiz_answer",
        },
      ]);
    } else if (widget.type === "radio") {
      props = props.concat([
        {
          break: true,
          title: "正确答案",
          key: "__quiz_answer",
          type: "select",
          options: widget.props.options?.map((option, index) => String.fromCharCode(65 + index)),
        },
      ]);
    } else if (widget.type === "checkbox") {
      props = props.concat([
        {
          break: true,
          title: "正确答案",
          key: "__quiz_answer",
          type: "select",
          options: widget.props.options?.map((option, index) => String.fromCharCode(65 + index)),
          defaultProps: {
            mode: "multiple",
          },
        },
      ]);
    }

    props = props.concat([
      {
        title: "解析",
        key: "__quiz_analysis",
        type: "textarea",
      },
    ]);
  }

  return props;
};

/**
 * 将表单项的属性渲染在属性面板中
 * @param formItem
 * @param [mode] 表单模式，默认为编辑模式
 * @return {{}}
 */
const formItemToProps = (formItem, mode) => {
  const formItemProps = formItem.props;
  const props = {};

  ["title", "required", "help", "break"].forEach(prop => {
    props[prop] = formItemProps[prop];
  });

  if (mode && mode === "quiz") {
    props.quiz_score = formItemProps.quiz_score;
    props.__quiz_answer = formItemProps.__quiz_answer;
    props.__quiz_analysis = formItemProps.__quiz_analysis;
  }

  if (["radio", "checkbox", "select", "rate-radio", "rate-checkbox"].includes(formItem.type)) {
    props.options = formItemProps.options;
  }

  if (["input", "select", "textarea"].includes(formItem.type)) {
    props.placeholder = formItemProps.placeholder;
  }

  if ("rate" === formItem.type) {
    props.count = formItemProps.defaultProps?.count;
    props.allowHalf = formItemProps.defaultProps?.allowHalf;
  }

  if ("matrix-scale" === formItem.type) {
    props.level = formItemProps.defaultProps?.level;
  }

  if ("uploader" === formItem.type) {
    props.maxNum = formItemProps.defaultProps?.maxNum || 1;
    props.privacy = formItemProps.defaultProps?.extraData?.type || "private";
  }

  return props;
};

/**
 * 将属性面板的属性配置在表单项中渲染
 * @param props
 * @param formItem
 * @param [mode] 表单模式，默认为编辑模式
 */
const propsToFormItem = (props, formItem, mode) => {
  if (!formItem) {
    return;
  }
  const formItemProps = formItem.props;
  ["title", "required", "help", "break"].forEach(prop => {
    formItemProps[prop] = props[prop];
  });

  if (mode && mode === "quiz") {
    formItemProps.quiz_score = props.quiz_score;
    formItemProps.__quiz_answer = props.__quiz_answer;
    formItemProps.__quiz_analysis = props.__quiz_analysis;
  }

  if (["radio", "checkbox", "select", "rate-radio", "rate-checkbox"].includes(formItem.type)) {
    formItemProps.options = props.options;
  }

  if (["input", "select", "textarea"].includes(formItem.type)) {
    formItemProps.placeholder = props.placeholder;
  }

  if ("rate" === formItem.type) {
    if (!formItemProps.defaultProps) {
      formItemProps.defaultProps = {};
    }
    formItemProps.defaultProps.count = props.count;
    formItemProps.defaultProps.allowHalf = props.allowHalf;
  }

  if ("matrix-scale" === formItem.type) {
    if (!formItemProps.defaultProps) {
      formItemProps.defaultProps = {};
    }
    formItemProps.defaultProps.level = props.level;
  }

  if ("uploader" === formItem.type) {
    if (!formItemProps.defaultProps) {
      formItemProps.defaultProps = {};
    }

    if (!formItemProps.defaultProps.extraData) {
      formItemProps.defaultProps.extraData = {};
    }

    formItemProps.defaultProps.maxNum = props.maxNum;
    formItemProps.defaultProps.extraData.type = props.privacy;
  }
};

export { widgetToProps, formItemToProps, propsToFormItem };
