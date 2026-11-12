import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { merge } from "lodash-es";
import Editor from "./components/WangEditor.vue";
import Toolbar from "./components/WangToolbar.vue";
import { message } from "antdv-next";
import "./index.less";
import { editorDefaults } from "./config.js";
import { useNewbieConfig } from "../../hooks/useMergedProps.js";
import { useFetch, useProcessStatusSuccess, useT } from "../../hooks";
import { useFormItemChange } from "../../utils/form-item-context.js";

/**
 * 编辑器内置提示，统一走全局 message
 * @param {String} info
 * @param {String} type
 */
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
    const triggerFieldChange = useFormItemChange();

    // 编辑器实例，必须用 shallowRef，重要！
    const editorRef = shallowRef();

    // 内容 HTML
    const valueHtml = ref("");

    const toolbarConfig = computed(() => ({
      excludeKeys: ["group-video", "emotion"],
      ...props.config?.toolbarConfig,
    }));

    const editorConfigRef = useNewbieConfig("editor", editorDefaults);

    // 内置的图片上传处理，用户可通过 config.editorConfig.MENU_CONF 逐项覆盖
    const defaultMenuConf = {
      uploadImage: {
        async customUpload(file, insertFn) {
          const formData = new FormData();
          formData.append("file", file);
          try {
            const res = await useFetch().post(editorConfigRef.value.uploadUrl, formData);
            useProcessStatusSuccess(res, () => {
              const { url, alt, href } = res.result;
              insertFn(url, alt, href);
            });
          } catch (e) {
            message.error(e?.response?.data?.result || e?.message || "图片上传失败");
          }
        },
      },
    };

    const editorConfig = computed(() => {
      const { MENU_CONF: userMenuConf, ...userConfig } = props.config?.editorConfig || {};
      return {
        placeholder:
          props.placeholder || useT("form.please-input", { title: useT("common.content") }),
        readOnly: props.disabled || props.readonly,
        ...userConfig,
        // 深合并，用户只配置其它菜单项时仍保留内置 uploadImage；显式覆盖 uploadImage 时以用户为准
        MENU_CONF: merge({}, defaultMenuConf, userMenuConf || {}),
      };
    });

    // props.config / disabled / readonly 变化后同步到已创建的编辑器实例
    watch(
      editorConfig,
      config => {
        try {
          editorRef.value?.setConfig?.(config);
        } catch (e) {
          console.warn("[NewbieEditor] 编辑器配置更新失败", e);
        }
      },
      { deep: true }
    );

    watch(
      toolbarConfig,
      async config => {
        if (!editorRef.value) return;
        try {
          const { DomEditor } = await import("@wangeditor/editor");
          DomEditor.getToolbar(editorRef.value)?.setConfig?.(config);
        } catch (e) {
          console.warn("[NewbieEditor] 工具栏配置更新失败", e);
        }
      },
      { deep: true }
    );

    watch(
      () => props.disabled || props.readonly,
      value => {
        const editor = editorRef.value;
        if (!editor) return;
        if (value) {
          editor.disable();
          return;
        }
        editor.enable();
        if (!toolbarElemRef.value) {
          toolbarElemRef.value = createToolbarElem();
        }
      }
    );

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
        triggerFieldChange();
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
