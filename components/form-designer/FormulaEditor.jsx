import {defineComponent, nextTick, ref, watch} from "vue";
import {Input, Tag, Button, Modal} from "antdv-next";
import {t, useT} from "../../hooks";
import {calcFormula, hasSelfReference} from "../form/utils/formula-engine.js";

const { TextArea } = Input;

// 函数表数据（说明文案存 i18n key，渲染时再翻译）
const FUNCTIONS = {
	math: [
		['SUM', '[q1], [q2], ...', 'form-designer.formula.fn.sum'],
		['AVG', '[q1], [q2], ...', 'form-designer.formula.fn.avg'],
		['MAX', '[q1], [q2], [q3]', 'form-designer.formula.fn.max'],
		['MIN', '[q1], [q2]', 'form-designer.formula.fn.min'],
		['ABS', '[q1]', 'form-designer.formula.fn.abs'],
		['ROUND', '[q1], 2', 'form-designer.formula.fn.round'],
		['MOD', '[q1], [q2]', 'form-designer.formula.fn.mod'],
		['POWER', '[q1], [q2]', 'form-designer.formula.fn.power'],
		['SQRT', '[q1]', 'form-designer.formula.fn.sqrt'],
	],
	logic: [
		['AND', '[a], [b], ...', 'form-designer.formula.fn.and'],
		['OR', '[a], [b], ...', 'form-designer.formula.fn.or'],
		['NOT', '[a]', 'form-designer.formula.fn.not'],
		['XOR', '[a], [b], ...', 'form-designer.formula.fn.xor'],
	],
	string: [
		['CONCAT', '[a], " ", [b]', 'form-designer.formula.fn.concat'],
		['LEN', '[q1]', 'form-designer.formula.fn.len'],
		['UPPER', '[q1]', 'form-designer.formula.fn.upper'],
		['LOWER', '[q1]', 'form-designer.formula.fn.lower'],
	],
	date: [
		['TODAY', '', 'form-designer.formula.fn.today'],
		['NOW', '', 'form-designer.formula.fn.now'],
		['DATE', '2024, 1, 15', 'form-designer.formula.fn.date'],
		['YEAR', '[dateField]', 'form-designer.formula.fn.year'],
		['MONTH', '[dateField]', 'form-designer.formula.fn.month'],
		['DAY', '[dateField]', 'form-designer.formula.fn.day'],
		['DATEDIF', '[start], [end], "Y"', 'form-designer.formula.fn.datedif'],
	],
	other: [
		['COUNT', '[q1], [q2], ...', 'form-designer.formula.fn.count'],
		['PERCENT', '[q1], [q2]', 'form-designer.formula.fn.percent'],
	],
};

// 简单表格渲染函数（translate 由调用方传入，避免在模块级调用 useT）
const renderTable = (translate, rows) => (
	<div class="formula-editor__table">
		<div class="formula-editor__table-header">
			<div class="formula-editor__table-cell formula-editor__table-head-cell">
				{translate('form-designer.formula.function-name')}
			</div>
			<div class="formula-editor__table-cell formula-editor__table-head-cell">
				{translate('form-designer.formula.function-args')}
			</div>
			<div class="formula-editor__table-cell formula-editor__table-head-cell">
				{translate('form-designer.formula.function-desc')}
			</div>
		</div>
		{rows.map((row, i) => (
			<div key={i} class="formula-editor__table-row">
				<div class="formula-editor__table-cell formula-editor__table-name">{row[0]}</div>
				<div class="formula-editor__table-cell formula-editor__table-args">
					<code class="formula-editor__code">{row[1]}</code>
				</div>
				<div class="formula-editor__table-cell formula-editor__table-desc">{translate(row[2])}</div>
			</div>
		))}
	</div>
);

// 帮助弹窗内容（translate 由调用方传入，避免在模块级调用 useT）
const renderHelpContent = translate => (
	<div class="formula-editor__help-scroll">
		<div class="formula-editor__quick-start">
			<strong>{translate('form-designer.formula.quick-start')}</strong>
			{translate('form-designer.formula.quick-start-desc')} <code class="formula-editor__code">[radio-1]</code>
			{translate('form-designer.formula.quick-start-desc-end')}
		</div>

		<h4 class="formula-editor__h4">{translate('form-designer.formula.basic-syntax')}</h4>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.field-reference')}</h5>
			<p class="formula-editor__p">{translate('form-designer.formula.field-reference-desc')}</p>
			<div class="formula-editor__guide">
				<code class="formula-editor__code">[fieldKey]</code>{' '}
				<span class="formula-editor__secondary">{translate('form-designer.formula.example-label')}</span>
				<code class="formula-editor__code">[radio-1]</code> <code class="formula-editor__code">[input-1]</code>
			</div>
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.arithmetic')}</h5>
			<div class="formula-editor__guide">
				<p class="formula-editor__p"><code class="formula-editor__code">[q1] + [q2]</code> — {translate('form-designer.formula.add')}</p>
				<p class="formula-editor__p"><code class="formula-editor__code">[q1] - [q2]</code> — {translate('form-designer.formula.subtract')}</p>
				<p class="formula-editor__p"><code class="formula-editor__code">[q1] * [q2]</code> — {translate('form-designer.formula.multiply')}</p>
				<p class="formula-editor__p"><code class="formula-editor__code">[q1] / [q2]</code> — {translate('form-designer.formula.divide')}</p>
				<p class="formula-editor__p formula-editor__p-last"><code class="formula-editor__code">[q1] % 100</code> — {translate('form-designer.formula.modulo')}</p>
			</div>
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.comparison')}</h5>
			<div class="formula-editor__guide">
				<p class="formula-editor__p"><code class="formula-editor__code">==</code> — {translate('form-designer.formula.equals')}</p>
				<p class="formula-editor__p"><code class="formula-editor__code">!=</code> — {translate('form-designer.formula.not-equals')}</p>
				<p class="formula-editor__p formula-editor__p-last"><code class="formula-editor__code">&gt; &lt; &gt;= &lt;=</code> — {translate('form-designer.formula.ordering')}</p>
			</div>
		</div>

		<div class="formula-editor__sep" />
		<h4 class="formula-editor__h4">{translate('form-designer.formula.functions')}</h4>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.condition')}</h5>
			<div class="formula-editor__guide">
				<code class="formula-editor__code">IF([q1] == "A", [q2], 0)</code>
			</div>
			<p class="formula-editor__p formula-editor__secondary">{translate('form-designer.formula.if-desc')}</p>
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.math-functions')}</h5>
			{renderTable(translate, FUNCTIONS.math)}
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.logic-functions')}</h5>
			{renderTable(translate, FUNCTIONS.logic)}
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.string-functions')}</h5>
			{renderTable(translate, FUNCTIONS.string)}
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.date-functions')}</h5>
			{renderTable(translate, FUNCTIONS.date)}
		</div>
		<div class="formula-editor__section">
			<h5 class="formula-editor__h5">{translate('form-designer.formula.other-functions')}</h5>
			{renderTable(translate, FUNCTIONS.other)}
		</div>

		<div class="formula-editor__sep" />
		<h4 class="formula-editor__h4">{translate('form-designer.formula.examples')}</h4>
		{[
			['form-designer.formula.example.total', 'SUM([q1], [q2], [q3])'],
			['form-designer.formula.example.conditional', 'IF([radio-1] == "A", 10, 0)'],
			['form-designer.formula.example.percent', 'PERCENT([score], [total])'],
			['form-designer.formula.example.concat', 'CONCAT([firstName], " ", [lastName])'],
			['form-designer.formula.example.parity', 'IF(MOD([num], 2) == 0, "偶数", "奇数")'],
			['form-designer.formula.example.multi-condition', 'IF(AND([score] >= 60, [attendance] > 80), "通过", "不通过")'],
			['form-designer.formula.example.age', 'DATEDIF([birthday], TODAY(), "Y")'],
		].map(([titleKey, code], i) => (
			<div key={i} class="formula-editor__card">
				<div class="formula-editor__card-title">{translate(titleKey)}</div>
				<div class="formula-editor__card-code"><code class="formula-editor__code">{code}</code></div>
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
				error.value = t("form-designer.formula.self-reference", {field: props.fieldKey});
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
				error.value = e.message || t("form-designer.formula.syntax-error");
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
				<div class="formula-editor__header">
					<span class="formula-editor__title">{useT("form-designer.formula.title")}</span>
					<Button type="link" size="small" onClick={() => { showHelp.value = true; }}>
						{useT("form-designer.formula.usage")}
					</Button>
				</div>
				<TextArea
					ref={textareaRef}
					value={props.value}
					onChange={handleInput}
					placeholder={useT("form-designer.formula.placeholder")}
					rows={4}
				/>
				{error.value && <div class="formula-editor__error">{error.value}</div>}
				{preview.value !== null && (
					<div class="formula-editor__result">
						{useT("form-designer.formula.result", {value: String(preview.value)})}
					</div>
				)}
				{props.availableFields.length > 0 && (
					<div class="formula-editor__fields">
						<span class="formula-editor__secondary">{useT("form-designer.formula.available-fields")}</span>
						{props.availableFields.map(f => (
							<Tag key={f.key} onClick={() => insertFieldRef(f.key)} class="formula-editor__field-tag">
								{f.title} [{f.key}]
							</Tag>
						))}
					</div>
				)}
				{showHelp.value && (
					<Modal
						v-model:open={showHelp.value}
						title={useT("form-designer.formula.help-title")}
						width={720}
					>
						{renderHelpContent(useT)}
					</Modal>
				)}
			</div>
		);
	},
});
