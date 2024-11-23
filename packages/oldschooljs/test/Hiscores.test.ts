import { expect, test } from 'vitest';

import { Hiscores } from '../src';

test('Hiscores', async () => {
	const koru = await Hiscores.fetch('Koru');

	expect(koru.minigames.pvpArena.rank).toBeGreaterThanOrEqual(1);
	expect(koru.minigames.pvpArena.score).toBeGreaterThanOrEqual(1);
	expect(koru.bossRecords.commanderZilyana.score).toBeGreaterThanOrEqual(1);
	expect(koru.bossRecords.dagannothPrime.score).toBeGreaterThanOrEqual(1);
	expect(koru.bossRecords.dagannothRex.score).toBeGreaterThanOrEqual(1);

	const [lynxTitan, zulu, b0aty, magnaboy, virtualMagnaboy, dmmTournyFaux] = await Promise.all([
		Hiscores.fetch('Lynx Titan'),
		Hiscores.fetch('Zulu'),
		Hiscores.fetch('B0aty'),
		Hiscores.fetch('Magnaboy'),
		Hiscores.fetch('Magnaboy', { virtualLevels: true }),
		Hiscores.fetch('Faux', { virtualLevels: true })
	]);

	expect(lynxTitan.username).toBe('Lynx Titan');
	expect(lynxTitan.combatLevel).toBe(126);
	expect(lynxTitan.skills.overall.level).toBe(2277);
	expect(lynxTitan.skills.overall.xp).toBe(4_600_000_000);

	expect(lynxTitan.clues.hard.score >= 22).toBe(true);
	expect(typeof lynxTitan.minigames.bountyHunter.rank).toBe('number');

	expect(zulu.bossRecords.giantMole.rank > 1).toBe(true);

	expect(zulu.bossRecords.commanderZilyana.rank > 1).toBe(true);
	expect(zulu.bossRecords.commanderZilyana.score).toBeGreaterThan(1084);

	expect(zulu.bossRecords.zulrah.rank > 1).toBe(true);
	expect(zulu.bossRecords.zulrah.score).toBeGreaterThanOrEqual(2527);

	expect(zulu.bossRecords.callisto.rank > 1).toBe(true);
	expect(zulu.bossRecords.callisto.score).toBeGreaterThan(326);

	expect(zulu.bossRecords.cerberus.rank > 1).toBe(true);
	expect(zulu.bossRecords.cerberus.score).toBeGreaterThan(7079);

	expect(zulu.bossRecords.nex.rank > 1).toBe(true);
	expect(zulu.bossRecords.nex.score > 150 && zulu.bossRecords.nex.score < 3000).toBe(true);

	expect(b0aty.minigames.bountyHunterLegacy.score).toEqual(8);
	expect(b0aty.minigames.bountyHunterLegacyRogue.score).toEqual(7);
	expect(b0aty.minigames.colosseumGlory.score).toBeGreaterThan(30_000);

	expect(magnaboy.clues.all.score).toBe(157);

	expect(magnaboy.clues.beginner.score).toBe(6);
	expect(magnaboy.clues.easy.score).toBe(15);

	expect(magnaboy.clues.medium.score).toBe(60);
	expect(magnaboy.clues.hard.score).toBe(53);

	expect(magnaboy.clues.elite.score).toBe(16);
	expect(magnaboy.clues.master.score).toBe(7);

	expect(magnaboy.minigames.LMS.score).toBe(-1);
	expect(magnaboy.bossRecords.nex.score).toBe(-1);
	expect(magnaboy.minigames.riftsClosed.score).toBe(-1);

	expect(virtualMagnaboy.skills.firemaking.level).toBe(106);
	expect(virtualMagnaboy.skills.cooking.level).toBe(100);
	expect(virtualMagnaboy.skills.fletching.level).toBe(99);
	expect(virtualMagnaboy.leaguePoints).toEqual(undefined);

	// DMM Tourny
	expect(dmmTournyFaux.username).toEqual('Faux');
	// Dont die Faux
	expect(dmmTournyFaux.combatLevel).toBeGreaterThan(30);
	expect(dmmTournyFaux.skills.agility.level).toBeGreaterThan(49);

	const leagues = await Hiscores.fetch('Magnaboy', { type: 'seasonal' });
	expect(leagues.leaguePoints?.points).toBeGreaterThan(1);

	const leagues2 = await Hiscores.fetch('fk ezscape', { type: 'seasonal' });
	expect(leagues2.leaguePoints?.points).toBeGreaterThan(1);

	// Skillers
	const skiller = await Hiscores.fetch('Jcw', { type: 'skiller' });
	expect(skiller.skills.overall.rank).toBeLessThan(10);
	expect(skiller.skills.overall.level).toBeGreaterThan(1500);
	expect(skiller.skills.overall.level).toBeLessThan(1601);

	// Pures
	const pure = await Hiscores.fetch('Headline', { type: 'skiller_defence' });
	expect(pure.skills.overall.rank).toBe(1);
	expect(pure.skills.overall.level).toBe(2179);
}, 30_000);
