import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, nextTick, provide, reactive } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import axios from "axios";
import NewbieModal from "../../components/modal/NewbieModal.jsx";
import NewbieList from "../../components/list/NewbieList.jsx";
import NewbieAddress from "../../components/address/NewbieAddress.jsx";
import NewbieCopy from "../../components/copy/NewbieCopy.jsx";
import NewbiePassword from "../../components/password/NewbiePassword.jsx";
import NewbieSignaturePad from "../../components/signature-pad/NewbieSignaturePad.jsx";
import NewbieButton from "../../components/button/NewbieButton.jsx";
import { modalDefaults } from "../../components/modal/config.js";
import { listDefaults } from "../../components/list/config.js";
import { addressDefaults } from "../../components/address/config.js";
import { copyDefaults } from "../../components/copy/config.js";
import { passwordDefaults } from "../../components/password/config.js";
import { signaturePadDefaults } from "../../components/signature-pad/config.js";
import { buttonDefaults } from "../../components/button/config.js";

// 与 components/provider/config.js 的 NEWBIE_CONFIG 同一个 key，
// 直接写 Symbol.for 以证明跨构建 entry 也能注入。
const CONFIG_KEY = Symbol.for("jobsys-newbie.config");

const components = [
	{ name: "NewbieModal", namespace: "modal", component: NewbieModal, defaults: modalDefaults },
	{ name: "NewbieList", namespace: "list", component: NewbieList, defaults: listDefaults },
	{
		name: "NewbieAddress",
		namespace: "address",
		component: NewbieAddress,
		defaults: addressDefaults,
	},
	{ name: "NewbieCopy", namespace: "copy", component: NewbieCopy, defaults: copyDefaults },
	{
		name: "NewbiePassword",
		namespace: "password",
		component: NewbiePassword,
		defaults: passwordDefaults,
	},
	{
		name: "NewbieSignaturePad",
		namespace: "signaturePad",
		component: NewbieSignaturePad,
		defaults: signaturePadDefaults,
	},
	{ name: "NewbieButton", namespace: "button", component: NewbieButton, defaults: buttonDefaults },
];

const wrappers = [];

const mountWithConfig = (component, config, props = {}, slots) => {
	const Host = defineComponent({
		setup() {
			provide(CONFIG_KEY, config);
			return () => h(component, props, slots);
		},
	});
	const wrapper = mount(Host, { attachTo: document.body });
	wrappers.push(wrapper);
	return wrapper;
};

const ok = data => ({
	status: "SUCCESS",
	result: { data, last_page: 1, total: data.length },
});

afterEach(() => {
	wrappers.forEach(wrapper => wrapper.unmount());
	wrappers.length = 0;
	document.body.innerHTML = "";
	vi.restoreAllMocks();
});

describe("组件默认值来自 config.js（F-030/F-031）", () => {
	it.each(components)(
		"$name 的 props 与 $namespace 命名空间一一对应，实例默认值全部为 undefined",
		({ component, defaults }) => {
			const propKeys = Object.keys(component.props || {}).toSorted();

			expect(propKeys).toEqual(Object.keys(defaults).toSorted());
			propKeys.forEach(key => {
				expect(component.props[key].default, `${key} 不应保留具体 default`).toBeUndefined();
			});
		}
	);

	it("config.js 保留组件原有默认值", () => {
		expect(modalDefaults).toEqual({
			type: "modal",
			visible: false,
			width: 800,
			height: 500,
			title: "",
			beforeClose: null,
			modalProps: {},
		});
		expect(listDefaults).toEqual({
			url: "",
			extraData: {},
			height: 300,
			offset: 50,
			finishedText: "",
			autoLoad: true,
			useStore: null,
			listProps: {},
		});
		expect(addressDefaults).toEqual({
			value: [],
			level: 3,
			disabled: false,
			placeholder: "请选择地区",
			url: "",
			afterFetched: null,
			dataSource: [],
		});
		expect(copyDefaults).toEqual({
			text: "",
			showIcon: false,
			customRender: null,
			copy: null,
		});
		expect(passwordDefaults).toEqual({
			value: "",
			min: 8,
			max: 20,
			strengthRules: {},
			width: 300,
		});
		expect(signaturePadDefaults).toEqual({
			title: "",
			readonly: false,
			agreement: "",
			preset: "",
		});
		expect(buttonDefaults).toEqual({
			type: "default",
			size: "middle",
			disabled: false,
			danger: false,
			label: "",
			icon: null,
			iconPosition: "left",
			fetcher: { loading: false },
			buttonProps: {},
		});
	});

	it("没有 Provider 时按 config.js 的默认值运行", () => {
		const wrapper = mountWithConfig(NewbiePassword, {}, { value: "abcdefg" });

		expect(wrapper.find(".error-message").text()).toBe("密码长度不能少于8个字符");

		const copy = mountWithConfig(NewbieCopy, {}, { text: "abc" });
		expect(copy.find(".newbie-copy-icon").classes()).not.toContain("always-show");
	});
});

describe("Provider config 覆盖组件默认值", () => {
	it("password：命名空间可覆盖 min", () => {
		const wrapper = mountWithConfig(NewbiePassword, { password: { min: 6 } }, { value: "abc" });

		expect(wrapper.find(".error-message").text()).toBe("密码长度不能少于6个字符");
	});

	it("list：命名空间可覆盖 autoLoad", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(ok([]));

		mountWithConfig(NewbieList, { list: { autoLoad: false } }, { url: "/api/list" });
		await flushPromises();

		expect(get).not.toHaveBeenCalled();
	});

	it("button：命名空间可覆盖 type", () => {
		const wrapper = mountWithConfig(
			NewbieButton,
			{ button: { type: "primary" } },
			{},
			() => "确定"
		);

		expect(wrapper.find("button").classes()).toContain("ant-btn-primary");
	});

	it("copy：命名空间可覆盖 showIcon", () => {
		const wrapper = mountWithConfig(NewbieCopy, { copy: { showIcon: true } }, { text: "abc" });

		expect(wrapper.find(".newbie-copy-icon").classes()).toContain("always-show");
	});

	it("address：命名空间可覆盖 placeholder 与 level", async () => {
		const wrapper = mountWithConfig(NewbieAddress, {
			address: { placeholder: "全局地区占位", level: 1 },
		});

		await flushPromises();

		expect(wrapper.html()).toContain("全局地区占位");
	});

	it("modal：命名空间可覆盖 title", async () => {
		mountWithConfig(NewbieModal, { modal: { title: "全局标题" } }, { visible: true });
		await nextTick();

		expect(document.querySelector(".newbie-modal-title")?.textContent).toBe("全局标题");
	});

	it("signaturePad：命名空间可覆盖 title", async () => {
		const wrapper = mountWithConfig(NewbieSignaturePad, {
			signaturePad: { title: "全局签名标题" },
		});

		wrapper.findComponent(NewbieSignaturePad).vm.open();
		await nextTick();
		await flushPromises();

		expect(document.querySelector(".newbie-signature-pad__title")?.textContent).toBe(
			"全局签名标题"
		);
	});

	it("Provider 配置更新后组件同步更新", async () => {
		const config = reactive({ password: { min: 6 } });
		const wrapper = mountWithConfig(NewbiePassword, config, { value: "abcde" });

		expect(wrapper.find(".error-message").text()).toBe("密码长度不能少于6个字符");

		config.password.min = 10;
		await nextTick();

		expect(wrapper.find(".error-message").text()).toBe("密码长度不能少于10个字符");
	});
});

describe("实例 props 优先于 Provider", () => {
	it("password：实例 min 覆盖 Provider", () => {
		const wrapper = mountWithConfig(
			NewbiePassword,
			{ password: { min: 6 } },
			{ value: "abcdefgh", min: 10 }
		);

		expect(wrapper.find(".error-message").text()).toBe("密码长度不能少于10个字符");
	});

	it("button：实例 type 覆盖 Provider", () => {
		const wrapper = mountWithConfig(
			NewbieButton,
			{ button: { type: "primary" } },
			{ type: "link" },
			() => "链接"
		);

		expect(wrapper.find("button").classes()).toContain("ant-btn-link");
		expect(wrapper.find("button").classes()).not.toContain("ant-btn-primary");
	});

	it("list：实例 autoLoad 覆盖 Provider", async () => {
		const get = vi.spyOn(axios, "get").mockResolvedValue(ok([{ id: 1 }]));

		mountWithConfig(
			NewbieList,
			{ list: { autoLoad: false } },
			{ url: "/api/list", autoLoad: true }
		);
		await flushPromises();

		expect(get).toHaveBeenCalledTimes(1);
	});
});
