import { reactive } from "vue";

/**
 * antdv-next 的 Form 要求 model 是嵌套对象，并且 name 需要使用路径数组。
 * 但 NewbieForm 对外的数据契约一直是「扁平对象 + 点号 key」（如 `major.name`），
 * 这里用一层访问器把扁平读写映射到嵌套 model 上，业务层与表单项代码无需改动。
 */

const splitPath = key =>
	String(key)
		.split(".")
		.filter(segment => segment !== "");

const pathCache = new Map();

/**
 * 把 `major.name` 转成稳定的路径数组，避免每次渲染都生成新数组导致字段重复注册
 * @param {String} key
 * @return {Array<String>|undefined}
 */
export const keyPath = key => {
	if (key === undefined || key === null || key === "") {
		return undefined;
	}
	const cacheKey = String(key);
	if (!pathCache.has(cacheKey)) {
		pathCache.set(cacheKey, splitPath(cacheKey));
	}
	return pathCache.get(cacheKey);
};

const getIn = (target, path) => {
	let current = target;
	for (const segment of path) {
		if (current === null || current === undefined) {
			return undefined;
		}
		current = current[segment];
	}
	return current;
};

const setIn = (target, path, value) => {
	let current = target;
	for (let i = 0; i < path.length - 1; i++) {
		const segment = path[i];
		if (current[segment] === null || typeof current[segment] !== "object") {
			current[segment] = {};
		}
		current = current[segment];
	}
	current[path[path.length - 1]] = value;
};

/**
 * 创建「扁平视图 + 嵌套模型」组合
 *
 * - `model` 交给 antdv-next Form 使用
 * - `flat` 是对外暴露的扁平对象，读写会自动同步到 model
 */
export function createFormModel() {
	const model = reactive({});
	const flatData = reactive({});
	const keys = new Set();

	const bind = key => {
		// 空 key 会生成 [undefined] 路径并把值写到 model["undefined"] 上；
		// "undefined" 是无 key 表单项访问 submitForm[undefined] 时产生的字符串键
		if (typeof key !== "string" || key === "" || key === "undefined") {
			return;
		}
		if (keys.has(key)) {
			return;
		}
		const path = splitPath(key);
		if (!path.length) {
			return;
		}
		Object.defineProperty(flatData, key, {
			enumerable: true,
			configurable: true,
			get: () => getIn(model, path),
			set: value => {
				setIn(model, path, value);
			},
		});
		keys.add(key);
	};

	/**
	 * 动态字段（props.form 函数返回的新字段、match 切换出的字段、slot 里直接
	 * 写入的新 key）可能从未走过 bind，直接赋值只会在扁平对象上留下普通属性，
	 * 嵌套 model 永远读不到。这里在 set 时自动补一次 bind。
	 */
	const flat = new Proxy(flatData, {
		set(target, key, value) {
			if (typeof key === "string") {
				// 无 key 的表单项读写的是 flat["undefined"]，不能建立映射污染 model
				if (key === "" || key === "undefined") {
					return true;
				}
				if (!keys.has(key)) {
					bind(key);
				}
				// 非法路径（如 "."）无法建立映射，直接忽略
				if (!keys.has(key)) {
					return true;
				}
			}
			target[key] = value;
			return true;
		},
	});

	const bindAll = list => list.forEach(key => bind(key));

	const clear = () => {
		for (const key of keys) {
			delete flat[key];
		}
		keys.clear();
		for (const key of Object.keys(model)) {
			delete model[key];
		}
	};

	/**
	 * 用一份完整的扁平数据替换当前模型
	 * @param {Object} data
	 */
	const replace = data => {
		clear();
		Object.keys(data || {}).forEach(key => {
			bind(key);
			flat[key] = data[key];
		});
	};

	/**
	 * 返回当前扁平数据的普通对象快照（值仍为引用，需要深拷贝时由调用方处理）
	 */
	const snapshot = () => {
		const result = {};
		keys.forEach(key => {
			result[key] = flat[key];
		});
		return result;
	};

	return { model, flat, keys, bind, bindAll, clear, replace, snapshot };
}
