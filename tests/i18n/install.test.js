import { describe, expect, it, vi } from "vitest";
import { createApp } from "vue";
import { createI18n } from "vue-i18n";

// 只验证 install 的 i18n 行为，屏蔽组件注册，避免依赖其它组件的实现细节
vi.mock("../../components", () => ({}));
vi.mock("../../hooks", () => ({ _configStatus: () => {} }));

import Newbie from "../../index.js";

describe("Newbie install 的 i18n 行为", () => {
	it("宿主未安装 vue-i18n 时安装内置实例", () => {
		const app = createApp({});
		app.use(Newbie);

		const installed = app.config.globalProperties.$i18n;
		expect(installed).toBeTruthy();
		expect(installed.locale).toBe("zh_CN");

		// 重复安装不会替换已有实例
		app.use(Newbie);
		expect(app.config.globalProperties.$i18n).toBe(installed);
	});

	it("宿主已安装 vue-i18n 时复用宿主实例", () => {
		const host = createI18n({
			legacy: false,
			locale: "en_US",
			messages: { en_US: {}, zh_CN: {} },
		});
		const app = createApp({});
		app.use(host);

		const installed = app.config.globalProperties.$i18n;
		expect(installed.locale).toBe("en_US");

		app.use(Newbie);

		expect(app.config.globalProperties.$i18n).toBe(installed);
		expect(app.config.globalProperties.$i18n.locale).toBe("en_US");
	});
});
