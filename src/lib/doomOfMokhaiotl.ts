import type { EquipmentSlot, GearSetupType } from '@oldschoolgg/gear';
import { formatDuration, objectEntries, Time, UserError } from '@oldschoolgg/toolkit';
import { Bank, Items, LootTable, resolveItems } from 'oldschooljs';
import { clamp } from 'remeda';

import { doomOfMokhaiotlCL } from '@/lib/data/CollectionsExport.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import type { Skills } from '@/lib/types/index.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { formatList, formatSkillRequirements } from '@/lib/util/smallUtils.js';

export const MAX_DELVE = 30;

export const DOOM_UNIQUE_ITEMS = resolveItems(['Mokhaiotl cloth', 'Eye of ayak (uncharged)', 'Avernic treads', 'Dom']);

export const DoomOfMokhaiotl = {
	id: 14708,
	name: 'Doom of Mokhaiotl',
	aliases: ['doom', 'mokhaiotl', 'mokha', 'osto-ayak', 'ostayak'],
	allItems: doomOfMokhaiotlCL,
	items: doomOfMokhaiotlCL,
	fmtProg: (deepestDelve: number, deepDelves: number, totalDelves: number) =>
		`Deepest Delve: ${deepestDelve} | Deep Delves: ${deepDelves} | Total Delves: ${totalDelves}`
};

const ARROW_TIER_IDS: { mod: number; ids: number[] }[] = [
	{ mod: -0.08, ids: resolveItems(['Dragon arrow']) },
	{ mod: -0.04, ids: resolveItems(['Amethyst arrow']) },
	{ mod: 0.05, ids: resolveItems(['Rune arrow']) },
	{ mod: 0.12, ids: resolveItems(['Adamant arrow']) },
	{ mod: 0.12, ids: resolveItems(['Mithril arrow']) },
	{ mod: 0.12, ids: resolveItems(['Steel arrow']) },
	{ mod: 0.12, ids: resolveItems(['Iron arrow']) },
	{ mod: 0.12, ids: resolveItems(['Bronze arrow']) }
];

interface DelveEntry {
	delveLevel: number;
	guaranteedTears: number;
	table: LootTable;
}

export interface DoomRunResult {
	diedAt: number | null;
	loot: Bank | null;
	deepestDelveCompleted: number;
	deepDelvesEarned: number;
	totalWavesCleared: number;
	fakeDuration: number;
	realDuration: number;
	deathChances: number[];
	ayakChargesGained: number;
}

function cappedDelve(delveLevel: number): number {
	return Math.min(delveLevel, 9);
}

function buildDelveTable(delveLevel: number): LootTable {
	const multipliers: Record<number, number> = {
		1: -0.5,
		2: -0.35,
		3: 0.0,
		4: 0.05,
		5: 0.1,
		6: 0.12,
		7: 0.14,
		8: 0.17,
		9: 0.2
	};
	const mult = multipliers[cappedDelve(delveLevel)] ?? 0.2;

	function qty(base: number): number {
		return Math.max(1, Math.trunc(base + base * mult));
	}

	const clueRate = delveLevel <= 2 ? 75 : 50;

	const table = new LootTable()
		.add('Dragon med helm', 1, 5)
		.add('Dragon platelegs', [2, 4], 1)
		.add('Mystic earth staff', 1, 5)
		.add('Rune pickaxe', [1, 3], 5)
		.add('Death rune', [qty(50), qty(70)], 5)
		.add('Chaos rune', [qty(50), qty(70)], 5)
		.add('Earth rune', [qty(500), qty(1000)], 5)
		.add('Fire rune', [qty(500), qty(1000)], 5)
		.add('Cannonball', [qty(200), qty(600)], 5)
		.add('Onyx bolts', [qty(5), qty(15)], 5)
		.add('Coal', [qty(15), qty(50)], 5)
		.add('Gold ore', [qty(20), qty(60)], 5)
		.add('Runite ore', [qty(3), qty(6)], 5)
		.add('Celastrus seed', 1, 3)
		.add('Ranarr seed', [1, 3], 2)
		.add('Spirit seed', 1, 3)
		.add('Aether catalyst', [qty(150), qty(400)], 5)
		.add('Dragon dart tip', [qty(30), qty(90)], 5)
		.add('Raw shark', [qty(20), qty(35)], 3)
		.add('Shark lure', [qty(40), qty(70)], 2)
		.add('Sun-kissed bones', [qty(25), qty(75)], 5)
		.add('Tooth half of key (moon key)', 1, 1)
		.add('Demon tear', [100, 300], 7)
		.add('Mokhaiotl waystone', delveLevel <= 1 ? 1 : [1, 2], 7)
		.tertiary(clueRate, 'Clue scroll (elite)');

	const cd = cappedDelve(delveLevel);

	const clothRates: Record<number, number> = { 2: 2500, 3: 2000, 4: 1350, 5: 810, 6: 765, 7: 720, 8: 630, 9: 540 };
	const eyeRates: Record<number, number> = { 3: 2000, 4: 1350, 5: 810, 6: 765, 7: 720, 8: 630, 9: 540 };
	const treadRates: Record<number, number> = { 4: 1350, 5: 810, 6: 765, 7: 720, 8: 630, 9: 540 };
	const petRates: Record<number, number> = { 6: 1000, 7: 750, 8: 500, 9: 250 };

	if (cd >= 2) table.tertiary(clothRates[cd] ?? 540, 'Mokhaiotl cloth');
	if (cd >= 3) table.tertiary(eyeRates[cd] ?? 540, 'Eye of ayak (uncharged)');
	if (cd >= 4) table.tertiary(treadRates[cd] ?? 540, 'Avernic treads');
	if (cd >= 6) table.tertiary(petRates[cd] ?? 250, 'Dom');

	return table;
}

export const doomDelves: DelveEntry[] = Array.from({ length: MAX_DELVE }, (_, i) => {
	const delveLevel = i + 1;
	const guaranteedTears = delveLevel < 3 ? 0 : delveLevel === 3 ? 50 : Math.min(100, 50 + (delveLevel - 3) * 10);
	return {
		delveLevel,
		guaranteedTears,
		table: buildDelveTable(delveLevel)
	};
});

function getArrowMod(arrowId: number | null): number {
	if (arrowId === null) return 0.12;
	return ARROW_TIER_IDS.find(tier => tier.ids.includes(arrowId))?.mod ?? 0.12;
}

function experienceScore(deepDelves: number, totalDelves: number): number {
	return deepDelves * 2 + Math.floor(totalDelves / 10);
}

function calculateDeathChance(delve: number, deepDelves: number, totalDelves: number, hasMasori: boolean): number {
	let chance: number;

	if (delve < 8) {
		const base = delve <= 3 ? [2, 5, 8][delve - 1] : delve <= 5 ? 8 + (delve - 3) * 3.5 : 15 + (delve - 5) * 3.5;
		const totalReduction = Math.min(totalDelves / 2000, 1) * 0.85;
		const deepReduction = Math.min(deepDelves / 200, 1) * 0.34;
		const totalFactor = Math.min(totalReduction + deepReduction, 0.92);
		chance = base * (1 - totalFactor);
	} else {
		const base = delve <= 16 ? 12 + (delve - 8) * 2.0 : 28 + (delve - 16) * 3.0;
		const deepFactor = Math.min(deepDelves / 500, 1);
		const deepReduction = base * 0.6 * deepFactor;
		const decayFactor = Math.max(0, 1 - deepDelves / 300);
		const totalReduction = base * 0.2 * Math.min(totalDelves / 1500, 1) * decayFactor;
		chance = base - deepReduction - totalReduction;
	}

	if (hasMasori) chance *= 0.9;

	return clamp(chance, { min: 0.1, max: 70 });
}

function calculateTripDuration(
	targetDelve: number,
	hasTbow: boolean,
	hasSBow: boolean,
	hasScythe: boolean,
	hasNoxHalberd: boolean,
	hasEliteVoid: boolean,
	arrowMod: number,
	rng: RNGProvider
): number {
	let totalBase = 0;
	for (let d = 1; d <= targetDelve; d++) {
		if (d <= 5) totalBase += 0.75 * Time.Minute;
		else if (d <= 8) totalBase += 1.25 * Time.Minute;
		else if (d <= 16) totalBase += 1.5 * Time.Minute;
		else totalBase += 1.75 * Time.Minute;
	}

	let weaponMod = 1.0;
	if (hasTbow) weaponMod -= 0.1;
	else if (hasSBow) weaponMod += 0.17;
	if (hasScythe) weaponMod -= 0.08;
	else if (hasNoxHalberd) weaponMod -= 0.04;
	if (hasEliteVoid) weaponMod -= 0.05;
	weaponMod += arrowMod;

	return totalBase * weaponMod * rng.randFloat(0.9, 1.1);
}

export function startDoomRun(options: {
	targetDelve: number;
	hasEmberlight: boolean;
	hasArclight: boolean;
	hasTbow: boolean;
	hasSBow: boolean;
	hasLightbearer: boolean;
	hasZcb: boolean;
	hasScythe: boolean;
	hasNoxHalberd: boolean;
	hasMasori: boolean;
	hasEliteVoid: boolean;
	hasChargedEyeOfAyak: boolean;
	arrowMod: number;
	deepDelves: number;
	totalDelves: number;
	stopOnUnique: boolean;
	rng: RNGProvider;
}): DoomRunResult {
	const { targetDelve, deepDelves, totalDelves } = options;

	const deathChances: number[] = [];
	let deepestDelveCompleted = 0;
	let deepDelvesEarned = 0;
	let totalWavesCleared = 0;
	let ayakChargesGained = 0;
	const pendingLoot = new Bank();

	const fakeDuration = calculateTripDuration(
		targetDelve,
		options.hasTbow,
		options.hasSBow,
		options.hasScythe,
		options.hasNoxHalberd,
		options.hasEliteVoid,
		options.arrowMod,
		options.rng
	);
	const realDuration = fakeDuration;

	for (let d = 1; d <= targetDelve; d++) {
		const deathChance = calculateDeathChance(d, deepDelves, totalDelves, options.hasMasori);
		deathChances.push(deathChance);

		if (options.rng.percentChance(deathChance)) {
			return {
				diedAt: d,
				loot: null,
				deepestDelveCompleted,
				deepDelvesEarned,
				totalWavesCleared,
				fakeDuration,
				realDuration,
				deathChances,
				ayakChargesGained
			};
		}

		deepestDelveCompleted = d;
		totalWavesCleared++;
		if (d >= 8) deepDelvesEarned++;

		const entry = doomDelves[d - 1];
		const waveRoll = entry.table.roll();
		pendingLoot.add(waveRoll);

		if (entry.guaranteedTears > 0) {
			pendingLoot.add('Demon tear', entry.guaranteedTears);
		}

		if (options.hasChargedEyeOfAyak) {
			ayakChargesGained += options.rng.randInt(10, 20);
		}

		if (options.stopOnUnique && DOOM_UNIQUE_ITEMS.some(id => waveRoll.has(id))) {
			return {
				diedAt: null,
				loot: pendingLoot,
				deepestDelveCompleted: d,
				deepDelvesEarned,
				totalWavesCleared,
				fakeDuration,
				realDuration,
				deathChances,
				ayakChargesGained
			};
		}
	}

	return {
		diedAt: null,
		loot: pendingLoot,
		deepestDelveCompleted,
		deepDelvesEarned,
		totalWavesCleared,
		fakeDuration,
		realDuration,
		deathChances,
		ayakChargesGained
	};
}

export async function doomCommand(itx: OSInteraction, targetDelve: number, stopOnUnique = true) {
	const { user, rng } = itx;

	if (await user.minionIsBusy()) {
		return `${user.usernameOrMention} is busy`;
	}

	if (!user.user.finished_quest_ids.includes(QuestID.TheFinalDawn)) {
		return `You need to complete "The Final Dawn" quest before you can fight the Doom of Mokhaiotl. Send your minion to do the quest using: ${globalClient.mentionCommand('activities', 'quest')}.`;
	}

	if (targetDelve < 1 || targetDelve > MAX_DELVE) {
		return `Target delve must be between 1 and ${MAX_DELVE}. Drop rates cap at delve 9, but death chance continues to increase beyond that.`;
	}

	const skillReqs: Skills = {
		attack: 85,
		strength: 85,
		defence: 70,
		ranged: 90,
		prayer: 74,
		hitpoints: 90
	};

	if (!user.hasSkillReqs(skillReqs)) {
		return `You need ${formatSkillRequirements(skillReqs)} to fight the Doom of Mokhaiotl.`;
	}

	const hasTbow = user.gear.range.hasEquipped('Twisted bow', true, true);
	const hasSBow = user.gear.range.hasEquipped('Scorching bow', true, true);

	if (!hasSBow && !hasTbow) {
		const ownsTbow = user.hasEquippedOrInBank('Twisted bow');
		const ownsSBow = user.hasEquippedOrInBank('Scorching bow');
		if (ownsTbow || ownsSBow) {
			return 'You have a Twisted bow or Scorching bow but it is not equipped in your **range** setup. Equip it there before fighting the Doom of Mokhaiotl.';
		}
		return 'You need a Twisted bow or Scorching bow equipped in your range setup to fight the Doom of Mokhaiotl. It is required for killing ranged demonic larvae.';
	}

	const demonbaneWeapons = resolveItems(['Darklight', 'Arclight', 'Emberlight']);
	if (!demonbaneWeapons.some(i => user.hasEquippedOrInBank(i))) {
		return `You need a demonbane weapon (${formatList(
			demonbaneWeapons.map(i => Items.itemNameFromId(i)),
			'or'
		)}) to fight the Doom of Mokhaiotl. Its demonic shield cannot be damaged without one.`;
	}

	const crystalHalberdVariants = resolveItems(['Crystal halberd']);
	const meleePunishWeapons = resolveItems(['Scythe of vitur', 'Noxious halberd', 'Dual macuahuitl']).concat(
		crystalHalberdVariants
	);
	if (!meleePunishWeapons.some(i => user.hasEquippedOrInBank(i))) {
		return `You need a melee punish weapon (Scythe of vitur, Noxious halberd, Crystal halberd, or Dual macuahuitl) to fight the Doom of Mokhaiotl. It is required to interrupt the Special Beam Cannon.`;
	}

	const mageWeapons = resolveItems([
		'Skull sceptre',
		"Slayer's staff",
		"Slayer's staff (e)",
		"Ahrim's staff",
		'Blue moon spear',
		'Staff of the dead',
		'Toxic staff of the dead',
		'Purging staff',
		'Master wand',
		'Kodai wand'
	]);

	const hasChargedEyeOfAyak = user.user.ayak_charges > 0 && user.hasEquippedOrInBank('Eye of ayak');
	const hasStaffMageWeapon = mageWeapons.some(i => user.hasEquippedOrInBank(i));
	const hasMageWeapon = hasChargedEyeOfAyak || hasStaffMageWeapon;

	if (!hasMageWeapon) {
		return `You need a mage weapon to fight the Doom of Mokhaiotl (required for killing mage grubs). Use the Eye of Ayak (with charges) or one of: ${formatList(
			mageWeapons.map(i => Items.itemNameFromId(i)),
			'or'
		)}.`;
	}

	const userMagicLevel = user.skillLevel('magic');

	const requiredItems: Partial<Record<GearSetupType, Partial<Record<EquipmentSlot, number[]>>>> = {
		range: {
			head: resolveItems(['Masori mask (f)', 'Masori mask', 'Void ranger helm', 'Armadyl helmet']),
			body: resolveItems(['Masori body (f)', 'Masori body', 'Elite void top', 'Armadyl chestplate']),
			legs: resolveItems(['Masori chaps (f)', 'Masori chaps', 'Elite void robe', 'Armadyl chainskirt']),
			neck: resolveItems(['Necklace of anguish', 'Amulet of fury']),
			cape: resolveItems(["Dizana's quiver", "Ava's assembler", "Ava's accumulator"]),
			feet: resolveItems([
				'Avernic treads',
				'Avernic treads (pr)',
				'Avernic treads (pe)',
				'Avernic treads (et)',
				'Avernic treads (pr)(pe)',
				'Avernic treads (pr)(et)',
				'Avernic treads (pe)(et)',
				'Avernic treads (max)',
				'Pegasian boots',
				'Aranea boots'
			]),
			hands: resolveItems(['Zaryte vambraces', 'Void knight gloves', 'Barrows gloves'])
		}
	};

	for (const [gearType, gearNeeded] of objectEntries(requiredItems)) {
		const gear = user.gear[gearType];
		if (!gearNeeded) continue;
		for (const items of Object.values(gearNeeded)) {
			if (!items.some(g => gear.hasEquipped(g))) {
				return `You need one of these equipped in your ${gearType} setup to fight the Doom of Mokhaiotl: ${formatList(
					items.map(i => Items.itemNameFromId(i)),
					'or'
				)}.`;
			}
		}
	}

	const hasEmberlight = user.hasEquippedOrInBank('Emberlight');
	const hasArclight = !hasEmberlight && user.hasEquippedOrInBank('Arclight');
	const hasLightbearer = user.hasEquippedOrInBank('Lightbearer');
	const hasZcb = user.hasEquippedOrInBank('Zaryte crossbow');
	const hasNoxHalberd = user.hasEquippedOrInBank('Noxious halberd');
	const hasCrystalHalb = crystalHalberdVariants.some(i => user.hasEquippedOrInBank(i));
	const hasScythe = user.hasEquippedOrInBank('Scythe of vitur');
	const hasBloodFury = user.hasEquippedOrInBank('Amulet of blood fury');

	const equippedAmmo = user.gear.range.get('ammo');
	const equippedArrowId: number | null = equippedAmmo?.item ?? null;
	const equippedArrowName: string | null =
		equippedArrowId !== null ? (Items.itemNameFromId(equippedArrowId) ?? null) : null;
	const arrowMod = getArrowMod(equippedArrowId);

	const masoriHead = resolveItems(['Masori mask (f)', 'Masori mask']);
	const masoriBody = resolveItems(['Masori body (f)', 'Masori body']);
	const masoriLegs = resolveItems(['Masori chaps (f)', 'Masori chaps']);
	const hasMasori =
		masoriHead.some(i => user.gear.range.hasEquipped(i)) &&
		masoriBody.some(i => user.gear.range.hasEquipped(i)) &&
		masoriLegs.some(i => user.gear.range.hasEquipped(i));

	const hasEliteVoid =
		user.gear.range.hasEquipped(resolveItems(['Void ranger helm'])[0]) &&
		user.gear.range.hasEquipped(resolveItems(['Elite void top'])[0]) &&
		user.gear.range.hasEquipped(resolveItems(['Elite void robe'])[0]) &&
		user.gear.range.hasEquipped(resolveItems(['Void knight gloves'])[0]);

	if ((hasTbow || hasSBow) && equippedArrowId === null) {
		return 'You need arrows equipped in your range setup to fight the Doom of Mokhaiotl.';
	}

	const stats = await user.fetchStats();
	const deepDelves = Number(stats.doom_deep_delves ?? 0);
	const totalDelves = Number(stats.doom_total_delves ?? 0);

	const res = startDoomRun({
		targetDelve,
		hasEmberlight,
		hasArclight,
		hasTbow,
		hasSBow,
		hasLightbearer,
		hasZcb,
		hasScythe,
		hasNoxHalberd,
		hasMasori,
		hasEliteVoid,
		hasChargedEyeOfAyak,
		arrowMod,
		deepDelves,
		totalDelves,
		stopOnUnique,
		rng
	});

	const fullDurationMinutes = res.realDuration / Time.Minute;
	const score = experienceScore(deepDelves, totalDelves);
	const experienceFactor = Math.min(score / 1000, 1);
	const brewsPerMinute = Math.max(0.2, 0.6 - experienceFactor * 0.3);
	const restoresPerMinute = Math.max(0.3, 0.3 + experienceFactor * 0.3);

	const cost = new Bank()
		.add('Saradomin brew(4)', Math.min(10, Math.max(1, Math.ceil(fullDurationMinutes * brewsPerMinute))))
		.add('Super restore(4)', Math.min(10, Math.max(1, Math.ceil(fullDurationMinutes * restoresPerMinute))))
		.add('Divine ranging potion(4)', Math.min(10, Math.max(1, Math.ceil(targetDelve / 5))))
		.add('Ranging potion(4)', Math.min(10, Math.max(1, Math.ceil(targetDelve / 5))));

	if (!hasChargedEyeOfAyak) {
		let fireRunes = 0;
		let soulRunes = 0;

		if (userMagicLevel >= 82) {
			fireRunes = 7 * targetDelve;
			soulRunes = 2 * targetDelve;
		} else if (userMagicLevel >= 62) {
			fireRunes = 5 * targetDelve;
			soulRunes = 1 * targetDelve;
		} else {
			fireRunes = 3 * targetDelve;
			cost.add('Chaos rune', targetDelve);
		}

		const fireAlternatives = ['Fire rune', 'Smoke rune', 'Steam rune', 'Lava rune'];
		let fireRemaining = fireRunes;
		for (const rune of fireAlternatives) {
			if (fireRemaining <= 0) break;
			const owned = user.bank.amount(rune);
			if (owned > 0) {
				const use = Math.min(owned, fireRemaining);
				cost.add(rune, use);
				fireRemaining -= use;
			}
		}
		if (fireRemaining > 0) cost.add('Fire rune', fireRemaining);

		if (soulRunes > 0) {
			const soulOwned = user.bank.amount('Soul rune');
			if (soulOwned >= soulRunes) {
				cost.add('Soul rune', soulRunes);
			} else {
				if (soulOwned > 0) cost.add('Soul rune', soulOwned);
				cost.add('Aether rune', soulRunes - soulOwned);
			}
		}
	}

	if ((hasTbow || hasSBow) && equippedArrowId !== null) {
		const arrowsPerDelve = hasTbow ? 35 : 45;
		cost.add(equippedArrowId, Math.min(1050, Math.ceil(targetDelve * arrowsPerDelve)));
	}

	if (hasZcb) cost.add('Ruby bolts (e)', Math.min(60, Math.ceil(targetDelve * 5)));
	if (hasCrystalHalb && !hasScythe && !hasNoxHalberd) cost.add('Crystal shard', Math.ceil(targetDelve));

	const realCost = new Bank();
	try {
		const result = await user.specialRemoveItems(cost);
		realCost.add(result.realCost);
	} catch (err: unknown) {
		if (err instanceof UserError) return err.message;
		throw err;
	}

	if (hasScythe) {
		await user.update({
			scythe_of_vitur_charges: { decrement: Math.ceil(targetDelve * 3) }
		});
	}

	if (hasBloodFury) {
		await user.update({
			blood_fury_charges: { decrement: Math.ceil(targetDelve * 3) }
		});
	}

	await ClientSettings.updateBankSetting('doom_cost', realCost);
	await user.statsBankUpdate('doom_cost', realCost);
	await trackLoot({
		totalCost: realCost,
		id: 'doom_of_mokhaiotl',
		type: 'Monster',
		changeType: 'cost',
		users: [{ id: user.id, cost: realCost }]
	});

	await ActivityManager.startTrip<DoomTaskOptions>({
		userID: user.id,
		channelId: itx.channelId,
		duration: res.realDuration,
		fakeDuration: res.fakeDuration,
		type: 'DoomOfMokhaiotl',
		targetDelve,
		diedAt: res.diedAt,
		loot: res.loot?.toJSON() ?? {},
		deepDelvesEarned: res.deepDelvesEarned,
		totalWavesCleared: res.totalWavesCleared,
		deepestDelveCompleted: res.deepestDelveCompleted,
		ayakChargesGained: res.ayakChargesGained
	});

	const boostLines: string[] = [];

	if (hasTbow) boostLines.push('Twisted bow (10% speed boost)');
	else boostLines.push('Scorching bow');

	if (equippedArrowName ?? equippedArrowId !== null) {
		const pct = Math.round(Math.abs(arrowMod) * 100);
		const displayName = equippedArrowName ?? Items.itemNameFromId(equippedArrowId!) ?? 'Unknown arrow';
		const effect = arrowMod < 0 ? `${pct}% speed boost` : `${pct}% speed penalty`;
		boostLines.push(`${displayName} (${effect})`);
	}

	if (hasEmberlight && !hasArclight) boostLines.push('Emberlight');
	else if (hasArclight) boostLines.push('Arclight');
	else boostLines.push('Darklight');

	if (hasScythe) boostLines.push('Scythe of vitur (8% speed boost)');
	else if (hasNoxHalberd) boostLines.push('Noxious halberd (4% speed boost)');
	else if (hasCrystalHalb) boostLines.push('Crystal halberd');
	else boostLines.push('Dual macuahuitl');

	if (hasChargedEyeOfAyak) boostLines.push('Eye of Ayak (mage grubs, no rune cost)');

	if (hasMasori) boostLines.push('Masori armour (10% death reduction)');
	else if (hasEliteVoid) boostLines.push('Elite void');
	if (hasLightbearer) boostLines.push('Lightbearer');
	if (hasZcb) boostLines.push('Zaryte crossbow');

	return [
		`${user.usernameOrMention}'s minion is now fighting the **Doom of Mokhaiotl** (targeting delve **${targetDelve}**)!`,
		`**Duration:** ${formatDuration(res.fakeDuration)} | **Stop on unique:** ${stopOnUnique ? 'Yes' : 'No'}`,
		`**Cost:** ${realCost}`,
		`**Boosts:** ${boostLines.join(', ')}`
	].join('\n');
}
