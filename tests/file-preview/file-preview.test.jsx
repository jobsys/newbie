import { afterEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import NewbieFilePreview from "../../components/file-preview/NewbieFilePreview.jsx";
import { getFileExtension, getPreviewKind } from "../../components/file-preview/utils.js";

const NEWBIE_CONFIG = Symbol.for("jobsys-newbie.config");

afterEach(() => {
	document.body.innerHTML = "";
});

const flush = async () => {
	await nextTick();
	await nextTick();
};

const FakeRenderer = {
	props: ["url", "filename", "options"],
	setup(props) {
		return () => (
			<div class="fake-renderer" data-theme={props.options?.theme}>
				{props.url}
			</div>
		);
	},
};

const mountPreview = (props = {}) =>
	mount(NewbieFilePreview, {
		props: {
			open: true,
			...props,
		},
		attachTo: document.body,
	});

describe("文件预览类型识别", () => {
	it("优先从 path 取扩展名，兼容签名 URL 和 ?path=", () => {
		expect(getFileExtension({ path: "private/合同.DOCX" })).toBe("docx");
		expect(getFileExtension({ url: "/api/download?path=private%2F报价.xlsx&sign=1" })).toBe(
			"xlsx"
		);
		expect(getFileExtension({ url: "https://x/a.PDF?token=1" })).toBe("pdf");
		expect(getFileExtension({ name: "演示.pptx" })).toBe("pptx");
	});

	it("区分图片、文档和未知类型", () => {
		expect(getPreviewKind("png")).toBe("image");
		expect(getPreviewKind("jpg")).toBe("image");
		expect(getPreviewKind("pdf")).toBe("document");
		expect(getPreviewKind("docx")).toBe("document");
		expect(getPreviewKind("xlsx")).toBe("document");
		expect(getPreviewKind("pptx")).toBe("document");
		expect(getPreviewKind("zip")).toBe("other");
		expect(getPreviewKind("")).toBe("other");
	});
});

describe("NewbieFilePreview", () => {
	it("文档交给注入的渲染器", async () => {
		const wrapper = mountPreview({
			url: "/files/contract.docx",
			name: "contract.docx",
			renderer: FakeRenderer,
		});
		await flush();

		expect(document.querySelector(".fake-renderer")).not.toBeNull();
		expect(document.querySelector(".fake-renderer").textContent).toContain(
			"/files/contract.docx"
		);
		expect(document.querySelector(".newbie-modal-title").textContent).toContain(
			"contract.docx"
		);

		wrapper.unmount();
	});

	it("从 Provider 读取渲染器和配置", async () => {
		const wrapper = mount(NewbieFilePreview, {
			props: {
				open: true,
				url: "/files/contract.docx",
				name: "contract.docx",
			},
			global: {
				provide: {
					[NEWBIE_CONFIG]: {
						filePreview: {
							renderer: FakeRenderer,
							options: { theme: "dark" },
						},
					},
				},
			},
			attachTo: document.body,
		});
		await flush();

		const renderer = document.querySelector(".fake-renderer");
		expect(renderer).not.toBeNull();
		expect(renderer.getAttribute("data-theme")).toBe("dark");

		wrapper.unmount();
	});

	it("loading 时显示加载状态而不是空状态", async () => {
		const wrapper = mountPreview({
			url: "",
			name: "contract.pdf",
			loading: true,
			renderer: FakeRenderer,
		});
		await flush();

		expect(document.querySelector(".newbie-file-preview-loading")).not.toBeNull();
		expect(document.querySelector(".newbie-file-preview-loading").textContent).toContain(
			"正在加载文档"
		);
		expect(document.querySelector(".fake-renderer")).toBeNull();

		wrapper.unmount();
	});

	it("没有渲染器时图片仍有兜底预览", async () => {
		const wrapper = mountPreview({
			url: "/files/photo.png",
			name: "photo.png",
		});
		await flush();

		const image = document.querySelector(".newbie-file-preview-image img");
		expect(image).not.toBeNull();
		expect(image.getAttribute("src")).toBe("/files/photo.png");

		wrapper.unmount();
	});

	it("没有渲染器且不是图片时显示不支持", async () => {
		const wrapper = mountPreview({
			url: "/files/archive.zip",
			name: "archive.zip",
		});
		await flush();

		expect(document.querySelector(".newbie-file-preview-fallback")).not.toBeNull();
		expect(document.querySelector(".newbie-file-preview-fallback").textContent).toContain(
			"不支持预览该文件类型"
		);

		wrapper.unmount();
	});

	it("关闭弹窗时触发 update:open", async () => {
		const wrapper = mountPreview({
			url: "/files/contract.pdf",
			name: "contract.pdf",
			renderer: FakeRenderer,
		});
		await flush();

		const closeButton = document.querySelector(
			".newbie-modal-actions .newbie-modal-action:last-child"
		);
		closeButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
		await flush();

		expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);

		wrapper.unmount();
	});
});
