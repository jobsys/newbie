import { withModifiers } from "vue";
import { Dropdown, Flex, Image, Menu, MenuItem, Switch, Tag, Tooltip } from "antdv-next";
import { DownOutlined, FilePdfOutlined, PictureOutlined } from "@antdv-next/icons";
import { isArray } from "lodash-es";
import NewbieButton from "../button/NewbieButton.jsx";

/**
 * 表格单元格渲染助手。
 *
 * 注意：以下函数会创建 VNode 并读取响应式数据，**只能在 render 中调用**
 * （即组件 render 函数、返回 VNode 的 customRender / render 回调）。
 * 不要放进 computed / watch / setup 顶层，它们不是 hook。
 *
 * 本文件不依赖 NewbieTable / NewbieSearch，Form 等组件可以只依赖这里，
 * 避免为了一个渲染助手引入整个表格与搜索栈。
 */

/**
 * 生成表格操作按钮
 * 只能在 render 中调用
 *
 * @param {array} actions
 *  action :
 *  {
 *      type: 'Button',
 *      name: '点击'
 *      props: {type: 'primary', icon: h(EditOutlined)},
 *      action: function(){},
 *  }
 */
export function renderTableActions(actions) {
	if (!actions) return null;
	if (!isArray(actions)) {
		actions = [actions];
	}
	const actionElems = actions.map(action => {
		let props = { ...action.props };

		let { type } = action;
		const { name } = action;

		let ActionComponent = null;

		if (!type || type === "button") {
			ActionComponent = NewbieButton;
			props.type = props.type || "text";
		}
		// 专为tag做一些样式处理
		if (type === "a-tag" || type === "tag") {
			ActionComponent = Tag;
		}

		if (type === "switch") {
			ActionComponent = Switch;
			if (action.name) {
				props.checkedChildren = action.name?.[0] || "";
				props.unCheckedChildren = action.name?.[1] || "";
			}
			props.checked = action.value;
			props.disabled = true;
		}

		if (action.action) {
			props.onClick = withModifiers(() => action.action(), ["stop"]);
		}
		if (action.tooltip) {
			const title = action.tooltip;
			return (
				<Tooltip title={title} transfer={true}>
					{{
						default: () => <ActionComponent {...props}>{() => name}</ActionComponent>,
					}}
				</Tooltip>
			);
		}

		if (action.children?.length) {
			const menuItems = action.children;

			return (
				<Dropdown placement={"bottom"} onClick={withModifiers(() => {}, ["stop"])}>
					{{
						default: () => (
							<NewbieButton type={"text"} size={"small"} {...props}>
								{() => [<DownOutlined style={{ fontSize: "12px" }}></DownOutlined>, name]}
							</NewbieButton>
						),
						popupRender: () => (
							<Menu>
								{() =>
									menuItems.map(item => (
										<MenuItem>
											{() => (
												<NewbieButton
													type={"text"}
													style={{ textAlign: "left" }}
													buttonProps={{ block: true }}
													onClick={withModifiers(() => item.action(), ["stop"])}
													{...item.props}
												>
													{() => item.name}
												</NewbieButton>
											)}
										</MenuItem>
									))
								}
							</Menu>
						),
					}}
				</Dropdown>
			);
		}

		return <ActionComponent {...props}>{{ default: () => name }}</ActionComponent>;
	});
	return <div class={"table-actions-wrapper"}>{actionElems}</div>;
}

/**
 * 生成表格图片预览
 * 只能在 render 中调用
 *
 * @param {string | array} images
 * @param {object} [DefaultIcon]
 * @returns {JSX.Element|unknown[]}
 */
export function renderTableImage(images, DefaultIcon) {
	if (!images) {
		return (
			<span style={{ fontSize: "30px" }}>
				{DefaultIcon ? <DefaultIcon /> : <PictureOutlined />}
			</span>
		);
	}

	if (!isArray(images)) {
		images = [images];
	}
	return (
		<Flex gap={"small"}>
			{() =>
				images.map(img => {
					const src = img.thumbUrl || img.url || img;
					return (
						<Image
							src={src}
							preview={{ src: img.url || img.thumbUrl || img }}
							width={48}
							height={48}
						></Image>
					);
				})
			}
		</Flex>
	);
}

/**
 * 生成附件链接
 * 只能在 render 中调用
 *
 * @todo i18n
 * @param {string | array} files
 * @param {object} [options]
 * @returns {JSX.Element|unknown[]}
 */
export function renderTableFile(files, options) {
	const { DefaultIcon, placeholder = "暂无内容", fileName } = options || {};
	if (!files) {
		return <span>{placeholder}</span>;
	}

	if (!isArray(files)) {
		files = [files];
	}
	return files.map((file, index) => {
		const src = file.url || file;
		const name = fileName || file.name || (files.length > 1 ? `查看附件${index + 1}` : "查看附件");
		return (
			<a href={src} style={{ display: "block" }} target="_blank">
				<span style={{ fontSize: "14px" }}>
					{DefaultIcon ? <DefaultIcon /> : <FilePdfOutlined />} {name}
				</span>
			</a>
		);
	});
}

/********** 旧名字，保留向后兼容 **********/

/**
 * @deprecated 请使用 renderTableActions（只能在 render 中调用）
 */
export const useTableActions = renderTableActions;

/**
 * @deprecated 请使用 renderTableImage（只能在 render 中调用）
 */
export const useTableImage = renderTableImage;

/**
 * @deprecated 请使用 renderTableFile（只能在 render 中调用）
 */
export const useTableFile = renderTableFile;
