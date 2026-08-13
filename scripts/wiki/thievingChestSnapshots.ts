import { Table } from '@oldschoolgg/toolkit';

import { Thieving } from '../../src/lib/skilling/skills/thieving/index.js';
import { calcChestXPPerHour } from '../../src/lib/skilling/skills/thieving/thievingUtils.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

function formatXp(xp: number): string {
	return Number.isInteger(xp) ? xp.toString() : xp.toFixed(1);
}

function formatXpHr(chest: (typeof Thieving.stealables)[number]): string {
	return Math.floor(calcChestXPPerHour(chest)).toLocaleString();
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
