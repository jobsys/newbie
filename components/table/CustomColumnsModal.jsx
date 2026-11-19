import { defineComponent, ref, watch } from "vue";
import { Button, Checkbox, CheckboxGroup, Col, Divider, Modal, Row } from "antdv-next";
import { useT } from "../../hooks";

/**
 * 自定义列显隐弹窗
 */
export default defineComponent({
	name: "CustomColumnsModal",
	props: {
		open: { type: Boolean, default: false },
		columns: { type: Array, default: () => [] },
		columnKey: { type: Object, default: () => ({}) },
	},
	emits: ["update:open", "submit"],
	setup(props, { emit }) {
		const checkedKeys = ref([]);

		watch(
			() => props.open,
			isOpen => {
				if (isOpen) {
					checkedKeys.value = Object.keys(props.columnKey).filter(key => props.columnKey[key]);
				}
			}
		);

		const onSelectAll = () => {
			checkedKeys.value = Object.keys(props.columnKey);
		};

		const onClearAll = () => {
			checkedKeys.value = [];
		};

		const onOk = () => {
			emit("submit", checkedKeys.value);
			emit("update:open", false);
		};

		return () => (
			<Modal
				open={props.open}
				onUpdate:open={val => emit("update:open", val)}
				title={useT("table.custom")}
				width={"900px"}
				onOk={onOk}
			>
				{() => [
					<CheckboxGroup v-model:value={checkedKeys.value} style={{ width: "100%" }}>
						{() => (
							<Row gutter={15}>
								{() =>
									props.columns.map(item => (
										<Col key={item.checkKey} span={6}>
											{() => (
												<Checkbox
													style={{ width: "100%", marginBottom: "5px", overflow: "hidden" }}
													value={item.checkKey}
												>
													{() => item.title}
												</Checkbox>
											)}
										</Col>
									))
								}
							</Row>
						)}
					</CheckboxGroup>,
					<Divider />,
					<Button onClick={onSelectAll}>{() => useT("table.select-all")}</Button>,
					<Button onClick={onClearAll} style={{ marginLeft: "5px" }}>
						{() => useT("table.unselect-all")}
					</Button>,
				]}
			</Modal>
		);
	},
});
