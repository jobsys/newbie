import {isArray, isNumber, isString, isUndefined, sum} from "lodash-es";
import {Affix, Card, Col, Divider, Row} from "ant-design-vue";
import createFormItem from "./FormItem.jsx";
import {nextTick} from "vue";
import {RightOutlined} from "@ant-design/icons-vue";

// 每个折叠容器的展开动画控制器，用于反向切换时移除未触发的 transitionend 监听
const expandAnimations = new WeakMap();

/**
 *
 * @param {Array.<NewbieFormItemConfig>} formItems
 * @param {object} submitForm
 * @param {*[]|JSX.Element} submitButtons
 * @param {object} context
 * @return {*[]|JSX.Element}
 */
const render = (formItems, submitForm, submitButtons, context) => {
	const { props, slots, formState, fieldVisibility } = context;
	const getFormItem = item =>
		createFormItem(
			{ ...item, visible: fieldVisibility ? fieldVisibility[item.key] !== false : true },
			submitForm,
			context
		);

	const fixedFormItems = [];
	const staticFormItems = [];

	// 过滤掉 computed 类型字段，不在填写表单中渲染（但值已通过 watcher 计算并写入 submitForm）
	const visibleFormItems = formItems.filter(item => item.type !== "computed");

	visibleFormItems.forEach(item => {
		if (item.columnIndex === "fixed") {
			fixedFormItems.push(item);
		} else {
			if (item.break || !staticFormItems.length) {
				staticFormItems.push([]);
			}
			staticFormItems[staticFormItems.length - 1].push(item);
		}
	});

	// 24 栅格分布
	let columns = props.columns;
	if (!columns || !isArray(columns) || !columns.length) {
		columns = [24];
	}

	if (sum(columns) !== 24) {
		console.error("NewbieForm columns must sum up to 24");
		return null;
	}

	// 单列布局下跨行没有意义，仅在多列布局中生效
	const canSpanRows = columns.length > 1;

	/**
	 * 表单项占用的行数，默认为 1
	 * @param {NewbieFormItemConfig} item
	 * @return {number}
	 */
	const toRowSpan = item => {
		const value = parseInt(item.rowSpan, 10);
		return canSpanRows && Number.isFinite(value) && value > 1 ? value : 1;
	};

	const sortedFormItems = staticFormItems.map(() => columns.map(() => []));

	staticFormItems.forEach((items, index) => {
		items.forEach(item => {
			let columnIndex = item.columnIndex || 0;
			columnIndex = isNumber(columnIndex)
				? Math.min(columnIndex, props.columns.length - 1)
				: columnIndex;

			let span = 0;

			/**
			 * [0, 1] 代表占 1-2 列
			 * [1, 2] 代表占 2-3 列
			 * [2, 4] 代表占 3-5 列
			 * 超过 columns.length 的值会被忽略
			 */
			if (isArray(columnIndex)) {
				for (let i = columnIndex[0]; i <= columnIndex[1]; i++) {
					if (!columns[i]) {
						break;
					}

					span += columns[i];

					// 渲染的元素会被放在数组第1项的列，其它的列放置占位元素

					if (i !== columnIndex[0]) {
						sortedFormItems[index][i].push("placeholder");
					}
				}
				item.span = span;

				// 默认的 labelCol.span 为 6，如果是 2 列，那么 labelCol.span 应该为 3， 3 列则为 2
				item.formItemProps = {
					labelCol: {
						span:
							(props.formProps.labelCol?.span || 6) /
							(columnIndex[columnIndex.length - 1] - columnIndex[0] + 1),
					},
					...item.formItemProps,
				};
				sortedFormItems[index][columnIndex[0]].push(item);
			} else if (isNumber(columnIndex)) {
				item.span = columns[columnIndex];
				sortedFormItems[index][columnIndex].push(item);
			}
		});
	});

	/**
	 * 生成固定在右侧的表单项
	 */
	const fixedFormElems = fixedFormItems.map(item => getFormItem(item));

	let staticFormElems = [];

	const onToggle = item => {
		const collapseElem = document.getElementById(`collapse_${item.key}`);

		if (formState[item.key].isCollapse) {
			expandAnimations.get(collapseElem)?.abort();

			collapseElem.style.height = `${collapseElem.scrollHeight}px`;

			// 过渡结束后必须恢复 auto，固定像素高度会在后续内容变高（增删行、行高变化等）时把超出部分截断
			const controller = new AbortController();
			expandAnimations.set(collapseElem, controller);
			collapseElem.addEventListener(
				"transitionend",
				event => {
					if (event.target === collapseElem && event.propertyName === "height") {
						collapseElem.style.height = "auto";
					}
				},
				{signal: controller.signal}
			);
		} else {
			expandAnimations.get(collapseElem)?.abort();

			//由于没有定义 height 的样式第一次无法触发动画，所以先设置个原始高度，再异步变为0来触发动画
			collapseElem.style.height = `${collapseElem.scrollHeight}px`;
			setTimeout(() => (collapseElem.style.height = "0px"));
		}
		nextTick(() => {
			formState[item.key].isCollapse = !formState[item.key].isCollapse;
		});
	};

	/**
	 * 生成静态表单项
	 */
	sortedFormItems.forEach((items, index) => {
		const sectionItems = staticFormItems[index];

		const breakItem = sectionItems.find(item => item.break) || null;

		// sectionElems 为该分组渲染出的元素数组
		let sectionElems;

		if (sectionItems.some(item => toRowSpan(item) > 1)) {
			/**
			 * 存在跨行字段时改用 CSS Grid 布局，
			 * 让较高的组件（如图片上传）可以占用多行，与相邻列的多个字段对齐
			 */
			const cursors = columns.map(() => 0);
			const cells = [];

			sectionItems.forEach(item => {
				let columnIndex = item.columnIndex || 0;
				if (isNumber(columnIndex)) {
					columnIndex = Math.min(columnIndex, columns.length - 1);
				}

				const startCol = isArray(columnIndex)
					? Math.min(columnIndex[0], columns.length - 1)
					: columnIndex;
				const endCol = isArray(columnIndex)
					? Math.min(columnIndex[columnIndex.length - 1], columns.length - 1)
					: columnIndex;

				// 跨列字段需要等它覆盖的所有列都空出位置后才能落位
				let row = 0;
				for (let col = startCol; col <= endCol; col++) {
					row = Math.max(row, cursors[col]);
				}

				const rowSpan = toRowSpan(item);

				cells.push({ item, startCol, endCol, row, rowSpan });

				for (let col = startCol; col <= endCol; col++) {
					cursors[col] = row + rowSpan;
				}
			});

			sectionElems = [
				<div
					class={`newbie-form__grid`}
					style={{ gridTemplateColumns: columns.map(width => `${width}fr`).join(" ") }}
				>
					{cells.map(cell => (
						<div
							class={`newbie-form__grid-item`}
							style={{
								gridColumn: `${cell.startCol + 1} / span ${cell.endCol - cell.startCol + 1}`,
								gridRow: `${cell.row + 1} / span ${cell.rowSpan}`,
							}}
						>
							{getFormItem(cell.item)}
						</div>
					))}
				</div>,
			];
		} else {
			/**
			 * 计算最长的一列有多少个表单项,则代表有多少行
			 * @type {number}
			 */
			const maxLength = Math.max(...items.map(item => item.length));

			const rows = [];

			for (let row = 0; row < maxLength; row++) {
				let offset = 0;
				const columnElems = [];

				for (let col = 0; col < sortedFormItems[index].length; col++) {
					const formItem = sortedFormItems[index][col][row];
					if (!formItem) {
						offset += columns[col];
						continue;
					}

					//如果是占位元素，则跳过，表示左则的元素占用了该列的位置，该位置没有元素
					if (formItem === "placeholder") {
						continue;
					}

					columnElems.push(
						<Col span={formItem.span} offset={offset}>
							{getFormItem(formItem)}
						</Col>
					);
					offset = 0;
				}

				rows.push(<Row gutter={16}>{columnElems}</Row>);
			}

			sectionElems = rows;
		}

		if (breakItem) {
			if (props.breakMode === "divider") {
				staticFormElems = staticFormElems.concat([
					<Divider {...props.dividerProps}>
						{() => (isString(breakItem.break) ? breakItem.break : "")}
					</Divider>,
					...sectionElems,
				]);
			} else if (props.breakMode === "collapse") {
				if (isUndefined(formState[breakItem.key].isCollapse)) {
					formState[breakItem.key].isCollapse = !!index; //默认展开第一个
				}

				const collapseElem = (
					<div class={`newbie-form__collapse-wrapper`}>
						<div class={`newbie-form__collapse-header`} onClick={() => onToggle(breakItem)}>
							<span
								class={`newbie-form__collapse-icon ${formState[breakItem.key].isCollapse ? "" : "open"}`}
							>
								<RightOutlined />
							</span>
							<span class={`newbie-form__collapse-title`}>{breakItem.break}</span>
						</div>
						<div
							class={`newbie-form__collapse-content-wrapper ${formState[breakItem.key].isCollapse ? "collapse" : ""}`}
							id={`collapse_${breakItem.key}`}
						>
							<div class={`newbie-form__collapse-content`}>{sectionElems}</div>
						</div>
					</div>
				);
				staticFormElems = staticFormElems.concat(collapseElem);
			}
		} else {
			staticFormElems = staticFormElems.concat(sectionElems);
		}
	});

	const footerElem = () => {
		if (slots.footer) {
			return <div class={"newbie-form__footer"}>{slots.footer()}</div>;
		}
		return null;
	};

	let layoutElem;

	if (fixedFormElems.length) {
		const submitButtonWrapper =
			props.disabled || props.readonly || props.hideButtons ? null : (
				<div class={"newbie-form__submit-wrapper"}>
					<Divider />
					<Row>
						<Col span={24} offset={2}>
							{{ default: () => submitButtons }}
						</Col>
					</Row>
				</div>
			);
		layoutElem = (
			<Row gutter={16}>
				<Col span={24 - props.fixedColumns}>{() => staticFormElems}</Col>
				<Col span={props.fixedColumns}>
					<Affix offsetTop={20}>
						<Card style={{ marginLeft: "20px" }}>
							{() => [fixedFormElems, footerElem(), submitButtonWrapper]}
						</Card>
					</Affix>
				</Col>
			</Row>
		);
	} else {
		const submitButtonWrapper =
			props.disabled || props.readonly || props.hideButtons ? null : (
				<div class={"newbie-form__submit-wrapper"}>
					<Divider />
					<Row gutter={16}>
						<Col offset={props.closable ? 9 : 10}>{{ default: () => submitButtons }}</Col>
					</Row>
				</div>
			);

		layoutElem = [staticFormElems, footerElem(), submitButtonWrapper];
	}

	return layoutElem;
};

export default render;
