import { describe, expect, it } from "vitest";
import { isReactive } from "vue";
import { createFormModel, keyPath } from "../../components/form/model.js";

const createModel = () => createFormModel();

describe("form/model keyPath", () => {
	it("把点号 key 拆成路径数组，并缓存同一个数组引用", () => {
		const first = keyPath("major.name");
		const second = keyPath("major.name");

		expect(first).toEqual(["major", "name"]);
		// 引用稳定，避免每次渲染生成新数组导致字段重复注册
		expect(second).toBe(first);
	});

	it("过滤空片段，但保留其余层级", () => {
		expect(keyPath("a..b")).toEqual(["a", "b"]);
		expect(keyPath("a.b.")).toEqual(["a", "b"]);
	});

	it("空 key 返回 undefined", () => {
		expect(keyPath(undefined)).toBeUndefined();
		expect(keyPath(null)).toBeUndefined();
		expect(keyPath("")).toBeUndefined();
	});
});

describe("form/model 扁平视图与嵌套模型", () => {
	it("bind 之后读写点号 key 会同步到嵌套 model", () => {
		const { model, flat, keys, bind } = createModel();

		bind("major.name");
		flat["major.name"] = "计算机";

		expect(model.major.name).toBe("计算机");
		expect(flat["major.name"]).toBe("计算机");
		expect(keys.has("major.name")).toBe(true);
	});

	it("未 bind 的 key 在赋值时自动补 bind（动态字段）", () => {
		const { model, flat, keys } = createModel();

		flat["extra.tip"] = "新字段";

		expect(keys.has("extra.tip")).toBe(true);
		expect(model.extra.tip).toBe("新字段");
	});

	it("重复 bind 幂等，不会覆盖已有值", () => {
		const { model, flat, bind } = createModel();

		bind("name");
		flat.name = "张三";
		bind("name");

		expect(flat.name).toBe("张三");
		expect(model.name).toBe("张三");
	});

	it("bind 忽略空 key、非字符串 key 与 'undefined' 字符串 key", () => {
		const { keys, bind } = createModel();

		bind("");
		bind(undefined);
		bind(null);
		bind(123);
		bind("undefined");
		bind(".");

		expect(keys.size).toBe(0);
	});

	it("给 flat['undefined'] 赋值不会写入 model（无 key 表单项）", () => {
		const { model, flat, keys } = createModel();

		flat["undefined"] = "无 key 的值";

		expect(keys.size).toBe(0);
		expect(Object.keys(model)).toEqual([]);
	});

	it("bindAll 批量注册多个 key", () => {
		const { model, flat, keys, bindAll } = createModel();

		bindAll(["a", "b.c", "d"]);
		// 只有注册过的完整点号 key 才有访问器，不能沿扁平分段赋值
		flat["b.c"] = 2;

		expect([...keys]).toEqual(["a", "b.c", "d"]);
		expect(model.b.c).toBe(2);
	});

	it("写入时把非对象的中间层替换为对象", () => {
		const { model, flat } = createModel();

		flat.a = 1;
		flat["a.b"] = 2;

		expect(model.a).toEqual({ b: 2 });
		expect(flat.a).toEqual({ b: 2 });
	});
});

describe("form/model 生命周期操作", () => {
	it("replace 用一份完整的扁平数据重建模型", () => {
		const { model, flat, keys, replace } = createModel();

		flat["old.key"] = 1;
		replace({ "user.name": "李四", level: 3 });

		expect(keys.has("old.key")).toBe(false);
		expect(flat["old.key"]).toBeUndefined();
		expect(model.old?.key).toBeUndefined();
		expect(flat["user.name"]).toBe("李四");
		expect(model.user.name).toBe("李四");
		expect(model.level).toBe(3);
		expect([...keys].toSorted()).toEqual(["level", "user.name"]);
	});

	it("replace 未传数据时等价于 clear", () => {
		const { model, flat, keys, replace } = createModel();

		flat.name = "张三";
		replace(undefined);

		expect(keys.size).toBe(0);
		expect(flat.name).toBeUndefined();
		expect(model.name).toBeUndefined();
	});

	it("clear 同时清空 model 与已注册的 flat key", () => {
		const { model, flat, keys, bind, clear } = createModel();

		bind("a.b");
		flat["a.b"] = 1;
		flat.c = 2;
		clear();

		expect(keys.size).toBe(0);
		expect(Object.keys(model)).toEqual([]);
		expect(flat["a.b"]).toBeUndefined();
		expect(flat.c).toBeUndefined();
	});

	it("snapshot 返回当前扁平数据的普通对象副本", () => {
		const { flat, snapshot } = createModel();

		flat.name = "张三";
		flat["major.name"] = "计算机";

		const snapshotData = snapshot();

		expect(snapshotData).toEqual({ name: "张三", "major.name": "计算机" });
		expect(snapshotData).not.toBe(flat);

		flat.name = "李四";
		expect(snapshotData.name).toBe("张三");
		expect(snapshot().name).toBe("李四");
	});

	it("model 与 flat 都是响应式对象", () => {
		const { model, flat } = createModel();

		expect(isReactive(model)).toBe(true);
		expect(isReactive(flat)).toBe(true);
	});
});
