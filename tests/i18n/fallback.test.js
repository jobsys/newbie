import { afterEach, describe, expect, it, vi } from "vitest";
import { t, useT, useI18nJoin, useLocale } from "../../hooks/i18n.js";
import i18n from "../../i18n.js";

afterEach(() => {
	i18n.global.locale.value = "zh_CN";
	vi.restoreAllMocks();
});

describe("t", () => {
	it("在 setup 之外也能返回翻译后的字符串", () => {
		expect(t("common.confirm")).toBe("确定");
	});

	it("数组 key 会逐项翻译后拼接", () => {
		expect(t(["common.confirm", "common.cancel"])).toBe("确定取消");
	});

	it("遇到不存在的 key 不抛错", () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(() => t("__newbie_not_exists__")).not.toThrow();
		expect(typeof t("__newbie_not_exists__")).toBe("string");
	});

	it("跟随内置实例的 locale 切换", () => {
		i18n.global.locale.value = "en_US";
		expect(t("common.confirm")).toBe("Confirm");
	});
});

describe("useT / useI18nJoin 降级", () => {
	it("在 setup 之外调用 useT 时降级到内置实例", () => {
		expect(useT("common.confirm")).toBe("确定");
		expect(useT(["common.confirm", "common.cancel"])).toBe("确定取消");
	});

	it("在 setup 之外调用 useI18nJoin 时能读取内置 locale", () => {
		expect(useI18nJoin("确定", "关闭")).toBe("确定关闭");

		i18n.global.locale.value = "en_US";
		expect(useI18nJoin(" confirm ", " cancel ")).toBe("Confirm cancel");
	});

	it("useLocale 在 setup 之外返回 t / locale，可直接替代 useI18n", () => {
		const { t: translate, locale } = useLocale();
		expect(translate("common.confirm")).toBe("确定");
		expect(locale.value).toBe("zh_CN");

		i18n.global.locale.value = "en_US";
		expect(translate("common.confirm")).toBe("Confirm");
		expect(locale.value).toBe("en_US");
	});
});
