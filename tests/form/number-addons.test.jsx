import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import NewbieForm from "../../components/form/NewbieForm.jsx";

const mountForm = fields =>
	mount(
		defineComponent({
			setup: () => () => <NewbieForm form={fields} submitUrl={"/api/form"} />,
		})
	);

describe("NewbieForm 数字字段附加内容", () => {
	it("addonBefore / addonAfter 转换为 Space.Compact，不产生废弃警告", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const wrapper = mountForm([
			{
				title: "工时",
				key: "hours",
				type: "number",
				defaultProps: { addonBefore: "¥", addonAfter: "小时" },
			},
		]);
		await nextTick();

		expect(wrapper.text()).toContain("¥");
		expect(wrapper.text()).toContain("小时");
		expect(wrapper.find(".ant-space-compact").exists()).toBe(true);
		expect(wrapper.findAll(".ant-space-addon")).toHaveLength(2);
		expect(wrapper.find(".ant-input-number").exists()).toBe(true);

		const addonWarnings = error.mock.calls.filter(([message]) =>
			String(message).includes("addonAfter")
		);
		expect(addonWarnings).toHaveLength(0);
		error.mockRestore();
	});

	it("兼容 Input 风格的 prepend / append 写法", async () => {
		const wrapper = mountForm([
			{
				title: "人数",
				key: "people",
				type: "number",
				defaultProps: { prepend: "共", append: "人" },
			},
		]);
		await nextTick();

		expect(wrapper.text()).toContain("共");
		expect(wrapper.text()).toContain("人");
	});
});
