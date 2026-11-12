import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import NewbieSignaturePad from "../../components/signature-pad/NewbieSignaturePad.jsx";

// signature_pad 5 用 CSS 像素坐标绘制，位图尺寸必须与 CSS 尺寸一致（× DPR），
// 否则浏览器拉伸位图，笔画会偏离鼠标。这里用桩替代 jsdom 缺失的 canvas 2d。
const createContext = () => ({
	fillStyle: "",
	strokeStyle: "",
	globalCompositeOperation: "source-over",
	lineWidth: 1,
	lineCap: "round",
	lineJoin: "round",
	setTransform: vi.fn(),
	scale: vi.fn(),
	translate: vi.fn(),
	clearRect: vi.fn(),
	fillRect: vi.fn(),
	beginPath: vi.fn(),
	closePath: vi.fn(),
	moveTo: vi.fn(),
	lineTo: vi.fn(),
	bezierCurveTo: vi.fn(),
	quadraticCurveTo: vi.fn(),
	arc: vi.fn(),
	fill: vi.fn(),
	stroke: vi.fn(),
	drawImage: vi.fn(),
	save: vi.fn(),
	restore: vi.fn(),
});

let canvasWidth = 400;
let canvasHeight = 200;
let context;
const originalGetContext = HTMLCanvasElement.prototype.getContext;
const originalGetBoundingClientRect = HTMLCanvasElement.prototype.getBoundingClientRect;

const mountSignaturePad = async () => {
	const wrapper = mount(NewbieSignaturePad, { attachTo: document.body });
	wrapper.vm.open();
	await nextTick();
	// 组件在弹窗打开后延迟 100ms 初始化画布
	await new Promise(resolve => setTimeout(resolve, 150));
	await nextTick();
	return wrapper;
};

afterEach(() => {
	vi.useRealTimers();
	HTMLCanvasElement.prototype.getContext = originalGetContext;
	HTMLCanvasElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
	delete HTMLCanvasElement.prototype.clientWidth;
	delete HTMLCanvasElement.prototype.clientHeight;
	document.body.innerHTML = "";
});

describe("NewbieSignaturePad 画布坐标系", () => {
	it("位图尺寸按 CSS 尺寸 × devicePixelRatio 设置，并用 setTransform 对齐坐标系", async () => {
		context = createContext();
		HTMLCanvasElement.prototype.getContext = () => context;
		HTMLCanvasElement.prototype.getBoundingClientRect = () => ({
			left: 0,
			top: 0,
			right: canvasWidth,
			bottom: canvasHeight,
			width: canvasWidth,
			height: canvasHeight,
			x: 0,
			y: 0,
			toJSON() {},
		});
		Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", {
			configurable: true,
			get: () => canvasWidth,
		});
		Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", {
			configurable: true,
			get: () => canvasHeight,
		});
		Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 2 });

		const wrapper = await mountSignaturePad();
		const canvas = document.querySelector(".newbie-signature-pad__canvas");

		expect(canvas.width).toBe(800);
		expect(canvas.height).toBe(400);
		expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);

		// 容器宽度变化后同步位图，避免拉伸导致笔迹与光标错位
		canvasWidth = 300;
		window.dispatchEvent(new Event("resize"));

		expect(canvas.width).toBe(600);
		expect(canvas.height).toBe(400);

		wrapper.unmount();
	});
});
