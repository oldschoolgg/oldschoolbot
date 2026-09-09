import type { EquipmentSlot } from '@oldschoolgg/gear';
import {
	calcWhatPercent,
	Emoji,
	formatDuration,
	isWeekend,
	reduceNumByPercent,
	round,
	Time,
	UserError
} from '@oldschoolgg/toolkit';
import { Bank, EMonster, Items, LootTable, resolveItems } from 'oldschooljs';

import { BitField, globalConfig } from '@/lib/constants.js';
import { avasDevices, doomOfMokhaiotlCL } from '@/lib/data/CollectionsExport.js';
import {
	applyDoomSkillBoost,
	CRYSTAL_HALBERD_SPEED_BOOST,
	calculateDoomDeathChances,
	calculateDoomDelveTrekDeathChance,
	calculateDoomDelveTrekDuration,
	calculateDoomKcReduction,
	calculateDoomWipeChanceBeforeTarget,
	calculateDoomZcbBoltsNeeded,
	DOOM_VENOM_PROTECTION_OPTIONS,
	type DoomDelveCompletions,
	type DoomMeleePunishWeapon,
	type DoomVenomProtection,
	ELITE_VOID_SPEED_BOOST,
	formatDoomDeathChance,
	getDoomArrowMod,
	getDoomMeleePunishWeaponName,
	LIGHTBEARER_SPEED_BOOST,
	MASORI_SPEED_BOOST,
	MAX_DELVE,
	NOXIOUS_HALBERD_SPEED_BOOST,
	normaliseDoomDelveCompletions,
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
import type { DoomActivityDelveTrekData, DoomTaskOptions } from '@/lib/types/minions.js';
import { autoDecantBank } from '@/lib/util/autoDecantBank.js';
import { formatList, formatSkillRequirements } from '@/lib/util/smallUtils.js';

export const DOOM_UNIQUE_ITEMS = resolveItems(['Mokhaiotl cloth', 'Eye of ayak (uncharged)', 'Avernic treads', 'Dom']);

export {
	calculateDeathChance,
	calculateDoomDelveTrekDeathChance,
	calculateDoomDelveTrekDuration,
	calculateDoomEarlyDeathSupplyRefund,
	calculateDoomWipeChanceBeforeTarget,
	calculateDoomXP,
	calculateDoomZcbBoltsNeeded,
	MAX_DELVE,
	normaliseDoomDelveCompletions,
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

// A Delve is one individual in-game level within a complete Delve Trek.
interface DoomDelveLevelEntry {
	delveLevel: number;
	guaranteedTears: number;
	table: LootTable;
}

// A Delve Trek is one complete attempt from Delve 1 until cash-out, a unique stop, or death.
export interface DoomDelveTrekResult {
	diedAt: number | null;
	loot: Bank | null;
	lastDelve: number;
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

export const doomDelves: DoomDelveLevelEntry[] = Array.from({ length: MAX_DELVE }, (_, i) => {
	const delveLevel = i + 1;
	const guaranteedTears = delveLevel < 3 ? 0 : delveLevel === 3 ? 50 : Math.min(100, 50 + (delveLevel - 3) * 10);
	return {
		delveLevel,
		guaranteedTears,
		table: buildDelveTable(delveLevel)
	};
});

function experienceScore(deepDelves: number, totalDelves: number): number {
	return totalDelves + deepDelves * 2;
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

interface DoomDelveTrekCostResult {
	cost: Bank;
	brewsUsed: number;
	restoresUsed: number;
	rangingUsed: number;
}

function doomResultFromActivityDelveTrek(delveTrek: DoomActivityDelveTrekData): DoomDelveTrekResult {
	return {
		diedAt: delveTrek.diedAt ?? null,
		loot: delveTrek.loot ? new Bank(delveTrek.loot) : null,
		lastDelve: delveTrek.lastDelve,
		duration: delveTrek.dur,
		deathChances: [],
		ayakChargesGained: delveTrek.ayak ?? 0
	};
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

export function startDoomDelveTrek(options: {
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
	delveCompletions: DoomDelveCompletions;
	baseDuration?: number;
	durationReductionPercent: number;
	stopOnUnique: boolean;
	rng: RNGProvider;
}): DoomDelveTrekResult {
	const { targetDelve } = options;

	const deathChances = calculateDoomDeathChances(targetDelve, options.delveCompletions);
	let lastDelve = 0;
	let ayakChargesGained = 0;
	const pendingLoot = new Bank();

	const baseDuration =
		options.baseDuration ??
		calculateDoomDelveTrekDuration(
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
				lastDelve: d,
				duration: deathDuration,
				deathChances,
				ayakChargesGained
			};
		}

		lastDelve = d;

		const delveLevel = doomDelves[d - 1];
		const delveRoll = delveLevel.table.roll();
		pendingLoot.add(delveRoll);
		if (delveLevel.guaranteedTears > 0) pendingLoot.add('Demon tear', delveLevel.guaranteedTears);

		if (options.hasChargedEyeOfAyak) {
			ayakChargesGained += options.rng.randInt(10, 20);
		}

		if (options.stopOnUnique && DOOM_UNIQUE_ITEMS.some(id => delveRoll.has(id))) {
			const stoppedDuration = reduceNumByPercent(
				scaleDoomDurationForCompletedDelves(baseDuration, d, targetDelve),
				options.durationReductionPercent
			);
			return {
				diedAt: null,
				loot: pendingLoot,
				lastDelve: d,
				duration: stoppedDuration,
				deathChances,
				ayakChargesGained
			};
		}
	}

	return {
		diedAt: null,
		loot: pendingLoot,
		lastDelve,
		duration,
		deathChances,
		ayakChargesGained
	};
}

const DOOM_ARROWS_PER_HOUR = 500;

export function calculateDoomArrowsNeeded(duration: number): number {
	return Math.max(1, Math.ceil((duration / Time.Hour) * DOOM_ARROWS_PER_HOUR));
}

export function getDoomActivityDelveTreks(data: DoomTaskOptions): DoomActivityDelveTrekData[] {
	return (data.delveTreks ?? data.delves ?? []).map(delveTrek => ({
		...delveTrek,
		lastDelve: delveTrek.lastDelve ?? delveTrek.lastWave ?? 0
	}));
}

export function hasCompletedDoomDelveTrek(delveTreks: DoomActivityDelveTrekData[], targetDelve = 1): boolean {
	return delveTreks.some(delveTrek => !delveTrek.dead && delveTrek.lastDelve >= targetDelve);
}

function describeMissingSupplies(availableSupplies: Bank, cost: Bank): string {
	const missing = cost.clone().remove(availableSupplies);
	return `${missing}`;
}

function describeDoomVenomShortfall(availableSupplies: Bank, duration: number, wastedDoses: number): string {
	return DOOM_VENOM_PROTECTION_OPTIONS.map(option => {
		const dosesNeeded = wastedDoses + Math.ceil(duration / option.venomImmunityDuration);
		const dosesOwned = [1, 2, 3, 4].reduce(
			(total, dose) => total + dose * availableSupplies.amount(`${option.potionName}(${dose})`),
			0
		);
		return `${option.potionName}: need ${dosesNeeded} doses, only have ${dosesOwned}`;
	}).join('; ');
}

function takeDoomVenomProtection(
	availableSupplies: Bank,
	potionRemainders: Bank,
	duration: number,
	wastedDoses: number
): DoomVenomProtection | null {
	const venomProtection = selectDoomVenomProtection(
		itemName => availableSupplies.amount(itemName) + potionRemainders.amount(itemName),
		duration,
		wastedDoses
	);
	if (!venomProtection) return null;

	const physicalItemCost = new Bank();
	for (const [item, quantity] of venomProtection.itemCost.items()) {
		const remainderQuantity = Math.min(quantity, potionRemainders.amount(item.id));
		if (remainderQuantity > 0) potionRemainders.remove(item.id, remainderQuantity);

		const physicalQuantity = quantity - remainderQuantity;
		if (physicalQuantity > availableSupplies.amount(item.id)) {
			throw new Error(`Doom venom allocation exceeded available ${item.name}`);
		}
		if (physicalQuantity > 0) {
			availableSupplies.remove(item.id, physicalQuantity);
			physicalItemCost.add(item.id, physicalQuantity);
		}
	}
	potionRemainders.add(venomProtection.replacementItems);

	return { ...venomProtection, itemCost: physicalItemCost };
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
		return `You need ${state.crystalShardsNeeded.toLocaleString()}x Crystal shard to use Crystal halberd for this delve.`;
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

function addDoomRuneCosts(cost: Bank, bank: Bank, userMagicLevel: number, delveLevelsForCost: number) {
	let fireRunes = 0;
	let soulRunes = 0;

	if (userMagicLevel >= 82) {
		fireRunes = 7 * delveLevelsForCost;
		soulRunes = 2 * delveLevelsForCost;
	} else if (userMagicLevel >= 62) {
		fireRunes = 5 * delveLevelsForCost;
		soulRunes = delveLevelsForCost;
	} else {
		fireRunes = 3 * delveLevelsForCost;
		cost.add('Chaos rune', delveLevelsForCost);
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

function getDoomDelveTrekCost(options: {
	user: DoomUser;
	state: DoomGearState;
	result: DoomDelveTrekResult;
	userMagicLevel: number;
	venomProtection: Pick<DoomVenomProtection, 'itemCost'>;
	deepDelves: number;
	totalDelves: number;
	availableSupplies?: Bank;
	arrowEstimateDuration?: number;
}): DoomDelveTrekCostResult {
	const { user, state, result, userMagicLevel, venomProtection, deepDelves, totalDelves } = options;
	const availableSupplies = options.availableSupplies ?? user.bank;
	const delveLevelsForCost = result.lastDelve;
	const fullDurationMinutes = result.duration / Time.Minute;
	const score = experienceScore(deepDelves, totalDelves);
	const experienceFactor = Math.min(score / 20, 1);
	const learningFactor = 1 - experienceFactor;
	const brewsPerMinute = 0.2 + learningFactor * 0.6;
	const restoresPerMinute = 0.1 + learningFactor * 0.3;
	const brewsUsed = Math.min(10, Math.max(1, Math.ceil(fullDurationMinutes * brewsPerMinute)));
	const restoresUsed = Math.min(10, Math.max(1, Math.ceil(fullDurationMinutes * restoresPerMinute)));
	const rangingUsed = Math.min(10, Math.max(1, Math.ceil(delveLevelsForCost / 5)));
	const cost = new Bank()
		.add('Saradomin brew(4)', brewsUsed)
		.add('Super restore(4)', restoresUsed)
		.add('Ranging potion(4)', rangingUsed)
		.add(venomProtection.itemCost);

	if (!state.hasChargedEyeOfAyak) {
		addDoomRuneCosts(cost, availableSupplies, userMagicLevel, delveLevelsForCost);
	}

	if ((state.hasTbow || state.hasSBow) && state.equippedArrowId !== null) {
		const arrowDuration = options.arrowEstimateDuration ?? result.duration;
		if (arrowDuration > 0) cost.add(state.equippedArrowId, calculateDoomArrowsNeeded(arrowDuration));
	}

	if (state.hasZcb) {
		const avasDevice = avasDevices.find(avas => user.gear.range.hasEquipped(avas.item.id));
		const boltsNeeded = calculateDoomZcbBoltsNeeded(delveLevelsForCost, avasDevice?.reduction ?? 0);
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

	if (state.meleePunishWeapon === 'crystal_halberd') cost.add('Crystal shard', Math.ceil(delveLevelsForCost));
	if (state.hasRiteOfVileTransference) {
		const casts = calcDeathChargeCasts({
			bank: availableSupplies,
			duration: result.duration,
			quantity: delveLevelsForCost
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

async function removeDoomTaskCost(
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
	const delveTrekDeathChance = calculateDoomDelveTrekDeathChance(deathChances);
	const wipeChanceBeforeTarget = calculateDoomWipeChanceBeforeTarget(deathChances);
	const targetDelveDeathChance = deathChances.at(-1) ?? 0;

	if (delveTrekDeathChance.expectedDeathDelve !== null) {
		return `\n**Wipe chance before target delve:** ${formatDoomDeathChance(
			wipeChanceBeforeTarget
		)} | **Target delve death chance:** ${formatDoomDeathChance(
			targetDelveDeathChance
		)} | **Expected death:** Delve ${round(delveTrekDeathChance.expectedDeathDelve, 1)}\n`;
	}

	return `\n**Wipe chance before target delve:** ${formatDoomDeathChance(
		wipeChanceBeforeTarget
	)} | **Target delve death chance:** ${formatDoomDeathChance(targetDelveDeathChance)}\n`;
}

export async function doomCommand(
	itx: OSInteraction,
	targetDelve = MAX_DELVE,
	stopOnUnique = true,
	disableZcbBoost = false,
	quantity?: number,
	check = false
) {
	const { user, rng } = itx;

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
	// The database column keeps its legacy name, but its keys represent individual in-game Delves.
	const delveCompletions = normaliseDoomDelveCompletions(
		(stats as { doom_wave_completions?: unknown }).doom_wave_completions
	);
	const doomKC = Math.max(await user.getKC(EMonster.DOOM_OF_MOKHAIOTL), deepDelves);
	const baseDuration = calculateDoomDelveTrekDuration(
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
	const durationReductionPercentWithoutWaystone = calcWhatPercent(
		baseDuration - durationAfterSkillBoost,
		baseDuration
	);
	const durationAfterWaystone = state.hasMokhaiotlWaystone
		? reduceNumByPercent(durationAfterSkillBoost, MOKHAIOTL_WAYSTONE_SPEED_BOOST)
		: durationAfterSkillBoost;
	const durationReductionPercent = calcWhatPercent(baseDuration - durationAfterWaystone, baseDuration);
	const mokhaiotlWaystonesOwned = user.bank.amount('Mokhaiotl waystone');

	const delveTrekOptions = {
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
		delveCompletions,
		baseDuration,
		durationReductionPercent,
		stopOnUnique,
		rng
	};
	const fullDelveTrekDuration = Math.floor(reduceNumByPercent(baseDuration, durationReductionPercent));
	const fullDelveTrekDurationWithoutWaystone = Math.floor(
		reduceNumByPercent(baseDuration, durationReductionPercentWithoutWaystone)
	);
	const weekendMod = isWeekend() ? 1.2 : 1.1;
	const maxTripLength = Math.floor(
		Math.max(
			rng.randomVariation((await user.calcMaxTripLength('DoomOfMokhaiotl')) * weekendMod, 10),
			fullDelveTrekDuration
		)
	);

	function plannedDelveTrekDuration(index: number): number {
		return index < mokhaiotlWaystonesOwned ? fullDelveTrekDuration : fullDelveTrekDurationWithoutWaystone;
	}
	function plannedTaskDuration(delveTrekQuantity: number): number {
		const boostedDelveTreks = Math.min(delveTrekQuantity, mokhaiotlWaystonesOwned);
		return (
			boostedDelveTreks * fullDelveTrekDuration +
			(delveTrekQuantity - boostedDelveTreks) * fullDelveTrekDurationWithoutWaystone
		);
	}
	let maxDelveTrekQuantity = 0;
	let maxPlannedDuration = 0;
	while (
		maxDelveTrekQuantity === 0 ||
		maxPlannedDuration + plannedDelveTrekDuration(maxDelveTrekQuantity) <= maxTripLength
	) {
		maxPlannedDuration += plannedDelveTrekDuration(maxDelveTrekQuantity);
		maxDelveTrekQuantity++;
	}

	if (quantity && plannedTaskDuration(quantity) > maxTripLength) {
		return `You can't do that many Doom of Mohkaiotl Delve Treks! If you want to maximize your task length, then don't specify a quantity and you will do as many Delve Treks as you can by default.`;
	}

	const delveTreks: DoomActivityDelveTrekData[] = [];
	let totalDuration = 0;
	const delveTreksToAttempt = quantity ?? Number.POSITIVE_INFINITY;
	const fakeDuration = quantity ? plannedTaskDuration(quantity) : maxTripLength;
	while (delveTreks.length < delveTreksToAttempt) {
		delveTrekOptions.durationReductionPercent =
			delveTreks.length < mokhaiotlWaystonesOwned
				? durationReductionPercent
				: durationReductionPercentWithoutWaystone;
		const delveTrek = startDoomDelveTrek(delveTrekOptions);
		const delveTrekDuration = Math.floor(delveTrek.duration);
		totalDuration += delveTrekDuration;
		delveTreks.push({
			dur: delveTrekDuration,
			dead: delveTrek.diedAt !== null,
			lastDelve: delveTrek.lastDelve,
			loot: delveTrek.loot?.toJSON(),
			diedAt: delveTrek.diedAt ?? undefined,
			ayak: delveTrek.ayakChargesGained || undefined
		});

		if (totalDuration > maxTripLength) break;
	}
	// This shouldn't happen since the task always attempts at least one Delve Trek.
	if (delveTreks.length === 0) {
		void itx.reply({ content: 'Doom Error: No Delve Treks successfully added. Please report this.' });
		throw new Error('Doom Error: No Delve Treks successfully added');
	}
	const DELETE_COPY_originalDelveTreks = delveTreks.map(delveTrek => ({
		...delveTrek,
		loot: delveTrek.loot ? { ...delveTrek.loot } : undefined
	}));
	let removedDelveTreks = false;
	// Keep this target- and outcome-independent. Charging from actual Delve Trek results leaks outcomes and is gameable.
	const fullDelveTrekCostResult: DoomDelveTrekResult = {
		diedAt: null,
		loot: null,
		lastDelve: targetDelve,
		duration: fullDelveTrekDuration,
		deathChances: [],
		ayakChargesGained: 0
	};
	function buildEstimatedCost(
		delveTrekQuantity: number
	): { cost: Bank; venomCost: Bank; effectiveVenomCost: Bank } | { reason: string } {
		const availableSupplies = user.bank.clone();
		const potionRemainders = new Bank();
		const cost = new Bank();
		const venomCost = new Bank();
		const effectiveVenomCost = new Bank();
		const taskSupplyEstimateDuration = quantity ? plannedTaskDuration(delveTrekQuantity) : maxTripLength * 1.25;

		for (let index = 0; index < delveTrekQuantity; index++) {
			const estimateDuration = plannedDelveTrekDuration(index);
			const venomProtection = takeDoomVenomProtection(
				availableSupplies,
				potionRemainders,
				estimateDuration * 1.1,
				1
			);
			if (!venomProtection) {
				const venomAvailable = availableSupplies.clone().add(potionRemainders);
				return {
					reason: `no venom-protection type covers Delve Trek ${index + 1}: ${describeDoomVenomShortfall(
						venomAvailable,
						estimateDuration * 1.1,
						1
					)}`
				};
			}
			cost.add(venomProtection.itemCost);
			venomCost.add(venomProtection.itemCost);
			effectiveVenomCost.add(venomProtection.effectiveCost);

			const delveTrekCost = getDoomDelveTrekCost({
				user,
				state,
				result: { ...fullDelveTrekCostResult, duration: estimateDuration },
				userMagicLevel,
				venomProtection: { itemCost: new Bank() },
				deepDelves,
				totalDelves,
				availableSupplies,
				arrowEstimateDuration: index === 0 ? taskSupplyEstimateDuration : 0
			});
			if (!availableSupplies.has(delveTrekCost.cost)) {
				return { reason: describeMissingSupplies(availableSupplies, delveTrekCost.cost) };
			}
			availableSupplies.remove(delveTrekCost.cost);
			cost.add(delveTrekCost.cost);
		}

		return {
			cost,
			venomCost,
			effectiveVenomCost
		};
	}
	function logRemovedDelveTreks(title: string, color: string, list: DoomActivityDelveTrekData[]) {
		console.info(`${color}${title}\x1b[0m`);
		for (const delveTrek of list) {
			const cost = getDoomDelveTrekCost({
				user,
				state,
				result: doomResultFromActivityDelveTrek(delveTrek),
				userMagicLevel,
				venomProtection: { itemCost: new Bank() },
				deepDelves,
				totalDelves
			}).cost;
			console.info(
				`${delveTrek.diedAt ? `Died at: ${delveTrek.diedAt} | ` : ''}Delve: ${delveTrek.lastDelve} | Duration: ${formatDuration(delveTrek.dur)} | Cost: ${cost}`
			);
		}
	}
	let estimate = buildEstimatedCost(delveTreks.length);
	if ('reason' in estimate && quantity)
		return `You don't have enough supplies to complete this many Doom of Mokhaiotl Delve Treks. Missing: ${estimate.reason}`;
	while ('reason' in estimate && delveTreks.length > 1) {
		const removedDelveTrek = delveTreks.pop()!;
		totalDuration -= removedDelveTrek.dur;
		removedDelveTreks = true;
		console.info(`Delve Trek removed because: ${estimate.reason}`);
		estimate = buildEstimatedCost(delveTreks.length);
	}
	if ('reason' in estimate)
		return `You don't have enough supplies to complete a Doom of Mokhaiotl Delve Trek. Missing: ${estimate.reason}`;
	if (removedDelveTreks) {
		logRemovedDelveTreks('ORIGINAL LIST', '\x1b[33m', DELETE_COPY_originalDelveTreks);
		logRemovedDelveTreks('NEW LIST', '\x1b[31m', delveTreks);
	}
	const {
		cost: estimatedCost,
		venomCost: estimatedVenomCost,
		effectiveVenomCost: estimatedEffectiveVenomCost
	} = estimate;
	const suppliesUsed = new Bank();
	const venomItemsUsed = new Bank();
	const venomItemsRefunded = new Bank();
	const actualSuppliesAvailable = user.bank.clone();
	const actualVenomSupplies = estimatedVenomCost.clone();
	const actualVenomRemainders = new Bank();
	const effectiveVenomCost = new Bank();

	for (const delveTrek of delveTreks) {
		const delveTrekCost = getDoomDelveTrekCost({
			user,
			state,
			result: doomResultFromActivityDelveTrek(delveTrek),
			userMagicLevel,
			venomProtection: { itemCost: new Bank() },
			deepDelves,
			totalDelves,
			availableSupplies: actualSuppliesAvailable,
			arrowEstimateDuration: 0
		});
		actualSuppliesAvailable.remove(delveTrekCost.cost);
		suppliesUsed.add(delveTrekCost.cost);

		// Venom protection is chosen independently for each Delve Trek, so later Treks can use another potion type.
		const delveTrekCostVenomProtection = takeDoomVenomProtection(
			actualVenomSupplies,
			actualVenomRemainders,
			delveTrek.dur + Time.Second * 30,
			delveTrek.diedAt ? 1 : 0
		);
		if (!delveTrekCostVenomProtection) {
			return 'Doom Error: The estimated venom protection did not cover the simulated Delve Treks. Please report this.';
		}
		venomItemsUsed.add(delveTrekCostVenomProtection.itemCost);
		effectiveVenomCost.add(delveTrekCostVenomProtection.effectiveCost);
	}
	venomItemsRefunded.add(actualVenomRemainders);
	suppliesUsed.add(venomItemsUsed);
	if ((state.hasTbow || state.hasSBow) && state.equippedArrowId !== null) {
		suppliesUsed.add(state.equippedArrowId, calculateDoomArrowsNeeded(totalDuration));
	}
	const refundedSupplies = new Bank();
	const refundedAmmo = new Bank();

	const deathChances = calculateDoomDeathChances(targetDelve, delveCompletions);
	const costRemovalResult = await removeDoomTaskCost(user, estimatedCost, {
		itemCost: estimatedVenomCost,
		replacementItems: new Bank(),
		effectiveCost: estimatedEffectiveVenomCost
	});
	if (typeof costRemovalResult === 'string') return costRemovalResult;
	const { removedCost, effectiveCost } = costRemovalResult;
	if ((state.hasTbow || state.hasSBow) && state.equippedArrowId !== null) {
		const estimatedArrows = estimatedCost.amount(state.equippedArrowId);
		const actualArrows = suppliesUsed.amount(state.equippedArrowId);
		const physicallyRemovedArrows = removedCost.amount(state.equippedArrowId);
		const physicallyUsedArrows =
			estimatedArrows > 0
				? Math.min(
						physicallyRemovedArrows,
						Math.ceil((actualArrows / estimatedArrows) * physicallyRemovedArrows)
					)
				: 0;
		suppliesUsed.remove(state.equippedArrowId, actualArrows).add(state.equippedArrowId, physicallyUsedArrows);
	}
	// Calculate refund, or notify Cyr if there's a cuck up
	try {
		if (!estimatedCost.has(suppliesUsed)) {
			const error = new Error('Doom: actual supplies exceeded the outcome-independent estimate');
			void globalClient.sendDm(globalConfig.adminUserIDs[0], `${error.message} for ${user.id}.`);
			Logging.logError(error, { estimatedCost, suppliesUsed, delveTreks });
		}
		const refund = removedCost.clone().remove(suppliesUsed).add(venomItemsRefunded);
		refundedSupplies.add(autoDecantBank(refund));
		if (state.equippedArrowId !== null) {
			const refundQuantity = refundedSupplies.amount(state.equippedArrowId);
			if (refundQuantity > 0) {
				refundedAmmo.add(state.equippedArrowId, refundQuantity);
				refundedSupplies.remove(state.equippedArrowId, refundQuantity);
			}
		}
	} catch (err) {
		const now = Date.now();
		void globalClient.sendDm(globalConfig.adminUserIDs[0], `Error calculating refund at ${now}: ${err}`);
		Logging.logError(new Error('Doom: Error calculating refund'), {
			timestamp: now,
			estimatedCost,
			removedCost,
			suppliesUsed,
			actualVenomSupplies,
			actualVenomRemainders
		});
	}

	await ClientSettings.updateBankSetting('doom_cost', effectiveCost);
	await user.statsBankUpdate('doom_cost', effectiveCost);
	await trackLoot({
		totalCost: effectiveCost,
		id: 'doom_of_mokhaiotl',
		type: 'Monster',
		changeType: 'cost',
		users: [{ id: user.id, cost: effectiveCost }]
	});
	const taskLoot = new Bank();
	for (const delveTrek of delveTreks) {
		if (!delveTrek.dead && delveTrek.loot) taskLoot.add(delveTrek.loot);
	}

	await ActivityManager.startTrip<DoomTaskOptions>({
		userID: user.id,
		channelId: itx.channelId,
		duration: totalDuration,
		fakeDuration,
		type: 'DoomOfMokhaiotl',
		targetDelve,
		delveTreks,
		loot: taskLoot.toJSON(),
		refund: refundedSupplies.toJSON(),
		refundAmmo: refundedAmmo.toJSON(),
		stopOnUnique,
		disableZcbBoost: state.zcbBoostDisabled || undefined
	});

	const quantityString = quantity
		? `${delveTreks.length}x Delve Treks up to Delve **${targetDelve}**!`
		: `Attempting as many Delve Treks as possible, each up to Delve ${targetDelve}.`;

	return [
		`${user.usernameOrMention}'s minion is now fighting the **Doom of Mokhaiotl** ${quantityString}`,

		`**Duration:** ${formatDuration(fakeDuration)} | **Stop on unique:** ${stopOnUnique ? 'Yes' : 'No'}`,
		buildDoomDeathChanceLine(deathChances),
		`**Cost:** ${removedCost}\n`,
		`**Boosts:** ${buildDoomBoostLines(state, kcReduction, skillBoostMsg).join(', ')}`,
		targetDelve > 15
			? `\n*Doom levels beyond 15 are considered, "__not worth the time__," but you can try if you would like ${Emoji.Joy}*. You will only use the supplies and time for levels actually completed, so you are not wasting anything.`
			: ''
	].join('\n');
}
