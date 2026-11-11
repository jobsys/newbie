import { config } from "@vue/test-utils";
import i18n from "../i18n.js";

config.global.plugins = [i18n];

// antdv-next 在 jsdom 下可能用到，缺失时补上
if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

if (!window.matchMedia) {
	window.matchMedia = query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener() {},
		removeListener() {},
		addEventListener() {},
		removeEventListener() {},
		dispatchEvent() {
			return false;
		},
	});
}
