import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import NewbiePassword from "../../components/password/NewbiePassword.jsx";

const findMessage = wrapper => wrapper.find(".error-message");

describe("NewbiePassword", () => {
	it("空值不显示错误提示", () => {
		const wrapper = mount(NewbiePassword, { props: { value: "" } });

		expect(findMessage(wrapper).exists()).toBe(false);
	});

	it("输入弱密码后按默认策略提示缺少的字符类型", async () => {
		const wrapper = mount(NewbiePassword, { props: { value: "" } });

		await wrapper.setProps({ value: "abcdefgh" });

		expect(findMessage(wrapper).text()).toBe("密码必须包含数字、大写字母和特殊符号");
	});

	it("strengthRules.require 可自定义提示的字符类型", async () => {
		const wrapper = mount(NewbiePassword, {
			props: { value: "abcdefgh", strengthRules: { require: ["digit"] } },
		});

		expect(findMessage(wrapper).text()).toBe("密码必须包含数字");

		await wrapper.setProps({ value: "abcdefg1" });

		expect(findMessage(wrapper).exists()).toBe(false);
	});

	it("strengthRules 可覆盖长度区间，require 为空时只校验长度", async () => {
		const wrapper = mount(NewbiePassword, {
			props: {
				value: "abc",
				min: 8,
				strengthRules: { min: 6, max: 10, require: [] },
			},
		});

		expect(findMessage(wrapper).text()).toBe("密码长度不能少于6个字符");

		await wrapper.setProps({ value: "abcdef" });

		expect(findMessage(wrapper).exists()).toBe(false);
	});
});
