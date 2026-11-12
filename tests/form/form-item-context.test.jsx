import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { useFormItemChange } from "../../utils/form-item-context.js";

describe("useFormItemChange 适配层（F-038）", () => {
	it("在表单之外调用时降级为空操作，不影响组件渲染", () => {
		const wrapper = mount(
			defineComponent({
				setup() {
					// 内部依赖 antdv-next 的内部子路径，导出缺失时应降级而不是抛错
					const triggerChange = useFormItemChange();
					expect(typeof triggerChange).toBe("function");
					expect(() => triggerChange()).not.toThrow();
					return () => <div class={"probe"}>ok</div>;
				},
			})
		);

		expect(wrapper.find(".probe").exists()).toBe(true);
		wrapper.unmount();
	});
});
