import { describe, expect, it } from "vitest";
import { defineComponent, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import NewbieProvider from "../../components/provider/NewbieProvider.jsx";
import NewbieTable from "../../components/table/NewbieTable.jsx";

const mountTable = (config, tableProps = {}) => {
	const Host = defineComponent({
		setup: () => () => (
			<NewbieProvider config={config}>
				<NewbieTable {...tableProps} />
			</NewbieProvider>
		),
	});
	return mount(Host);
};

describe("NewbieTable 全局配置", () => {
	it("Provider 的 pageSize / pageKey / pageSizeKey 生效", () => {
		const wrapper = mountTable(
			{ table: { pageSize: 50, pageKey: "p", pageSizeKey: "s" } },
			{ filterable: false }
		);

		expect(wrapper.findComponent(NewbieTable).vm.getQueryData()).toEqual({
			s: 50,
			p: 1,
		});
	});

	it("实例 props 覆盖 Provider", () => {
		const wrapper = mountTable(
			{ table: { pagination: true, pageSize: 50 } },
			{ pagination: false, filterable: false }
		);

		// pagination 被实例关闭后，查询参数里不再附加分页字段
		expect(wrapper.findComponent(NewbieTable).vm.getQueryData()).toEqual({});
	});

	it("异步更新 Provider pageSize 后表格分页同步更新", async () => {
		const config = ref({ table: { pageSize: 20 } });
		const Host = defineComponent({
			setup: () => () => (
				<NewbieProvider config={config.value}>
					<NewbieTable filterable={false} />
				</NewbieProvider>
			),
		});
		const wrapper = mount(Host);
		expect(wrapper.findComponent(NewbieTable).vm.getQueryData().pageSize).toBe(20);

		config.value = { table: { pageSize: 50 } };
		await nextTick();
		expect(wrapper.findComponent(NewbieTable).vm.getQueryData().pageSize).toBe(50);
	});

	it("未挂 Provider 时使用组件默认值，不会产生 undefined 参数名", () => {
		const wrapper = mount(NewbieTable, { props: { filterable: false } });

		expect(wrapper.vm.getQueryData()).toEqual({ page: 1, pageSize: 20 });
	});
});
