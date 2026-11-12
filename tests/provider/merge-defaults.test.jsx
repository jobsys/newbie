import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import Newbie from "../../index.js";
import NewbieProvider from "../../components/provider/NewbieProvider.jsx";
import NewbieForm from "../../components/form/NewbieForm.jsx";
import NewbieTable from "../../components/table/NewbieTable.jsx";
import { NewbieThemeProvider } from "../../components/provider/index.js";
import { formDefaults } from "../../components/form/config.js";
import { tableDefaults } from "../../components/table/config.js";
import { renderTableActions } from "../../components/table/helpers.jsx";
import { mergeConfig } from "../../components/provider/config.js";
import withInstall, {
	NEWBIE_COMPONENT,
	isNewbieComponent,
} from "../../utils/withInstall.js";

const { getMock, postMock } = vi.hoisted(() => ({
	getMock: vi.fn(),
	postMock: vi.fn(),
}));

vi.mock("axios", () => ({
	default: {
		get: getMock,
		post: postMock,
	},
}));

afterEach(() => {
	getMock.mockReset();
	postMock.mockReset();
});

const mountTable = (config, tableProps = {}) =>
	mount(
		defineComponent({
			setup: () => () => (
				<NewbieProvider config={config}>
					<NewbieTable filterable={false} {...tableProps} />
				</NewbieProvider>
			),
		})
	);

const mountForm = (config, formProps = {}) =>
	mount(
		defineComponent({
			setup: () => () => (
				<NewbieProvider config={config}>
					<NewbieForm {...formProps} />
				</NewbieProvider>
			),
		})
	);

describe("tableDefaults 与 Provider 覆盖（F-031）", () => {
	it("默认值放在 tableDefaults，便于全局配置", () => {
		expect(tableDefaults.editable).toBe(false);
		expect(tableDefaults.submitUrl).toBe("");
	});

	it("Provider 的 table.editable 生效", async () => {
		const wrapper = mountTable(
			{ table: { editable: true } },
			{
				columns: [{ title: "名称", dataIndex: "name", key: "name", editable: true }],
				dataSource: [{ id: 1, name: "甲" }],
			}
		);
		await nextTick();

		expect(wrapper.findAll(".edit-icon").length).toBe(1);
	});

	it("Provider 的 table.submitUrl 生效", async () => {
		postMock.mockResolvedValue({ status: "SUCCESS" });

		const wrapper = mountTable(
			{ table: { editable: true, submitUrl: "/api/cell" } },
			{
				columns: [{ title: "名称", dataIndex: "name", key: "name", editable: true }],
				dataSource: [{ id: 1, name: "甲" }],
			}
		);
		await nextTick();

		await wrapper.find(".edit-icon").trigger("click");
		await nextTick();

		await wrapper.find("input.ant-input").setValue("乙");
		await wrapper.find(".check-icon").trigger("click");
		await flushPromises();

		expect(postMock).toHaveBeenCalledTimes(1);
		expect(postMock.mock.calls[0][0]).toBe("/api/cell");
		expect(postMock.mock.calls[0][1]).toMatchObject({ id: 1, name: "乙" });
	});

	it("实例 props 仍然覆盖 Provider", async () => {
		const wrapper = mountTable(
			{ table: { editable: true } },
			{
				editable: false,
				columns: [{ title: "名称", dataIndex: "name", key: "name", editable: true }],
				dataSource: [{ id: 1, name: "甲" }],
			}
		);
		await nextTick();

		expect(wrapper.findAll(".edit-icon").length).toBe(0);
	});
});

describe("form.columnPresets（F-032）", () => {
	it("新名 columnPresets 生效", async () => {
		const wrapper = mountForm(
			{ form: { columnPresets: { input: { defaultValue: "全局默认值" } } } },
			{ form: [{ key: "name", type: "input", title: "姓名" }] }
		);
		await nextTick();

		expect(wrapper.findComponent(NewbieForm).vm.getForm().name).toBe("全局默认值");
	});

	it("旧名形式 form.columns 仍然兼容", async () => {
		const wrapper = mountForm(
			{ form: { columns: { input: { defaultValue: "旧名默认值" } } } },
			{ form: [{ key: "name", type: "input", title: "姓名" }] }
		);
		await nextTick();

		expect(wrapper.findComponent(NewbieForm).vm.getForm().name).toBe("旧名默认值");
	});

	it("同时存在时新名优先", async () => {
		const wrapper = mountForm(
			{
				form: {
					columnPresets: { input: { defaultValue: "新名" } },
					columns: { input: { defaultValue: "旧名" } },
				},
			},
			{ form: [{ key: "name", type: "input", title: "姓名" }] }
		);
		await nextTick();

		expect(wrapper.findComponent(NewbieForm).vm.getForm().name).toBe("新名");
	});

	it("formDefaults 使用 columnPresets，不再占用 columns", () => {
		expect(formDefaults).toHaveProperty("columnPresets");
		expect(formDefaults).not.toHaveProperty("columns");
	});

	it("布局 columns prop 仍然只控制 24 栅格", async () => {
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		const wrapper = mountForm(
			{ form: { columnPresets: { input: { defaultValue: "x" } } } },
			{
				columns: [12, 12],
				form: [
					{ key: "a", type: "input" },
					{ key: "b", type: "input" },
				],
			}
		);
		await nextTick();

		expect(errorSpy).not.toHaveBeenCalledWith("NewbieForm columns must sum up to 24");
		expect(wrapper.findComponent(NewbieForm).vm.getForm()).toMatchObject({ a: "x", b: "x" });
		errorSpy.mockRestore();
	});
});

describe("withInstall 标记与安装（F-041）", () => {
	it("withInstall 给组件加标记与 install，普通对象不会被误判", () => {
		const plain = withInstall(defineComponent({ name: "PlainProbe", render: () => null }));

		expect(plain[NEWBIE_COMPONENT]).toBe(true);
		expect(isNewbieComponent(plain)).toBe(true);
		expect(typeof plain.install).toBe("function");

		// 自带 install 但不是库组件：不能靠 install 判断
		expect(isNewbieComponent({ install() {} })).toBe(false);
		expect(isNewbieComponent(() => {})).toBe(false);
		expect(isNewbieComponent(mergeConfig)).toBe(false);
	});

	it("Provider 两个导出都使用同一套标记", () => {
		expect(isNewbieComponent(NewbieTable)).toBe(true);
		expect(isNewbieComponent(NewbieForm)).toBe(true);
		expect(isNewbieComponent(NewbieThemeProvider)).toBe(true);
	});

	it("index.js 安装循环只注册带标记的导出", () => {
		const installed = [];
		const registered = [];
		const app = {
			config: { globalProperties: { $i18n: {} } },
			use(plugin) {
				installed.push(plugin);
			},
			component(name) {
				registered.push(name);
			},
		};

		Newbie.install(app);

		expect(installed).toContain(NewbieTable);
		expect(installed).toContain(NewbieForm);
		expect(installed).toContain(NewbieThemeProvider);
		expect(installed.every(isNewbieComponent)).toBe(true);
		expect(installed).not.toContain(renderTableActions);
		expect(installed).not.toContain(mergeConfig);

		NewbieTable.install(app);
		expect(registered).toContain("NewbieTable");
	});
});
