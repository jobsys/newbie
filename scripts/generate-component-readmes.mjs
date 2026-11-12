import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const pagesDir = path.join(root, "playground/docs/pages");
const demosDir = path.join(root, "playground/docs/demos");

const targetOverrides = {
	theme: "components/provider/THEME.md",
};

const escapeCell = value => {
	if (value === null || value === undefined || value === "") {
		return "-";
	}
	return String(value)
		.replace(/\|/g, "\\|")
		.replace(/\r?\n/g, "<br>");
};

const renderTable = (headers, rows) => {
	const head = `| ${headers.join(" | ")} |`;
	const separator = `| ${headers.map(() => "---").join(" | ")} |`;
	const body = rows
		.map(row => `| ${headers.map((_, index) => escapeCell(row[index])).join(" | ")} |`)
		.join("\n");
	return [head, separator, body].join("\n");
};

const demoPath = file => path.join(demosDir, file);

const readDemo = file => {
	const target = demoPath(file);
	if (!fs.existsSync(target)) {
		return "";
	}
	return fs
		.readFileSync(target, "utf8")
		.replace(
			/from\s+"\.\.\/\.\.\/\.\.\/\.\.\/components\/index\.js"/g,
			'from "jobsys-newbie"'
		)
		.trim();
};

const componentName = page => page.component;

const docsPath = page =>
	page.slug === "provider" ? "/guide/provider" : `/components/${page.slug}`;

const renderReadme = page => {
	const parts = [];

	parts.push(`# ${page.title}`);
	parts.push("");
	parts.push(`> ${page.description}`);
	parts.push("");
	parts.push(
		`> 本文件由 \`pnpm docs:readme\` 根据 \`playground/docs/pages/${page.slug}.js\` 生成，请修改页面配置后重新生成，不要直接编辑。`
	);
	parts.push("");

	if (page.notice) {
		parts.push(`> **注意**：${page.notice}`);
		parts.push("");
	}

	parts.push("## 何时使用");
	parts.push("");
	(page.whenToUse || []).forEach(item => {
		parts.push(`- ${item}`);
	});
	parts.push("");

	parts.push("## 安装");
	parts.push("");
	parts.push("```bash");
	parts.push("pnpm add jobsys-newbie antdv-next @antdv-next/icons");
	parts.push("```");
	parts.push("");
	parts.push("```js");
	parts.push(`import { ${componentName(page)} } from "jobsys-newbie";`);
	parts.push("```");
	parts.push("");
	parts.push("也可以全局注册整个组件库：");
	parts.push("");
	parts.push("```js");
	parts.push('import Newbie from "jobsys-newbie";');
	parts.push('app.use(Newbie);');
	parts.push("```");
	parts.push("");
	parts.push(
		`完整交互示例：本地运行 \`pnpm dev\` 后访问 \`#${docsPath(page)}\`。`
	);
	parts.push("");

	if (page.demos?.length) {
		const basic = readDemo(page.demos[0].file);
		if (basic) {
			parts.push("## 基础用法");
			parts.push("");
			parts.push(`\`${page.demos[0].title}\`：${page.demos[0].description}`);
			parts.push("");
			parts.push("```vue");
			parts.push(basic);
			parts.push("```");
			parts.push("");
		}

		parts.push("## 更多示例");
		parts.push("");
		parts.push("| 示例 | 说明 | 源码 |");
		parts.push("| --- | --- | --- |");
		page.demos.forEach(demo => {
			const link = `../../playground/docs/demos/${demo.file}`;
			parts.push(
				`| ${escapeCell(demo.title)} | ${escapeCell(demo.description)} | [${demo.file}](${link}) |`
			);
		});
		parts.push("");
	}

	const api = page.api || {};

	if (api.props?.length) {
		parts.push("## Props");
		parts.push("");
		parts.push(
			renderTable(
				["参数", "说明", "类型", "默认值"],
				api.props.map(item => [item.name, item.description, item.type, item.default])
			)
		);
		parts.push("");
	}

	if (api.events?.length) {
		parts.push("## Events");
		parts.push("");
		parts.push(
			renderTable(
				["事件名", "说明", "参数"],
				api.events.map(item => [item.name, item.description, item.params])
			)
		);
		parts.push("");
	}

	if (api.slots?.length) {
		parts.push("## Slots");
		parts.push("");
		parts.push(
			renderTable(
				["插槽名", "说明"],
				api.slots.map(item => [item.name, item.description])
			)
		);
		parts.push("");
	}

	if (api.methods?.length) {
		parts.push("## Methods");
		parts.push("");
		parts.push(
			renderTable(
				["方法", "说明", "参数"],
				api.methods.map(item => [item.name, item.description, item.params])
			)
		);
		parts.push("");
	}

	(api.types || []).forEach(type => {
		parts.push(`## ${type.title}`);
		parts.push("");
		if (type.description) {
			parts.push(type.description);
			parts.push("");
		}
		parts.push(renderTable(type.columns, type.rows));
		parts.push("");
	});

	if (page.provider?.length) {
		parts.push("## 全局配置");
		parts.push("");
		parts.push(
			`通过 \`<NewbieProvider :config="{ ${page.provider[0].namespace}: { ... } }">\` 覆盖默认值，实例 props 优先级更高。`
		);
		parts.push("");
		page.provider.forEach(group => {
			parts.push(`### ${group.namespace}`);
			parts.push("");
			if (group.description) {
				parts.push(group.description);
				parts.push("");
			}
			parts.push(renderTable(["配置项", "说明", "类型", "默认值"], group.rows));
			parts.push("");
		});
	}

	if (page.guide) {
		parts.push(`## ${page.guide.title}`);
		parts.push("");
		parts.push(page.guide.content);
		parts.push("");
	}

	if (page.faq?.length) {
		parts.push("## FAQ");
		parts.push("");
		page.faq.forEach(item => {
			parts.push(`### ${item.title}`);
			parts.push("");
			parts.push(item.content);
			parts.push("");
		});
	}

	if (page.slug === "provider") {
		parts.push("## 主题");
		parts.push("");
		parts.push(
			"密度、主色、暗色模式与 CSS 变量由 `NewbieThemeProvider` 提供，详见 [THEME.md](./THEME.md)。"
		);
		parts.push("");
	}

	return `${parts.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
};

const files = fs
	.readdirSync(pagesDir)
	.filter(file => file.endsWith(".js"))
	.toSorted();

const generate = async file => {
	let page;
	try {
		const mod = await import(pathToFileURL(path.join(pagesDir, file)).href);
		page = mod.default;
	} catch (error) {
		// 并发生成时错误信息必须带上来源文件，否则无法定位是哪个页面写坏了
		throw new Error(`加载 ${file} 失败：${error.message}`, { cause: error });
	}

	if (!page?.slug) {
		console.warn(`skip ${file}: no default page`);
		return null;
	}

	const relativeTarget = targetOverrides[page.slug] || `components/${page.slug}/README.md`;
	const target = path.join(root, relativeTarget);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, renderReadme(page), "utf8");
	return relativeTarget;
};

// 各页面互相独立，并行 import + 写文件；日志按文件顺序统一输出，保持可读
const generated = await Promise.all(files.map(file => generate(file)));

generated.filter(Boolean).forEach(relativeTarget => {
	console.log(`generated ${relativeTarget}`);
});
