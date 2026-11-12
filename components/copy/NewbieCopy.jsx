import {defineComponent} from "vue";
import {CopyOutlined} from "@antdv-next/icons";
import {useClipboard} from "@vueuse/core";
import {message} from "antdv-next";
import i18n from "../../i18n.js";
import { useMergedProps } from "../../hooks/useMergedProps.js";
import { copyDefaults } from "./config.js";

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
		text: { type: String, default: undefined },

		/**
		 * true: 复制图标一直显示; false: 仅 hover 时显示
		 */
		showIcon: { type: Boolean, default: undefined },

		/**
		 * 自定义渲染内容
		 */
		customRender: { type: Function, default: undefined },

		/**
		 * 自定义复制方法
		 */
		copy: { type: Function, default: undefined },
	},
	setup(rawProps) {
		const props = useMergedProps(rawProps, "copy", copyDefaults);
		const { copy } = useClipboard({ legacy: true });
		const onClick = async () => {
			if (props.copy) {
				await props.copy(props.text);
			} else {
				await copy(props.text);
				await message.success(i18n.global.t("table.copy-success"));
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
