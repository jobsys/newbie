import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { Modal } from "antdv-next";
import NewbieModal from "../../components/modal/NewbieModal.jsx";

afterEach(() => {
	document.body.innerHTML = "";
	vi.restoreAllMocks();
});

describe("NewbieModal beforeClose", () => {
	it("点击关闭按钮时不会因在事件回调中使用 useT 而抛错", async () => {
		// Modal.confirm 在 jsdom 下渲染成本较高，这里只断言它被正确调用
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});

		const wrapper = mount(NewbieModal, {
			props: {
				visible: true,
				beforeClose: { trigger: true },
			},
			attachTo: document.body,
		});
		await nextTick();

		const closeButton = document.querySelector(".newbie-modal-actions .newbie-modal-action:last-child");
		expect(closeButton).not.toBeNull();
		closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await nextTick();

		expect(confirm).toHaveBeenCalledTimes(1);
		expect(confirm.mock.calls[0][0]).toMatchObject({
			title: "操作提示",
			content: "确定关闭吗？",
			okText: "确定",
			cancelText: "取消",
		});
		expect(wrapper.exists()).toBe(true);

		wrapper.unmount();
	});

	it("beforeClose 触发条件为 false 时直接关闭", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});

		const wrapper = mount(NewbieModal, {
			props: {
				visible: true,
				beforeClose: { trigger: false },
			},
			attachTo: document.body,
		});
		await nextTick();

		const closeButton = document.querySelector(".newbie-modal-actions .newbie-modal-action:last-child");
		expect(closeButton).not.toBeNull();
		closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await nextTick();

		expect(confirm).not.toHaveBeenCalled();
		expect(wrapper.emitted("update:visible")).toEqual([[false]]);
		expect(wrapper.emitted("close")).toHaveLength(1);

		wrapper.unmount();
	});
});
