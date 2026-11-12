const KEYWORDS = [
	"as",
	"async",
	"await",
	"break",
	"case",
	"catch",
	"class",
	"const",
	"continue",
	"default",
	"delete",
	"do",
	"else",
	"export",
	"extends",
	"false",
	"finally",
	"for",
	"from",
	"function",
	"if",
	"import",
	"in",
	"instanceof",
	"let",
	"new",
	"null",
	"of",
	"return",
	"static",
	"super",
	"switch",
	"this",
	"throw",
	"true",
	"try",
	"typeof",
	"undefined",
	"var",
	"void",
	"while",
	"yield",
];

const KEYWORD_RE = new RegExp(`\\b(?:${KEYWORDS.join("|")})\\b`);

const escapeHtml = code =>
	code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * 轻量语法高亮。
 *
 * 不追求完整 parser，只覆盖文档代码块里会出现的内容：
 * 注释、字符串、模板表达式、标签名、数字和 JS 关键字。
 * 按「从前往后、先匹配先消费」的方式扫描，避免把 span 注入到字符串里。
 *
 * @param {String} code
 * @param {String} lang
 * @return {String} HTML
 */
export function highlight(code, lang = "vue") {
	if (!code) {
		return "";
	}

	const isTemplate = ["vue", "html", "xml"].includes(lang);
	const isScript = ["js", "javascript", "ts", "typescript", "mjs"].includes(lang);
	const isStyle = ["css", "less", "scss"].includes(lang);
	const isJson = ["json", "json5"].includes(lang);

	const parts = [];
	if (isTemplate || isScript) {
		parts.push("(<!--[\\s\\S]*?-->|\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*)");
	}
	if (isTemplate) {
		parts.push("(\\{\\{[\\s\\S]*?\\}\\})");
		parts.push("(<\\/?[\\w-]+)");
	}
	parts.push("(\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)");
	if (isJson) {
		parts.push("(\"(?:\\\\.|[^\"\\\\])*\"\\s*:)");
	}
	if (isScript) {
		parts.push(`(${KEYWORD_RE.source})`);
	}
	if (isStyle) {
		parts.push("([\\w-]+)(?=\\s*:)");
	}
	parts.push("(\\b\\d+(?:\\.\\d+)?\\b)");

	const regex = new RegExp(parts.join("|"), "g");
	let lastIndex = 0;
	let html = "";

	const classNames = [];
	if (isTemplate || isScript) classNames.push("comment");
	if (isTemplate) classNames.push("expr", "tag");
	classNames.push("string");
	if (isJson) classNames.push("key");
	if (isScript) classNames.push("keyword");
	if (isStyle) classNames.push("property");
	classNames.push("number");

	for (const match of code.matchAll(regex)) {
		html += escapeHtml(code.slice(lastIndex, match.index));
		const groupIndex = match.slice(1).findIndex(item => item !== undefined);
		const className = classNames[groupIndex] || "plain";
		html += `<span class="tok-${className}">${escapeHtml(match[0])}</span>`;
		lastIndex = match.index + match[0].length;
	}

	html += escapeHtml(code.slice(lastIndex));
	return html;
}
