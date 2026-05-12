import { calcPerHour, Table } from '@oldschoolgg/toolkit';

import { Thieving } from '../../src/lib/skilling/skills/thieving/index.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

const CHEST_SUCCESS_RATE = 0.975;

function formatXp(xp: number): string {
	return Number.isInteger(xp) ? xp.toString() : xp.toFixed(1);
}

function normaliseChance(chance: number): number {
	return Math.max(0, Math.min(1, chance <= 1 ? chance : chance / 100));
}

function chestSuccessRate(chest: (typeof Thieving.stealables)[number]): number {
	return chest.slope !== undefined && chest.intercept !== undefined
		? normaliseChance(chest.slope * chest.level + chest.intercept)
		: CHEST_SUCCESS_RATE;
}

function formatXpHr(chest: (typeof Thieving.stealables)[number]): string {
	const successRate = chestSuccessRate(chest);
	const missedAttemptsOnFailure =
		chest.stunTime && chest.respawnTime ? Math.round(chest.stunTime / chest.respawnTime) : 0;
	const xpPerAction = chest.xp * successRate;
	const effectiveActionTime = chest.respawnTime! * (1 + (1 - successRate) * missedAttemptsOnFailure);
	const xpHr = calcPerHour(xpPerAction, effectiveActionTime);
	return Math.floor(xpHr).toLocaleString();
}

function renderThievingChestTable() {
	const chests = Thieving.stealables.filter(stealable => stealable.type === 'chest');
	const table = new Table();

	table.addHeader('Chest Name', 'Required Level', 'Experience', 'XP/Hr', 'Requirements/Notes');

	for (const chest of chests) {
		if (!chest.respawnTime) {
			throw new Error(`Missing respawn time for ${chest.name}`);
		}

		table.addRow(
			chest.name,
			chest.level.toString(),
			formatXp(chest.xp),
			formatXpHr(chest),
			chest.prayerLevelRequired ? `${chest.prayerLevelRequired} Prayer required` : '-'
		);
	}

	handleMarkdownEmbed('thievingchestxphr', 'osb/Skills/thieving/README.md', table.toString());
}

renderThievingChestTable();
