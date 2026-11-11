import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, inject, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import i18n from "../../i18n.js";
import NewbieProvider, { NEWBIE_TABLE } from "../../components/provider/NewbieProvider.jsx";
import { NEWBIE_CONFIG } from "../../components/provider/config.js";

const Probe = defineComponent({
	setup() {
		const bag = inject(NEWBIE_CONFIG, {});
		return () => <div class="probe">{JSON.stringify(bag)}</div>;
	},
});

const mountWith = (props, slot = () => h(Probe)) =>
	mount(NewbieProvider, { props, slots: { default: slot } });

afterEach(() => {
	i18n.global.locale.value = "zh_CN";
	vi.restoreAllMocks();
});

describe("NewbieProvider", () => {
	it("config 覆盖包原样提供给子组件", () => {
		const wrapper = mountWith({ config: { table: { pageSize: 50 } } });
		expect(wrapper.find(".probe").text()).toContain('"pageSize":50');
	});

	it("旧 props 仍然生效，且 config 优先", () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const wrapper = mountWith({
			table: { pageSize: 30 },
			config: { table: { pageSize: 50 } },
		});
		expect(wrapper.find(".probe").text()).toContain('"pageSize":50');
		expect(console.warn).toHaveBeenCalled();
	});

	it("默认不修改宿主 i18n 语言", () => {
		i18n.global.locale.value = "en_US";
		mountWith({});
		expect(i18n.global.locale.value).toBe("en_US");
	});

	it("显式传入 locale 时同步到 i18n", async () => {
		const wrapper = mountWith({ locale: "en_US" });
		expect(i18n.global.locale.value).toBe("en_US");

		await wrapper.setProps({ locale: "zh_CN" });
		expect(i18n.global.locale.value).toBe("zh_CN");
	});

	it("不额外包裹 DOM 节点", () => {
		const wrapper = mountWith({}, () => h("span", { class: "only" }, "ok"));
		expect(wrapper.html()).toBe('<span class="only">ok</span>');
	});

	it("异步替换 config 后子组件更新", async () => {
		const wrapper = mountWith({ config: { table: { pageSize: 30 } } });
		await wrapper.setProps({ config: { table: { pageSize: 60 } } });
		await nextTick();
		expect(wrapper.find(".probe").text()).toContain('"pageSize":60');
	});

	it("兼容期内旧 Symbol 仍可注入", () => {
		const LegacyProbe = defineComponent({
			setup() {
				const bag = inject(NEWBIE_TABLE, {});
				return () => <div class="legacy">{bag.pageSize}</div>;
			},
		});
		const wrapper = mountWith(
			{ config: { table: { pageSize: 50 } } },
			() => h(LegacyProbe)
		);
		expect(wrapper.find(".legacy").text()).toBe("50");
	});
});
