import { defineComponent } from "vue";
import { CopyOutlined } from "@ant-design/icons-vue";
import { useClipboard } from "@vueuse/core";
import { message } from "ant-design-vue";
import i18n from "../../i18n.js";

import "./index.less";

/**
 * 复制组件（仅在 https 协议下有效）
 *
 *
 * @version 2.1.0
 */
export default defineComponent({
  name: "NewbieCopy",
  props: {
    /**
     * 复制内容，默认也作为显示内容
     */
    text: { type: String, default: "" },

    /**
     * true: 复制图标一直显示; false: 仅 hover 时显示
     */
    showIcon: { type: Boolean, default: false },

    /**
     * 自定义渲染内容
     */
    customRender: { type: Function, default: null },

    /**
     * 自定义复制方法
     */
    copy: { type: Function, default: null },
  },
  setup(props) {
    const { copy } = useClipboard();
    const onClick = async () => {
      if (props.copy) {
        await props.copy(props.text);
      } else {
        await copy(props.text);
        message.success(i18n.global.t("table.copy-success"));
      }
    };

    const contentElem = () => {
      if (props.customRender) {
        return <span class={"newbie-copy-text"}>{props.customRender(props.text)}</span>;
      }
      return <span class={"newbie-copy-text"}>{props.text}</span>;
    };

    return () => (
      <span class={"newbie-copy"} onClick={onClick}>
        {contentElem()}
        <span class={`newbie-copy-icon ${props.showIcon ? "always-show" : ""}`}>
          <CopyOutlined></CopyOutlined>
        </span>
      </span>
    );
  },
});
