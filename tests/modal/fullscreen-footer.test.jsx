import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import NewbieModal from "../../components/modal/NewbieModal.jsx";
import NewbieForm from "../../components/form/NewbieForm.jsx";

afterEach(() => {
	document.body.innerHTML = "";
});

const flush = async () => {
	await nextTick();
	await nextTick();
};

const click = element => {
	element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
};

const toggleFullscreen = () =>
	click(document.querySelector(".newbie-modal-actions .newbie-modal-action"));

const mountInModal = async (type = "drawer", formProps = {}) => {
	const Host = defineComponent({
		setup() {
			const visible = ref(true);
			return () => (
				<NewbieModal v-model:visible={visible.value} type={type} title="编辑单位" width={520}>
					<NewbieForm
						form={[{ key: "name", title: "单位名称" }]}
						data={{}}
						cardWrapper={false}
						{...formProps}
					/>
				</NewbieModal>
			);
		},
	});

	const wrapper = mount(Host, { attachTo: document.body });
	await flush();
	return wrapper;
};

describe("NewbieModal 全屏", () => {
	it("进入全屏后撑满视口，并解除内容区最大高度限制", async () => {
		const wrapper = mount(NewbieModal, {
			props: { visible: true, title: "单位设置", width: 640, height: 320 },
			attachTo: document.body,
		});
		await flush();

		const body = document.querySelector(".ant-modal-body");
		expect(body.style.maxHeight).toBe("320px");
		expect(document.querySelector(".ant-modal-wrap.full-modal")).toBeNull();

		toggleFullscreen();
		await flush();

		expect(document.querySelector(".ant-modal-wrap.full-modal")).not.toBeNull();		expect(document.querySelector(".ant-modal-body").style.maxHeight).toBe("none");
		// 全屏时不再显示拖动光标
		expect(document.querySelector(".newbie-modal-title")).not.toBeNull();

		wrapper.unmount();
	});

	it("退出全屏后恢复窗口尺寸，并清除拖动位移", async () => {
		const wrapper = mount(NewbieModal, {
			props: { visible: true, title: "单位设置", width: 640, height: 320 },
			attachTo: document.body,
		});
		await flush();

		toggleFullscreen();
		await flush();
		toggleFullscreen();
		await flush();

		expect(document.querySelector(".ant-modal-wrap.full-modal")).toBeNull();
		expect(document.querySelector(".ant-modal-body").style.maxHeight).toBe("320px");
		// 拖动容器的位移必须归零，否则退出全屏后会偏出视口
		expect(document.querySelector(".newbie-modal-drag").style.transform).toContain(
			"translate(0px"
		);

		wrapper.unmount();
	});
});

describe("NewbieForm 与 NewbieModal 底部按钮", () => {	it("Drawer 模式下按钮固定在底部 footer，表单内不再重复渲染", async () => {
		const wrapper = await mountInModal("drawer", { buttonsInFooter: true });

		const footer = document.querySelector(".ant-drawer-footer");
		expect(footer).not.toBeNull();
		expect(footer.querySelector(".newbie-modal-footer")).not.toBeNull();
		// antd 会在两个汉字之间自动插入空格，比较前先去掉空白
		expect(footer.textContent.replace(/\s/g, "")).toContain("保存");
		expect(footer.textContent.replace(/\s/g, "")).toContain("关闭");
		expect(document.querySelector(".newbie-form__submit-wrapper")).toBeNull();

		wrapper.unmount();
	});

	it("Modal 模式下同样使用底部 footer", async () => {
		const wrapper = await mountInModal("modal", { buttonsInFooter: true });

		const footer = document.querySelector(".ant-modal-footer");
		expect(footer).not.toBeNull();
		expect(footer.textContent.replace(/\s/g, "")).toContain("保存");
		expect(document.querySelector(".newbie-form__submit-wrapper")).toBeNull();

		wrapper.unmount();
	});

	it("hideButtons 时不渲染空的底部区域", async () => {
		const wrapper = await mountInModal("drawer", { buttonsInFooter: true, hideButtons: true });

		expect(document.querySelector(".ant-drawer-footer")).toBeNull();
		expect(document.querySelector(".newbie-form__submit-wrapper")).toBeNull();

		wrapper.unmount();
	});

	it("不在 NewbieModal 内时回退到表单内部按钮", async () => {
		const wrapper = mount(NewbieForm, {
			props: {
				form: [{ key: "name", title: "单位名称" }],
				data: {},
				buttonsInFooter: true,
				cardWrapper: false,
			},
			attachTo: document.body,
		});
		await flush();

		expect(document.querySelector(".newbie-form__submit-wrapper")).not.toBeNull();

		wrapper.unmount();
	});
});
