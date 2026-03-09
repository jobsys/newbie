import { computed, ref, watch, defineComponent } from "vue";
import { InputPassword } from "ant-design-vue";
import "./index.less";
import { genPixel } from "../../utils/style.js";

/**
 * 密码输入框
 *
 * 分为4个密码强度等级，每有以下字符的一种增强一个等级：数字，大写字母，小写字母，特殊字符
 * 每个等级都有对应的颜色，当输入的密码包含对应的等级时，对应的等级颜色会高亮
 *
 *
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbiePassword",
  components: { InputPassword },
  props: {
    /**
     * 输入框的值
     *
     */
    value: { type: String, default: "" },
    /**
     * 最小长度
     */
    min: { type: Number, default: 8 },
    /**
     * 最大长度
     */
    max: { type: Number, default: 20 },

    /**
     * 宽度
     */
    width: { type: [Number, String], default: 300 },
  },
  emits: [
    /**
     * @event update:modelValue
     */
    "update:value",

    /**
     * 输入框内容变化时的回调
     * @event change
     * @param {Event} event 事件对象
     */
    "change",
  ],
  setup(props, { emit, expose }) {
    const password = ref("");

    watch(
      () => props.modelValue,
      () => {
        password.value = props.modelValue;
      }
    );

    const strength = computed(() => {
      let score = 0;
      const regexList = [
        /\d/, // 包含数字
        /[a-z]/, // 包含小写字母
        /[A-Z]/, // 包含大写字母
        /[^a-zA-Z0-9]/, // 包含特殊符号
      ];

      regexList.forEach(regex => {
        if (regex.test(password.value)) {
          score += 1;
        }
      });

      return score;
    });

    const classList = ["", "bad", "weak", "medium", "strong"];

    const onChange = e => {
      const { value } = e.target;
      emit("change", e);
      emit("update:value", value);
    };

    const showError = computed(() => {
      return (
        (password.value.length > 0 && password.value.length < props.min) ||
        password.value.length > props.max ||
        strength.value < 4
      );
    });

    const errorMessage = computed(() => {
      if (password.value.length > 0 && password.value.length < props.min) {
        return `密码长度不能少于${props.min}个字符`;
      }
      if (password.value.length > props.max) {
        return `密码长度不能超过${props.max}个字符`;
      }
      if (strength.value < 4) {
        return "密码必须包含数字、小写字母、大写字母和特殊符号";
      }

      return "";
    });
    expose({
      /**
       * 密码强度，0 为最弱，4 为最强
       * @type {ComputedRef<number>}
       */
      strength,
    });
    return () => (
      <div class="newbie-password" style={{ width: genPixel(props.width) }}>
        <input-password
          v-model:value={password.value}
          onChange={onChange}
          minlength={props.min}
          maxlength={props.max}
        ></input-password>
        <div class={`strength-indicator-container ${classList[strength.value]}`}>
          <div class={`strength-indicator ${strength.value >= 1 ? "active" : ""}`}></div>
          <div class={`strength-indicator ${strength.value >= 2 ? "active" : ""}`}></div>
          <div class={`strength-indicator ${strength.value >= 3 ? "active" : ""}`}></div>
          <div class={`strength-indicator ${strength.value >= 4 ? "active" : ""}`}></div>
        </div>
        {showError.value ? <div class="error-message">{errorMessage.value}</div> : null}
      </div>
    );
  },
});
