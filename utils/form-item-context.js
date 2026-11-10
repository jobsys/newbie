import { useFormItemContext } from "antdv-next/dist/form/context";

/**
 * antdv-next 把原来 `Form.useInjectFormItemContext()` 的 `onFieldChange`
 * 拆成了 `triggerChange` / `triggerBlur`。
 *
 * 这里统一成一个小的适配函数，避免业务组件直接依赖 antdv 内部路径散落各处。
 * 将来如果官方把它提升为公开 API，只需要改这一个文件。
 */
export function useFormItemChange() {
	const context = useFormItemContext();
	return () => context?.triggerChange?.();
}
