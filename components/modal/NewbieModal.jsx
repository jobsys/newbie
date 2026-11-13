import { computed, defineComponent, provide, ref, shallowReactive, watch, watchEffect } from "vue";
import { useDraggable } from "@vueuse/core";
import { Button, Drawer, Modal } from "antdv-next";
import { CloseOutlined, CompressOutlined, ExpandOutlined } from "@antdv-next/icons";
import "./index.less";
import { isFunction, isObject } from "lodash-es";
import { genPixel } from "../../utils/style";
import { t } from "../../hooks/index.js";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { modalDefaults } from "./config.js";
import { NEWBIE_MODAL_ACTIONS } from "./context.js";

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
    type: { type: String, default: undefined },
    /**
     * 可见性控制
     * `v-model:visible`
     */
    visible: { type: Boolean, default: undefined },
    /**
     * 宽度
     */
    width: { type: [Number, String], default: undefined },

    /**
     * 高度，仅当Type为modal时有效
     */
    height: { type: [Number, String], default: undefined },

    /**
     * 标题
     */
    title: { type: String, default: undefined },

    /**
     * 为 `Function` 时返回 Promise, resolve(true) 正常关闭，resolve(false) 可阻止关闭；
     * 为 `Object` 时参考 [下方配置 beforeclose](#beforeclose)
     */
    beforeClose: { type: [Function, Object], default: undefined },

    /**
     * 原生 [Modal](https://www.antdv-next.com/components/modal-cn#props) 或者是 [Drawer](https://www.antdv-next.com/components/drawer-cn#props) 的配置
     */
    modalProps: { type: Object, default: undefined },
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

  setup(rawProps, { emit, slots }) {
    const props = useMergedProps(rawProps, "modal", modalDefaults);
    const modalTitleRef = ref(null);
    const isFullModal = ref(false);
    const isVisible = ref(false);

    // 底部动作区：子组件（如 NewbieForm）把按钮的渲染函数注册进来，
    // 由 NewbieModal 决定按钮最终出现在 Modal / Drawer 的底部固定区。
    // 用 shallowReactive 的数组，注册/注销后底部区域会重新渲染。
    const footerActions = shallowReactive([]);
    let footerActionSeed = 0;

    provide(NEWBIE_MODAL_ACTIONS, {
      /**
       * @param {Function} renderAction 返回按钮节点的渲染函数
       * @param {Object} [options]
       * @param {Function} [options.isDirty] 弹层关闭前检查表单是否有脏数据
       * @param {Function} [options.getConfirm] 脏数据确认框的文案
       * @return {Function} 注销函数
       */
      register(renderAction, options = {}) {
        const entry = {
          id: (footerActionSeed += 1),
          render: renderAction,
          isDirty: options.isDirty || null,
          getConfirm: options.getConfirm || null,
        };
        footerActions.push(entry);
        return () => {
          const index = footerActions.indexOf(entry);
          if (index > -1) {
            footerActions.splice(index, 1);
          }
        };
      },

      /**
       * 请求关闭弹层，统一走 beforeClose / 脏数据确认流程
       * @param {Object} [options]
       * @param {Boolean} [options.skipDirty] 调用方已完成脏数据确认时跳过重复确认
       */
      requestClose(options) {
        return onCloseModal(options);
      },
    });

    // antdv-next Drawer 用 size 承载宽度：数字转 px，百分比等 CSS 值原样生效，
    // 不再回退到已废弃的 width
    const drawerSize = computed(() => {
      const raw = props.width;
      if (raw === undefined || raw === null || raw === "") {
        return undefined;
      }
      if (typeof raw === "number") {
        return raw;
      }
      const value = String(raw).trim();
      // 纯数字或 px 值先转数字，避免 @v-c/drawer 对字符串宽度告警
      if (/^\d+(\.\d+)?(px)?$/i.test(value)) {
        return Number.parseFloat(value);
      }
      return value;
    });

    // antdv-next 用 styles 对象描述各区域样式，调用方通过 modalProps.styles
    // 自定义 header 等区域时，不能把内置的 wrapper/body 配置整块浅覆盖掉
    const mergedModalProps = computed(() => {
      const { styles, ...rest } = props.modalProps || {};
      const styleOverrides = isObject(styles) ? styles : {};
      return {
        ...rest,
        styles: {
          ...styleOverrides,
          wrapper: { overflow: "hidden", ...styleOverrides.wrapper },
          body: {
            // 全屏时高度交给 flex 布局撑满，不能再被内容区的 maxHeight 截断
            maxHeight: isFullModal.value
              ? "none"
              : props.height
                ? genPixel(props.height)
                : "600px",
            overflow: "auto",
            ...styleOverrides.body,
          },
        },
      };
    });

    watch(
      () => props.visible,
      visible => {
        isVisible.value = visible;
      },
      { immediate: true } // 添加 immediate 选项
    );

    // 以下代码用于拖动弹窗，来自官方文档， https://www.antdv-next.com/components/modal-cn#modal-demo-modal-render
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

    /**
     * 丢弃拖动产生的位移。
     * 全屏 / 退出全屏时窗口尺寸变化，旧的 dragRect 与 translate 都不再适用，
     * 不清零会出现全屏后弹窗仍被平移到视口外、标题被裁掉的问题。
     */
    const resetDrag = () => {
      startedDrag.value = false;
      transformX.value = 0;
      transformY.value = 0;
      preTransformX.value = 0;
      preTransformY.value = 0;
    };

    /**
     * 切换全屏，全屏状态下禁止拖动
     * @param {Boolean} value
     */
    const setFullscreen = value => {
      if (isFullModal.value === value) {
        return;
      }
      isFullModal.value = value;
      resetDrag();
    };

    watch([x, y], () => {
      if (isFullModal.value) {
        return;
      }
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
      if (!isFullModal.value && startedDrag.value) {
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

    const finishClose = () => {
      setFullscreen(false);
      emit("update:visible", false);
      emit("close");
    };

    const onCloseModal = async (options = {}) => {
      // antdv-next 的关闭事件会把 MouseEvent 传进来，只有显式的 skipDirty 才跳过脏数据检查
      const skipDirty = options?.skipDirty === true;

      if (props.beforeClose && isFunction(props.beforeClose) && !(await props.beforeClose())) {
        return;
      }

      if (props.beforeClose && isObject(props.beforeClose)) {
        const { title, content, okText, cancelText, trigger } = props.beforeClose;

        let showConfirm = isFunction(trigger) ? trigger() : trigger;

        if (showConfirm) {
          Modal.confirm({
            title: title || t("common.action-prompt"),
            content: content || t("common.close-confirm"),
            okText: okText || t("common.confirm"),
            cancelText: cancelText || t("common.cancel"),
            onOk: finishClose,
          });
          return;
        }
      }

      // beforeClose 已由调用方自定义时以它为准，避免与抽屉内的表单重复确认
      if (!skipDirty && !props.beforeClose) {
        const dirtyEntry = footerActions.find(entry => entry.isDirty?.());

        if (dirtyEntry) {
          const texts = dirtyEntry.getConfirm?.() || {};

          Modal.confirm({
            title: t("common.data-changed"),
            content: t("common.discard-confirm"),
            okText: t("common.confirm"),
            cancelText: t("common.cancel"),
            ...texts,
            onOk: finishClose,
          });
          return;
        }
      }

      finishClose();
    };

    const modalTitle = () => (
      <div class="newbie-modal-header">
        <span class="newbie-modal-title" ref={modalTitleRef}>
          {props.title}
        </span>
        <div class="newbie-modal-actions">
          <Button
            class="newbie-modal-action"
            type="text"
            size="small"
            icon={isFullModal.value ? <CompressOutlined /> : <ExpandOutlined />}
            aria-label={isFullModal.value ? t("common.exit-fullscreen") : t("common.fullscreen")}
            title={isFullModal.value ? t("common.exit-fullscreen") : t("common.fullscreen")}
            onClick={() => setFullscreen(!isFullModal.value)}
          />
          <Button
            class="newbie-modal-action"
            type="text"
            size="small"
            icon={<CloseOutlined />}
            aria-label={t("common.close")}
            title={t("common.close")}
            onClick={onCloseModal}
          />
        </div>
      </div>
    );

    /**
     * 底部动作区：插槽 footer + 子组件注册的按钮。
     * 注册项在特定状态下可能返回 null（如 hideButtons），因此按真实渲染结果判断是否显示底部区域。
     */
    const renderFooter = () => {
      const nodes = [slots.footer?.(), ...footerActions.map(entry => entry.render())].filter(Boolean);
      return nodes.length ? <div class="newbie-modal-footer">{nodes}</div> : null;
    };

    const elemModal = () => {
      const footer = renderFooter() ?? mergedModalProps.value.footer ?? null;

      return (
        <Modal
          wrapClassName={`newbie-modal${isFullModal.value ? " full-modal" : ""}`}
          width={isFullModal.value ? "100%" : genPixel(props.width)}
          open={isVisible.value}
          closable={false}
          destroyOnHidden
          maskClosable={false}
          onCancel={onCloseModal}
          {...mergedModalProps.value}
          footer={footer}
        >
          {{
            /**
             * @slot 弹窗内容
             */
            default: () => slots.default?.(),
            title: () => modalTitle(),
            modalRender: node => (
              <div class="newbie-modal-drag" style={transformStyle.value}>
                {node}
              </div>
            ),
          }}
        </Modal>
      );
    };

    const elemDrawer = () => {
      const footer = renderFooter() ?? props.modalProps?.footer ?? undefined;

      return (
        <Drawer
          title={props.title}
          open={isVisible.value}
          destroyOnHidden
          size={drawerSize.value}
          maskClosable={false}
          // 关闭按钮放到标题栏右侧（antdv-next 默认在标题左侧），
          // 调用方仍可通过 modalProps.closable 覆盖
          closable={{ placement: "end" }}
          onClose={onCloseModal}
          {...props.modalProps}
          footer={footer}
        >
          {{
            /**
             * @slot 弹窗内容
             */
            default: () => slots.default?.(),
            ...(slots.extra ? { extra: () => slots.extra() } : {}),
          }}
        </Drawer>
      );
    };

    return () => (
      <div class="newbie-modal">
        {props.type === "modal" ? elemModal() : elemDrawer()}
      </div>
    );
  },
});
