import { afterEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { Modal } from "antdv-next";
import NewbieTable from "../../components/table/NewbieTable.jsx";
import { tableDefaults } from "../../components/table/config.js";

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
	vi.restoreAllMocks();
});

const mountTable = (props = {}) =>
	mount(NewbieTable, {
		props: {
			filterable: false,
			editable: true,
			submitUrl: "/api/cell",
			dataSource: [{ id: 1, name: "甲", enabled: true }],
			...props,
		},
	});

/**
 * 拦截 Modal.confirm，记录配置以便手动触发 onOk / onCancel
 */
const spyConfirm = () => {
	const calls = [];
	vi.spyOn(Modal, "confirm").mockImplementation(config => {
		calls.push(config);
	});
	return calls;
};

describe("NewbieTable 单元格保存确认提醒", () => {
	it("confirmCellSubmit 默认关闭，放在 tableDefaults 可被 Provider 覆盖", () => {
		expect(tableDefaults.confirmCellSubmit).toBe(false);
	});

	it("开启 confirmCellSubmit 后先弹确认，确认后才提交", async () => {
		postMock.mockResolvedValue({ status: "SUCCESS" });
		const confirmCalls = spyConfirm();

		const wrapper = mountTable({
			confirmCellSubmit: true,
			columns: [{ title: "名称", dataIndex: "name", key: "name", editable: true }],
		});
		await nextTick();

		await wrapper.find(".edit-icon").trigger("click");
		await nextTick();
		await wrapper.find("input.ant-input").setValue("乙");
		await wrapper.find(".check-icon").trigger("click");
		await nextTick();

		expect(confirmCalls.length).toBe(1);
		expect(postMock).not.toHaveBeenCalled();
		// 未确认前保持编辑态
		expect(wrapper.find("input.ant-input").exists()).toBe(true);

		await confirmCalls[0].onOk();
		await flushPromises();

		expect(postMock).toHaveBeenCalledTimes(1);
		expect(postMock.mock.calls[0][0]).toBe("/api/cell");
		expect(postMock.mock.calls[0][1]).toMatchObject({ id: 1, name: "乙" });
	});

	it("取消确认时不提交，文本类控件保持编辑态", async () => {
		const confirmCalls = spyConfirm();

		const wrapper = mountTable({
			confirmCellSubmit: true,
			columns: [{ title: "名称", dataIndex: "name", key: "name", editable: true }],
		});
		await nextTick();

		await wrapper.find(".edit-icon").trigger("click");
		await nextTick();
		await wrapper.find("input.ant-input").setValue("乙");
		await wrapper.find(".check-icon").trigger("click");
		await nextTick();

		await confirmCalls[0].onCancel();
		await nextTick();

		expect(postMock).not.toHaveBeenCalled();
		expect(wrapper.find("input.ant-input").exists()).toBe(true);
	});

	it("列级 editable.confirm: false 可在全局开启时单独关闭该列", async () => {
		postMock.mockResolvedValue({ status: "SUCCESS" });
		const confirmCalls = spyConfirm();

		const wrapper = mountTable({
			confirmCellSubmit: true,
			columns: [
				{ title: "名称", dataIndex: "name", key: "name", editable: { type: "input", confirm: false } },
			],
		});
		await nextTick();

		await wrapper.find(".edit-icon").trigger("click");
		await nextTick();
		await wrapper.find("input.ant-input").setValue("乙");
		await wrapper.find(".check-icon").trigger("click");
		await flushPromises();

		expect(confirmCalls.length).toBe(0);
		expect(postMock).toHaveBeenCalledTimes(1);
	});

	it("列级 editable.confirm 传对象时作为 Modal.confirm 配置", async () => {
		const confirmCalls = spyConfirm();

		const wrapper = mountTable({
			columns: [
				{
					title: "名称",
					dataIndex: "name",
					key: "name",
					editable: { type: "input", confirm: { content: "自定义提醒文案" } },
				},
			],
		});
		await nextTick();

		await wrapper.find(".edit-icon").trigger("click");
		await nextTick();
		await wrapper.find("input.ant-input").setValue("乙");
		await wrapper.find(".check-icon").trigger("click");
		await nextTick();

		expect(confirmCalls.length).toBe(1);
		expect(confirmCalls[0].content).toBe("自定义提醒文案");
	});

	it("switch 取消确认时回滚为原值且不提交，确认后提交新值", async () => {
		postMock.mockResolvedValue({ status: "SUCCESS" });
		const confirmCalls = spyConfirm();

		const wrapper = mountTable({
			confirmCellSubmit: true,
			columns: [{ title: "状态", dataIndex: "enabled", key: "enabled", editable: { type: "switch" } }],
		});
		await nextTick();

		const switchEl = wrapper.find(".ant-switch");
		expect(switchEl.classes()).toContain("ant-switch-checked");

		await switchEl.trigger("click");
		await nextTick();

		expect(confirmCalls.length).toBe(1);
		expect(postMock).not.toHaveBeenCalled();

		await confirmCalls[0].onCancel();
		await nextTick();

		expect(postMock).not.toHaveBeenCalled();
		expect(wrapper.find(".ant-switch").classes()).toContain("ant-switch-checked");

		// 再次切换并确认，提交切换后的新值
		await wrapper.find(".ant-switch").trigger("click");
		await nextTick();
		expect(confirmCalls.length).toBe(2);

		await confirmCalls[1].onOk();
		await flushPromises();

		expect(postMock).toHaveBeenCalledTimes(1);
		expect(postMock.mock.calls[0][1]).toMatchObject({ id: 1, enabled: false });
	});
});
