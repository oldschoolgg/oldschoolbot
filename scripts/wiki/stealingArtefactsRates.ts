import { readFileSync, writeFileSync } from 'node:fs';

import { calculateStealingArtefactsXpPerHour } from '../../src/lib/minions/data/stealingArtefacts.js';

const DOC_PATH = './docs/src/content/docs/osb/Minigames/stealing-artefacts.md';
const START_MARKER = '<!-- rates-table:start -->';
const END_MARKER = '<!-- rates-table:end -->';

type RateCondition = {
	label: string;
	teleportEligible: boolean;
	hasGraceful: boolean;
	stamina: boolean;
};

const conditions: RateCondition[] = [
	{ label: 'No tele, Graceful + stamina', teleportEligible: false, hasGraceful: true, stamina: true },
	{ label: 'Tele, Graceful + stamina', teleportEligible: true, hasGraceful: true, stamina: true },
	{ label: 'Tele, Graceful only', teleportEligible: true, hasGraceful: true, stamina: false },
	{ label: 'Tele, stamina only', teleportEligible: true, hasGraceful: false, stamina: true },
	{ label: 'Tele, no Graceful/stamina', teleportEligible: true, hasGraceful: false, stamina: false }
];

function formatInt(value: number): string {
	return Math.floor(value).toLocaleString();
}

function formatNumber(value: number): string {
	return Number(value.toFixed(2)).toLocaleString();
}

function generateRatesTable() {
	const header = [
		'Level',
		...conditions.map(condition => `XP/hr (${condition.label})`),
		'Deliveries/hr (Tele, Graceful + stamina)',
		'Coins/hr range (Tele, Graceful + stamina)'
	];
	const divider = header.map(() => '---');
	const rows = [header, divider];

	for (let level = 49; level <= 99; level++) {
		const conditionResults = conditions.map(condition =>
			calculateStealingArtefactsXpPerHour({
				thievingLevel: level,
				teleportEligible: condition.teleportEligible,
				hasGraceful: condition.hasGraceful,
				stamina: condition.stamina
			})
		);
		const teleBest = conditionResults[1];
		const minCoinsPerHour = Math.floor(teleBest.deliveriesPerHour * 500);
		const maxCoinsPerHour = Math.floor(teleBest.deliveriesPerHour * 1000);

		rows.push([
			level.toString(),
			...conditionResults.map(result => formatInt(result.finalXpPerHour)),
			formatNumber(teleBest.deliveriesPerHour),
			`${minCoinsPerHour.toLocaleString()}-${maxCoinsPerHour.toLocaleString()}`
		]);
	}

	return rows.map(row => `| ${row.join(' | ')} |`).join('\n');
}

function updateDoc(table: string) {
	const content = readFileSync(DOC_PATH, 'utf8');
	const startIndex = content.indexOf(START_MARKER);
	const endIndex = content.indexOf(END_MARKER);

	if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
		throw new Error(`Unable to find valid marker block in ${DOC_PATH}.`);
	}

	const replacement = `${START_MARKER}\n${table}\n${END_MARKER}`;
	const updated = `${content.slice(0, startIndex)}${replacement}${content.slice(endIndex + END_MARKER.length)}`;
	writeFileSync(DOC_PATH, updated, 'utf8');
}

const table = generateRatesTable();
updateDoc(table);
console.log(`Updated rates table in ${DOC_PATH}`);
