import type { EquipmentSlot, GearSetupType } from '@oldschoolgg/gear';
import {
	formatDuration,
	GeneralBank,
	type GeneralBankType,
	objectEntries,
	Time,
	UserError
} from '@oldschoolgg/toolkit';
import { Bank, type ItemBank, Items, LootTable, resolveItems } from 'oldschooljs';
import { clamp } from 'remeda';

import { trackLoot } from '@/lib/lootTrack.js';
import { QuestID } from '@/lib/minions/data/quests.js';
import type { Skills } from '@/lib/types/index.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { formatList, formatSkillRequirements } from '@/lib/util/smallUtils.js';
import { doomOfMokhaiotlCL } from '@/lib/data/CollectionsExport.js';

function cappedDelve(delveLevel: number): number {
	return Math.min(delveLevel, 9);
}

function buildDelveTable(delveLevel: number): LootTable {
	const multipliers: Record<number, number> = {
		1: -0.50, 2: -0.35, 3: 0.00, 4: 0.05, 5: 0.10,
		6: 0.12,  7: 0.14,  8: 0.17, 9: 0.20
	};
	const mult = multipliers[cappedDelve(delveLevel)] ?? 0.20;

	function qty(base: number): number {
		return Math.max(1, Math.trunc(base + base * mult));
	}

	const clueRate = delveLevel <= 2 ? 75 : 50;

	const table = new LootTable()
		.add('Dragon med helm',              1,                     5)
		.add('Dragon platelegs',             [2, 4],                1)
		.add('Mystic earth staff',           1,                     5)
		.add('Rune pickaxe',                 [1, 3],                5)
		.add('Death rune',                   [qty(50), qty(70)],    5)
		.add('Chaos rune',                   [qty(50), qty(70)],    5)
		.add('Earth rune',                   [qty(500), qty(1000)], 5)
		.add('Fire rune',                    [qty(500), qty(1000)], 5)
		.add('Cannonball',                   [qty(200), qty(600)],  5)
		.add('Onyx bolts',                   [qty(5), qty(15)],     5)
		.add('Coal',                         [qty(15), qty(50)],    5)
		.add('Gold ore',                     [qty(20), qty(60)],    5)
		.add('Runite ore',                   [qty(3), qty(6)],      5)
		.add('Celastrus seed',               1,                     3)
		.add('Ranarr seed',                  [1, 3],                2)
		.add('Spirit seed',                  1,                     3)
		.add('Aether catalyst',              [qty(150), qty(400)],  5)
		.add('Dragon dart tip',              [qty(30), qty(90)],    5)
		.add('Raw shark',                    [qty(20), qty(35)],    3)
		.add('Shark lure',                   [qty(40), qty(70)],    2)
		.add('Sun-kissed bones',             [qty(25), qty(75)],    5)
		.add('Tooth half of key (moon key)', 1,                     1)
		.add('Demon tear',                   [qty(100), qty(300)],  7)
		.add('Mokhaiotl waystone',           delveLevel <= 1 ? 1 : [1, 2], 7)
		.tertiary(clueRate, 'Clue scroll (elite)');

	const cd = cappedDelve(delveLevel);

	const clothRates: Record<number, number> = {
		2: 2500, 3: 2000, 4: 1350, 5: 810,
		6: 765,  7: 720,  8: 630,  9: 540
	};
	if (cd >= 2) table.tertiary(clothRates[cd] ?? 540, 'Mokhaiotl cloth');

	const eyeRates: Record<number, number> = {
		3: 2000, 4: 1350, 5: 810,
		6: 765,  7: 720,  8: 630, 9: 540
	};
	if (cd >= 3) table.tertiary(eyeRates[cd] ?? 540, 'Eye of ayak (uncharged)');

	const treadRates: Record<number, number> = {
		4: 1350, 5: 810,
		6: 765,  7: 720, 8: 630, 9: 540
	};
	if (cd >= 4) table.tertiary(treadRates[cd] ?? 540, 'Avernic treads');

	const petRates: Record<number, number> = {
		6: 1000, 7: 750, 8: 500, 9: 250
	};
	if (cd >= 6) table.tertiary(petRates[cd] ?? 250, 'Dom');

	return table;
}

const doomLootTables: LootTable[] = Array.from({ length: 9 }, (_, i) => buildDelveTable(i + 1));

function getDoomLootTable(delveLevel: number): LootTable {
	return doomLootTables[Math.min(delveLevel, 9) - 1];
}

interface Delve {
	delveLevel: number;
	guaranteedTears: number;
	table: LootTable;
}

export const MAX_DELVE = 30;

export const doomDelves: Delve[] = Array.from({ length: MAX_DELVE }, (_, i) => {
	const delveLevel = i + 1;
	const guaranteedTears = delveLevel < 3 ? 0 : delveLevel === 3 ? 50 : Math.min(100, 50 + (delveLevel - 3) * 10);
	return { delveLevel, guaranteedTears, table: getDoomLootTable(delveLevel) };
});

export class DoomDelveKCBank extends GeneralBank<number> {
	deepDelves = 0;
	constructor(initialBank?: GeneralBankType<number>) {
		super({
			initialBank,
			allowedKeys: Array.from({ length: MAX_DELVE }, (_, i) => i + 1),
			valueSchema: { floats: true, min: 0, max: 999_999 }
		});
	}

	addDelveKC(delveLevel: number) {
		if (delveLevel >= 8) this.deepDelves++;
		this.add(delveLevel, 1);
	}
}

function calculateDeathChance(delve: number, kc: number, hasEmberlight: boolean, hasArclight: boolean): number {
	let base = delve <= 5 ? 2 + delve : delve <= 10 ? 5 + (delve-5)*2 : 15 + (delve-10)*2;

	const kcFactor = 1 - Math.exp(-kc/40);
	const kcReduction = base * 0.3 * kcFactor;

	let chance = base - kcReduction;

	if (hasEmberlight) chance *= 0.85;
	if (hasArclight) chance *= 0.92;

	return clamp(chance, { min: 1, max: 50 });
}

function calculateTripDuration(targetDelve: number, rng: RNGProvider): number {
	const baseDelveTime = 10 * Time.Minute;
	const extraPerDelve = 1.5 * Time.Minute;
	const extraTime = Math.max(0, targetDelve - 8) * extraPerDelve;

	const variance = rng.randFloat(0.85, 1.15);

	const duration = (baseDelveTime + extraTime) * variance;

	return Math.min(duration, 17 * Time.Minute);
}

export interface DoomRunResult {
	diedAt: number | null;
	loot: Bank | null;
	deepestDelveCompleted: number;
	fakeDuration: number;
	realDuration: number;
	deathChances: number[];
	kcBank: DoomDelveKCBank;
}

export function startDoomRun(options: {
	targetDelve: number;
	hasEmberlight: boolean;
	hasArclight: boolean;
	hasTbow: boolean;
	hasSBow: boolean;
	hasLightbearer: boolean;
	hasZcb: boolean;
	kcBank: DoomDelveKCBank;
	stopOnUnique: boolean;
	rng: RNGProvider;
}): DoomRunResult {
	const { targetDelve, kcBank } = options;

	const uniqueItems = resolveItems([
		'Mokhaiotl cloth',
		'Eye of ayak (uncharged)',
		'Avernic treads',
		'Dom'
	]);

	const deathChances: number[] = [];
	let deepestDelveCompleted = 0;
	const pendingLoot = new Bank();

	const fakeDuration = calculateTripDuration(targetDelve, options.rng);
	const realDuration = fakeDuration;

	for (let d = 1; d <= targetDelve; d++) {
		const delveKC = kcBank.amount(d);

		const deathChance = calculateDeathChance(
			d,
			delveKC,
			options.hasEmberlight,
			options.hasArclight
		);

		deathChances.push(deathChance);

		if (options.rng.percentChance(deathChance)) {
			// Minion dies at this delve
			return {
				diedAt: d,
				loot: null,
				deepestDelveCompleted,
				fakeDuration,
				realDuration,
				deathChances,
				kcBank
			};
		}

		deepestDelveCompleted = d;

		const delve = doomDelves[d - 1];
		const lootRoll = delve.table.roll();
		pendingLoot.add(lootRoll);

		if (delve.guaranteedTears > 0) {
			pendingLoot.add('Demon tear', delve.guaranteedTears);
		}

		kcBank.addDelveKC(d);

		if (options.stopOnUnique && uniqueItems.some(id => lootRoll.has(id))) {
			return {
				diedAt: null,
				loot: pendingLoot,
				deepestDelveCompleted: d,
				fakeDuration,
				realDuration,
				deathChances,
				kcBank
			};
		}
	}

	// Survived all delves
	return {
		diedAt: null,
		loot: pendingLoot,
		deepestDelveCompleted,
		fakeDuration,
		realDuration,
		deathChances,
		kcBank
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
		return `Target delve must be between 1 and ${MAX_DELVE}. Note: drop rates cap at delve 9, but death chance continues to increase beyond that.`;
	}

	const skillReqs: Skills = {
		attack: 85,
		strength: 85,
		defence: 70,
		ranged: 90,
		prayer: 77,
		hitpoints: 90
	};

	if (!user.hasSkillReqs(skillReqs)) {
		return `You need ${formatSkillRequirements(skillReqs)} to fight the Doom of Mokhaiotl.`;
	}

	const hasSBow = user.hasEquippedOrInBank('Scorching bow');
	const hasTbow = user.gear.range.hasEquipped('Twisted bow', true, true);
	if (!hasSBow && !hasTbow) {
		return `You need a Scorching bow (or Twisted bow) to fight the Doom of Mokhaiotl. It is required for killing ranged demonic larvae.`;
	}

	const demonbaneWeapons = resolveItems(['Darklight', 'Arclight', 'Emberlight']);
	if (!demonbaneWeapons.some(i => user.hasEquippedOrInBank(i))) {
		return `You need a demonbane weapon (${formatList(
			demonbaneWeapons.map(i => Items.itemNameFromId(i)),
			'or'
		)}) to fight the Doom of Mokhaiotl. Its shield cannot be damaged without one.`;
	}

	const meleeWeapons = resolveItems(['Scythe of vitur', 'Noxious halberd', 'Crystal halberd', 'Dual macuahuitl']);
	if (!meleeWeapons.some(i => user.hasEquippedOrInBank(i))) {
		return `You need a melee punish weapon (${formatList(
			meleeWeapons.map(i => Items.itemNameFromId(i)),
			'or'
		)}) to fight the Doom of Mokhaiotl. It is required to interrupt the Special Beam Cannon.`;
	}

	const requiredItems: Partial<Record<GearSetupType, Partial<Record<EquipmentSlot, number[]>>>> = {
		range: {
			head: resolveItems(['Masori mask (f)', 'Masori mask', 'Void ranger helm', 'Armadyl helmet']),
			body: resolveItems(['Masori body (f)', 'Masori body', 'Elite void top', 'Armadyl chestplate']),
			legs: resolveItems(['Masori chaps (f)', 'Masori chaps', 'Elite void robe', 'Armadyl chainskirt']),
			neck: resolveItems(['Necklace of anguish', 'Amulet of fury']),
			cape: resolveItems(["Dizana's quiver", "Ava's assembler", "Ava's accumulator"]),
			feet: resolveItems(['Avernic treads', 'Pegasian boots', 'Aranea boots']),
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

	const hasEmberlight  = user.gear.melee.hasEquipped('Emberlight', true, true);
	const hasArclight    = !hasEmberlight && user.gear.melee.hasEquipped('Arclight', true, true);
	const hasLightbearer = user.hasEquippedOrInBank('Lightbearer');
	const hasZcb         = user.hasEquippedOrInBank('Zaryte crossbow');
	const hasScythe      = user.hasEquippedOrInBank('Scythe of vitur');
	const hasCrystalHalb = user.hasEquippedOrInBank('Crystal halberd');

	const kcBank = new DoomDelveKCBank((await user.fetchStats()).doom_kc_bank as ItemBank);

	const res = startDoomRun({
		kcBank,
		targetDelve,
		hasEmberlight,
		hasArclight,
		hasTbow,
		hasSBow,
		hasLightbearer,
		hasZcb,
		stopOnUnique,
		rng
	});

	const delvesAttempted = res.diedAt ?? res.deepestDelveCompleted;
	const durationMinutes = res.realDuration / Time.Minute;
	const deepestKC = kcBank.amount(targetDelve);
	const experienceFactor = Math.min(1, deepestKC / 50);

	// Brews decrease and restores increase with experience
	const brewsPerMinute  = Math.max(0.2, 0.6 - experienceFactor * 0.3);
	const restoresPerMinute = Math.max(0.3, 0.3 + experienceFactor * 0.3);

	const cost = new Bank()
		.add('Saradomin brew(4)',        Math.max(1, Math.ceil(durationMinutes * brewsPerMinute)))
		.add('Super restore(4)',         Math.max(1, Math.ceil(durationMinutes * restoresPerMinute)))
		.add('Divine ranging potion(4)', Math.max(1, Math.ceil(delvesAttempted / 5)))
		.add('Ranging potion(4)',        Math.max(1, Math.ceil(delvesAttempted / 5)));

	if (hasTbow) cost.add('Dragon arrow', Math.ceil(durationMinutes * 14));
	else cost.add('Amethyst arrow', Math.ceil(durationMinutes * 20));

	if (hasZcb) cost.add('Ruby bolts (e)', Math.ceil(delvesAttempted * 5));
	if (hasCrystalHalb) cost.add('Crystal shard', Math.ceil(delvesAttempted));
	if (hasScythe && targetDelve <= 5) cost.add('Blood rune', Math.ceil(delvesAttempted * 3));

	const bonusMessages = [
		hasTbow ? 'Twisted bow - best-in-slot ranged weapon' : 'Scorching bow - bring a Twisted bow for best performance',
		hasEmberlight ? 'Emberlight: -12% death chance' : hasArclight ? 'Arclight: -6% death chance' : 'Darklight: minimum demonbane weapon',
		hasLightbearer ? 'Lightbearer: faster spec energy recovery' : 'No Lightbearer - highly recommended for spec boosts',
		hasZcb ? 'Zaryte crossbow: 100% accurate spec during car phase' : hasCrystalHalb ? 'Crystal halberd: best melee punish spec option' : 'No spec weapon - bring a Zaryte crossbow or Crystal halberd',
		(hasScythe && targetDelve <= 5) ? 'Scythe of vitur for melee punish (delves 1-5)' : hasCrystalHalb ? 'Crystal halberd for melee punish' : ''
	].filter(Boolean);

	const realCost = new Bank();
	try {
		const result = await user.specialRemoveItems(cost);
		realCost.add(result.realCost);
	} catch (err: unknown) {
		if (err instanceof UserError) return err.message;
		throw err;
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
		kcBank: res.kcBank._bank
	});

	const timeStr = formatDuration(res.fakeDuration);
	const removedItemsStr = realCost.toString();

	return `:minion: Your minion is now attempting the Doom of Mokhaiotl, targeting delve **${targetDelve}**. It'll take around ${timeStr} to finish.
Bonuses: ${bonusMessages.join(', ')}
Removed items: ${removedItemsStr}`;
}

export class DoomOfMokhaiotlSingleton {
	id: number;
	name: string;
	aliases: string[];

	constructor(options: { id: number; name: string; aliases: string[] }) {
		this.id = options.id;
		this.name = options.name;
		this.aliases = options.aliases;
	}

	get allItems() {
		return [];
	}
}

export const DoomOfMokhaiotl = {
	id: 14708,
	name: 'Doom of Mokhaiotl',
	aliases: ['doom', 'mokhaiotl', 'mokha', 'osto-ayak', 'ostayak'],
	allItems: doomOfMokhaiotlCL,
	items: doomOfMokhaiotlCL,
	fmtProg: (kcBank: DoomDelveKCBank) => {
		const deepDelves = kcBank.deepDelves;
		const totalDelves = Array.from({ length: MAX_DELVE }, (_, i) => kcBank.amount(i + 1)).reduce((a, b) => a + b, 0);
		return `Deep Delves KC: ${deepDelves}, Delves Completed: ${totalDelves}`;
	}
};