import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

describe("vitest", () => {
	it("可以挂载 Vue 组件", () => {
		const Demo = defineComponent({
			setup: () => () => h("div", { class: "demo" }, "ok"),
		});
		const wrapper = mount(Demo);
		expect(wrapper.find(".demo").text()).toBe("ok");
	});
});
