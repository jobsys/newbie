const escapeHtml = text =>
	String(text ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

/**
 * 行内 Markdown：`code`、**bold**、[link](url)
 */
export function inlineMarkdown(text) {
	let value = escapeHtml(text);
	value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
	value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	value = value.replace(
		/\[([^\]]+)\]\(([^)]+)\)/g,
		'<a href="$2" target="_blank" rel="noreferrer">$1</a>'
	);
	return value;
}

const isTableSeparator = line => /^\s*\|?[\s:|-]+\|?\s*$/.test(line) && line.includes("-");

const parseTableRow = line => {
	const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
	return trimmed.split("|").map(cell => cell.trim());
};

const renderTable = (header, rows) => {
	const head = header
		.map(cell => `<th>${inlineMarkdown(cell)}</th>`)
		.join("");
	const body = rows
		.map(
			row =>
				`<tr>${row
					.map(cell => `<td>${inlineMarkdown(cell)}</td>`)
					.join("")}</tr>`
		)
		.join("");
	return `<div class="md-table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
};

const renderList = (items, ordered) => {
	const tag = ordered ? "ol" : "ul";
	return `<${tag}>${items
		.map(item => `<li>${inlineMarkdown(item)}</li>`)
		.join("")}</${tag}>`;
};

/**
 * 文档用 Markdown 渲染。
 *
 * 支持：段落、标题、无序/有序列表、引用、代码块、表格、行内样式。
 * 不引入完整 Markdown 依赖，避免增加安装体积；文档内容都在仓库内维护。
 *
 * @param {String} markdown
 * @return {String} HTML
 */
export function renderMarkdown(markdown) {
	if (!markdown) {
		return "";
	}

	const lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
	const html = [];
	let index = 0;

	while (index < lines.length) {
		const line = lines[index];
		const trimmed = line.trim();

		if (!trimmed) {
			index += 1;
			continue;
		}

		// 代码块
		if (trimmed.startsWith("```")) {
			const lang = trimmed.slice(3).trim();
			const code = [];
			index += 1;
			while (index < lines.length && !lines[index].trim().startsWith("```")) {
				code.push(lines[index]);
				index += 1;
			}
			index += 1;
			html.push(
				`<pre class="md-code" data-lang="${escapeHtml(lang)}"><code>${escapeHtml(
					code.join("\n")
				)}</code></pre>`
			);
			continue;
		}

		// 表格
		if (
			trimmed.includes("|") &&
			index + 1 < lines.length &&
			isTableSeparator(lines[index + 1])
		) {
			const header = parseTableRow(trimmed);
			const rows = [];
			index += 2;
			while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
				rows.push(parseTableRow(lines[index]));
				index += 1;
			}
			html.push(renderTable(header, rows));
			continue;
		}

		// 标题
		const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
		if (heading) {
			const level = heading[1].length + 2; // 文档正文从 h3 起，避免和页面 h1/h2 冲突
			const id = heading[2]
				.toLowerCase()
				.replace(/[^\w\u4e00-\u9fa5]+/g, "-")
				.replace(/^-|-$/g, "");
			html.push(`<h${level} id="${id}">${inlineMarkdown(heading[2])}</h${level}>`);
			index += 1;
			continue;
		}

		// 引用
		if (trimmed.startsWith(">")) {
			const quotes = [];
			while (index < lines.length && lines[index].trim().startsWith(">")) {
				quotes.push(lines[index].trim().replace(/^>\s?/, ""));
				index += 1;
			}
			html.push(`<blockquote>${inlineMarkdown(quotes.join(" "))}</blockquote>`);
			continue;
		}

		// 无序列表
		if (/^[-*]\s+/.test(trimmed)) {
			const items = [];
			while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
				items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
				index += 1;
			}
			html.push(renderList(items, false));
			continue;
		}

		// 有序列表
		if (/^\d+\.\s+/.test(trimmed)) {
			const items = [];
			while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
				items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
				index += 1;
			}
			html.push(renderList(items, true));
			continue;
		}

		// 段落：合并连续的非空行
		const paragraph = [];
		while (index < lines.length && lines[index].trim()) {
			const current = lines[index].trim();
			if (
				current.startsWith("```") ||
				/^(#{1,4})\s+/.test(current) ||
				/^[-*]\s+/.test(current) ||
				/^\d+\.\s+/.test(current) ||
				current.startsWith(">")
			) {
				break;
			}
			paragraph.push(current);
			index += 1;
		}
		if (paragraph.length) {
			html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
		} else {
			index += 1;
		}
	}

	return html.join("\n");
}
