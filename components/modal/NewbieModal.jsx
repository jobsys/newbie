import { computed, defineComponent, ref, watch, watchEffect } from "vue";
import { useDraggable } from "@vueuse/core";
import { Drawer, Modal } from "ant-design-vue";
import { CloseOutlined, CompressOutlined, ExpandOutlined } from "@ant-design/icons-vue";
import "./index.less";
import { isFunction, isObject } from "lodash-es";
import { genPixel } from "../../utils/style";
import { useT } from "../../hooks/index.js";

/**
 * 弹窗组件
 * 可以选择使用 Modal 或者是 Drawer
 * Modal 支持全屏以及拖动
 *
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbieModal",
  props: {
    /**
     * 弹窗类型
     *
     * @values modal, drawer
     */
    type: { type: String, default: "modal" },
    /**
     * 可见性控制
     * `v-model:visible`
     */
    visible: { type: Boolean, default: false },
    /**
     * 宽度
     */
    width: { type: [Number, String], default: 800 },

    /**
     * 高度，仅当Type为modal时有效
     */
    height: { type: [Number, String], default: 500 },

    /**
     * 标题
     */
    title: { type: String, default: "" },

    /**
     * 为 `Function` 时返回 Promise, resolve(true) 正常关闭，resolve(false) 可阻止关闭；
     * 为 `Object` 时参考 [下方配置 beforeclose](#beforeclose)
     */
    beforeClose: { type: [Function, Object], default: null },

    /**
     * 原生 [Modal](https://www.antdv.com/components/modal-cn#api) 或者是 [Drawer](https://www.antdv.com/components/drawer-cn#api) 的配置
     */
    modalProps: { type: Object, default: () => ({}) },
  },
  emits: [
    /**
     * @event update:visible
     * @param {boolean} visible 是否可见
     */
    "update:visible",

    /**
     * 关闭弹窗时回调
     *
     * @event close
     */
    "close",
  ],

  setup(props, { emit, slots }) {
    const modalTitleRef = ref(null);
    const isFullModal = ref(false);
    const isVisible = ref(false);

    watch(
      () => props.visible,
      visible => {
        isVisible.value = visible;
      },
      { immediate: true } // 添加 immediate 选项
    );

    const onCloseModal = async () => {
      if (props.beforeClose && isFunction(props.beforeClose) && !(await props.beforeClose())) {
        return;
      }

      if (props.beforeClose && isObject(props.beforeClose)) {
        const { title, content, okText, cancelText, trigger } = props.beforeClose;

        let showConfirm = isFunction(trigger) ? trigger() : trigger;

        if (showConfirm) {
          Modal.confirm({
            title: title || useT("common.action-prompt"),
            content: content || useT("common.close-confirm"),
            okText: okText || useT("common.confirm"),
            cancelText: cancelText || useT("common.cancel"),
            onOk: () => {
              isFullModal.value = false;
              emit("update:visible", false);
              emit("close");
            },
          });
          return;
        }
      }

      isFullModal.value = false;
      emit("update:visible", false);
      emit("close");
    };

    // 以下代码用于拖动弹窗，来自官方文档， https://www.antdv.com/components/modal-cn#components-modal-demo-modal-render
    const { x, y, isDragging } = useDraggable(modalTitleRef);

    const startX = ref(0);
    const startY = ref(0);
    const startedDrag = ref(false);
    const transformX = ref(0);
    const transformY = ref(0);
    const preTransformX = ref(0);
    const preTransformY = ref(0);
    const dragRect = ref({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    });
    watch([x, y], () => {
      if (!startedDrag.value) {
        startX.value = x.value;
        startY.value = y.value;
        const bodyRect = document.body.getBoundingClientRect();
        const titleRect = modalTitleRef.value.getBoundingClientRect();
        dragRect.value.right = bodyRect.width - titleRect.width;
        dragRect.value.bottom = Math.max(bodyRect.height - titleRect.height, 800);
        preTransformX.value = transformX.value;
        preTransformY.value = transformY.value;
      }
      startedDrag.value = true;
    });
    watch(isDragging, () => {
      if (!isDragging) {
        startedDrag.value = false;
      }
    });
    watchEffect(() => {
      if (startedDrag.value) {
        transformX.value =
          preTransformX.value +
          Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
          startX.value;
        transformY.value =
          preTransformY.value +
          Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
          startY.value;
      }
    });
    const transformStyle = computed(() => {
      return {
        transform: `translate(${transformX.value}px, ${transformY.value}px)`,
      };
    });

    const modalTitle = () => (
      <div class="newbie-modal-header">
        <span class="newbie-modal-title" ref={modalTitleRef}>
          {props.title}
        </span>
        <div class="newbie-modal-actions">
          {isFullModal.value ? (
            <a onClick={() => (isFullModal.value = false)}>
              <CompressOutlined style={{ fontSize: "16px" }} />
            </a>
          ) : (
            <a onClick={() => (isFullModal.value = true)}>
              <ExpandOutlined style={{ fontSize: "16px" }} />
            </a>
          )}

          <a onClick={onCloseModal}>
            <CloseOutlined style={{ fontSize: "20px", marginTop: "2px" }} />
          </a>
        </div>
      </div>
    );

    const elemModal = () => (
      <Modal
        footer={null}
        wrapStyle={{ overflow: "hidden" }}
        wrapClassName={`newbie-modal ${isFullModal.value ? "full-modal" : ""}`}
        width={isFullModal.value ? "100%" : genPixel(props.width)}
        v-model:open={isVisible.value}
        bodyStyle={{ maxHeight: props.height ? genPixel(props.height) : "600px", overflow: "auto" }}
        closable={false}
        destroyOnClose
        maskClosable={false}
        onCancel={onCloseModal}
        {...props.modalProps}
      >
        {{
          /**
           * @slot 弹窗内容
           */
          default: () => slots.default?.(),
          title: () => modalTitle(),
          modalRender: ({ originVNode }) => <div style={transformStyle.value}>{originVNode}</div>,
        }}
      </Modal>
    );

    const elemDrawer = () => (
      <Drawer
        title={props.title}
        v-model:open={isVisible.value}
        closable={false}
        destroyOnClose
        width={genPixel(props.width)}
        maskClosable={false}
        onClose={onCloseModal}
        {...props.modalProps}
      >
        {{
          /**
           * @slot 弹窗内容
           */
          default: () => slots.default?.(),
          extra: () => <CloseOutlined onClick={onCloseModal} />,
        }}
      </Drawer>
    );

    return () => (
      <div class="newbie-modal">{props.type === "modal" ? elemModal() : elemDrawer()}</div>
    );
  },
});
