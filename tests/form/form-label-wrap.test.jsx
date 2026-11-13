import { describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import NewbieProvider from "../../components/provider/NewbieProvider.jsx";
import NewbieForm from "../../components/form/NewbieForm.jsx";

const fields = [
	{ key: "name", type: "input", title: "这是一个很长很长、需要自动换行的表单标签" },
	{ key: "code", type: "input", title: "编码" },
];

const mountForm = formProps =>
	mount(
		defineComponent({
			setup: () => () => (
				<NewbieProvider>
					<NewbieForm form={fields} submitUrl={"/api/form"} {...formProps} />
				</NewbieProvider>
			),
		})
	);

const getLabelWraps = wrapper => wrapper.findAll(".ant-form-item-label");

describe("NewbieForm Label 自动换行", () => {
	it("默认给所有 FormItem 的 Label 开启换行", async () => {
		const wrapper = mountForm();
		await nextTick();

		const labels = getLabelWraps(wrapper);
		expect(labels.length).toBe(fields.length);
		labels.forEach(label => {
			expect(label.classes()).toContain("ant-form-item-label-wrap");
		});

		wrapper.unmount();
	});

	it("labelWrap 为 false 时恢复 antd 默认的不换行", async () => {
		const wrapper = mountForm({ labelWrap: false });
		await nextTick();

		getLabelWraps(wrapper).forEach(label => {
			expect(label.classes()).not.toContain("ant-form-item-label-wrap");
		});

		wrapper.unmount();
	});

	it("formProps.labelWrap 可以覆盖 labelWrap 的默认值", async () => {
		const wrapper = mountForm({ labelWrap: false, formProps: { labelWrap: true } });
		await nextTick();

		getLabelWraps(wrapper).forEach(label => {
			expect(label.classes()).toContain("ant-form-item-label-wrap");
		});

		wrapper.unmount();
	});
});
