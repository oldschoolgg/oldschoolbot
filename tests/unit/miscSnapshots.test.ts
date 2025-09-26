import { expect, it } from 'vitest';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { allCombatAchievementTasks } from '@/lib/combat_achievements/combatAchievements.js';
import { Eatables } from '@/lib/data/eatables.js';
import { similarItems } from '@/lib/data/similarItems.js';
import Potions from '@/lib/minions/data/potions.js';
import { Minigames } from '@/lib/settings/minigames.js';
import { BOT_TYPE } from '../../src/lib/constants.js';

it(`${BOT_TYPE} Minigames`, () => {
	const result = [...Minigames].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Combat Achievements`, () => {
	const result = [...allCombatAchievementTasks].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Potions`, () => {
	const result = [...Potions].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Eatables`, () => {
	const result = [...Eatables].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Similar Items`, () => {
	const result = [...similarItems.entries()].sort((a, b) => a[0] - b[0]);
	expect(result).toMatchSnapshot();
});

it(`${BOT_TYPE} Clue Tiers`, () => {
	const result = [...ClueTiers].sort((a, b) => a.name.localeCompare(b.name));
	expect(result).toMatchSnapshot();
});
