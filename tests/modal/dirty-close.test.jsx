import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { Modal } from "antdv-next";
import NewbieModal from "../../components/modal/NewbieModal.jsx";
import NewbieForm from "../../components/form/NewbieForm.jsx";

afterEach(() => {
	document.body.innerHTML = "";
	vi.restoreAllMocks();
});

const flush = async () => {
	await nextTick();
	await nextTick();
};

const click = element => {
	element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
};

/**
 * 挂载 Drawer + NewbieForm，并把表单实例和 close 回调交给测试使用
 */
const mountDrawerForm = async ({ close, confirmOnClose = true } = {}) => {
	let formRef = null;

	const Host = defineComponent({
		setup() {
			const visible = ref(true);
			return () => (
				<NewbieModal
					visible={visible.value}
					onUpdate:visible={value => (visible.value = value)}
					type="drawer"
					title="编辑单位"
					width={520}
				>
					<NewbieForm
						ref={el => (formRef = el)}
						form={[{ key: "name", title: "单位名称" }]}
						data={{}}
						cardWrapper={false}
						buttonsInFooter
						confirmOnClose={confirmOnClose}
						close={close}
					/>
				</NewbieModal>
			);
		},
	});

	const wrapper = mount(Host, { attachTo: document.body });
	await flush();

	return { wrapper, form: () => formRef };
};

const footerCloseButton = () => document.querySelector(".newbie-modal-footer .ant-btn-default");

describe("NewbieForm confirmOnClose", () => {
	it("没有脏数据时直接关闭，不弹确认框", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});
		const close = vi.fn();
		const { wrapper } = await mountDrawerForm({ close });

		click(footerCloseButton());
		await flush();

		expect(confirm).not.toHaveBeenCalled();
		expect(close).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});

	it("有脏数据时二次确认，确认后才关闭", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});
		const close = vi.fn();
		const { wrapper, form } = await mountDrawerForm({ close });

		form().setForm({ name: "改过的名称" });
		await flush();

		click(footerCloseButton());
		await flush();

		expect(confirm).toHaveBeenCalledTimes(1);
		expect(confirm.mock.calls[0][0]).toMatchObject({
			title: "数据有变动",
			content: "是否放弃当前编辑内容？",
			okText: "确定",
			cancelText: "取消",
		});
		expect(close).not.toHaveBeenCalled();

		confirm.mock.calls[0][0].onOk();
		await flush();

		expect(close).toHaveBeenCalledTimes(1);

		wrapper.unmount();
	});

	it("自定义确认框文案", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});
		const close = vi.fn();
		const { wrapper, form } = await mountDrawerForm({
			close,
			confirmOnClose: { title: "放弃修改？", content: "修改尚未保存", okText: "放弃", cancelText: "继续编辑" },
		});

		form().setForm({ name: "改过的名称" });
		await flush();

		click(footerCloseButton());
		await flush();

		expect(confirm.mock.calls[0][0]).toMatchObject({
			title: "放弃修改？",
			content: "修改尚未保存",
			okText: "放弃",
			cancelText: "继续编辑",
		});

		wrapper.unmount();
	});

	it("Drawer 右上角关闭同样复用脏数据确认", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});
		const close = vi.fn();
		const { wrapper, form } = await mountDrawerForm({ close });

		form().setForm({ name: "改过的名称" });
		await flush();

		click(document.querySelector(".ant-drawer-close"));
		await flush();

		expect(confirm).toHaveBeenCalledTimes(1);
		expect(confirm.mock.calls[0][0]).toMatchObject({ content: "是否放弃当前编辑内容？" });

		wrapper.unmount();
	});

	it("脏数据确认期间 Drawer 不消失，确认关闭后仍可再次打开", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});
		const close = vi.fn();
		const visible = ref(true);
		let formRef = null;

		const Host = defineComponent({
			setup() {
				return () => (
					<NewbieModal
						visible={visible.value}
						onUpdate:visible={value => (visible.value = value)}
						type="drawer"
						title="编辑单位"
						width={520}
					>
						<NewbieForm
							ref={el => (formRef = el)}
							form={[{ key: "name", title: "单位名称" }]}
							data={{}}
							cardWrapper={false}
							buttonsInFooter
							confirmOnClose
							close={close}
						/>
					</NewbieModal>
				);
			},
		});

		const wrapper = mount(Host, { attachTo: document.body });
		await flush();

		formRef.setForm({ name: "改过的名称" });
		await flush();

		click(document.querySelector(".ant-drawer-close"));
		await flush();

		// 关闭按钮只是发起关闭请求，确认前 Drawer 必须保持打开
		expect(confirm).toHaveBeenCalledTimes(1);
		expect(document.querySelector(".ant-drawer-open")).not.toBeNull();
		expect(close).not.toHaveBeenCalled();

		// 确认放弃后才真正关闭
		confirm.mock.calls[0][0].onOk();
		await flush();
		expect(document.querySelector(".ant-drawer-open")).toBeNull();

		// 再次打开时组件状态没有卡死
		visible.value = true;
		await flush();
		expect(document.querySelector(".ant-drawer-open")).not.toBeNull();

		wrapper.unmount();
	});

	it("关闭前拦截优先级高于内置脏数据确认", async () => {
		const confirm = vi.spyOn(Modal, "confirm").mockImplementation(() => {});
		const close = vi.fn();
		let formRef = null;

		const Host = defineComponent({
			setup() {
				const visible = ref(true);
				return () => (
					<NewbieModal
						visible={visible.value}
						onUpdate:visible={value => (visible.value = value)}
						type="drawer"
						title="编辑单位"
						width={520}
						beforeClose={() => false}
					>
						<NewbieForm
							ref={el => (formRef = el)}
							form={[{ key: "name", title: "单位名称" }]}
							data={{}}
							cardWrapper={false}
							buttonsInFooter
							confirmOnClose
							close={close}
						/>
					</NewbieModal>
				);
			},
		});

		const wrapper = mount(Host, { attachTo: document.body });
		await flush();

		formRef.setForm({ name: "改过的名称" });
		await flush();

		click(document.querySelector(".ant-drawer-close"));
		await flush();

		expect(confirm).not.toHaveBeenCalled();

		wrapper.unmount();
	});
});
