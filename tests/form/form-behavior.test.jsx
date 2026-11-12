import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import NewbieForm from "../../components/form/NewbieForm.jsx";
import { getFetchInstance, setFetchInstance } from "../../hooks/network.js";

const mountForm = (formProps = {}) =>
	mount(NewbieForm, {
		props: {
			cardWrapper: false,
			hideButtons: true,
			// 避开内置成功提示，只关注提交体
			afterSubmit: () => {},
			...formProps,
		},
	});

const submitWith = async beforeSubmit => {
	const wrapper = mountForm({
		form: [{ key: "name", type: "input", defaultValue: "张三" }],
		submitUrl: "/api/form",
		beforeSubmit,
	});

	await nextTick();
	await wrapper.findComponent(NewbieForm).vm.submit();
	await flushPromises();
	wrapper.unmount();
};

describe("NewbieForm 渲染期只读配置（F-004）", () => {
	it("多列 + columnIndex 数组挂载不递归，且不写回调用方配置", async () => {
		const form = [
			{ key: "a", title: "A", type: "input", columnIndex: [0, 1] },
			{ key: "b", title: "B", type: "input", columnIndex: 1 },
			// 未声明 type，默认值只能补在内部副本上
			{ key: "c", title: "C" },
		];

		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const wrapper = mountForm({ columns: [12, 12], form });

		await nextTick();
		await nextTick();
		await flushPromises();

		const messages = [...errorSpy.mock.calls, ...warnSpy.mock.calls].map(args => String(args[0]));

		errorSpy.mockRestore();
		warnSpy.mockRestore();

		expect(messages.some(message => message.includes("Maximum recursive updates"))).toBe(false);
		expect(messages.some(message => message.includes("Failed to resolve component"))).toBe(false);

		// 渲染期不得改写调用方传入的 form 配置
		for (const item of form) {
			expect(item).not.toHaveProperty("span");
			expect(item).not.toHaveProperty("formItemProps");
		}
		expect(form[2]).not.toHaveProperty("type");

		// 三种字段都正常渲染与初始化
		expect(wrapper.findComponent(NewbieForm).vm.getForm()).toEqual({
			a: "",
			b: "",
			c: "",
		});

		wrapper.unmount();
	});
});

describe("NewbieForm.beforeSubmit 契约（F-012）", () => {
	const posted = [];
	let originalInstance = null;

	beforeEach(() => {
		originalInstance = getFetchInstance();
		setFetchInstance({
			post: (url, data) => {
				posted.push({ url, data });
				return Promise.resolve({ status: "SUCCESS" });
			},
		});
	});

	afterEach(() => {
		setFetchInstance(originalInstance);
		posted.length = 0;
	});

	it("返回 undefined 时沿用原提交体", async () => {
		await submitWith(() => {});

		expect(posted).toHaveLength(1);
		expect(posted[0].data).toEqual({ name: "张三" });
	});

	it("返回对象时替换提交体", async () => {
		await submitWith(() => ({ custom: true }));

		expect(posted).toHaveLength(1);
		expect(posted[0].data).toEqual({ custom: true });
	});

	it("返回 false 时阻止提交", async () => {
		await submitWith(() => false);

		expect(posted).toHaveLength(0);
	});
});

describe("条件逻辑隐藏字段的值恢复（F-024）", () => {
	it("字段重新显示时回填隐藏前的值", async () => {
		const wrapper = mountForm({
			data: { mode: "B", extra: "hello" },
			form: {
				fields: [
					{ key: "mode", type: "radio", options: ["A", "B"] },
					{ key: "extra", type: "input" },
				],
				logic: {
					rules: [
						{
							targetField: "extra",
							action: "hide",
							conditions: [{ field: "mode", operator: "notEquals", value: "B" }],
						},
					],
				},
			},
		});

		await nextTick();
		await flushPromises();

		const formVm = wrapper.findComponent(NewbieForm).vm;
		expect(formVm.getForm().extra).toBe("hello");

		// 隐藏：值置为 null，但隐藏前的值会被暂存
		formVm.setForm({ mode: "A" });
		await nextTick();
		await nextTick();
		expect(formVm.getForm().extra).toBe(null);

		// 重新显示：回填暂存值，不丢用户数据
		formVm.setForm({ mode: "B" });
		await nextTick();
		await nextTick();
		expect(formVm.getForm().extra).toBe("hello");

		wrapper.unmount();
	});
});

describe("Group 字段的组件解析（F-010）", () => {
	it("未全局注册时 group 字段也能渲染", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const wrapper = mountForm({
			form: [
				{
					key: "items",
					type: "group",
					title: "明细",
					children: [{ key: "name", type: "input", title: "名称" }],
				},
			],
		});

		await nextTick();
		await flushPromises();

		const messages = warnSpy.mock.calls.map(args => String(args[0]));
		warnSpy.mockRestore();

		expect(messages.some(message => message.includes("Failed to resolve component"))).toBe(false);
		expect(wrapper.text()).toContain("明细");

		wrapper.unmount();
	});
});

describe("data 支持 JSON 字符串（F-022）", () => {
	it("字符串按 JSON 解析，不展开成字符索引对象", async () => {
		const wrapper = mountForm({
			data: JSON.stringify({ name: "字符串数据" }),
			form: [{ key: "name", type: "input" }],
		});

		await nextTick();
		await flushPromises();

		expect(wrapper.findComponent(NewbieForm).vm.getForm()).toEqual({ name: "字符串数据" });

		wrapper.unmount();
	});

	it("非法 JSON 时忽略并告警", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

		const wrapper = mountForm({
			data: "not-json",
			form: [{ key: "name", type: "input", defaultValue: "默认值" }],
		});

		await nextTick();
		await flushPromises();

		const messages = warnSpy.mock.calls.map(args => String(args[0]));
		warnSpy.mockRestore();

		expect(messages.some(message => message.includes("data"))).toBe(true);
		// 不会出现 {0: "n", 1: "o"} 这类字符索引字段
		expect(wrapper.findComponent(NewbieForm).vm.getForm()).toEqual({ name: "默认值" });

		wrapper.unmount();
	});
});
