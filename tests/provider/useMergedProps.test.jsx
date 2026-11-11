import { describe, expect, it } from "vitest";
import { defineComponent, h, nextTick, provide, reactive } from "vue";
import { mount } from "@vue/test-utils";
import { NEWBIE_CONFIG } from "../../components/provider/config.js";
import { useMergedProps } from "../../hooks/useMergedProps.js";

const defaults = { pageSize: 20, filterable: true, pageKey: "page" };

const Probe = defineComponent({
	props: {
		pageSize: { type: Number },
		filterable: { type: Boolean, default: undefined },
		pageKey: { type: String },
	},
	setup(rawProps) {
		const props = useMergedProps(rawProps, "table", defaults);
		return () => (
			<div class="probe">
				{`${props.pageSize}|${props.filterable}|${props.pageKey}`}
			</div>
		);
	},
});

const render = (bag, probeProps = {}) => {
	const Host = defineComponent({
		setup() {
			provide(NEWBIE_CONFIG, bag);
			return () => h(Probe, probeProps);
		},
	});
	return mount(Host);
};

describe("useMergedProps", () => {
	it("没有 Provider 时使用组件默认值", () => {
		expect(render({}).find(".probe").text()).toBe("20|true|page");
	});

	it("Provider 覆盖组件默认值", () => {
		expect(
			render({ table: { pageSize: 50, pageKey: "p" } }).find(".probe").text()
		).toBe("50|true|p");
	});

	it("实例 props 优先级最高", () => {
		expect(
			render({ table: { pageSize: 50 } }, { pageSize: 100 }).find(".probe").text()
		).toBe("100|true|page");
	});

	it("false / 0 也是合法覆盖值", () => {
		expect(
			render({ table: { pageSize: 0, filterable: false } })
				.find(".probe")
				.text()
		).toBe("0|false|page");
	});

	it("Provider 更新后组件同步更新", async () => {
		const bag = reactive({ table: { pageSize: 50 } });
		const wrapper = render(bag);
		expect(wrapper.find(".probe").text()).toBe("50|true|page");

		bag.table.pageSize = 60;
		await nextTick();
		expect(wrapper.find(".probe").text()).toBe("60|true|page");
	});
});
