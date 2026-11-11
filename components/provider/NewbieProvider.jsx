import { defineComponent, provide, reactive, readonly, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NEWBIE_CONFIG, mergeConfig } from "./config.js";

// ===== 兼容期：以下 Symbol、LEGACY_DEFAULTS 与旧 provide 在 Phase 8 删除 =====
export const NEWBIE_LOCALE = Symbol("NEWBIE_LOCALE");
export const NEWBIE_EDITOR = Symbol("NEWBIE_EDITOR");
export const NEWBIE_TABLE = Symbol("NEWBIE_TABLE");
export const NEWBIE_UPLOADER = Symbol("NEWBIE_UPLOADER");
export const NEWBIE_FORM = Symbol("NEWBIE_FORM");
export const NEWBIE_SEARCH = Symbol("NEWBIE_SEARCH");

const LEGACY_KEYS = ["editor", "table", "uploader", "form", "search"];

const LEGACY_SYMBOLS = {
	editor: NEWBIE_EDITOR,
	table: NEWBIE_TABLE,
	uploader: NEWBIE_UPLOADER,
	form: NEWBIE_FORM,
	search: NEWBIE_SEARCH,
};

// 兼容期保留旧默认值，保证 Phase 4-6 迁移前旧组件行为不变；Phase 8 删除
const LEGACY_DEFAULTS = {
	editor: { uploadUrl: "" },
	table: {
		page: 1,
		pageSize: 10,
		pageKey: "page",
		pageSizeKey: "pageSize",
		afterFetched: null,
	},
	uploader: {
		uploadUrl: "",
		defaultFileItem: {
			id: "id",
			name: "name",
			url: "url",
			path: "path",
			thumbUrl: "thumbUrl",
		},
		defaultPreview: null,
	},
	form: { format: {}, afterFetched: null, columns: {} },
	search: { maskClass: "", inputClass: "", valueFormatter: null },
};
// ===== 兼容期结束 =====

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

		// 兼容期：旧组件仍能注入；Phase 8 删除
		for (const key of LEGACY_KEYS) {
			provide(
				LEGACY_SYMBOLS[key],
				mergeConfig(LEGACY_DEFAULTS[key], config[key] || {})
			);
		}
		provide(NEWBIE_LOCALE, toRef(props, "locale"));

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
