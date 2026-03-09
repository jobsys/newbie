import { defineComponent, ref, watch } from "vue";
import { Checkbox, message, Modal } from "ant-design-vue";
import SignaturePad from "signature_pad";
import NewbieButton from "../button/NewbieButton.jsx";
import "./index.less";
import { useI18n } from "vue-i18n";

export default defineComponent({
  name: "NewbieSignaturePad",
  props: {
    title: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    agreement: {
      type: String,
      default: "",
    },
    preset: {
      type: String,
      default: "",
    },
  },
  emits: ["save"],
  setup(props, { emit, expose, slots }) {
    const { t } = useI18n();
    const showPopup = ref(false);
    const signaturePad = ref(null);
    const canvasContainerRef = ref(null);
    const canvasRef = ref(null);
    const agreed = ref(false);
    const open = () => {
      showPopup.value = true;
    };

    const resizeCanvas = () => {
      canvasRef.value.width = canvasContainerRef.value.offsetWidth;
      //canvasRef.value.height = canvasContainerRef.value.offsetHeight
      // have to clear it manually.
      //signaturePad.clear();

      // If you want to keep the drawing on resize instead of clearing it you can reset the data.
      signaturePad.value?.fromData(signaturePad.value?.toData());
    };

    // On mobile devices it might make more sense to listen to orientation change,
    // rather than window resize events.
    window.onresize = resizeCanvas;

    const initSignaturePad = () => {
      if (!canvasRef.value) {
        return;
      }
      resizeCanvas();
      signaturePad.value = new SignaturePad(canvasRef.value);
      if (props.preset) {
        signaturePad.value.fromDataURL(props.preset);
      }
      if (props.readonly) {
        signaturePad.value.off();
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

    watch(showPopup, val => {
      if (val) {
        setTimeout(initSignaturePad, 100);
      }
    });

    expose({
      open,
    });

    return () => (
      <Modal v-model={[showPopup.value, "open"]} footer={null} width={600}>
        <div class="newbie-signature-pad">
          {slots.title || props.title ? (
            <div class="newbie-signature-pad__title">{slots.title?.() || props.title}</div>
          ) : null}
          <div class="newbie-signature-pad__canvas-container" ref={canvasContainerRef}>
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
