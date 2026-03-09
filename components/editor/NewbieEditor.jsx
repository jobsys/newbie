import { defineComponent, onBeforeUnmount, onMounted, ref, shallowRef, inject, watch } from "vue";
import Editor from "./components/WangEditor.vue";
import Toolbar from "./components/WangToolbar.vue";
import { message, Form } from "ant-design-vue";
import "./index.less";
import { NEWBIE_EDITOR } from "../provider/NewbieProvider.jsx";
import { useFetch, useProcessStatusSuccess, useT } from "../../hooks";

/**
 * 富文本编辑器
 * 基于 WangEditor
 *
 * @version 1.0.0
 * @see https://www.wangeditor.com/v5/for-frame.html#vue3
 */
export default defineComponent({
  name: "NewbieEditor",
  props: {
    /**
     * 输入框的值
     * @model
     */
    value: { type: String, default: "" },

    /**
     * 占位符
     */
    placeholder: { type: String, default: "" },

    /**
     * 是否禁用
     */
    disabled: { type: Boolean, default: false },

    /**
     * 是否只读
     */
    readonly: { type: Boolean, default: false },

    /**
     * @param {Object} config.toolbarConfig  [工具栏配置](https://www.wangeditor.com/v5/toolbar-config.html)
     * @param {Object} config.editorConfig [编辑器配置](https://www.wangeditor.com/v5/editor-config.html)
     */
    config: {
      type: Object,
      default: () => ({
        toolbarConfig: {},
        editorConfig: {},
      }),
    },
  },
  emits: ["update:value"],
  setup(props, { emit, expose }) {
    const formItemContext = Form.useInjectFormItemContext();

    // 编辑器实例，必须用 shallowRef，重要！
    const editorRef = shallowRef();

    // 内容 HTML
    const valueHtml = ref("");

    const toolbarConfig = ref({
      excludeKeys: ["group-video", "emotion"],
      ...props.config?.toolbarConfig,
    });

    const { uploadUrl } = inject(NEWBIE_EDITOR, () => ({}));

    const editorConfig = ref({
      placeholder:
        props.placeholder || useT("form.please-input", { title: useT("common.content") }),
      readOnly: props.disabled || props.readonly,
      MENU_CONF: {
        uploadImage: {
          async customUpload(file, insertFn) {
            const formData = new FormData();
            formData.append("file", file);
            try {
              let res = await useFetch().post(uploadUrl, formData);
              useProcessStatusSuccess(res, () => {
                const { url, alt, href } = res.result;
                insertFn(url, alt, href);
              });
            } catch (e) {
              console.log(e);
            }
          },
        },
      },
      ...props.config?.editorConfig,
    });

    const setContent = content => {
      if (editorRef.value) {
        editorRef.value.setHtml(content);
      }
    };

    const getEditor = () => {
      return editorRef?.value;
    };

    // 组件销毁时，也及时销毁编辑器，重要！
    onBeforeUnmount(() => {
      const editor = editorRef.value;
      if (editor == null) return;

      editor.destroy();
    });

    watch(
      () => props.value,
      val => {
        if (val !== valueHtml.value && editorRef.value) {
          setContent(val);
        }
      }
    );

    // 编辑器回调函数
    const handleCreated = editor => {
      editorRef.value = editor; // 记录 editor 实例，重要！

      setContent(props.value);
      editor.on("fullScreen", () => {
        document.body.classList.add("fullscreen");
      });
      editor.on("unFullScreen", () => {
        document.body.classList.remove("fullscreen");
      });

      if (!props.disabled && !props.readonly) {
        toolbarElemRef.value = createToolbarElem();
      }
    };

    const handleChange = editor => {
      let html = editor.getHtml();
      if (editor.isEmpty()) {
        html = "";
      }
      if (html !== props.value) {
        emit("update:value", html);
        formItemContext.onFieldChange();
      }
    };

    const customAlert = async (info, type) => {
      switch (type) {
        case "success":
          message.success(info);
          break;
        case "info":
          message.info(info);
          break;
        case "warning":
          message.warning(info);
          break;
        case "error":
          message.error(info);
          break;
        default:
          message.info(info);
          break;
      }
    };

    expose({
      setContent,
      getEditor,
    });

    /********** render **********/

    const toolbarElemRef = ref();
    const editorElemRef = ref();

    const createToolbarElem = () => {
      if (editorRef?.value?.destroy) {
        return (
          <Toolbar
            editor={editorRef.value}
            defaultConfig={toolbarConfig.value}
            style="border-bottom: 1px solid #f0f0f0"
          ></Toolbar>
        );
      } else {
        return <div></div>;
      }
    };

    const createEditorElem = () => (
      <Editor
        v-model={valueHtml.value}
        defaultConfig={editorConfig.value}
        style="height: 400px; overflow-y: hidden"
        onOnChange={handleChange}
        onOnCreated={handleCreated}
        onCustomAlert={customAlert}
      />
    );

    onMounted(() => {
      editorElemRef.value = createEditorElem();
    });

    return () => (
      <div style="border: 1px solid #f0f0f0">
        {toolbarElemRef.value}
        {editorElemRef.value}
      </div>
    );
  },
});
