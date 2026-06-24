import {defineComponent, nextTick, ref, watch} from "vue";
import {Input, Tag, Button, Modal} from "ant-design-vue";
import {calcFormula, hasSelfReference} from "../form/utils/formula-engine.js";

const { TextArea } = Input;

// 内联样式常量
const S = {
	code: { background: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 4, padding: '2px 6px', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', color: '#cf1322' },
	guideBg: { background: '#fafafa', padding: '12px 16px', borderRadius: 6 },
	table: { border: '1px solid #f0f0f0', borderRadius: 6, overflow: 'hidden', margin: '8px 0 16px' },
	tableHeader: { display: 'flex', background: '#fafafa', borderBottom: '1px solid #f0f0f0' },
	tableCell: (i, len) => ({ flex: 1, padding: '8px 12px', borderRight: i < len - 1 ? '1px solid #f0f0f0' : 'none' }),
	tableRow: (i, total) => ({ display: 'flex', borderBottom: i < total - 1 ? '1px solid #f0f0f0' : 'none' }),
	sep: { borderBottom: '1px solid #f0f0f0', margin: '16px 0' },
	section: { marginBottom: 16 },
	card: { border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', marginBottom: 12 },
	cardCode: { background: '#fafafa', padding: '8px 12px', borderRadius: 4 },
	h4: { fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 0 },
	h5: { fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 0 },
	p: { margin: '0 0 8px', lineHeight: 1.6 },
	secondary: { color: '#8c8c8c' },
};

// 函数表数据
const FUNCTIONS = {
	math: [
		['SUM', '[q1], [q2], ...', '求和'], ['AVG', '[q1], [q2], ...', '平均值'],
		['MAX', '[q1], [q2], [q3]', '最大值'], ['MIN', '[q1], [q2]', '最小值'],
		['ABS', '[q1]', '绝对值'], ['ROUND', '[q1], 2', '四舍五入到指定位数'],
		['MOD', '[q1], [q2]', '取模（余数）'], ['POWER', '[q1], [q2]', '幂运算（q1 的 q2 次方）'],
		['SQRT', '[q1]', '平方根'],
	],
	logic: [
		['AND', '[a], [b], ...', '逻辑与（全部为真返回 1）'],
		['OR', '[a], [b], ...', '逻辑或（任一为真返回 1）'],
		['NOT', '[a]', '逻辑非（取反）'],
		['XOR', '[a], [b], ...', '异或（奇数个真返回 1）'],
	],
	string: [
		['CONCAT', '[a], " ", [b]', '字符串拼接'], ['LEN', '[q1]', '字符串长度'],
		['UPPER', '[q1]', '转大写'], ['LOWER', '[q1]', '转小写'],
	],
	date: [
		['TODAY', '', '返回今天的日期 (YYYY-MM-DD)'],
		['NOW', '', '返回当前日期时间'],
		['DATE', '2024, 1, 15', '构造日期'],
		['YEAR', '[dateField]', '提取年份'],
		['MONTH', '[dateField]', '提取月份 (1-12)'],
		['DAY', '[dateField]', '提取日期 (1-31)'],
		['DATEDIF', '[start], [end], "Y"', '日期差（Y/M/D）'],
	],
	other: [
		['COUNT', '[q1], [q2], ...', '非空计数'], ['PERCENT', '[q1], [q2]', '百分比 (q1/q2*100)'],
	],
};

// 简单表格渲染函数
const renderTable = (rows) => (
	<div style={S.table}>
		<div style={S.tableHeader}>
			<div style={{ ...S.tableCell(0, 3), fontWeight: 600, color: '#262626' }}>函数名</div>
			<div style={{ ...S.tableCell(1, 3), fontWeight: 600, color: '#262626' }}>参数</div>
			<div style={{ ...S.tableCell(2, 3), fontWeight: 600, color: '#262626' }}>说明</div>
		</div>
		{rows.map((row, i) => (
			<div key={i} style={S.tableRow(i, rows.length)}>
				<div style={{ ...S.tableCell(0, 3), color: '#595959', fontWeight: 600 }}>{row[0]}</div>
				<div style={{ ...S.tableCell(1, 3), color: '#cf1322' }}><code style={S.code}>{row[1]}</code></div>
				<div style={{ ...S.tableCell(2, 3), color: '#595959' }}>{row[2]}</div>
			</div>
		))}
	</div>
);

// 帮助弹窗内容
const renderHelpContent = () => (
	<div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
		<div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 6, padding: '12px 16px', marginBottom: 24 }}>
			<strong>快速开始：</strong>使用方括号引用字段值，如 <code style={S.code}>[radio-1]</code>。支持基本运算和函数调用。
		</div>

		<h4 style={S.h4}>基础语法</h4>
		<div style={S.section}>
			<h5 style={S.h5}>字段引用</h5>
			<p style={S.p}>使用方括号引用其他字段的值：</p>
			<div style={S.guideBg}>
				<code style={S.code}>[fieldKey]</code> <span style={S.secondary}>例如：</span>
				<code style={S.code}>[radio-1]</code> <code style={S.code}>[input-1]</code>
			</div>
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>算术运算</h5>
			<div style={S.guideBg}>
				<p style={S.p}><code style={S.code}>[q1] + [q2]</code> — 加法</p>
				<p style={S.p}><code style={S.code}>[q1] - [q2]</code> — 减法</p>
				<p style={S.p}><code style={S.code}>[q1] * [q2]</code> — 乘法</p>
				<p style={S.p}><code style={S.code}>[q1] / [q2]</code> — 除法</p>
				<p style={{ ...S.p, marginBottom: 0 }}><code style={S.code}>[q1] % 100</code> — 取模</p>
			</div>
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>比较运算</h5>
			<div style={S.guideBg}>
				<p style={S.p}><code style={S.code}>==</code> — 等于</p>
				<p style={S.p}><code style={S.code}>!=</code> — 不等于</p>
				<p style={{ ...S.p, marginBottom: 0 }}><code style={S.code}>&gt; &lt; &gt;= &lt;=</code> — 大小比较</p>
			</div>
		</div>

		<div style={S.sep} />
		<h4 style={S.h4}>函数</h4>
		<div style={S.section}>
			<h5 style={S.h5}>条件判断</h5>
			<div style={S.guideBg}>
				<code style={S.code}>IF([q1] == "A", [q2], 0)</code>
			</div>
			<p style={{ ...S.p, ...S.secondary }}>如果 q1 等于 "A"，返回 q2 的值，否则返回 0</p>
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>数学函数</h5>
			{renderTable(FUNCTIONS.math)}
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>逻辑函数</h5>
			{renderTable(FUNCTIONS.logic)}
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>字符串函数</h5>
			{renderTable(FUNCTIONS.string)}
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>日期函数</h5>
			{renderTable(FUNCTIONS.date)}
		</div>
		<div style={S.section}>
			<h5 style={S.h5}>其他函数</h5>
			{renderTable(FUNCTIONS.other)}
		</div>

		<div style={S.sep} />
		<h4 style={S.h4}>常用示例</h4>
		{[
			['计算总分', 'SUM([q1], [q2], [q3])'],
			['条件计分', 'IF([radio-1] == "A", 10, 0)'],
			['百分比计算', 'PERCENT([score], [total])'],
			['字符串拼接', 'CONCAT([firstName], " ", [lastName])'],
			['取模判断奇偶', 'IF(MOD([num], 2) == 0, "偶数", "奇数")'],
			['多条件判断', 'IF(AND([score] >= 60, [attendance] > 80), "通过", "不通过")'],
			['计算年龄', 'DATEDIF([birthday], TODAY(), "Y")'],
		].map(([title, code], i) => (
			<div key={i} style={S.card}>
				<div style={{ marginBottom: 8, fontWeight: 600 }}>{title}</div>
				<div style={S.cardCode}><code style={S.code}>{code}</code></div>
			</div>
		))}
	</div>
);

export default defineComponent({
	name: "FormulaEditor",
	props: {
		value: { type: String, default: "" },
		onChange: { type: Function, default: () => {} },
		availableFields: { type: Array, default: () => [] },
		previewData: { type: Object, default: () => ({}) },
		/** 当前正在编辑的字段 key，用于自引用检测 */
		fieldKey: { type: String, default: "" },
	},
	setup(props) {
		const error = ref(null);
		const preview = ref(null);
		const showHelp = ref(false);
		const textareaRef = ref(null);

		const evaluateFormula = formula => {
			if (!formula || !formula.trim()) {
				preview.value = null;
				error.value = null;
				return;
			}

			// 自引用检测：公式引用了自身字段
			if (props.fieldKey && hasSelfReference(formula, props.fieldKey)) {
				error.value = `公式不能引用自身字段 [${props.fieldKey}]，这会导致循环计算`;
				preview.value = null;
				return;
			}

			try {
				const result = calcFormula(formula, props.previewData);
				if (result && typeof result === 'object' && result.error) {
					error.value = result.error;
					preview.value = null;
				} else {
					preview.value = result;
					error.value = null;
				}
			} catch (e) {
				error.value = e.message || "公式语法错误";
				preview.value = null;
			}
		};

		const handleInput = e => {
			const val = e.target.value;
			props.onChange(val);
			evaluateFormula(val);
		};

		/**
		 * 将字段引用插入到 textarea 的当前光标位置
		 * 自动处理前后运算符：保证插入后的公式语法合法
		 */
		const insertFieldRef = fieldKey => {
			const textareaEl = textareaRef.value?.ref || textareaRef.value;
			const currentVal = props.value || "";
			const refText = `[${fieldKey}]`;

			let newVal, cursorPos;

			if (textareaEl && typeof textareaEl.selectionStart === 'number') {
				const start = textareaEl.selectionStart;
				const end = textareaEl.selectionEnd;
				const before = currentVal.slice(0, start);
				const after = currentVal.slice(end);

				// 判断 before 末尾是否需要补运算符（不是运算符/逗号/左括号）
				const trimmedBefore = before.replace(/\s+$/, '');
				const lastChar = trimmedBefore.slice(-1);
				const needsOpBefore = trimmedBefore.length > 0
					&& lastChar !== '(' && lastChar !== ','
					&& !'+-*/%><=!'.includes(lastChar);

				// 判断 after 开头是否需要补运算符（以 [ 开头表示紧跟着新字段引用）
				const trimmedAfter = after.replace(/^\s+/, '');
				const needsOpAfter = trimmedAfter.startsWith('[');

				const insert = (needsOpBefore ? '+' : '') + refText + (needsOpAfter ? '+' : '');
				newVal = before + insert + after;
				cursorPos = (before + insert).length;
			} else {
				// 无光标信息，追加到末尾
				const trimmed = currentVal.replace(/\s+$/, '');
				const lastChar = trimmed.slice(-1);
				const needsOp = trimmed.length > 0
					&& lastChar !== '(' && lastChar !== ','
					&& !'+-*/%><=!'.includes(lastChar);

				newVal = currentVal + (needsOp ? '+' : '') + refText;
				cursorPos = newVal.length;
			}

			props.onChange(newVal);
			evaluateFormula(newVal);

			// 恢复焦点和光标位置
			nextTick(() => {
				if (textareaEl) {
					textareaEl.focus();
					if (typeof textareaEl.setSelectionRange === 'function') {
						textareaEl.setSelectionRange(cursorPos, cursorPos);
					}
				}
			});
		};

		// 初始化求值
		if (props.value) {
			evaluateFormula(props.value);
		}

		// 切换字段时同步
		watch(() => props.value, newVal => evaluateFormula(newVal));

		return () => (
			<div class="formula-editor">
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: '8px' }}>
					<span style={{ fontSize: '14px'}}>计算公式</span>
					<Button type="link" size="small" onClick={() => { showHelp.value = true; }}>
						使用说明
					</Button>
				</div>
				<TextArea
					ref={textareaRef}
					value={props.value}
					onChange={handleInput}
					placeholder="如: SUM([q1], [q2]) 或点击下面字段自动拼接"
					rows={4}
				/>
				{error.value && <div style={{ color: '#ff4d4f', marginTop: 4, fontSize: 13 }}>{error.value}</div>}
				{preview.value !== null && <div style={{ color: '#52c41a', marginTop: 4, fontSize: 13 }}>结果: {String(preview.value)}</div>}
				{props.availableFields.length > 0 && (
					<div style={{ marginTop: '8px' }}>
						<span style={S.secondary}>可用字段：</span>
						{props.availableFields.map(f => (
							<Tag key={f.key} onClick={() => insertFieldRef(f.key)} style={{ cursor: "pointer", marginTop: 4 }}>
								{f.title} [{f.key}]
							</Tag>
						))}
					</div>
				)}
				{showHelp.value && (
					<Modal
						v-model:open={showHelp.value}
						title="公式使用说明"
						width={720}
					>
						{renderHelpContent()}
					</Modal>
				)}
			</div>
		);
	},
});
