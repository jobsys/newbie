# NewbieProvider 全局配置改造实施计划

> **致执行者：** 必需子技能（REQUIRED SUB-SKILL）：使用 `executing-plans` 逐个任务地执行此计划。
> 每个任务结束后运行该任务的验证命令并提交；不要跨任务批量提交，也不要在测试未通过时进入下一阶段。

**目标：** 把 `NewbieProvider` 从「固定 5 个配置对象」改为「任意命名空间的覆盖包 + 组件自带默认值」，实现「组件默认值 < Provider 全局配置 < 实例 props」，以后新增组件或新增参数都不需要修改 Provider。

**架构：** 用一个 `NEWBIE_CONFIG` Symbol 提供任意命名空间的配置对象；每个组件在自己的 `config.js` 里声明可被全局覆盖的默认值；`useMergedProps(rawProps, namespace, defaults)` 返回带优先级的合并代理；Provider 只负责合并新旧配置并响应式地提供覆盖包，不再登记参数清单。

**技术栈：** Vue 3.5（peer `^3.5.30`）、JSX（`@vitejs/plugin-vue-jsx`）、vue-i18n 11、lodash-es、antdv-next 1.8.1、Vitest + `@vue/test-utils` + jsdom（本计划新增）。

---

## 0. 背景与约束

### 0.1 现状问题

| 问题 | 位置 | 影响 |
| --- | --- | --- |
| `uploader.defaultFileItem` 浅合并，整体被覆盖 | `components/provider/NewbieProvider.jsx:149-158` | 只传 `url` 时 `name`/`path`/`id` 丢失；`NewbieUploader`、`FormItem` 用 `undefined` 当字段名 |
| 默认值在 props 和 provide 里各写一份 | `NewbieProvider.jsx:26-121`、`:138-165` | 改一处漏一处，`pageSize` 已经漂移（Provider 10 / 表格 20） |
| `table.page`、`table.pageSize` 没有消费方 | `components/table/NewbieTable.jsx:286` | 配了不生效，表格硬编码 `20`（本计划接通 `table.pageSize`，废弃无实际意义的全局初始页码 `table.page`） |
| provide 的值是 setup 时的一次性快照 | `NewbieProvider.jsx:138-165` | 异步拉取配置、运行时改配置都不生效 |
| `locale` 默认 `"zh_CN"` 直接改全局 i18n | `NewbieProvider.jsx:117-136` | 覆盖宿主语言；多 Provider / SSR 互相干扰 |
| `NEWBIE_LOCALE` 无 inject 方 | 全库 | 死代码 |
| 未挂 Provider 时 inject 兜底是 `{}` | `NewbieTable.jsx:248` 等 | `params[undefined]` 被发给后端 |
| 额外包一层 `<div>` | `NewbieProvider.jsx:167` | 多一层 DOM，class/style 落在 div 上 |
| Symbol 与默认值耦合在 `.jsx` 里 | 文件级 | 子组件为了拿 Symbol 必须 import 组件模块 |

关联待办：`TODOs.md` 的「Uploader required 检测不正常」有两个成因：一是局部覆盖 `defaultFileItem` 时 `path` 变成 `undefined`（本计划通过深合并与组件级默认值彻底解决）；二是单文件上传在 `NewbieUploader` `onMounted` 时将空初始对象转为 `null` 与 `type: "object"` 校验规则冲突（需单独排查修复，不在本计划范围）。

### 0.2 设计约定（执行时不要偏离）

1. **优先级固定为**：组件 `defaults` < `NewbieProvider.config[namespace]` < 实例 props（显式传入）。
2. **命名空间**：沿用 `editor`、`table`、`uploader`、`form`、`search`；新组件用自己的名字（如 `signaturePad`）。Provider 不维护清单。
3. **配置 key 可以多于组件 props**：例如 `table.pageSize`、`table.pageKey` 不是 `NewbieTable` 的 prop，但组件可以读取。`defaults` 对象同时充当「组件支持哪些全局配置」的 schema。
4. **合并语义**：普通对象递归合并；数组、函数、`null`、标量整体替换；`undefined` 视为未传，忽略并不覆盖已有默认值。实例 props 永远整体覆盖全局值，不做深合并。
5. **未传检测**：白名单 prop 不能保留 Vue `default`，否则永远检测不到「未传」。Boolean 必须写 `default: undefined`（Vue 3.5 实测：`type: Boolean` 无 default 时缺失会变成 `false`，写 `default: undefined` 才是 `undefined`）。
6. **响应式**：全局配置使用 `reactive` + `watch`，组件通过 `computed` 读取并在消费处按需 `.value` 解包，确保异步拉取配置能自动生效。
7. **SSR 安全**：不引入运行时全局注册表、不修改模块级变量；所有状态挂在 Provider 实例上。
8. **兼容**：旧的 `editor/table/uploader/form/search` props 保留一个版本，内部映射进 `config` 并 `console.warn` 弃用；`config` 优先于旧 props。

### 0.3 非目标（YAGNI）

- 不做运行时全局注册表/自动扫描组件（会破坏 tree-shaking，且有 SSR 串数据风险）。
- 不把 `dataSource`、`columns`（表格列/表单栅格列）、`value`、`open`、`loading` 等数据/状态类 props 全局化。
- 不迁移 TypeScript，不引入 defineProps 代码生成。
- 不修改组件对外 props 名称，不调整 antd 主题相关逻辑。

### 0.4 开始前检查

```bash
git status                 # 必须干净，或明确记录当前改动
git branch --show-current  # 确认当前工作分支
node -v                    # 预期 >=22.13.0（见 package.json engines）
pnpm -v
```

如 `pnpm add` 因网络失败，先按本机代理端口设置 `pnpm config set proxy` / `https-proxy` 再重试；代理配置不要提交到仓库。

---

## 1. 任务总览

| 阶段 | 任务 | 提交信息 |
| --- | --- | --- |
| 0 | 测试基础设施 | `test: add vitest setup` |
| 1 | 配置核心 `mergeConfig` | `feat: add provider config merge utility` |
| 2 | `useMergedProps` / `useNewbieConfig` | `feat: add useMergedProps hook` |
| 3 | Provider 改造 | `feat: make newbie provider a config override bag` |
| 4 | Table 迁移 | `feat: table reads global config defaults` |
| 5 | Uploader 迁移 + P0 修复 | `fix: deep merge uploader file item config` |
| 6 | Form / Search / Editor 迁移 | `feat: migrate form and search to provider config` |
| 7 | 文档与示例 | `docs: document provider global config` |
| 8 | 清理与验收 | `chore: remove deprecated provider symbols` |

---

## Phase 0：测试基础设施

### 任务 0.1：安装测试依赖

- [ ] 执行：

```bash
pnpm add -D vitest @vue/test-utils jsdom
```

- [ ] 确认 `package.json` 的 `devDependencies` 中出现三项，且没有 peer dependency 报错。
- [ ] 若 Vitest 与 Vite 8 存在 peer 冲突，先升级到 `vitest@latest`；仍冲突则在计划末尾「风险」里记录并改用 `node:test` + `@vue/test-utils`（仅影响测试运行器，不影响本计划设计）。

### 任务 0.2：新增 `vitest.config.js`

- [ ] 新建 `vitest.config.js`：

```js
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

export default mergeConfig(
	viteConfig,
	defineConfig({
		test: {
			environment: "jsdom",
			globals: true,
			include: ["tests/**/*.test.{js,jsx}"],
			setupFiles: ["./tests/setup.js"],
		},
	})
);
```

### 任务 0.3：新增 `tests/setup.js`

- [ ] 新建 `tests/setup.js`：

```js
import { config } from "@vue/test-utils";
import i18n from "../i18n.js";

config.global.plugins = [i18n];

// antdv-next 在 jsdom 下可能用到，缺失时补上
if (!globalThis.ResizeObserver) {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

if (!window.matchMedia) {
	window.matchMedia = query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener() {},
		removeListener() {},
		addEventListener() {},
		removeEventListener() {},
		dispatchEvent() {
			return false;
		},
	});
}
```

### 任务 0.4：补测试脚本

- [ ] 在 `package.json` 的 `scripts` 中加入：

```json
"test": "vitest run",
"test:watch": "vitest"
```

### 任务 0.5：冒烟测试

- [ ] 新建 `tests/smoke.test.js`：

```js
import { describe, expect, it } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

describe("vitest", () => {
	it("可以挂载 Vue 组件", () => {
		const Demo = defineComponent({
			setup: () => () => h("div", { class: "demo" }, "ok"),
		});
		const wrapper = mount(Demo);
		expect(wrapper.find(".demo").text()).toBe("ok");
	});
});
```

- [ ] 运行：

```bash
pnpm test
```

预期 1 passed。
- [ ] 运行 `pnpm lint`，确认没有新增报错。
- [ ] 提交：

```bash
git add package.json pnpm-lock.yaml vitest.config.js tests/setup.js tests/smoke.test.js
git commit -m "test: add vitest setup"
```

---

## Phase 1：配置核心 `mergeConfig`

### 任务 1.1：先写失败测试

- [ ] 新建 `tests/provider/config.test.js`：

```js
import { describe, expect, it } from "vitest";
import { mergeConfig } from "../../components/provider/config.js";

const defaults = {
	uploader: {
		uploadUrl: "",
		defaultFileItem: { id: "id", name: "name", url: "url", path: "path" },
	},
	form: {
		format: { date: true, boolean: false },
		columns: { switch: { defaultProps: { size: "small" } } },
	},
	table: { pageSize: 20, autoQuery: false },
};

describe("mergeConfig", () => {
	it("深合并 defaultFileItem，只覆盖传入的字段", () => {
		const result = mergeConfig(defaults, {
			uploader: { defaultFileItem: { url: "fileUrl" } },
		});

		expect(result.uploader.defaultFileItem).toEqual({
			id: "id",
			name: "name",
			url: "fileUrl",
			path: "path",
		});
	});

	it("深合并 form.columns，保留未覆盖的类型", () => {
		const result = mergeConfig(defaults, {
			form: { columns: { switch: { defaultProps: { size: "default" } } } },
		});

		expect(result.form.columns.switch.defaultProps.size).toBe("default");
	});

	it("数组与函数整体替换", () => {
		const fn = () => 1;
		const result = mergeConfig(
			{ search: { valueFormatter: null, options: [1, 2] } },
			{ search: { valueFormatter: fn, options: [3] } }
		);

		expect(result.search.valueFormatter).toBe(fn);
		expect(result.search.options).toEqual([3]);
	});

	it("保留 false、0 与空字符串", () => {
		const result = mergeConfig(defaults, {
			table: { pageSize: 0, autoQuery: false },
		});

		expect(result.table.pageSize).toBe(0);
		expect(result.table.autoQuery).toBe(false);
	});

	it("忽略 undefined，不覆盖已有默认值", () => {
		const result = mergeConfig(defaults, {
			table: { pageSize: undefined },
			uploader: { defaultFileItem: { url: "fileUrl", path: undefined } },
		});

		expect(result.table.pageSize).toBe(20);
		expect(result.uploader.defaultFileItem.path).toBe("path");
		expect(result.uploader.defaultFileItem.url).toBe("fileUrl");
	});

	it("不修改传入对象", () => {
		const input = { table: { pageSize: 50 } };
		mergeConfig(defaults, input);
		expect(defaults.table.pageSize).toBe(20);
		expect(input).toEqual({ table: { pageSize: 50 } });
	});
});
```

- [ ] 运行，确认模块不存在而失败：

```bash
pnpm vitest run tests/provider/config.test.js
```

### 任务 1.2：实现 `components/provider/config.js`

- [ ] 新建 `components/provider/config.js`：

```js
import { isPlainObject } from "lodash-es";

/** 全局配置覆盖包的注入 key
 * 用 Symbol.for 而不是 Symbol：主入口与 hooks 入口是两个构建 entry，
 * 普通 Symbol 可能在两个 chunk 里各生成一份，导致 inject 拿不到。
 */
export const NEWBIE_CONFIG = Symbol.for("jobsys-newbie.config");

/** 空配置，作为 inject 的默认值，避免每个消费方各写一个 {} */
export const EMPTY_CONFIG = Object.freeze({});

/**
 * 合并配置：普通对象递归合并，数组/函数/标量整体替换，undefined 忽略。
 * 不修改 base 与 input。
 */
export function mergeConfig(base = {}, input = {}) {
	if (!isPlainObject(base) || !isPlainObject(input)) {
		return input ?? base;
	}

	const result = { ...base };
	for (const key of Object.keys(input)) {
		const next = input[key];
		if (next === undefined) {
			continue;
		}
		result[key] =
			isPlainObject(next) && isPlainObject(base[key])
				? mergeConfig(base[key], next)
				: next;
	}
	return result;
}
```

- [ ] 运行：

```bash
pnpm vitest run tests/provider/config.test.js
```

预期 6 passed。
- [ ] 提交：

```bash
git add components/provider/config.js tests/provider/config.test.js
git commit -m "feat: add provider config merge utility"
```

---

## Phase 2：`useMergedProps` 与 `useNewbieConfig`

### 任务 2.1：先写失败测试

- [ ] 新建 `tests/provider/useMergedProps.test.jsx`：

```jsx
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
```

- [ ] 运行，确认因 `useMergedProps` 不存在而失败：

```bash
pnpm vitest run tests/provider/useMergedProps.test.jsx
```

### 任务 2.2：实现 hook

- [ ] 新建 `hooks/useMergedProps.js`：

```js
import { computed, inject } from "vue";
import { EMPTY_CONFIG, NEWBIE_CONFIG, mergeConfig } from "../components/provider/config.js";

/**
 * 解析组件实际生效的配置。
 *
 * 优先级：实例 props > Provider config[namespace] > 组件 defaults。
 * 返回 Proxy，因此组件内部可以继续写 `props.xxx`，不需要改成 computed。
 *
 * @param {Object} rawProps defineComponent 传入的 props
 * @param {string} namespace 配置命名空间，如 "table"
 * @param {Object} defaults 组件默认值，同时是该组件支持的全局配置 key 清单
 */
export function useMergedProps(rawProps, namespace, defaults = {}) {
	const bag = inject(NEWBIE_CONFIG, EMPTY_CONFIG);

	const merged = computed(() => {
		const base = mergeConfig(defaults, bag[namespace] || {});
		for (const key of Object.keys(rawProps)) {
			if (rawProps[key] !== undefined) {
				base[key] = rawProps[key];
			}
		}
		return base;
	});

	return new Proxy(
		{},
		{
			get: (_, key) => (typeof key === "string" ? merged.value[key] : undefined),
			has: (_, key) => typeof key === "string" && key in merged.value,
			ownKeys: () => Reflect.ownKeys(merged.value),
			getOwnPropertyDescriptor: (_, key) =>
				typeof key === "string" && key in merged.value
					? {
							enumerable: true,
							configurable: true,
							value: merged.value[key],
						}
					: undefined,
		}
	);
}

/**
 * 只读取命名空间配置（不做实例 props 合并），返回 computed。
 * 用于 uploader / form / search / editor 这类配置项与组件 props 不同名或结构不同的场景。
 */
export function useNewbieConfig(namespace, defaults = {}) {
	const bag = inject(NEWBIE_CONFIG, EMPTY_CONFIG);
	return computed(() => mergeConfig(defaults, bag[namespace] || {}));
}
```

- [ ] 在 `hooks/index.js` 末尾加入：

```js
export * from "./useMergedProps.js";
```

- [ ] 运行：

```bash
pnpm vitest run tests/provider/useMergedProps.test.jsx
```

预期 5 passed。
- [ ] 提交：

```bash
git add hooks/useMergedProps.js hooks/index.js tests/provider/useMergedProps.test.jsx
git commit -m "feat: add useMergedProps hook"
```

---

## Phase 3：Provider 改造

### 任务 3.1：先写失败测试

- [ ] 新建 `tests/provider/NewbieProvider.test.jsx`：

```jsx
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, inject, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import i18n from "../../i18n.js";
import NewbieProvider, { NEWBIE_TABLE } from "../../components/provider/NewbieProvider.jsx";
import { NEWBIE_CONFIG } from "../../components/provider/config.js";

const Probe = defineComponent({
	setup() {
		const bag = inject(NEWBIE_CONFIG, {});
		return () => <div class="probe">{JSON.stringify(bag)}</div>;
	},
});

const mountWith = (props, slot = () => h(Probe)) =>
	mount(NewbieProvider, { props, slots: { default: slot } });

afterEach(() => {
	i18n.global.locale.value = "zh_CN";
	vi.restoreAllMocks();
});

describe("NewbieProvider", () => {
	it("config 覆盖包原样提供给子组件", () => {
		const wrapper = mountWith({ config: { table: { pageSize: 50 } } });
		expect(wrapper.find(".probe").text()).toContain('"pageSize":50');
	});

	it("旧 props 仍然生效，且 config 优先", () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const wrapper = mountWith({
			table: { pageSize: 30 },
			config: { table: { pageSize: 50 } },
		});
		expect(wrapper.find(".probe").text()).toContain('"pageSize":50');
		expect(console.warn).toHaveBeenCalled();
	});

	it("默认不修改宿主 i18n 语言", () => {
		i18n.global.locale.value = "en_US";
		mountWith({});
		expect(i18n.global.locale.value).toBe("en_US");
	});

	it("显式传入 locale 时同步到 i18n", async () => {
		const wrapper = mountWith({ locale: "en_US" });
		expect(i18n.global.locale.value).toBe("en_US");

		await wrapper.setProps({ locale: "zh_CN" });
		expect(i18n.global.locale.value).toBe("zh_CN");
	});

	it("不额外包裹 DOM 节点", () => {
		const wrapper = mountWith({}, () => h("span", { class: "only" }, "ok"));
		expect(wrapper.html()).toBe('<span class="only">ok</span>');
	});

	it("异步替换 config 后子组件更新", async () => {
		const wrapper = mountWith({ config: { table: { pageSize: 30 } } });
		await wrapper.setProps({ config: { table: { pageSize: 60 } } });
		await nextTick();
		expect(wrapper.find(".probe").text()).toContain('"pageSize":60');
	});

	it("兼容期内旧 Symbol 仍可注入", () => {
		const LegacyProbe = defineComponent({
			setup() {
				const bag = inject(NEWBIE_TABLE, {});
				return () => <div class="legacy">{bag.pageSize}</div>;
			},
		});
		const wrapper = mountWith(
			{ config: { table: { pageSize: 50 } } },
			() => h(LegacyProbe)
		);
		expect(wrapper.find(".legacy").text()).toBe("50");
	});
});
```

- [ ] 运行，确认失败：

```bash
pnpm vitest run tests/provider/NewbieProvider.test.jsx
```

### 任务 3.2：重写 `components/provider/NewbieProvider.jsx` 并更新导出

- [ ] `components/provider/NewbieProvider.jsx` 整文件替换为：

```jsx
import { defineComponent, provide, reactive, readonly, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { NEWBIE_CONFIG, mergeConfig } from "./config.js";

// ===== 兼容期：以下 Symbol、LEGACY_DEFAULTS 与旧 provide 在 Phase 8 删除 =====
export const NEWBIE_LOCALE = Symbol("NEWBIE_LOCALE");
export const NEWBIE_EDITOR = Symbol("NEWBIE_EDITOR");
export const NEWBIE_TABLE = Symbol("NEWBIE_TABLE");
export const NEWBIE_UPLOADER = Symbol("NEWBIE_UPLOADER");
export const NEWBIE_FORM = Symbol("NEWBIE_FORM");
export const NEWBIE_SEARCH = Symbol("NEWBIE_SEARCH");

const LEGACY_KEYS = ["editor", "table", "uploader", "form", "search"];

const LEGACY_SYMBOLS = {
	editor: NEWBIE_EDITOR,
	table: NEWBIE_TABLE,
	uploader: NEWBIE_UPLOADER,
	form: NEWBIE_FORM,
	search: NEWBIE_SEARCH,
};

// 兼容期保留旧默认值，保证 Phase 4-6 迁移前旧组件行为不变；Phase 8 删除
const LEGACY_DEFAULTS = {
	editor: { uploadUrl: "" },
	table: {
		page: 1,
		pageSize: 10,
		pageKey: "page",
		pageSizeKey: "pageSize",
		afterFetched: null,
	},
	uploader: {
		uploadUrl: "",
		defaultFileItem: {
			id: "id",
			name: "name",
			url: "url",
			path: "path",
			thumbUrl: "thumbUrl",
		},
		defaultPreview: null,
	},
	form: { format: {}, afterFetched: null, columns: {} },
	search: { maskClass: "", inputClass: "", valueFormatter: null },
};
// ===== 兼容期结束 =====

const legacyProps = () =>
	LEGACY_KEYS.reduce((props, key) => {
		props[key] = { type: Object, default: undefined };
		return props;
	}, {});

/**
 * Newbie 全局配置
 *
 * @example
 * <NewbieProvider :config="{ table: { pageSize: 50 }, uploader: { uploadUrl: '/api/upload' } }">
 *   <App />
 * </NewbieProvider>
 */
export default defineComponent({
	name: "NewbieProvider",
	inheritAttrs: false,
	props: {
		/**
		 * 任意组件命名空间的覆盖包，key 由组件自己定义
		 */
		config: { type: Object, default: () => ({}) },

		/**
		 * vue-i18n 的语言；留空表示不修改宿主语言
		 */
		locale: { type: String, default: "" },

		// 旧 API，保留一个版本，内部映射到 config
		...legacyProps(),
	},
	setup(props, { slots }) {
		const toBag = () => {
			const legacy = {};
			for (const key of LEGACY_KEYS) {
				if (props[key]) {
					legacy[key] = props[key];
				}
			}
			return mergeConfig(legacy, props.config);
		};

		const legacyKeys = LEGACY_KEYS.filter(key => props[key]);
		if (legacyKeys.length) {
			console.warn(
				`[NewbieProvider] 顶层 ${legacyKeys.join(", ")} props 已废弃，请改用 :config="{ ${legacyKeys.join(", ")}: {...} }"`
			);
		}

		const config = reactive(toBag());
		provide(NEWBIE_CONFIG, readonly(config));

		// 兼容期：旧组件仍能注入；Phase 8 删除
		for (const key of LEGACY_KEYS) {
			provide(
				LEGACY_SYMBOLS[key],
				mergeConfig(LEGACY_DEFAULTS[key], config[key] || {})
			);
		}
		provide(NEWBIE_LOCALE, toRef(props, "locale"));

		watch(
			toBag,
			next => {
				for (const key of Object.keys(config)) {
					if (!(key in next)) {
						delete config[key];
					}
				}
				Object.assign(config, next);
			},
			{ deep: true }
		);

		const { locale } = useI18n({ useScope: "global" });
		watch(
			() => props.locale,
			value => {
				if (value) {
					locale.value = value;
				}
			},
			{ immediate: true }
		);

		return () => slots.default?.() ?? null;
	},
});
```

- [ ] 在 `components/provider/index.js` 中补充导出 `NEWBIE_CONFIG`、`EMPTY_CONFIG` 与 `mergeConfig`：

```js
export { NEWBIE_CONFIG, EMPTY_CONFIG, mergeConfig } from "./config.js";
```

- [ ] 暂时保留 `NEWBIE_*` Symbol 与旧 provide，等 Phase 4-6 把所有消费方迁移完、Phase 8 再统一删除；这样每个提交之间项目仍然可运行。
- [ ] 运行：

```bash
pnpm vitest run tests/provider/NewbieProvider.test.jsx
```

预期 7 passed。
- [ ] 提交：

```bash
git add components/provider/NewbieProvider.jsx components/provider/index.js tests/provider/NewbieProvider.test.jsx
git commit -m "feat: make newbie provider a config override bag"
```

> 注意：`useI18n` 要求宿主安装 vue-i18n（本仓库已有 `i18n.js`）。如果未来需要「未安装 i18n 也能用 Provider」，另开任务改成可选读取，不在本计划内。

---

## Phase 4：Table 迁移

### 任务 4.1：新增 `components/table/config.js`

- [ ] 新建：

```js
export const tableDefaults = {
	pageSize: 20,
	pageKey: "page",
	pageSizeKey: "pageSize",
	filterable: true,
	pagination: true,
	autoQuery: false,
	showRefresh: true,
	cardWrapper: false,
	method: "get",
	rowKey: "id",
	afterFetched: null,
	persistence: false,
};
```

> `pageSize` 取 20，与 `NewbieTable` 当前实际行为一致；旧 Provider 里的 10 是错误默认值，本计划顺手修正，需在变更说明中标注。`autoQuery` 当前为历史遗留 prop（组件内暂未消费），保留在 `tableDefaults` 中维持 prop 契约兼容。

### 任务 4.2：把白名单 props 的 default 改为 undefined

- [ ] 在 `components/table/NewbieTable.jsx` 中修改以下 prop（只改这些，其余保持原样）：

```js
filterable: { type: Boolean, default: undefined },
pagination: { type: [Boolean, Object], default: undefined },
autoQuery: { type: Boolean, default: undefined },
method: { type: String },
afterFetched: { type: Function, default: undefined },
rowKey: { type: [String, Function] },
showRefresh: { type: Boolean, default: undefined },
persistence: { type: [Boolean, String, Object], default: undefined },
cardWrapper: { type: Boolean, default: undefined },
```

- [ ] 确认这些 prop 的 JSDoc 注释保留，并把原默认值写进注释（例如 `默认读取 tableDefaults.pageSize`）。

### 任务 4.3：setup 接入合并 hook

- [ ] 删除 `import {NEWBIE_TABLE} from "../provider/NewbieProvider.jsx";`。
- [ ] 引入：

```js
import { tableDefaults } from "./config.js";
import { useMergedProps } from "../../hooks/useMergedProps.js";
```

- [ ] 把 setup 签名从：

```js
setup(props, { emit, slots, expose }) {
```

改为：

```js
setup(rawProps, { emit, slots, expose }) {
	const props = useMergedProps(rawProps, "table", tableDefaults);
```

- [ ] 删除 `const tableProvider = inject(NEWBIE_TABLE, () => {});`。
- [ ] `inject` 在 `NewbieTable.jsx` 中已无其它用途，从 `vue` 的 import 列表中移除。

### 任务 4.4：接上 `pageSize`（含异步更新同步）与请求参数

- [ ] 把 `NewbieTable.jsx:286` 改为：

```js
pageSize:
	persistencePagination.pageSize ||
	props.pagination?.pageSize ||
	props.pageSize,
```

- [ ] 在 `state` 定义之后添加 `watch`，保证异步替换 Provider `config.table.pageSize`（或动态修改 `props.pagination.pageSize`）且无持久化覆盖时，`state.pagination.pageSize` 能同步更新：

```js
watch(
	() => props.pagination?.pageSize || props.pageSize,
	nextSize => {
		if (!persistencePagination.pageSize && nextSize) {
			state.pagination.pageSize = nextSize;
		}
	}
);
```

- [ ] 把 `NewbieTable.jsx:347-349` 中的 `tableProvider.pageSizeKey` / `tableProvider.pageKey` 改为 `props.pageSizeKey` / `props.pageKey`。
- [ ] 把 `NewbieTable.jsx:385` 改为：

```js
const fetched = props.afterFetched;
```

（Provider 的 `afterFetched` 已经合并进 `props.afterFetched`，实例 props 仍天然优先。）

- [ ] 全文件搜索 `tableProvider`，确认无残留。

> 注意：`pageSize` / `pageKey` / `pageSizeKey` 没有声明为 `NewbieTable` 的 props，只能通过 Provider 配置；实例级分页仍走 `pagination`。如果以后希望实例也能直接覆盖这三个值，需要额外声明同名 prop，并保持 `default: undefined`。

### 任务 4.5：表格集成测试

- [ ] 新建 `tests/table/table-config.test.jsx`（注意不要引入未使用的 `h`，以免 `pnpm lint` 报错）：

```jsx
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
});
```

- [ ] 运行：

```bash
pnpm vitest run tests/table/table-config.test.jsx
pnpm lint
```

- [ ] 打开 playground 手动确认：

```bash
pnpm dev
```

检查 `#Table` 页面：分页默认 20；在 `playground/App.vue` 临时加 `:config="{ table: { pageSize: 50 } }"` 后刷新，分页变 50；表格实例传 `:pagination="{ pageSize: 30 }"` 时以 30 为准。

- [ ] 提交：

```bash
git add components/table/NewbieTable.jsx components/table/config.js tests/table/table-config.test.jsx
git commit -m "feat: table reads global config defaults"
```

---

## Phase 5：Uploader 迁移与 P0 修复

### 任务 5.1：新增 `components/uploader/config.js`

- [ ] 新建：

```js
export const defaultFileItem = {
	id: "id",
	name: "name",
	url: "url",
	path: "path",
	thumbUrl: "thumbUrl",
};

export const uploaderDefaults = {
	uploadUrl: "",
	defaultPreview: null,
	defaultFileItem,
};
```

### 任务 5.2：NewbieUploader 读取合并配置

- [ ] 删除 `import {NEWBIE_UPLOADER} from "../provider/NewbieProvider.jsx";`。
- [ ] 引入：

```js
import { uploaderDefaults } from "./config.js";
import { useNewbieConfig } from "../../hooks/useMergedProps.js";
```

- [ ] 把 `NewbieUploader.jsx:118-123` 改为通过 `useNewbieConfig` 获取（在使用处读取或保持响应式读取，使异步拉取 `uploadUrl` 也能在渲染时生效）：

```js
const uploaderConfig = useNewbieConfig("uploader", uploaderDefaults);
const defaultFileItem = uploaderConfig.value.defaultFileItem;
const { url: urlKey, path: pathKey, name: nameKey } = defaultFileItem;
```

- [ ] 将 `NewbieUploader.jsx:233` 的 `defaultPreview` 改为读取 `uploaderConfig.value.defaultPreview`，将 `:439` 的 `action={props.action || defaultUploadUrl}` 改为 `action={props.action || uploaderConfig.value.uploadUrl}`，删除对 `uploaderProvider` 的所有引用。
- [ ] 如果 `inject` 在 `NewbieUploader.jsx` 中已无其它用途，从 `vue` 的 import 列表中移除。

### 任务 5.3：FormItem 防御与死代码清理

- [ ] 在 `components/form/components/FormItem.jsx:164` 改为：

```js
[uploaderProvider.defaultFileItem?.path || "path"]: {
```

- [ ] 移除 `components/form/components/FormItem.jsx:151-155` 的 `if (!Object.keys(uploaderProvider).length)` 分支（接入 `uploaderDefaults` 后 `defaultFileItem.path` 始终有安全默认值 `"path"`，且上传地址也可由表单项自身的 `defaultProps.action` 提供，不再需要阻断渲染）。

### 任务 5.4：验证 P0

- [ ] 新增 `tests/uploader/config.test.js`：

```js
import { describe, expect, it } from "vitest";
import { mergeConfig } from "../../components/provider/config.js";
import { uploaderDefaults } from "../../components/uploader/config.js";

describe("uploader 配置", () => {
	it("只覆盖 url 时保留其它文件字段", () => {
		const merged = mergeConfig(uploaderDefaults, {
			defaultFileItem: { url: "fileUrl" },
		});

		expect(merged.defaultFileItem).toEqual({
			id: "id",
			name: "name",
			url: "fileUrl",
			path: "path",
			thumbUrl: "thumbUrl",
		});
	});
});
```

- [ ] 运行：

```bash
pnpm vitest run tests/uploader/config.test.js
```

- [ ] playground 手动验证：在 `playground/App.vue` 的 provider 配置里只写：

```js
uploader: { uploadUrl: "/index.php/tool/test_upload", defaultFileItem: { url: "url" } }
```

上传一个文件并提交，确认提交数据里仍有 `name`、`path`、`id`。
- [ ] 提交：

```bash
git add components/uploader/NewbieUploader.jsx components/uploader/config.js components/form/components/FormItem.jsx tests/uploader/config.test.js
git commit -m "fix: deep merge uploader file item config"
```

---

## Phase 6：Form / Search / Editor 迁移

### 任务 6.1：Form

- [ ] 新建 `components/form/config.js`：

```js
export const formDefaults = {
	format: {},
	afterFetched: null,
	columns: {},
};
```

> 说明：`NewbieForm` 的实例 prop `columns` 是栅格列宽数组（默认 `[24]`），而全局配置 `form.columns` 是按字段类型索引的默认配置映射（如 `{ switch: { defaultProps: ... } }`），两者语义不同，因此 `NewbieForm` 使用 `useNewbieConfig("form", formDefaults)` 读取全局配置。

- [ ] `NewbieForm.jsx`：

  - 删除 `NEWBIE_FORM`、`NEWBIE_UPLOADER` 的 import；
  - 引入 `formDefaults`、`uploaderDefaults` 与 `useNewbieConfig`；
  - 把 `:256-257` 改为响应式配置引用：

```js
const formConfigRef = useNewbieConfig("form", formDefaults);
const uploaderConfigRef = useNewbieConfig("uploader", uploaderDefaults);
```

  - 在 `formItems`（`:271`）、`initFormData`（`:374`、`:379`）、`fetchItem`（`:408`）、`onSubmit`（`:457`）中通过 `formConfigRef.value` 和 `uploaderConfigRef.value` 读取，并在 `layoutElem`（`:616`）的 `context` 中传入 `formProvider: formConfigRef.value` 与 `uploaderProvider: uploaderConfigRef.value`；
  - 如果 `inject` 在 `NewbieForm.jsx` 中已无其它用途，从 `vue` 的 import 列表中移除。

- [ ] `components/form/components/FormItem.jsx`：

  - 删除 `NEWBIE_FORM`、`NEWBIE_UPLOADER` 的 import；
  - 引入 `uploaderDefaults`；
  - `FormItem.jsx` 的 `render` 是普通渲染函数（每次渲染对每个字段都会调用），**不要**在里面每次调用 `useNewbieConfig` 创建新的 `computed`；改为直接从第 3 个参数 `context` 解构 `uploaderProvider = uploaderDefaults`：

```js
const render = (item, submitForm, { props, slots, formState, uploaderProvider = uploaderDefaults }) => {
```

  - 把 `:34-37` 的 `initItemDefaultValue` 调用中未使用的 `formProvider` 移除，只传 `{ uploaderProvider }`；
  - 把 `:93`（`match` 递归调用）与 `:244`（`combiner` 调用）补充传递 `formState` 与 `uploaderProvider`（并在 `Combiner.jsx` 中透传上下文给 `createFormItem`）；
  - 从 `vue` 的 import 列表中移除不再使用的 `inject`。

### 任务 6.2：Search

- [ ] 新建 `components/search/config.js`：

```js
export const searchDefaults = {
	maskClass: "",
	inputClass: "",
	valueFormatter: null,
};
```

- [ ] `NewbieSearch.jsx`：

  - 删除 `NEWBIE_SEARCH` import，从 `vue` 的 import 列表中移除不再使用的 `inject`；
  - 引入 `searchDefaults` 与 `useNewbieConfig`；
  - 把 `:85` 改为 `const searchConfig = useNewbieConfig("search", searchDefaults);`；
  - 在 `getQueryForm`（`:418`）中读取 `searchConfig.value?.valueFormatter?.[item.type]`，在 `searchElems`（`:583`）中传入 `searchProvider: searchConfig.value`；
  - 修正 `:418` 的注释：`valueFormatter` 是「按字段类型索引的格式化函数映射」，不是单个 Function。

### 任务 6.3：Editor

- [ ] 新建 `components/editor/config.js`：

```js
export const editorDefaults = {
	uploadUrl: "",
};
```

- [ ] `NewbieEditor.jsx`：

  - 删除 `NEWBIE_EDITOR` import，从 `vue` 的 import 列表中移除不再使用的 `inject`；
  - 引入 `editorDefaults` 与 `useNewbieConfig`；
  - 把 `:68` 改为 `const editorProvider = useNewbieConfig("editor", editorDefaults);`，并在 `:80` 上传处使用 `editorProvider.value.uploadUrl`（支持异步配置上传地址）。

### 任务 6.4：回归

- [ ] 运行全量测试与 lint：

```bash
pnpm test
pnpm lint
```

- [ ] playground 手动检查 `#Form`、`#Search`、`#Editor` 三个页面功能正常。
- [ ] 提交：

```bash
git add components/form components/search components/editor
git commit -m "feat: migrate form and search to provider config"
```

---

## Phase 7：文档与示例

### 任务 7.1：新增用户文档 `docs/provider-config.md`

- [ ] 内容至少包含：

1. 优先级说明（组件默认值 < Provider `config` < 实例 props）；
2. 命名空间与可配置项清单（`table`、`uploader`、`form`、`search`、`editor`）；
3. 初始化示例（同步 / 异步拉取配置）；
4. 如何给新组件新增命名空间：新建 `config.js` → setup 使用 `useMergedProps` / `useNewbieConfig`；
5. 哪些参数不要全局化（数据、受控状态，以及 `NewbieForm` 的栅格 `columns` 与全局 `form.columns` 的区别）；
6. 从旧 API 迁移的对照表（含 `table.pageSize` 默认值从 10 统一为 20、移除 `table.page`、`locale` 默认不覆盖宿主语言的说明）。

### 任务 7.2：更新现有文档

- [ ] `USAGE.md` 的 `NewbieProvider - 全局配置` 改为 `:config` 写法，并保留一段「旧写法」说明。
- [ ] `API_DOCUMENTATION.md:951`、`:1990` 的示例同步更新。
- [ ] `MIGRATION-ANTDV-NEXT.md:69` 的示例同步更新。
- [ ] `components/editor/README.md:14` 修正 `eidtor` / `uploadeUrl` 拼写，并更新为 `config` 写法。
- [ ] `components/uploader/README.md`、`components/form/README.md` 的示例同步更新。

### 任务 7.3：playground 示例

- [ ] 在 `playground/App.vue` 中把 `providers` 的各组件配置收纳进 `config` 字段（保留原有 `afterFetched`、`valueFormatter`、`uploadUrl` 等演示逻辑，并精简 `defaultFileItem` 以演示深合并）：

```js
const providers = reactive({
	config: {
		table: {
			pageSizeKey: "page_size",
			afterFetched: res => ({
				items: res.result.data,
				totalSize: res.result.total,
			}),
		},
		form: {
			columns: {},
		},
		search: {
			valueFormatter: {
				date(value) {
					return value.format("YYYY-MM-DD");
				},
			},
		},
		uploader: {
			uploadUrl: "/index.php/tool/test_upload",
			defaultFileItem: {
				url: "url",
			},
		},
	},
	locale: "zh_CN",
});
```

- [ ] 提交：

```bash
git add docs/provider-config.md USAGE.md API_DOCUMENTATION.md MIGRATION-ANTDV-NEXT.md components playground
git commit -m "docs: document provider global config"
```

---

## Phase 8：清理与验收

### 任务 8.1：清理旧 Symbol（保留旧 props 一个版本）

- [ ] 确认除 Provider 与兼容测试外无残留引用：

```bash
Select-String -Path "components\**\*.js*","hooks\**\*.js*","playground\**\*" -Pattern "NEWBIE_TABLE|NEWBIE_FORM|NEWBIE_UPLOADER|NEWBIE_SEARCH|NEWBIE_EDITOR|NEWBIE_LOCALE"
```

- [ ] 删除 `tests/provider/NewbieProvider.test.jsx` 中的「兼容期内旧 Symbol 仍可注入」测试，并移除 `NEWBIE_TABLE` import。
- [ ] 删除 `NewbieProvider.jsx` 中标记为「兼容期」的代码：
  - 6 个旧 `NEWBIE_*` Symbol 导出；
  - `LEGACY_SYMBOLS` 与 `LEGACY_DEFAULTS` 常量（注意：`LEGACY_DEFAULTS` 必须一并删除，否则 `oxlint` 会报未使用变量错误）；
  - `for (const key of LEGACY_KEYS) { provide(...) }` 循环；
  - `provide(NEWBIE_LOCALE, ...)`；
  - 不再使用的 `toRef` import。
- [ ] **保留** `LEGACY_KEYS`、`legacyProps()` 以及它们在 `toBag()` 中到 `config` 的映射，旧 props 要到下一个 breaking 版本才移除；在文件顶部加注释：

```js
// TODO(next-major): 删除顶层 editor/table/uploader/form/search props，
// 以及仅为它们服务的 LEGACY_KEYS / legacyProps()。
```

- [ ] 运行 `pnpm test` 与 `pnpm lint`，确认测试通过且无 lint 报错（Provider 测试数比 Phase 3 少 1 个）。
- [ ] 提交：

```bash
git add components/provider/NewbieProvider.jsx tests/provider/NewbieProvider.test.jsx
git commit -m "chore: remove deprecated provider symbols"
```

### 任务 8.2：全量验证

- [ ] 运行：

```bash
pnpm test
pnpm lint
pnpm build
```

三项全部通过；构建产物中不应出现新的外部依赖。
- [ ] 检查 `dist/` 没有被提交（`.gitignore` 已忽略）。
- [ ] 若有收尾改动则提交：

```bash
git status
```

### 任务 8.3：验收清单

- [ ] 新代码路径（`NEWBIE_CONFIG` + 各组件 `config.js`）不再依赖 Provider 内的默认值清单。
- [ ] 新增一个命名空间（例如给某个组件加 `signaturePad` 配置）不需要改 `NewbieProvider.jsx`。
- [ ] `uploader.defaultFileItem` 只传 `url` 时，其余字段仍在（P0 回归测试通过）。
- [ ] Provider 配置在初始化后异步替换，Table 分页能更新（单测已覆盖）。
- [ ] 实例 props 始终覆盖全局配置，包括 `false` / `0` / `""`。
- [ ] Provider 默认不改变宿主 i18n 语言。
- [ ] Provider 不产生额外 DOM 节点。
- [ ] 未挂 Provider 的组件使用各自 `config.js` 的默认值，不会出现 `params[undefined]`。
- [ ] 旧写法仍能运行，并输出一条弃用警告。

---

## 2. 风险与回滚

| 风险 | 说明 | 应对 |
| --- | --- | --- |
| 多入口 Symbol 身份 | `hooks/index.js` 与主入口是两个构建 entry，普通 `Symbol()` 可能各生成一份 | `NEWBIE_CONFIG` 使用 `Symbol.for("jobsys-newbie.config")`，在 ESM/CJS 与多 entry 下保持同一实例 |
| Proxy 包裹 props 的兼容性 | 依赖 `props` 的第三方 composable 可能拿到代理而不是原对象 | 本仓库内未使用 `toRefs(props)`；Proxy 以 `{}` 为 target 并正确实现 `has`/`ownKeys`/`getOwnPropertyDescriptor` |
| Boolean prop 缺失值 | 不写 `default: undefined` 会得到 `false`，导致全局配置永远被覆盖 | Phase 4 已显式列出；新增白名单 prop 时必须遵守 |
| 深合并副作用 | 普通对象会被递归合并，可能不是调用方期望的替换语义 | 数组/函数已替换，`undefined` 已忽略；如某 key 需要整体替换，在组件 defaults 里不要放同结构对象 |
| 默认值变更 | `pageSize` 从 10 改为 20，`locale` 默认从 `zh_CN` 改为空 | 在 CHANGELOG / 迁移文档中标注；alpha 阶段可接受 |
| Vitest 与 Vite 8 peer 冲突 | 测试基础设施可能装不上 | 优先升级 Vitest；仍失败则记录并用 `node:test` 跑纯函数测试，组件测试降级为 playground 手测 |
| 旧 API 移除 | 外部项目可能仍写顶层 `:table` | 本计划保留一个版本并 warn，移除放到下一个 breaking 版本 |

回滚策略：按 Phase 提交，任一阶段出问题直接 `git revert <commit>`；`NEWBIE_CONFIG` 与旧 Symbol 在 Phase 8 之前可以并存，不会影响现有项目。

---

## 3. 执行顺序提醒

1. 严格按 Phase 0 → 8 顺序执行，测试先行的任务不要跳步。
2. 每个 Phase 结束运行一次 `pnpm test` 和 `pnpm lint`。
3. Phase 4 和 Phase 5 是行为变化最大的两步，改动后必须打开 playground 手动验证，不要只看单测。
4. 如果发现计划中的行号与代码不一致，以「文件 + 语义」为准，先更新本计划再继续。
