import { calcPerHour, Table } from '@oldschoolgg/toolkit';

import { Thieving } from '../../src/lib/skilling/skills/thieving/index.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

const CHEST_SUCCESS_RATE = 0.975;

function formatXp(xp: number): string {
	return Number.isInteger(xp) ? xp.toString() : xp.toFixed(1);
}

function formatXpHr(xp: number, respawnTime: number): string {
	const xpPerAttempt = xp * CHEST_SUCCESS_RATE;
	const xpHr = calcPerHour(xpPerAttempt, respawnTime);
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
			formatXpHr(chest.xp, chest.respawnTime),
			chest.prayerLevelRequired ? `${chest.prayerLevelRequired} Prayer required` : '-'
		);
	}

	handleMarkdownEmbed('thievingchestxphr', 'osb/Skills/thieving/README.md', table.toString());
}

renderThievingChestTable();
