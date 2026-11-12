import { defineComponent } from "vue";
import { Button } from "antdv-next";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { buttonDefaults } from "./config.js";

/**
 * 按钮组件
 * 在原生基础上增加了 loading 状态，以及图标的支持
 * loading 状态配合 useFetch 可以自动化处理
 *
 * @version 1.0.0
 */
export default defineComponent({
  name: "NewbieButton",
  props: {
    /**
     * 按钮类型
     * @values primary, ghost, dashed, link, text ,default
     */
    type: { type: String, default: undefined },

    /**
     * 按钮大小
     * @values large, middle, small
     */
    size: { type: String, default: undefined },

    /**
     * 失效状态
     */
    disabled: { type: Boolean, default: undefined },

    /**
     * 设置危险按钮
     */
    danger: { type: Boolean, default: undefined },

    /**
     * 按钮标签
     */
    label: { type: String, default: undefined },

    /**
     * 按钮图标，需要使用
     *
     */
    icon: { type: Object, default: undefined },

    /**
     * 按钮图标位置
     * @values left, right
     */
    iconPosition: { type: String, default: undefined },

    /**
     * 请求状态控制器
     * @param {boolean} fetcher.loading 是否加载中
     */
    fetcher: {
      type: Object,
      default: undefined,
    },

    /**
     * 原生 [Button](https://www.antdv-next.com/components/button-cn#props) 配置
     */
    buttonProps: {
      type: Object,
      default: undefined,
    },
  },
  emits: [
    /**
     * @event click
     * @param {Event} event 点击事件
     */
    "click",
  ],
  setup(rawProps, { emit, slots }) {
    const props = useMergedProps(rawProps, "button", buttonDefaults);
    const onClick = e => {
      emit("click", e);
    };

    const defaultLabel = () => {
      return props.label || slots.default?.() || "";
    };

    const defaultSlot = () => {
      if (props.icon && props.iconPosition === "left") {
        return [props.icon, defaultLabel()];
      } else if (props.icon && props.iconPosition === "right") {
        return [defaultLabel(), props.icon];
      }
      return [defaultLabel()];
    };

    return () => (
      <Button
        danger={props.danger}
        loading={props.fetcher.loading}
        type={props.type}
        size={props.size}
        disabled={props.disabled}
        onClick={onClick}
        {...props.buttonProps}
      >
        {{
          default: () => defaultSlot(),
        }}
      </Button>
    );
  },
});
