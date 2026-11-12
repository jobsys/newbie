import * as antdvFormContext from "antdv-next/dist/form/context";

/**
 * antdv-next 把原来 `Form.useInjectFormItemContext()` 的 `onFieldChange`
 * 拆成了 `triggerChange` / `triggerBlur`。
 *
 * 这里统一成一个小的适配函数，避免业务组件直接依赖 antdv 内部路径散落各处。
 * 将来如果官方把它提升为公开 API，只需要改这一个文件。
 *
 * 依赖说明（评审 F-038）：
 * - `antdv-next/dist/form/context` 是包内内部模块，但 antdv-next 的 package.json
 *   用 `"./dist/*"` 通配符导出了该子路径，1.x 内可稳定解析（当前验证版本 1.8.1）；
 *   本库构建时把 `antdv-next` external，运行时解析的是宿主安装的那一份。
 * - 这里用命名空间导入而不是命名导入，并在运行时探测导出是否存在：
 *   未来版本若去掉 `useFormItemContext`，只会降级为「不触发字段变更」，
 *   不会让上传/富文本等组件整体渲染失败。
 * - ESM 静态导入无法 try/catch「文件本身不存在」的情况。若 antdv-next 大版本移除
 *   该路径，需要同步修改本文件（这是全库唯一的耦合点），并收紧 peer 依赖范围。
 */
const useFormItemContext =
	typeof antdvFormContext.useFormItemContext === "function" ? antdvFormContext.useFormItemContext : null;

export function useFormItemChange() {
	if (!useFormItemContext) {
		return () => {};
	}

	const context = useFormItemContext();

	return () => context?.triggerChange?.();
}
