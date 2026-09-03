import type { EquipmentSlot } from '@oldschoolgg/gear';
import { calcWhatPercent, formatDuration, reduceNumByPercent, round, Time, UserError } from '@oldschoolgg/toolkit';
import { Bank, EMonster, Items, LootTable, resolveItems } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { avasDevices, doomOfMokhaiotlCL } from '@/lib/data/CollectionsExport.js';
import {
	applyDoomSkillBoost,
	CRYSTAL_HALBERD_SPEED_BOOST,
	calculateDoomDeathChances,
	calculateDoomKcReduction,
	calculateDoomRunDeathChance,
	calculateDoomTripDuration,
	calculateDoomWipeChanceBeforeTarget,
	calculateDoomZcbBoltsNeeded,
	DOOM_VENOM_PROTECTION_OPTIONS,
	type DoomMeleePunishWeapon,
	type DoomVenomProtection,
	type DoomWaveCompletions,
	ELITE_VOID_SPEED_BOOST,
	formatDoomDeathChance,
	getDoomArrowMod,
	getDoomMeleePunishWeaponName,
	LIGHTBEARER_SPEED_BOOST,
	MASORI_SPEED_BOOST,
	MAX_DELVE,
	NOXIOUS_HALBERD_SPEED_BOOST,
	normaliseDoomWaveCompletions,
	RITE_OF_VILE_TRANSFERENCE_SPEED_BOOST,
	SCORCHING_BOW_SPEED_PENALTY,
	scaleDoomDurationForCompletedDelves,
	selectDoomMeleePunishWeapon,
	selectDoomVenomProtection,
	ZARYTE_VAMBRACES_SPEED_BOOST,
	ZCB_SPEED_BOOST
} from '@/lib/doomOfMokhaiotlHelpers.js';
import { trackLoot } from '@/lib/lootTrack.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import {
	calcDeathChargeCasts,
	DEATH_CHARGE_MAGIC_LEVEL,
	deathChargeCastCost
} from '@/lib/minions/functions/deathCharge.js';
import type { Skills } from '@/lib/types/index.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { formatList, formatSkillRequirements } from '@/lib/util/smallUtils.js';

export const DOOM_UNIQUE_ITEMS = resolveItems(['Mokhaiotl cloth', 'Eye of ayak (uncharged)', 'Avernic treads', 'Dom']);

export {
	calculateDeathChance,
	calculateDoomRunDeathChance,
	calculateDoomTripDuration,
	calculateDoomWipeChanceBeforeTarget,
	calculateDoomXP,
	calculateDoomZcbBoltsNeeded,
	MAX_DELVE,
	normaliseDoomWaveCompletions,
	scaleDoomDurationForCompletedDelves,
	selectDoomMeleePunishWeapon,
	selectDoomVenomProtection
} from '@/lib/doomOfMokhaiotlHelpers.js';

export const DoomOfMokhaiotl = {
	id: 14708,
	name: 'Doom of Mokhaiotl',
	aliases: ['doom', 'mokhaiotl', 'mokha', 'osto-ayak', 'ostayak'],
	allItems: doomOfMokhaiotlCL,
	items: doomOfMokhaiotlCL,
	fmtProg: (deepestDelve: number, deepDelves: number, totalDelves: number) =>
		`Deepest Delve: ${deepestDelve} | Deep Delves: ${deepDelves} | Total Delves: ${totalDelves}`
};

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
	duration: number;
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

function experienceScore(deepDelves: number, totalDelves: number): number {
	return deepDelves * 2 + Math.floor(totalDelves / 10);
}

type DoomUser = OSInteraction['user'];

interface DoomGearState {
	hasTbow: boolean;
	hasSBow: boolean;
	hasChargedEyeOfAyak: boolean;
	hasLightbearer: boolean;
	hasZcb: boolean;
	zcbBoostDisabled: boolean;
	zcbBoltsNeeded: number;
	zcbBoltsOwned: number;
	hasRiteOfVileTransference: boolean;
	meleePunishWeapon: DoomMeleePunishWeapon | null;
	equippedArrowId: number | null;
	equippedArrowName: string | null;
	arrowMod: number;
	hasMasori: boolean;
	hasEliteVoid: boolean;
	hasZaryteVambraces: boolean;
	crystalShardsNeeded: number;
}

interface DoomTripCostResult {
	cost: Bank;
	brewsUsed: number;
	restoresUsed: number;
	rangingUsed: number;
}

const DOOM_SKILL_REQUIREMENTS: Skills = {
	attack: 85,
	strength: 85,
	defence: 70,
	ranged: 90,
	prayer: 74,
	hitpoints: 90
};

const DOOM_DEMONBANE_WEAPONS = resolveItems(['Darklight', 'Arclight', 'Emberlight']);
const DOOM_CRYSTAL_HALBERD_VARIANTS = resolveItems(['Crystal halberd']);
const DOOM_MAGE_WEAPONS = resolveItems([
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
const DOOM_REQUIRED_RANGE_GEAR: Partial<Record<EquipmentSlot, number[]>> = {
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
};

export function startDoomRun(options: {
	targetDelve: number;
	hasTbow: boolean;
	hasSBow: boolean;
	hasLightbearer: boolean;
	hasZcb: boolean;
	meleePunishWeapon: DoomMeleePunishWeapon;
	hasMasori: boolean;
	hasEliteVoid: boolean;
	hasZaryteVambraces: boolean;
	hasRiteOfVileTransference: boolean;
	hasChargedEyeOfAyak: boolean;
	arrowMod: number;
	waveCompletions: DoomWaveCompletions;
	baseDuration?: number;
	durationReductionPercent: number;
	stopOnUnique: boolean;
	rng: RNGProvider;
}): DoomRunResult {
	const { targetDelve } = options;

	const deathChances = calculateDoomDeathChances(targetDelve, options.waveCompletions);
	let deepestDelveCompleted = 0;
	let deepDelvesEarned = 0;
	let totalWavesCleared = 0;
	let ayakChargesGained = 0;
	const pendingLoot = new Bank();

	const baseDuration =
		options.baseDuration ??
		calculateDoomTripDuration(
			targetDelve,
			options.hasTbow,
			options.hasSBow,
			options.hasZcb,
			options.hasLightbearer,
			options.meleePunishWeapon,
			options.hasMasori,
			options.hasEliteVoid,
			options.hasZaryteVambraces,
			options.hasRiteOfVileTransference,
			options.arrowMod,
			options.rng
		);
	const duration = reduceNumByPercent(baseDuration, options.durationReductionPercent);

	for (let d = 1; d <= targetDelve; d++) {
		const deathChance = deathChances[d - 1];

		if (options.rng.percentChance(deathChance)) {
			return {
				diedAt: d,
				loot: null,
				deepestDelveCompleted,
				deepDelvesEarned,
				totalWavesCleared,
				duration,
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
			const stoppedDuration = reduceNumByPercent(
				scaleDoomDurationForCompletedDelves(baseDuration, d, targetDelve),
				options.durationReductionPercent
			);
			return {
				diedAt: null,
				loot: pendingLoot,
				deepestDelveCompleted: d,
				deepDelvesEarned,
				totalWavesCleared,
				duration: stoppedDuration,
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
		duration,
		deathChances,
		ayakChargesGained
	};
}

const RUBY_BOLT_VARIANTS = ['Ruby bolts (e)', 'Ruby dragon bolts (e)'] as const;

function getDoomGearState(user: DoomUser, targetDelve: number, disableZcbBoost = false): DoomGearState {
	const hasTbow = user.gear.range.hasEquipped('Twisted bow', true, true);
	const hasSBow = user.gear.range.hasEquipped('Scorching bow', true, true);
	const hasChargedEyeOfAyak = user.user.ayak_charges > 0 && user.hasEquippedOrInBank('Eye of ayak');
	const hasLightbearer = user.hasEquippedOrInBank('Lightbearer');
	const ownsZcb = user.hasEquippedOrInBank('Zaryte crossbow');
	const avasDevice = avasDevices.find(avas => user.gear.range.hasEquipped(avas.item.id));
	const zcbBoltsNeeded = calculateDoomZcbBoltsNeeded(targetDelve, avasDevice?.reduction ?? 0);
	const zcbBoltsOwned = RUBY_BOLT_VARIANTS.reduce((total, bolt) => total + user.bank.amount(bolt), 0);
	const zcbBoostDisabled = ownsZcb && (disableZcbBoost || zcbBoltsOwned < zcbBoltsNeeded);
	const hasZcb = ownsZcb && !zcbBoostDisabled;
	const hasRiteOfVileTransference =
		user.user.bitfield.includes(BitField.HasRiteOfVileTransference) &&
		!user.user.bitfield.includes(BitField.DisableRiteOfVileTransference) &&
		user.skillLevel('magic') >= DEATH_CHARGE_MAGIC_LEVEL &&
		user.bank.has(deathChargeCastCost(1));
	const hasNoxHalberd = user.hasEquippedOrInBank('Noxious halberd');
	const hasCrystalHalb = DOOM_CRYSTAL_HALBERD_VARIANTS.some(i => user.hasEquippedOrInBank(i));
	const hasDualMacuahuitl = user.hasEquippedOrInBank('Dual macuahuitl');
	const crystalShardsNeeded = Math.ceil(targetDelve);
	const meleePunishWeapon = selectDoomMeleePunishWeapon({
		hasNoxHalberd,
		hasCrystalHalberd: hasCrystalHalb,
		hasDualMacuahuitl,
		crystalShardsOwned: user.bank.amount('Crystal shard'),
		crystalShardsNeeded
	});

	const equippedAmmo = user.gear.range.get('ammo');
	const equippedArrowId: number | null = equippedAmmo?.item ?? null;
	const equippedArrowName: string | null =
		equippedArrowId !== null ? (Items.itemNameFromId(equippedArrowId) ?? null) : null;

	const hasMasori =
		user.gear.range.hasEquipped('Masori mask (f)') &&
		user.gear.range.hasEquipped('Masori body (f)') &&
		user.gear.range.hasEquipped('Masori chaps (f)');
	const hasEliteVoid =
		user.gear.range.hasEquipped('Void ranger helm') &&
		user.gear.range.hasEquipped('Elite void top') &&
		user.gear.range.hasEquipped('Elite void robe') &&
		user.gear.range.hasEquipped('Void knight gloves');

	return {
		hasTbow,
		hasSBow,
		hasChargedEyeOfAyak,
		hasLightbearer,
		hasZcb,
		zcbBoostDisabled,
		zcbBoltsNeeded,
		zcbBoltsOwned,
		hasRiteOfVileTransference,
		meleePunishWeapon,
		equippedArrowId,
		equippedArrowName,
		arrowMod: getDoomArrowMod(equippedArrowId),
		hasMasori,
		hasEliteVoid,
		hasZaryteVambraces: user.gear.range.hasEquipped('Zaryte vambraces'),
		crystalShardsNeeded
	};
}

function getDoomPreflightError(user: DoomUser, targetDelve: number): string | null {
	if (!user.user.finished_quest_ids.includes(QuestID.TheFinalDawn)) {
		return `You need to complete "The Final Dawn" quest before you can fight the Doom of Mokhaiotl. Send your minion to do the quest using: ${globalClient.mentionCommand('activities', 'quest')}.`;
	}

	if (targetDelve < 1 || targetDelve > MAX_DELVE) {
		return `Target delve must be between 1 and ${MAX_DELVE}. Drop rates cap at delve 9, but death chance continues to increase beyond that.`;
	}

	if (!user.hasSkillReqs(DOOM_SKILL_REQUIREMENTS)) {
		return `You need ${formatSkillRequirements(DOOM_SKILL_REQUIREMENTS)} to fight the Doom of Mokhaiotl.`;
	}

	if (!user.user.bitfield.includes(BitField.HasDexScroll)) {
		return 'You need to use a Dexterous prayer scroll to unlock Rigour before you can fight the Doom of Mokhaiotl.';
	}

	return null;
}

function getDoomGearError(user: DoomUser, state: DoomGearState): string | null {
	if (!state.hasSBow && !state.hasTbow) {
		const ownsTbow = user.hasEquippedOrInBank('Twisted bow');
		const ownsSBow = user.hasEquippedOrInBank('Scorching bow');
		if (ownsTbow || ownsSBow) {
			return 'You have a Twisted bow or Scorching bow but it is not equipped in your **range** setup. Equip it there before fighting the Doom of Mokhaiotl.';
		}
		return 'You need a Twisted bow or Scorching bow equipped in your range setup to fight the Doom of Mokhaiotl. It is required for killing ranged demonic larvae.';
	}

	if (!DOOM_DEMONBANE_WEAPONS.some(i => user.hasEquippedOrInBank(i))) {
		return `You need a demonbane weapon (${formatList(
			DOOM_DEMONBANE_WEAPONS.map(i => Items.itemNameFromId(i)),
			'or'
		)}) to fight the Doom of Mokhaiotl. Its demonic shield cannot be damaged without one.`;
	}

	const hasStaffMageWeapon = DOOM_MAGE_WEAPONS.some(i => user.hasEquippedOrInBank(i));
	if (!state.hasChargedEyeOfAyak && !hasStaffMageWeapon) {
		return `You need a mage weapon to fight the Doom of Mokhaiotl (required for killing mage grubs). Use the Eye of Ayak (with charges) or one of: ${formatList(
			DOOM_MAGE_WEAPONS.map(i => Items.itemNameFromId(i)),
			'or'
		)}.`;
	}

	for (const items of Object.values(DOOM_REQUIRED_RANGE_GEAR)) {
		if (!items.some(g => user.gear.range.hasEquipped(g))) {
			return `You need one of these equipped in your range setup to fight the Doom of Mokhaiotl: ${formatList(
				items.map(i => Items.itemNameFromId(i)),
				'or'
			)}.`;
		}
	}

	if (!state.meleePunishWeapon) {
		return 'You need a melee punish weapon (Noxious halberd, Crystal halberd, or Dual macuahuitl) to fight the Doom of Mokhaiotl. It is required to interrupt the Special Beam Cannon.';
	}

	if (
		state.meleePunishWeapon === 'crystal_halberd' &&
		user.bank.amount('Crystal shard') < state.crystalShardsNeeded
	) {
		return `You need ${state.crystalShardsNeeded.toLocaleString()}x Crystal shard to use Crystal halberd for this trip.`;
	}

	if ((state.hasTbow || state.hasSBow) && state.equippedArrowId === null) {
		return 'You need arrows equipped in your range setup to fight the Doom of Mokhaiotl.';
	}

	return null;
}

function addDoomRuneCosts(cost: Bank, user: DoomUser, userMagicLevel: number, delvesForCost: number) {
	let fireRunes = 0;
	let soulRunes = 0;

	if (userMagicLevel >= 82) {
		fireRunes = 7 * delvesForCost;
		soulRunes = 2 * delvesForCost;
	} else if (userMagicLevel >= 62) {
		fireRunes = 5 * delvesForCost;
		soulRunes = delvesForCost;
	} else {
		fireRunes = 3 * delvesForCost;
		cost.add('Chaos rune', delvesForCost);
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

function getDoomTripCost(options: {
	user: DoomUser;
	state: DoomGearState;
	result: DoomRunResult;
	targetDelve: number;
	userMagicLevel: number;
	venomProtection: DoomVenomProtection;
	deepDelves: number;
	totalDelves: number;
}): DoomTripCostResult {
	const { user, state, result, targetDelve, userMagicLevel, venomProtection, deepDelves, totalDelves } = options;
	const delvesForCost = result.diedAt === null ? result.deepestDelveCompleted : targetDelve;
	const fullDurationMinutes = result.duration / Time.Minute;
	const score = experienceScore(deepDelves, totalDelves);
	const experienceFactor = Math.min(score / 1000, 1);
	const brewsPerMinute = Math.max(0.2, 0.6 - experienceFactor * 0.3);
	const restoresPerMinute = Math.max(0.3, 0.3 + experienceFactor * 0.3);
	const brewsUsed = Math.min(10, Math.max(1, Math.ceil(fullDurationMinutes * brewsPerMinute)));
	const restoresUsed = Math.min(10, Math.max(1, Math.ceil(fullDurationMinutes * restoresPerMinute)));
	const rangingUsed = Math.min(10, Math.max(1, Math.ceil(delvesForCost / 5)));
	const cost = new Bank()
		.add('Saradomin brew(4)', brewsUsed)
		.add('Super restore(4)', restoresUsed)
		.add('Ranging potion(4)', rangingUsed)
		.add(venomProtection.itemCost);

	if (!state.hasChargedEyeOfAyak) {
		addDoomRuneCosts(cost, user, userMagicLevel, delvesForCost);
	}

	if ((state.hasTbow || state.hasSBow) && state.equippedArrowId !== null) {
		const arrowsPerDelve = state.hasTbow ? 15 : 20;
		cost.add(state.equippedArrowId, Math.min(600, Math.ceil(delvesForCost * arrowsPerDelve)));
	}

	if (state.hasZcb) {
		const avasDevice = avasDevices.find(avas => user.gear.range.hasEquipped(avas.item.id));
		const boltsNeeded = calculateDoomZcbBoltsNeeded(delvesForCost, avasDevice?.reduction ?? 0);
		let boltsRemaining = boltsNeeded;
		for (const bolt of RUBY_BOLT_VARIANTS) {
			if (boltsRemaining <= 0) break;
			const owned = user.bank.amount(bolt);
			if (owned > 0) {
				const use = Math.min(owned, boltsRemaining);
				cost.add(bolt, use);
				boltsRemaining -= use;
			}
		}
	}

	if (state.meleePunishWeapon === 'crystal_halberd') cost.add('Crystal shard', Math.ceil(delvesForCost));
	if (state.hasRiteOfVileTransference) {
		const casts = calcDeathChargeCasts({
			bank: user.bank,
			duration: result.duration,
			quantity: delvesForCost
		});
		if (casts > 0) cost.add(deathChargeCastCost(casts));
	}

	return {
		cost,
		brewsUsed,
		restoresUsed,
		rangingUsed
	};
}

async function removeDoomTripCost(
	user: DoomUser,
	cost: Bank,
	venomProtection: DoomVenomProtection
): Promise<Bank | string> {
	const realCost = new Bank();
	try {
		const result = await user.specialRemoveItems(cost);
		realCost.add(result.realCost);
	} catch (err: unknown) {
		if (err instanceof UserError) return err.message;
		throw err;
	}
	if (venomProtection.replacementItems.length > 0) {
		await user.addItemsToBank({ items: venomProtection.replacementItems, collectionLog: false });
		realCost.remove(venomProtection.itemCost).add(venomProtection.effectiveCost);
	}
	return realCost;
}

function buildDoomBoostLines(state: DoomGearState, kcReduction: number, skillBoostMsg: string): string[] {
	const boostLines: string[] = [];

	if (state.hasTbow) boostLines.push('10% for Twisted bow');
	else boostLines.push(`${SCORCHING_BOW_SPEED_PENALTY}% slower for Scorching bow`);

	if (state.equippedArrowId !== null) {
		const pct = Math.round(Math.abs(state.arrowMod) * 100);
		const displayName = state.equippedArrowName ?? Items.itemNameFromId(state.equippedArrowId) ?? 'Unknown arrow';
		boostLines.push(state.arrowMod < 0 ? `${pct}% for ${displayName}` : `${pct}% slower for ${displayName}`);
	}

	if (state.meleePunishWeapon === 'noxious_halberd') {
		boostLines.push(`${NOXIOUS_HALBERD_SPEED_BOOST}% for ${getDoomMeleePunishWeaponName(state.meleePunishWeapon)}`);
	}

	if (state.hasMasori) boostLines.push(`${MASORI_SPEED_BOOST}% for Masori armour`);
	else if (state.hasEliteVoid) boostLines.push(`${ELITE_VOID_SPEED_BOOST}% for Elite void`);
	if (state.hasZaryteVambraces) boostLines.push(`${ZARYTE_VAMBRACES_SPEED_BOOST}% for Zaryte vambraces`);
	if (kcReduction >= 1) boostLines.push(`${kcReduction}% for KC`);
	boostLines.push(skillBoostMsg);
	if (state.hasLightbearer) boostLines.push(`${LIGHTBEARER_SPEED_BOOST}% for Lightbearer`);
	if (state.hasRiteOfVileTransference) {
		boostLines.push(`${RITE_OF_VILE_TRANSFERENCE_SPEED_BOOST}% for Rite of vile transference`);
	}
	if (state.hasChargedEyeOfAyak) boostLines.push('Eye of ayak replacing mage grub rune costs');
	if (state.hasZcb) boostLines.push(`${ZCB_SPEED_BOOST}% for Zaryte crossbow`);
	else {
		if (state.zcbBoostDisabled) {
			boostLines.push('Zaryte crossbow boost skipped (missing Ruby bolts (e)/Ruby dragon bolts (e))');
		}
		if (state.meleePunishWeapon === 'crystal_halberd') {
			boostLines.push(
				`${CRYSTAL_HALBERD_SPEED_BOOST}% for ${getDoomMeleePunishWeaponName(state.meleePunishWeapon)}`
			);
		}
	}

	return boostLines;
}

function buildDoomDeathChanceLine(deathChances: number[]): string {
	const runDeathChance = calculateDoomRunDeathChance(deathChances);
	const wipeChanceBeforeTarget = calculateDoomWipeChanceBeforeTarget(deathChances);
	const targetDelveDeathChance = deathChances.at(-1) ?? 0;

	if (runDeathChance.expectedDeathWave !== null) {
		return `**Wipe chance before target delve:** ${formatDoomDeathChance(
			wipeChanceBeforeTarget
		)} | **Target delve death chance:** ${formatDoomDeathChance(
			targetDelveDeathChance
		)} | **Expected death:** Delve ${round(runDeathChance.expectedDeathWave, 1)}`;
	}

	return `**Wipe chance before target delve:** ${formatDoomDeathChance(
		wipeChanceBeforeTarget
	)} | **Target delve death chance:** ${formatDoomDeathChance(targetDelveDeathChance)}`;
}

export async function doomCommand(
	itx: OSInteraction,
	targetDelve: number,
	stopOnUnique = true,
	disableZcbBoost = false
) {
	const { user, rng } = itx;

	if (await user.minionIsBusy()) {
		return `${user.usernameOrMention} is busy`;
	}

	const preflightError = getDoomPreflightError(user, targetDelve);
	if (preflightError) return preflightError;

	const state = getDoomGearState(user, targetDelve, disableZcbBoost);
	const gearError = getDoomGearError(user, state);
	if (gearError) return gearError;
	if (!state.meleePunishWeapon) throw new Error('Doom gear validated without a melee punish weapon.');
	if (state.zcbBoostDisabled && !disableZcbBoost) {
		await itx.confirmation(
			`You have a Zaryte crossbow, but need ${state.zcbBoltsNeeded.toLocaleString()}x Ruby bolts (e) or Ruby dragon bolts (e) for the ZCB boost and only own ${state.zcbBoltsOwned.toLocaleString()} total. Continue without the ZCB boost?`
		);
	}
	const userMagicLevel = user.skillLevel('magic');

	const stats = await user.fetchStats();
	const deepDelves = Number(stats.doom_deep_delves ?? 0);
	const totalDelves = Number(stats.doom_total_delves ?? 0);
	const waveCompletions = normaliseDoomWaveCompletions(
		(stats as { doom_wave_completions?: unknown }).doom_wave_completions
	);
	const doomKC = Math.max(await user.getKC(EMonster.DOOM_OF_MOKHAIOTL), deepDelves);
	const baseDuration = calculateDoomTripDuration(
		targetDelve,
		state.hasTbow,
		state.hasSBow,
		state.hasZcb,
		state.hasLightbearer,
		state.meleePunishWeapon,
		state.hasMasori,
		state.hasEliteVoid,
		state.hasZaryteVambraces,
		state.hasRiteOfVileTransference,
		state.arrowMod,
		rng
	);
	const kcReduction = calculateDoomKcReduction(doomKC, baseDuration);
	const [durationAfterSkillBoost, skillBoostMsg] = applyDoomSkillBoost(
		user.skillsAsLevels as Required<Skills>,
		reduceNumByPercent(baseDuration, kcReduction)
	);
	const durationReductionPercent = calcWhatPercent(baseDuration - durationAfterSkillBoost, baseDuration);

	const res = startDoomRun({
		targetDelve,
		hasTbow: state.hasTbow,
		hasSBow: state.hasSBow,
		hasLightbearer: state.hasLightbearer,
		hasZcb: state.hasZcb,
		meleePunishWeapon: state.meleePunishWeapon,
		hasMasori: state.hasMasori,
		hasEliteVoid: state.hasEliteVoid,
		hasZaryteVambraces: state.hasZaryteVambraces,
		hasRiteOfVileTransference: state.hasRiteOfVileTransference,
		hasChargedEyeOfAyak: state.hasChargedEyeOfAyak,
		arrowMod: state.arrowMod,
		waveCompletions,
		baseDuration,
		durationReductionPercent,
		stopOnUnique,
		rng
	});
	const venomProtection = selectDoomVenomProtection(itemName => user.bank.amount(itemName), res.duration);
	if (!venomProtection) {
		return `You need enough doses of ${formatList(
			DOOM_VENOM_PROTECTION_OPTIONS.map(option => option.potionName),
			'or'
		)} to cover this ${formatDuration(res.duration)} Doom trip.`;
	}

	const costResult = getDoomTripCost({
		user,
		state,
		result: res,
		targetDelve,
		userMagicLevel,
		venomProtection,
		deepDelves,
		totalDelves
	});

	const realCost = await removeDoomTripCost(user, costResult.cost, venomProtection);
	if (typeof realCost === 'string') return realCost;

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
		duration: res.duration,
		fakeDuration: res.duration,
		type: 'DoomOfMokhaiotl',
		targetDelve,
		xpTargetDelve: res.diedAt === null ? res.deepestDelveCompleted : targetDelve,
		diedAt: res.diedAt,
		loot: res.loot?.toJSON() ?? {},
		deepDelvesEarned: res.deepDelvesEarned,
		totalWavesCleared: res.totalWavesCleared,
		deepestDelveCompleted: res.deepestDelveCompleted,
		stopOnUnique,
		ayakChargesGained: res.ayakChargesGained,
		brewsUsed: costResult.brewsUsed,
		restoresUsed: costResult.restoresUsed,
		rangingUsed: costResult.rangingUsed,
		disableZcbBoost: state.zcbBoostDisabled || undefined
	});

	return [
		`${user.usernameOrMention}'s minion is now fighting the **Doom of Mokhaiotl** (targeting delve **${targetDelve}**)!`,
		`**Duration:** ${formatDuration(res.duration)} | **Stop on unique:** ${stopOnUnique ? 'Yes' : 'No'}`,
		buildDoomDeathChanceLine(res.deathChances),
		`**Cost:** ${realCost}`,
		`**Boosts:** ${buildDoomBoostLines(state, kcReduction, skillBoostMsg).join(', ')}`
	].join('\n');
}
