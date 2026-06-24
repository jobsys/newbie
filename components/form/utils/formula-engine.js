/**
 * Formula Engine - DSL 解析器和求值器
 *
 * 支持字段引用、算术运算、比较运算和内置函数
 * DSL 示例: IF([q1] == "A", [q2] + [q3], 0)
 */

// Token 类型常量
const TokenType = {
	NUMBER: "NUMBER",
	STRING: "STRING",
	FIELD_REF: "FIELD_REF",
	LPAREN: "LPAREN",
	RPAREN: "RPAREN",
	COMMA: "COMMA",
	OPERATOR: "OPERATOR",
	FUNCTION: "FUNCTION",
};

/**
 * 分词器 - 将 DSL 字符串转换为 token 数组
 * @param {string} dsl - 公式字符串
 * @returns {Array} token 数组，每个 token 包含 type 和 value
 */
export function tokenize(dsl) {
	const tokens = [];
	let pos = 0;

	while (pos < dsl.length) {
		const char = dsl[pos];

		// 跳过空白
		if (/\s/.test(char)) {
			pos++;
			continue;
		}

		// 字段引用 [fieldKey]
		if (char === "[") {
			const end = dsl.indexOf("]", pos);
			if (end === -1) {
				throw new Error(`未闭合的字段引用，位置 ${pos}`);
			}
			const fieldName = dsl.slice(pos + 1, end);
			tokens.push({ type: TokenType.FIELD_REF, value: fieldName });
			pos = end + 1;
			continue;
		}

		// 字符串字面量（单引号或双引号）
		if (char === '"' || char === "'") {
			const quote = char;
			let str = "";
			pos++; // 跳过开始引号
			while (pos < dsl.length && dsl[pos] !== quote) {
				if (dsl[pos] === "\\") {
					pos++;
					str += dsl[pos];
				} else {
					str += dsl[pos];
				}
				pos++;
			}
			if (pos >= dsl.length) {
				throw new Error(`未闭合的字符串字面量`);
			}
			tokens.push({ type: TokenType.STRING, value: str });
			pos++; // 跳过结束引号
			continue;
		}

		// 数字字面量
		if (/\d/.test(char) || (char === "-" && pos + 1 < dsl.length && /\d/.test(dsl[pos + 1]))) {
			let num = "";
			// 处理负号：只有当前面没有操作数时才是负号
			if (char === "-") {
				const prevToken = tokens[tokens.length - 1];
				if (
					prevToken &&
					prevToken.type !== TokenType.OPERATOR &&
					prevToken.type !== TokenType.LPAREN &&
					prevToken.type !== TokenType.COMMA
				) {
					// 前面有操作数，这是减号
					tokens.push({ type: TokenType.OPERATOR, value: "-" });
					pos++;
					continue;
				}
			}

			while (pos < dsl.length && /[\d.]/.test(dsl[pos])) {
				num += dsl[pos];
				pos++;
			}
			tokens.push({ type: TokenType.NUMBER, value: parseFloat(num) });
			continue;
		}

		// 括号
		if (char === "(") {
			tokens.push({ type: TokenType.LPAREN, value: "(" });
			pos++;
			continue;
		}
		if (char === ")") {
			tokens.push({ type: TokenType.RPAREN, value: ")" });
			pos++;
			continue;
		}

		// 逗号
		if (char === ",") {
			tokens.push({ type: TokenType.COMMA, value: "," });
			pos++;
			continue;
		}

		// 运算符（包括多字符运算符如 ==, !=, >=, <=）
		if (/[+\-*/%><=!]/.test(char)) {
			let op = char;
			// 检查是否为双字符运算符
			if (pos + 1 < dsl.length && /[=]/.test(dsl[pos + 1])) {
				op += dsl[pos + 1];
				pos++;
			}
			tokens.push({ type: TokenType.OPERATOR, value: op });
			pos++;
			continue;
		}

		// 函数名或标识符
		if (/[a-zA-Z_]/.test(char)) {
			let name = "";
			while (pos < dsl.length && /[a-zA-Z0-9_]/.test(dsl[pos])) {
				name += dsl[pos];
				pos++;
			}
			// 检查后面是否有左括号来判断是否为函数
			// 跳过中间的空格
			let lookahead = pos;
			while (lookahead < dsl.length && /\s/.test(dsl[lookahead])) {
				lookahead++;
			}
			if (lookahead < dsl.length && dsl[lookahead] === "(") {
				tokens.push({ type: TokenType.FUNCTION, value: name.toUpperCase() });
			} else {
				// 非函数标识符视为字段引用（兼容写法）
				tokens.push({ type: TokenType.FIELD_REF, value: name });
			}
			continue;
		}

		// 未知字符
		throw new Error(`未知字符: '${char}'，位置 ${pos}`);
	}

	return tokens;
}

// AST 节点类型
const NodeType = {
	NumberLiteral: "NumberLiteral",
	StringLiteral: "StringLiteral",
	FieldRef: "FieldRef",
	BinaryOp: "BinaryOp",
	UnaryOp: "UnaryOp",
	FunctionCall: "FunctionCall",
};

/**
 * Pratt 解析器 - 将 token 数组转换为 AST
 * @param {Array} tokens - token 数组
 * @returns {Object} AST 根节点
 */
export function parse(tokens) {
	let pos = 0;

	// 运算符优先级
	const precedence = {
		"+": 10,
		"-": 10,
		"*": 20,
		"/": 20,
		"%": 20,
		"==": 5,
		"!=": 5,
		">": 5,
		"<": 5,
		">=": 5,
		"<=": 5,
	};

	function peek() {
		return tokens[pos];
	}

	function consume() {
		return tokens[pos++];
	}

	function parseExpression(minPrec = 0) {
		let left = parsePrimary();

		while (
			pos < tokens.length &&
			peek().type === TokenType.OPERATOR &&
			precedence[peek().value] >= minPrec
		) {
			const op = consume().value;
			const right = parseExpression(precedence[op] + 1);
			left = {
				type: NodeType.BinaryOp,
				operator: op,
				left,
				right,
			};
		}

		return left;
	}

	function parsePrimary() {
		const token = peek();

		if (!token) {
			throw new Error("意外的表达式结尾");
		}

		switch (token.type) {
			case TokenType.NUMBER:
				consume();
				return { type: NodeType.NumberLiteral, value: token.value };

			case TokenType.STRING:
				consume();
				return { type: NodeType.StringLiteral, value: token.value };

			case TokenType.FIELD_REF:
				consume();
				return { type: NodeType.FieldRef, name: token.value };

			case TokenType.LPAREN:
				consume(); // 消耗 '('
				const expr = parseExpression();
				if (!peek() || peek().type !== TokenType.RPAREN) {
					throw new Error("缺少右括号");
				}
				consume(); // 消耗 ')'
				return expr;

			case TokenType.FUNCTION:
				return parseFunctionCall();

			default:
				throw new Error(`意外的 token: ${token.value}`);
		}
	}

	function parseFunctionCall() {
		const name = consume().value;

		if (!peek() || peek().type !== TokenType.LPAREN) {
			throw new Error(`函数 ${name} 后期望有左括号`);
		}
		consume(); // 消耗 '('

		const args = [];

		// 处理空参数列表
		if (peek() && peek().type === TokenType.RPAREN) {
			consume();
			return { type: NodeType.FunctionCall, name, args };
		}

		// 解析第一个参数
		args.push(parseExpression());

		// 解析后续参数
		while (peek() && peek().type === TokenType.COMMA) {
			consume(); // 消耗 ','
			args.push(parseExpression());
		}

		if (!peek() || peek().type !== TokenType.RPAREN) {
			throw new Error(`函数 ${name} 缺少右括号`);
		}
		consume(); // 消耗 ')'

		return { type: NodeType.FunctionCall, name, args };
	}

	if (tokens.length === 0) {
		throw new Error("空的公式表达式");
	}

	const ast = parseExpression();

	if (pos < tokens.length) {
		throw new Error(`未解析的 token: ${tokens[pos].value}`);
	}

	return ast;
}

/**
 * 求值器 - 递归计算 AST 的值
 * @param {Object} ast - AST 节点
 * @param {Object} formData - 表单数据对象
 * @returns {*} 计算结果
 */
export function evaluate(ast, formData = {}) {
	if (!ast) {
		return null;
	}

	switch (ast.type) {
		case NodeType.NumberLiteral:
			return ast.value;

		case NodeType.StringLiteral:
			return ast.value;

		case NodeType.FieldRef:
			const value = formData[ast.name];
			// 空值处理：返回 null，由上下文决定如何转换
			return value !== undefined && value !== null ? value : null;

		case NodeType.BinaryOp:
			return evaluateBinaryOp(ast.operator, ast.left, ast.right, formData);

		case NodeType.FunctionCall:
			return evaluateFunctionCall(ast.name, ast.args, formData);

		default:
			throw new Error(`未知的 AST 节点类型: ${ast.type}`);
	}
}

/**
 * 计算二元运算符
 */
function evaluateBinaryOp(operator, leftNode, rightNode, formData) {
	const left = evaluate(leftNode, formData);
	const right = evaluate(rightNode, formData);

	// 空值处理
	const leftNum = toNumber(left);
	const rightNum = toNumber(right);
	const leftStr = toString(left);
	const rightStr = toString(right);

	switch (operator) {
		// 算术运算
		case "+":
			// 如果任一操作数是字符串，进行拼接
			if (typeof left === "string" || typeof right === "string") {
				return leftStr + rightStr;
			}
			return leftNum + rightNum;
		case "-":
			return leftNum - rightNum;
		case "*":
			return leftNum * rightNum;
		case "/":
			if (rightNum === 0) {
				return { error: "除零错误" };
			}
			return leftNum / rightNum;
		case "%":
			if (rightNum === 0) {
				return { error: "除零错误" };
			}
			return leftNum % rightNum;

		// 比较运算（返回 1/0）
		case "==":
			return looseEqual(left, right) ? 1 : 0;
		case "!=":
			return !looseEqual(left, right) ? 1 : 0;
		case ">":
			return leftNum > rightNum ? 1 : 0;
		case "<":
			return leftNum < rightNum ? 1 : 0;
		case ">=":
			return leftNum >= rightNum ? 1 : 0;
		case "<=":
			return leftNum <= rightNum ? 1 : 0;

		default:
			throw new Error(`未知的运算符: ${operator}`);
	}
}

/**
 * 计算函数调用
 */
function evaluateFunctionCall(name, argsNodes, formData) {
	const args = argsNodes.map(node => evaluate(node, formData));

	switch (name) {
		// 条件函数
		case "IF":
			if (args.length < 3) {
				return { error: "IF 函数需要 3 个参数" };
			}
			return toNumber(args[0]) ? args[1] : args[2];

		// 聚合函数
		case "SUM":
			return args.reduce((sum, val) => sum + toNumber(val), 0);

		case "AVG": {
			if (args.length === 0) {
				return { error: "AVG 函数至少需要 1 个参数" };
			}
			const sum = args.reduce((s, val) => s + toNumber(val), 0);
			return sum / args.length;
		}

		case "MAX":
			return Math.max(...args.map(toNumber));

		case "MIN":
			return Math.min(...args.map(toNumber));

		case "ABS":
			if (args.length !== 1) {
				return { error: "ABS 函数需要 1 个参数" };
			}
			return Math.abs(toNumber(args[0]));

		case "ROUND":
			if (args.length < 1) {
				return { error: "ROUND 函数至少需要 1 个参数" };
			}
			const decimals = args.length > 1 ? toNumber(args[1]) : 0;
			const factor = Math.pow(10, decimals);
			return Math.round(toNumber(args[0]) * factor) / factor;

		case "COUNT":
			return args.filter(val => val !== null && val !== undefined).length;

		case "PERCENT":
			if (args.length < 2) {
				return { error: "PERCENT 函数需要 2 个参数" };
			}
			const denominator = toNumber(args[1]);
			if (denominator === 0) {
				return { error: "PERCENT 函数除零错误" };
			}
			return (toNumber(args[0]) / denominator) * 100;

		// 字符串函数
		case "CONCAT":
			return args.map(toString).join("");

		case "LEN":
			if (args.length !== 1) {
				return { error: "LEN 函数需要 1 个参数" };
			}
			return toString(args[0]).length;

		case "UPPER":
			if (args.length !== 1) {
				return { error: "UPPER 函数需要 1 个参数" };
			}
			return toString(args[0]).toUpperCase();

		case "LOWER":
			if (args.length !== 1) {
				return { error: "LOWER 函数需要 1 个参数" };
			}
			return toString(args[0]).toLowerCase();

		// 数学扩展函数
		case "MOD":
			if (args.length < 2) {
				return { error: "MOD 函数需要 2 个参数" };
			}
			const modDivisor = toNumber(args[1]);
			if (modDivisor === 0) {
				return { error: "MOD 函数除零错误" };
			}
			return toNumber(args[0]) % modDivisor;

		case "POWER":
			if (args.length < 2) {
				return { error: "POWER 函数需要 2 个参数" };
			}
			return Math.pow(toNumber(args[0]), toNumber(args[1]));

		case "SQRT":
			if (args.length !== 1) {
				return { error: "SQRT 函数需要 1 个参数" };
			}
			const sqrtVal = toNumber(args[0]);
			if (sqrtVal < 0) {
				return { error: "SQRT 函数参数不能为负数" };
			}
			return Math.sqrt(sqrtVal);

		// 逻辑函数
		case "AND":
			if (args.length === 0) {
				return { error: "AND 函数至少需要 1 个参数" };
			}
			return args.every(val => toNumber(val) !== 0) ? 1 : 0;

		case "OR":
			if (args.length === 0) {
				return { error: "OR 函数至少需要 1 个参数" };
			}
			return args.some(val => toNumber(val) !== 0) ? 1 : 0;

		case "NOT":
			if (args.length !== 1) {
				return { error: "NOT 函数需要 1 个参数" };
			}
			return toNumber(args[0]) === 0 ? 1 : 0;

		case "XOR":
			if (args.length < 2) {
				return { error: "XOR 函数至少需要 2 个参数" };
			}
			const trueCount = args.filter(val => toNumber(val) !== 0).length;
			return trueCount % 2 === 1 ? 1 : 0;

		// 日期函数
		case "TODAY":
			return new Date().toISOString().slice(0, 10);

		case "NOW":
			return new Date().toISOString();

		case "DATE":
			if (args.length < 3) {
				return { error: "DATE 函数需要 3 个参数 (年, 月, 日)" };
			}
			const year = toNumber(args[0]);
			const month = toNumber(args[1]);
			const day = toNumber(args[2]);
			const dateObj = new Date(year, month - 1, day);
			if (isNaN(dateObj.getTime())) {
				return { error: "DATE 函数参数无效" };
			}
			return dateObj.toISOString().slice(0, 10);

		case "YEAR":
			if (args.length !== 1) {
				return { error: "YEAR 函数需要 1 个参数" };
			}
			return parseDate(args[0]).getFullYear();

		case "MONTH":
			if (args.length !== 1) {
				return { error: "MONTH 函数需要 1 个参数" };
			}
			return parseDate(args[0]).getMonth() + 1;

		case "DAY":
			if (args.length !== 1) {
				return { error: "DAY 函数需要 1 个参数" };
			}
			return parseDate(args[0]).getDate();

		case "HOUR":
			if (args.length !== 1) {
				return { error: "HOUR 函数需要 1 个参数" };
			}
			return parseDate(args[0]).getHours();

		case "MINUTE":
			if (args.length !== 1) {
				return { error: "MINUTE 函数需要 1 个参数" };
			}
			return parseDate(args[0]).getMinutes();

		case "DATEDIF":
			if (args.length < 3) {
				return { error: "DATEDIF 函数需要 3 个参数 (开始日期, 结束日期, 单位)" };
			}
			const startDate = parseDate(args[0]);
			const endDate = parseDate(args[1]);
			const unit = toString(args[2]).toUpperCase();
			const diffMs = endDate - startDate;
			if (isNaN(diffMs)) {
				return { error: "DATEDIF 函数日期参数无效" };
			}
			switch (unit) {
				case "Y":
					return endDate.getFullYear() - startDate.getFullYear();
				case "M":
					return (
						(endDate.getFullYear() - startDate.getFullYear()) * 12 +
						(endDate.getMonth() - startDate.getMonth())
					);
				case "D":
					return Math.floor(diffMs / (1000 * 60 * 60 * 24));
				default:
					return { error: 'DATEDIF 单位应为 "Y"、"M" 或 "D"' };
			}

		default:
			return { error: `未知函数: ${name}` };
	}
}

/**
 * 辅助函数：宽松相等比较
 */
function looseEqual(a, b) {
	// null/undefined 与空字符串视为相等
	const aIsEmpty = a === null || a === undefined || a === "";
	const bIsEmpty = b === null || b === undefined || b === "";
	if (aIsEmpty && bIsEmpty) return true;
	if (aIsEmpty || bIsEmpty) return false;

	// 尝试数值比较
	const aNum = Number(a);
	const bNum = Number(b);
	if (!isNaN(aNum) && !isNaN(bNum)) {
		return aNum === bNum;
	}

	// 字符串比较
	return String(a) === String(b);
}

/**
 * 辅助函数：转换为数字
 */
function toNumber(val) {
	if (val === null || val === undefined || val === "") return 0;
	if (typeof val === "number") return val;
	if (typeof val === "boolean") return val ? 1 : 0;
	const num = Number(val);
	return isNaN(num) ? 0 : num;
}

/**
 * 辅助函数：转换为字符串
 */
function toString(val) {
	if (val === null || val === undefined) return "";
	return String(val);
}

/**
 * 辅助函数：解析日期
 * 支持 Date 对象、ISO 字符串、时间戳
 * @param {*} val - 待解析的值
 * @returns {Date} 解析后的 Date 对象，无效时返回 Invalid Date
 */
function parseDate(val) {
	if (val instanceof Date) return val;
	if (typeof val === "number") return new Date(val);
	if (typeof val === "string") {
		// 尝试 ISO 格式 (YYYY-MM-DD)
		const iso = new Date(val);
		if (!isNaN(iso.getTime())) return iso;
		// 尝试中文日期格式
		const match = val.match(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})/);
		if (match) {
			return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
		}
	}
	return new Date(NaN);
}

// AST 缓存
const astCache = new Map();

/**
 * 从 AST 中提取所有字段引用
 * @param {Object} ast - AST 节点
 * @returns {Set<string>} 字段名集合
 */
export function getFieldRefs(ast) {
	const refs = new Set();
	if (!ast) return refs;

	switch (ast.type) {
		case NodeType.FieldRef:
			refs.add(ast.name);
			break;
		case NodeType.BinaryOp:
			getFieldRefs(ast.left).forEach(r => refs.add(r));
			getFieldRefs(ast.right).forEach(r => refs.add(r));
			break;
		case NodeType.FunctionCall:
			ast.args.forEach(arg => getFieldRefs(arg).forEach(r => refs.add(r)));
			break;
		default:
			break;
	}
	return refs;
}

/**
 * 检测公式是否存在自引用（公式引用了自身字段）
 * @param {string} dsl - 公式字符串
 * @param {string} fieldKey - 当前字段的 key
 * @returns {boolean} 是否存在自引用
 */
export function hasSelfReference(dsl, fieldKey) {
	if (!dsl || !fieldKey) return false;
	try {
		let ast = astCache.get(dsl);
		if (!ast) {
			const tokens = tokenize(dsl);
			ast = parse(tokens);
			astCache.set(dsl, ast);
		}
		return getFieldRefs(ast).has(fieldKey);
	} catch {
		return false;
	}
}

/**
 * 便捷 API：计算公式
 * @param {string} dsl - 公式字符串
 * @param {Object} formData - 表单数据
 * @returns {*} 计算结果，错误时返回 { error: "message" }
 */
export function calcFormula(dsl, formData = {}) {
	try {
		// 检查缓存
		let ast = astCache.get(dsl);
		if (!ast) {
			const tokens = tokenize(dsl);
			ast = parse(tokens);
			astCache.set(dsl, ast);
		}

		const result = evaluate(ast, formData);

		// 检查结果是否为错误对象
		if (result && typeof result === "object" && result.error) {
			return result;
		}

		return result;
	} catch (err) {
		return { error: err.message };
	}
}
