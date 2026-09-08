import type { EquipmentSlot } from '@oldschoolgg/gear';
import {
	calcWhatPercent,
	formatDuration,
	isWeekend,
	reduceNumByPercent,
	round,
	Time,
	UserError
} from '@oldschoolgg/toolkit';
import { Bank, EMonster, type ItemBank, Items, LootTable, resolveItems } from 'oldschooljs';

import { BitField, globalConfig } from '@/lib/constants.js';
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
import { autoDecantPotions } from '@/lib/util/autoDecantPotions.js';
import { formatList, formatSkillRequirements } from '@/lib/util/smallUtils.js';

export const DOOM_UNIQUE_ITEMS = resolveItems(['Mokhaiotl cloth', 'Eye of ayak (uncharged)', 'Avernic treads', 'Dom']);

export {
	calculateDeathChance,
	calculateDoomEarlyDeathSupplyRefund,
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

export function rollDoomRegularLoot(delveLevel: number): Bank {
	const entry = doomDelves[delveLevel - 1];
	const loot = entry.table.roll();
	for (const itemID of DOOM_UNIQUE_ITEMS) {
		const amount = loot.amount(itemID);
		if (amount > 0) loot.remove(itemID, amount);
	}
	if (entry.guaranteedTears > 0) loot.add('Demon tear', entry.guaranteedTears);
	return loot;
}

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
	hasMokhaiotlWaystone: boolean;
}

interface DoomTripCostResult {
	cost: Bank;
	brewsUsed: number;
	restoresUsed: number;
	rangingUsed: number;
}

interface DoomActivityTripData {
	dur: number;
	dead: boolean;
	lvl: number;
	loot?: ItemBank;
	diedAt?: number;
	ayak?: number;
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
const MOKHAIOTL_WAYSTONE_SPEED_BOOST = 2;
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
			const deathDuration = reduceNumByPercent(
				scaleDoomDurationForCompletedDelves(baseDuration, d, targetDelve),
				options.durationReductionPercent
			);
			return {
				diedAt: d,
				loot: null,
				deepestDelveCompleted,
				deepDelvesEarned,
				totalWavesCleared,
				duration: deathDuration,
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
		crystalShardsNeeded,
		hasMokhaiotlWaystone: user.bank.has('Mokhaiotl waystone')
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

function checkLine(passed: boolean, text: string): string {
	return `${passed ? '✅' : '❌'} ${text}`;
}

function buildDoomRequirementsChecklist(user: DoomUser, targetDelve: number, state: DoomGearState): string {
	const lines = [
		checkLine(user.user.finished_quest_ids.includes(QuestID.TheFinalDawn), 'Completed "The Final Dawn" quest.'),
		checkLine(targetDelve >= 1 && targetDelve <= MAX_DELVE, `Target delve is between 1 and ${MAX_DELVE}.`),
		checkLine(
			user.hasSkillReqs(DOOM_SKILL_REQUIREMENTS),
			`Stats: ${formatSkillRequirements(DOOM_SKILL_REQUIREMENTS)}.`
		),
		checkLine(
			user.user.bitfield.includes(BitField.HasDexScroll),
			'Rigour unlocked from a Dexterous prayer scroll.'
		),
		checkLine(state.hasSBow || state.hasTbow, 'Twisted bow or Scorching bow equipped in your range setup.'),
		checkLine(
			DOOM_DEMONBANE_WEAPONS.some(i => user.hasEquippedOrInBank(i)),
			`Demonbane weapon owned: ${formatList(
				DOOM_DEMONBANE_WEAPONS.map(i => Items.itemNameFromId(i)),
				'or'
			)}.`
		),
		checkLine(
			state.hasChargedEyeOfAyak || DOOM_MAGE_WEAPONS.some(i => user.hasEquippedOrInBank(i)),
			'Eye of Ayak with charges or a mage weapon for mage grubs.'
		),
		...Object.entries(DOOM_REQUIRED_RANGE_GEAR).map(([slot, items]) =>
			checkLine(
				items.some(g => user.gear.range.hasEquipped(g)),
				`Range ${slot}: ${formatList(
					items.map(i => Items.itemNameFromId(i)),
					'or'
				)}.`
			)
		),
		checkLine(
			Boolean(state.meleePunishWeapon),
			'Melee punish weapon: Noxious halberd, Crystal halberd, or Dual macuahuitl.'
		),
		checkLine(
			state.meleePunishWeapon !== 'crystal_halberd' ||
				user.bank.amount('Crystal shard') >= state.crystalShardsNeeded,
			`${state.crystalShardsNeeded.toLocaleString()}x Crystal shard for Crystal halberd.`
		),
		checkLine(
			!(state.hasTbow || state.hasSBow) || state.equippedArrowId !== null,
			'Arrows equipped in your range setup.'
		)
	];

	return `**Doom of Mokhaiotl requirements for delve ${targetDelve}:**\n${lines.join('\n')}`;
}

function addDoomRuneCosts(cost: Bank, bank: Bank, userMagicLevel: number, delvesForCost: number) {
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
		const owned = bank.amount(rune);
		if (owned > 0) {
			const use = Math.min(owned, fireRemaining);
			cost.add(rune, use);
			fireRemaining -= use;
		}
	}
	if (fireRemaining > 0) cost.add('Fire rune', fireRemaining);

	if (soulRunes > 0) {
		const soulOwned = bank.amount('Soul rune');
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
	userMagicLevel: number;
	venomProtection: Pick<DoomVenomProtection, 'itemCost'>;
	deepDelves: number;
	totalDelves: number;
	availableSupplies?: Bank;
}): DoomTripCostResult {
	const { user, state, result, userMagicLevel, venomProtection, deepDelves, totalDelves } = options;
	const availableSupplies = options.availableSupplies ?? user.bank;
	const delvesForCost = result.diedAt ?? result.deepestDelveCompleted;
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
		addDoomRuneCosts(cost, availableSupplies, userMagicLevel, delvesForCost);
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
			const owned = availableSupplies.amount(bolt);
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
			bank: availableSupplies,
			duration: result.duration,
			quantity: delvesForCost
		});
		if (casts > 0) cost.add(deathChargeCastCost(casts));
	}
	if (state.hasMokhaiotlWaystone && availableSupplies.has('Mokhaiotl waystone')) cost.add('Mokhaiotl waystone');

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
	venomProtection: Pick<DoomVenomProtection, 'itemCost' | 'replacementItems' | 'effectiveCost'>
): Promise<{ removedCost: Bank; effectiveCost: Bank } | string> {
	const removedCost = new Bank();
	try {
		const result = await user.specialRemoveItems(cost);
		removedCost.add(result.realCost);
	} catch (err: unknown) {
		if (err instanceof UserError) return err.message;
		throw err;
	}
	const effectiveCost = removedCost.clone();
	if (venomProtection.itemCost.length > 0) {
		effectiveCost.remove(venomProtection.itemCost).add(venomProtection.effectiveCost);
	}
	return { removedCost, effectiveCost };
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
	if (state.hasMokhaiotlWaystone) boostLines.push(`${MOKHAIOTL_WAYSTONE_SPEED_BOOST}% for Mokhaiotl waystone`);
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
		return `\n**Wipe chance before target delve:** ${formatDoomDeathChance(
			wipeChanceBeforeTarget
		)} | **Target delve death chance:** ${formatDoomDeathChance(
			targetDelveDeathChance
		)} | **Expected death:** Delve ${round(runDeathChance.expectedDeathWave, 1)}\n`;
	}

	return `\n**Wipe chance before target delve:** ${formatDoomDeathChance(
		wipeChanceBeforeTarget
	)} | **Target delve death chance:** ${formatDoomDeathChance(targetDelveDeathChance)}\n`;
}

export async function doomCommand(
	itx: OSInteraction,
	targetDelve: number,
	stopOnUnique = true,
	disableZcbBoost = false,
	quantity?: number,
	check = false
) {
	const { user, rng } = itx;
	const effectiveStopOnUnique = quantity ? stopOnUnique : true;

	if (!Number.isInteger(targetDelve)) return 'Target delve must be a whole number.';
	if (quantity !== undefined && (!Number.isInteger(quantity) || quantity < 1))
		return 'Quantity must be a positive whole number.';

	const state = getDoomGearState(user, targetDelve, disableZcbBoost);
	if (check) return buildDoomRequirementsChecklist(user, targetDelve, state);

	if (await user.minionIsBusy()) {
		return `${user.usernameOrMention} is busy`;
	}

	const preflightError = getDoomPreflightError(user, targetDelve);
	if (preflightError) return preflightError;

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
	const durationReductionPercentWithoutWaystone = calcWhatPercent(baseDuration - durationAfterSkillBoost, baseDuration);
	const durationAfterWaystone = state.hasMokhaiotlWaystone
		? reduceNumByPercent(durationAfterSkillBoost, MOKHAIOTL_WAYSTONE_SPEED_BOOST)
		: durationAfterSkillBoost;
	const durationReductionPercent = calcWhatPercent(baseDuration - durationAfterWaystone, baseDuration);
	const mokhaiotlWaystonesOwned = user.bank.amount('Mokhaiotl waystone');

	const tripOptions = {
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
		stopOnUnique: effectiveStopOnUnique,
		rng
	};
	const fullTripDuration = Math.floor(reduceNumByPercent(baseDuration, durationReductionPercent));
	const weekendMod = isWeekend() ? 1.2 : 1.1;
	const maxTripLength = Math.floor(
		Math.max(
			rng.randomVariation((await user.calcMaxTripLength('DoomOfMokhaiotl')) * weekendMod, 10),
			fullTripDuration
		)
	);

	const maxTripQuantity = Math.max(1, Math.floor(maxTripLength / fullTripDuration));

	console.log('maxTripLength', formatDuration(maxTripLength));
	const fakeDuration = quantity ? quantity * fullTripDuration : maxTripLength;
	console.log('fakeDuration', formatDuration(fakeDuration));
	if (quantity && quantity > maxTripQuantity) {
		return `The max amount of trips you can do at Delve ${targetDelve} is ${maxTripQuantity.toLocaleString()}, try a lower quantity. Doing ${quantity.toLocaleString()}x would take ${formatDuration(
			quantity * fullTripDuration
		)}. If you want to maximize your trip length, then don't specify a quantity and you will do as many as you can by default.`;
	}

	const trips: DoomActivityTripData[] = [];
	const fullTripCostResult: DoomRunResult = {
		diedAt: null,
		loot: null,
		deepestDelveCompleted: targetDelve,
		deepDelvesEarned: Math.max(0, targetDelve - 7),
		totalWavesCleared: targetDelve,
		duration: fullTripDuration,
		deathChances: [],
		ayakChargesGained: 0
	};
	let totalDuration = 0;
	const tripsToAttempt = quantity ?? Number.POSITIVE_INFINITY;
	while (trips.length < tripsToAttempt) {
		tripOptions.durationReductionPercent =
			trips.length < mokhaiotlWaystonesOwned ? durationReductionPercent : durationReductionPercentWithoutWaystone;
		const trip = startDoomRun(tripOptions);
		const tripDuration = Math.floor(trip.duration);
		totalDuration += tripDuration;
		const uniqueLoot = new Bank();
		if (trip.loot) {
			for (const itemID of DOOM_UNIQUE_ITEMS) {
				const qty = trip.loot.amount(itemID);
				if (qty > 0) uniqueLoot.add(itemID, qty);
			}
		}
		trips.push({
			dur: tripDuration,
			dead: trip.diedAt !== null,
			lvl: trip.deepestDelveCompleted,
			loot: uniqueLoot.length > 0 ? uniqueLoot.toJSON() : undefined,
			diedAt: trip.diedAt ?? undefined,
			ayak: trip.ayakChargesGained || undefined
		});

		if (totalDuration > maxTripLength) break;
	}
	console.log('totalDuration', formatDuration(totalDuration));
	// This shouldn't happen since we always allow at least 1 trip
	if (trips.length === 0) {
		void itx.reply({ content: 'Doom Error: No trips successfully added. Please report this.' });
		throw new Error('Doom Error: No trips successfully added');
	}
	function buildEstimatedCost(tripQuantity: number) {
		const availableSupplies = user.bank.clone();
		const venomProtection = selectDoomVenomProtection(
			itemName => availableSupplies.amount(itemName),
			fullTripDuration * tripQuantity * 1.1,
			tripQuantity
		);
		if (!venomProtection) return null;
		const cost = new Bank().add(venomProtection.itemCost);
		if (!availableSupplies.has(venomProtection.itemCost)) return null;
		availableSupplies.remove(venomProtection.itemCost);

		for (let i = 0; i < tripQuantity; i++) {
			const tripCost = getDoomTripCost({
				user,
				state,
				result: fullTripCostResult,
				userMagicLevel,
				venomProtection: { itemCost: new Bank() },
				deepDelves,
				totalDelves,
				availableSupplies
			});
			if (!availableSupplies.has(tripCost.cost)) return null;
			availableSupplies.remove(tripCost.cost);
			cost.add(tripCost.cost);
		}

		return {
			cost,
			venomCost: venomProtection.itemCost,
			effectiveVenomCost: venomProtection.effectiveCost
		};
	}
	let estimated = buildEstimatedCost(trips.length);
	if (!estimated && quantity) return "You don't have enough supplies to complete this many Doom of Mokhaiotl trips.";
	while (!estimated && trips.length > 1) {
		const removedTrip = trips.pop()!;
		totalDuration -= removedTrip.dur;
		console.log('Doom of Mokhaiotl trip popped for supplies', {
			userID: user.id,
			targetDelve,
			tripsRemaining: trips.length,
			removedTrip
		});
		estimated = buildEstimatedCost(trips.length);
	}
	if (!estimated) return "You don't have enough supplies to complete a Doom of Mokhaiotl trip.";
	const {
		cost: estimatedCost,
		venomCost: estimatedVenomCost,
		effectiveVenomCost: estimatedEffectiveVenomCost
	} = estimated;
	const suppliesUsed = new Bank();
	const venomItemsUsed = new Bank();
	const venomItemsRefunded = new Bank();
	const tripSuppliesAvailable = user.bank.clone();
	const effectiveVenomCost = new Bank();
	// One wasted dose of antivenom per death, plus 30 seconds of duration per trip.
	let antivenomWastedDoses = 0;
	// Calculate how much venom duration is needed for the trip; there's always some waste.
	let antivenomDurationNeeded = Time.Second * 30 * trips.length;

	for (const trip of trips) {
		const tripCost = getDoomTripCost({
			user,
			state,
			result: {
				diedAt: trip.diedAt ?? null,
				loot: null,
				deepestDelveCompleted: trip.lvl,
				deepDelvesEarned: Math.max(0, trip.lvl - 7),
				totalWavesCleared: trip.lvl,
				duration: trip.dur,
				deathChances: [],
				ayakChargesGained: trip.ayak ?? 0
			},
			userMagicLevel,
			venomProtection: { itemCost: new Bank() },
			deepDelves,
			totalDelves,
			availableSupplies: tripSuppliesAvailable
		});
		if (trip.diedAt) antivenomWastedDoses++;
		tripSuppliesAvailable.remove(tripCost.cost);
		antivenomDurationNeeded += trip.dur;
		suppliesUsed.add(tripCost.cost);
	}
	const tripCostVenomProtection = selectDoomVenomProtection(
		itemName => tripSuppliesAvailable.amount(itemName),
		antivenomDurationNeeded,
		antivenomWastedDoses
	);
	if (tripCostVenomProtection) {
		venomItemsUsed.add(tripCostVenomProtection.itemCost);
		venomItemsRefunded.add(tripCostVenomProtection.replacementItems);
		effectiveVenomCost.add(tripCostVenomProtection.effectiveCost);
	}
	suppliesUsed.add(venomItemsUsed);
	const refundedSupplies = new Bank();
	// Calculate refund, or notify Cyr if there's a cuck up
	try {
		console.log('estimatedCost', `${estimatedCost}`);
		console.log('suppliesUsed', `${suppliesUsed}`);
		const diff = estimatedCost.clone().remove(suppliesUsed);
		console.log('diff', `${diff}`);
		refundedSupplies.add(autoDecantPotions(diff));
	} catch (err) {
		const now = Date.now();
		void globalClient.sendDm(globalConfig.adminUserIDs[0], `Error calculating refund at ${now}: ${err}`);
		Logging.logError(new Error('Doom: Error calculating refund'), {
			timestamp: now,
			estimatedCost,
			suppliesUsed,
			tripCostVenomProtection
		});
	}

	const deepestDelveCompletedForTask = Math.max(...trips.map(trip => trip.lvl));
	const totalWavesClearedForTask = trips.reduce((sum, trip) => sum + trip.lvl, 0);
	const deepDelvesEarnedForTask = trips.reduce((sum, trip) => sum + Math.max(0, trip.lvl - 7), 0);
	const ayakChargesGainedForTask = trips.reduce((sum, trip) => sum + (trip.ayak ?? 0), 0);
	const diedAtForTask = trips.length === 1 ? (trips[0].diedAt ?? null) : null;
	const deathChances = calculateDoomDeathChances(targetDelve, waveCompletions);
	const costRemovalResult = await removeDoomTripCost(user, estimatedCost, {
		itemCost: estimatedVenomCost,
		replacementItems: new Bank(),
		effectiveCost: estimatedEffectiveVenomCost
	});
	if (typeof costRemovalResult === 'string') return costRemovalResult;
	const { removedCost, effectiveCost } = costRemovalResult;
	const refund = removedCost.clone().remove(suppliesUsed).add(venomItemsRefunded);

	await ClientSettings.updateBankSetting('doom_cost', effectiveCost);
	await user.statsBankUpdate('doom_cost', effectiveCost);
	await trackLoot({
		totalCost: effectiveCost,
		id: 'doom_of_mokhaiotl',
		type: 'Monster',
		changeType: 'cost',
		users: [{ id: user.id, cost: effectiveCost }]
	});

	await ActivityManager.startTrip<DoomTaskOptions>({
		userID: user.id,
		channelId: itx.channelId,
		duration: totalDuration,
		fakeDuration,
		type: 'DoomOfMokhaiotl',
		targetDelve,
		quantity: trips.length,
		xpTargetDelve: deepestDelveCompletedForTask,
		diedAt: diedAtForTask,
		loot: {},
		trips,
		refund: refund.toJSON(),
		deepDelvesEarned: deepDelvesEarnedForTask,
		totalWavesCleared: totalWavesClearedForTask,
		deepestDelveCompleted: deepestDelveCompletedForTask,
		stopOnUnique: effectiveStopOnUnique,
		ayakChargesGained: ayakChargesGainedForTask,
		brewsUsed: suppliesUsed.amount('Saradomin brew(4)'),
		restoresUsed: suppliesUsed.amount('Super restore(4)'),
		rangingUsed: suppliesUsed.amount('Ranging potion(4)'),
		disableZcbBoost: state.zcbBoostDisabled || undefined
	});

	return [
		quantity
			? `${user.usernameOrMention}'s minion is now fighting the **Doom of Mokhaiotl** ${trips.length}x (targeting delve **${targetDelve}**)!`
			: `${user.usernameOrMention}'s minion is now fighting the **Doom of Mokhaiotl**! Attempting to do as many trips as possible up to level ${targetDelve}.`,
		`**Duration:** ${formatDuration(fakeDuration)} | **Stop on unique:** ${effectiveStopOnUnique ? 'Yes' : 'No'}`,
		buildDoomDeathChanceLine(deathChances),
		`**Cost:** ${removedCost}`,
		`**Boosts:** ${buildDoomBoostLines(state, kcReduction, skillBoostMsg).join(', ')}`,
		targetDelve > 15
			? 'Doom levels beyond 15 are not worth the time, but you can try if you would like :). You will only use the supplies and time for levels actually completed, so you are not wasting anything.'
			: ''
	].join('\n');
}
