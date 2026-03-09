<template>
  <div ref="selector"></div>
</template>
<script>
import { defineComponent, onMounted, ref, watchEffect } from "vue";

export default defineComponent({
  props: {
    // editor 实例
    editor: {
      type: Object,
      default: () => null,
    },
    /** 编辑器模式 */
    mode: {
      type: String,
      default: "default",
    },
    /** 编辑器默认配置 */
    defaultConfig: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    // toolbar 容器
    const selector = ref(null);

    /**
     * 初始化 toolbar
     */
    const create = editor => {
      if (!selector.value) return;
      if (editor == null) {
        throw new Error("Not found instance of Editor when create <Toolbar/> component");
      }
      // 由于该库在 import 的时候会有 DOM 操作，所以只能在 onMounted 后手动引入
      import("@wangeditor/editor").then(wangEditor => {
        if (wangEditor.DomEditor.getToolbar(editor)) return; // 不重复创建

        wangEditor.createToolbar({
          editor,
          selector: selector.value || "<div></div>",
          mode: props.mode,
          config: props.defaultConfig,
        });
      });
    };

    onMounted(() => {
      watchEffect(() => {
        const { editor } = props;
        if (editor == null) return;
        create(editor); // 初始化 toolbar
      });
    });

    return {
      selector,
    };
  },
});
</script>
