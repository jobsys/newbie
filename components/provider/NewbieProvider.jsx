import { defineComponent, provide, reactive, readonly, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NEWBIE_CONFIG, mergeConfig } from "./config.js";

// TODO(next-major): 删除顶层 editor/table/uploader/form/search props，
// 以及仅为它们服务的 LEGACY_KEYS / legacyProps()。
const LEGACY_KEYS = ["editor", "table", "uploader", "form", "search"];

const legacyProps = () =>
	LEGACY_KEYS.reduce((props, key) => {
		props[key] = { type: Object, default: undefined };
		return props;
	}, {});

/**
 * Newbie 全局配置
 *
 * @example
 * <NewbieProvider :config="{ table: { pageSize: 50 }, uploader: { uploadUrl: '/api/upload' } }">
 *   <App />
 * </NewbieProvider>
 */
export default defineComponent({
	name: "NewbieProvider",
	inheritAttrs: false,
	props: {
		/**
		 * 任意组件命名空间的覆盖包，key 由组件自己定义
		 */
		config: { type: Object, default: () => ({}) },

		/**
		 * vue-i18n 的语言；留空表示不修改宿主语言
		 */
		locale: { type: String, default: "" },

		// 旧 API，保留一个版本，内部映射到 config
		...legacyProps(),
	},
	setup(props, { slots }) {
		const toBag = () => {
			const legacy = {};
			for (const key of LEGACY_KEYS) {
				if (props[key]) {
					legacy[key] = props[key];
				}
			}
			return mergeConfig(legacy, props.config);
		};

		const legacyKeys = LEGACY_KEYS.filter(key => props[key]);
		if (legacyKeys.length) {
			console.warn(
				`[NewbieProvider] 顶层 ${legacyKeys.join(", ")} props 已废弃，请改用 :config="{ ${legacyKeys.join(", ")}: {...} }"`
			);
		}

		const config = reactive(toBag());
		provide(NEWBIE_CONFIG, readonly(config));

		watch(
			toBag,
			next => {
				for (const key of Object.keys(config)) {
					if (!(key in next)) {
						delete config[key];
					}
				}
				Object.assign(config, next);
			},
			{ deep: true }
		);

		const { locale } = useI18n({ useScope: "global" });
		watch(
			() => props.locale,
			value => {
				if (value) {
					locale.value = value;
				}
			},
			{ immediate: true }
		);

		return () => slots.default?.() ?? null;
	},
});
