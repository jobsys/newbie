import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import { Checkbox, message, Modal } from "antdv-next";
import { useEventListener } from "@vueuse/core";
import SignaturePad from "signature_pad";
import NewbieButton from "../button/NewbieButton.jsx";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { signaturePadDefaults } from "./config.js";
import "./index.less";
import { useLocale } from "../../hooks/i18n.js";

export default defineComponent({
  name: "NewbieSignaturePad",
  props: {
    title: {
      type: String,
      default: undefined,
    },
    readonly: {
      type: Boolean,
      default: undefined,
    },
    agreement: {
      type: String,
      default: undefined,
    },
    preset: {
      type: String,
      default: undefined,
    },
  },
  emits: ["save"],
  setup(rawProps, { emit, expose, slots }) {
    const props = useMergedProps(rawProps, "signaturePad", signaturePadDefaults);
    const { t } = useLocale();
    const showPopup = ref(false);
    const signaturePad = ref(null);
    const canvasRef = ref(null);
    const agreed = ref(false);
    const open = () => {
      showPopup.value = true;
    };

    // signature_pad 5 直接用 clientX/clientY（CSS 像素）作为绘制坐标，
    // 所以位图必须是 CSS 尺寸 × devicePixelRatio，再用 setTransform 缩放坐标系；
    // 否则位图会被浏览器拉伸，笔画就会偏离鼠标、落在光标后面。
    let canvasRatio = 0;
    const resizeCanvas = () => {
      const canvas = canvasRef.value;
      if (!canvas) {
        return;
      }
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) {
        return;
      }
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const nextWidth = Math.round(width * ratio);
      const nextHeight = Math.round(height * ratio);
      if (canvas.width === nextWidth && canvas.height === nextHeight && canvasRatio === ratio) {
        return;
      }
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      // 修改 width/height 会重置 2d 上下文状态，需重新应用缩放
      canvas.getContext("2d")?.setTransform(ratio, 0, 0, ratio, 0, 0);
      canvasRatio = ratio;
      // 尺寸变化会清空画布，重绘已有内容（含 preset）
      signaturePad.value?.redraw();
    };

    // On mobile devices it might make more sense to listen to orientation change,
    // rather than window resize events.
    // 使用 useEventListener 自动解绑，避免覆盖宿主应用的 window.onresize。
    useEventListener(window, "resize", resizeCanvas);

    // 创建（或复用）SignaturePad 实例。弹窗内容被销毁重建时先解绑旧实例，
    // 避免重复监听指针事件导致笔画抖动。
    let prepared = false;
    const ensureSignaturePad = () => {
      const canvas = canvasRef.value;
      if (!canvas) {
        return null;
      }
      if (signaturePad.value && signaturePad.value.canvas !== canvas) {
        signaturePad.value.off();
        signaturePad.value = null;
        // 画布被重建，新画布需要重新应用 preset
        prepared = false;
      }
      if (!signaturePad.value) {
        // 无 canvas 2d 上下文（如 jsdom、部分受限 WebView）时跳过初始化，
        // 避免 signature_pad 在 renderer 为 null 时抛 "setting 'fillStyle'"
        if (!canvas.getContext?.("2d")) {
          return null;
        }
        resizeCanvas();
        // minDistance 默认 5px 会让笔画末端最多落后光标 5px，收窄到 1px 更跟手
        signaturePad.value = new SignaturePad(canvas, { minDistance: 1 });
      }
      return signaturePad.value;
    };

    // 每次打开只重置一次，之后仅同步画布尺寸
    const prepareSignaturePad = () => {
      const pad = ensureSignaturePad();
      if (!pad) {
        return;
      }
      resizeCanvas();
      if (props.readonly) {
        pad.off();
      }
      if (prepared) {
        return;
      }
      prepared = true;
      if (!props.readonly) {
        // 从空白开始，避免残留上一次的签名
        pad.clear();
      }
      if (props.preset) {
        pad.fromDataURL(props.preset);
      }
    };

    const onClearSignature = () => {
      if (signaturePad.value) {
        signaturePad.value.clear();
      }
    };

    const onSaveSignature = () => {
      if (!signaturePad.value || signaturePad.value.isEmpty()) {
        return;
      }

      if (props.agreement && !agreed.value) {
        message.warn(t("signature-pad.agreement"));
        return;
      }
      const dataUrl = signaturePad.value.toDataURL();
      emit("save", dataUrl);
      showPopup.value = false;
    };

    const onClose = () => {
      showPopup.value = false;
    };

    let initTimer = null;

    watch(showPopup, val => {
      if (val) {
        prepared = false;
        initTimer = setTimeout(prepareSignaturePad, 100);
      }
    });

    onBeforeUnmount(() => {
      if (initTimer) {
        clearTimeout(initTimer);
        initTimer = null;
      }
      signaturePad.value?.off();
      signaturePad.value = null;
    });

    expose({
      open,
    });

    return () => (
      <Modal
        v-model={[showPopup.value, "open"]}
        footer={null}
        width={600}
        afterOpenChange={isOpen => {
          // 弹窗动画结束后布局才最终确定，此时同步画布尺寸，保证笔迹与鼠标对齐
          if (isOpen) {
            prepareSignaturePad();
          }
        }}
      >
        <div class="newbie-signature-pad">
          {slots.title || props.title ? (
            <div class="newbie-signature-pad__title">{slots.title?.() || props.title}</div>
          ) : null}
          <div class="newbie-signature-pad__canvas-container">
            <canvas class="newbie-signature-pad__canvas" ref={canvasRef} />
          </div>
          {props.agreement && !props.readonly && (
            <div class="newbie-signature-pad__agreement">
              <Checkbox v-model:checked={agreed.value}>{props.agreement}</Checkbox>
            </div>
          )}
          {props.readonly ? (
            <div class="newbie-signature-pad__actions">
              <NewbieButton type="default" onClick={onClose}>
                {t("common.close")}
              </NewbieButton>
            </div>
          ) : (
            <div class="newbie-signature-pad__actions">
              <NewbieButton
                type="default"
                onClick={onClearSignature}
                style={{ marginRight: "4px" }}
              >
                {t("common.clear")}
              </NewbieButton>
              <NewbieButton type="primary" onClick={onSaveSignature}>
                {t("common.save")}
              </NewbieButton>
            </div>
          )}
        </div>
      </Modal>
    );
  },
});
