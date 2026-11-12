<template>
	<div v-if="rows.length" class="docs-api-table">
		<div v-if="title" class="docs-api-table__title">
			<h3 :id="id">{{ title }}</h3>
			<p v-if="description" class="docs-api-table__description">{{ description }}</p>
		</div>
		<div class="md-table">
			<table>
				<thead>
					<tr>
						<th v-for="column in columns" :key="column">{{ column }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(row, rowIndex) in rows" :key="rowIndex">
						<td v-for="(cell, cellIndex) in row" :key="cellIndex">
							<span v-html="formatCell(cell)"></span>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup>
import { inlineMarkdown } from "../utils/markdown.js";

defineProps({
	id: { type: String, default: "" },
	title: { type: String, default: "" },
	description: { type: String, default: "" },
	columns: { type: Array, default: () => [] },
	rows: { type: Array, default: () => [] },
});

const formatCell = value => {
	if (value === null || value === undefined || value === "") {
		return '<span class="docs-api-empty">-</span>';
	}
	return inlineMarkdown(value);
};
</script>
