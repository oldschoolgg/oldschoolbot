import { Items } from 'oldschooljs';
import { omit } from 'remeda';
import { expect, it } from 'vitest';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { allCombatAchievementTasks } from '@/lib/combat_achievements/combatAchievements.js';
import { Eatables } from '@/lib/data/eatables.js';
import { similarItems } from '@/lib/data/similarItems.js';
import Potions from '@/lib/minions/data/potions.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { BOT_TYPE } from '../../src/lib/constants.js';
import { serializeSnapshotItem } from './userutil.js';

it(`${BOT_TYPE} Minigames`, () => {
	const result = [...Minigames].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Combat Achievements`, () => {
	const result = [...allCombatAchievementTasks]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(serializeSnapshotItem);
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Potions`, () => {
	const result = [...Potions].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem);
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Eatables`, () => {
	const result = [...Eatables].sort((a, b) => a.name.localeCompare(b.name)).map(serializeSnapshotItem);
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Similar Items`, () => {
	const result = [...similarItems.entries()]
		.map(i => [...i[1], i[0]].map(id => Items.itemNameFromId(id) ?? '???UNKNOWN???'))
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(serializeSnapshotItem);
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Clue Tiers`, () => {
	const result = [...ClueTiers]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(tier => {
			return omit(tier, ['reqs']);
		})
		.map(serializeSnapshotItem);
	expect(result).toMatchSnapshot();
});
