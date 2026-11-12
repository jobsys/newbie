import { computed, ref, watch, defineComponent } from "vue";
import { InputPassword } from "antdv-next";
import "./index.less";
import { genPixel } from "../../utils/style.js";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { passwordDefaults } from "./config.js";

/**
 * 字符类型定义，用于计算强度与生成提示文案
 */
const STRENGTH_TYPES = {
  digit: { regex: /\d/, label: "数字" },
  lower: { regex: /[a-z]/, label: "小写字母" },
  upper: { regex: /[A-Z]/, label: "大写字母" },
  symbol: { regex: /[^a-zA-Z0-9]/, label: "特殊符号" },
};

const DEFAULT_REQUIRE = ["digit", "lower", "upper", "symbol"];

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
    value: { type: String, default: undefined },
    /**
     * 最小长度
     */
    min: { type: Number, default: undefined },
    /**
     * 最大长度
     */
    max: { type: Number, default: undefined },

    /**
     * 强度与字符组合策略，只用于展示提示，不会阻止输入或提交
     *
     * `min` / `max` 省略时沿用组件的 min / max 属性；
     * `require` 支持 `digit`、`lower`、`upper`、`symbol`，传空数组可关闭字符组合提示。
     *
     * @example { min: 6, max: 16, require: ["digit", "lower"] }
     */
    strengthRules: {
      type: Object,
      default: undefined,
    },

    /**
     * 宽度
     */
    width: { type: [Number, String], default: undefined },
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
  setup(rawProps, { emit, expose }) {
    const props = useMergedProps(rawProps, "password", passwordDefaults);
    const password = ref(props.value || "");

    watch(
      () => props.value,
      value => {
        if (value !== password.value) {
          password.value = value || "";
        }
      }
    );

    const strength = computed(() => {
      let score = 0;

      Object.values(STRENGTH_TYPES).forEach(({ regex }) => {
        if (regex.test(password.value)) {
          score += 1;
        }
      });

      return score;
    });

    /**
     * 实际生效的强度策略：props.strengthRules 覆盖默认的字符组合要求
     */
    const rules = computed(() => ({
      min: props.min,
      max: props.max,
      require: DEFAULT_REQUIRE,
      ...props.strengthRules,
    }));

    /**
     * 未满足的字符类型
     */
    const missingRequirements = computed(() =>
      (rules.value.require || []).filter(
        type => STRENGTH_TYPES[type] && !STRENGTH_TYPES[type].regex.test(password.value)
      )
    );

    const classList = ["", "bad", "weak", "medium", "strong"];

    const onChange = e => {
      const { value } = e.target;
      emit("change", e);
      emit("update:value", value);
    };

    const showError = computed(() => {
      // 空值不提示错误，把是否必填交给表单校验
      if (password.value.length === 0) {
        return false;
      }

      return (
        password.value.length < rules.value.min ||
        password.value.length > rules.value.max ||
        missingRequirements.value.length > 0
      );
    });

    const errorMessage = computed(() => {
      if (password.value.length === 0) {
        return "";
      }
      if (password.value.length < rules.value.min) {
        return `密码长度不能少于${rules.value.min}个字符`;
      }
      if (password.value.length > rules.value.max) {
        return `密码长度不能超过${rules.value.max}个字符`;
      }
      if (missingRequirements.value.length > 0) {
        const labels = missingRequirements.value.map(type => STRENGTH_TYPES[type].label);
        const text =
          labels.length > 1
            ? `${labels.slice(0, -1).join("、")}和${labels[labels.length - 1]}`
            : labels[0];
        return `密码必须包含${text}`;
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
          minlength={rules.value.min}
          maxlength={rules.value.max}
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
