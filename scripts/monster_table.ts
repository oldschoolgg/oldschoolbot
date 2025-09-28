import { TSVWriter } from '@oldschoolgg/toolkit/structures';
import { calcPerHour, Time } from '@oldschoolgg/toolkit/util';
import type { PlayerOwnedHouse } from '@prisma/client';
import { Bank, convertBankToPerHourStats, Items, itemID, resolveItems, toKMB } from 'oldschooljs';
import { omit } from 'remeda';

applyStaticDefine();

import '../src/lib/safeglobals';

import { maxMage, maxMelee, maxRange } from '@/lib/bso/depthsOfAtlantis.js';
import { materialTypes } from '@/lib/bso/skills/invention/index.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { type BitField, PVM_METHODS } from '@/lib/constants.js';
import { degradeableItems } from '@/lib/degradeableItems.js';
import { SlayerActivityConstants } from '@/lib/minions/data/combatConstants.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import { SkillsArray } from '@/lib/skilling/types.js';
import { slayerMasters } from '@/lib/slayer/slayerMasters.js';
import { SlayerRewardsShop, type SlayerTaskUnlocksEnum } from '@/lib/slayer/slayerUnlocks.js';
import { ChargeBank } from '@/lib/structures/Banks.js';
import { Gear } from '@/lib/structures/Gear.js';
import { GearBank } from '@/lib/structures/GearBank.js';
import { KCBank } from '@/lib/structures/KCBank.js';
import { MUserStats } from '@/lib/structures/MUserStats.js';
import {
	type MinionKillReturn,
	newMinionKillCommand
} from '@/mahoji/lib/abstracted_commands/minionKill/newMinionKill.js';
import { doMonsterTrip } from '@/tasks/minions/monsterActivity.js';
import { applyStaticDefine } from '../meta.js';

const MAX_TRIP_LENGTH = Time.Hour * 600;
const skills = ['attack', 'strength', 'defence', 'magic', 'ranged', 'hitpoints', 'slayer'];

function round(int: number) {
	return Math.round(int / 1000) * 1000;
}
const slayerUnlocks: SlayerTaskUnlocksEnum[] = SlayerRewardsShop.map(i => i.id);
const bank = new Bank();
for (const item of Items.values()) bank.add(item.id, 1000000);
bank.add('Black chinchompa', 100000000);
const chargeBank = new ChargeBank();
for (const deg of degradeableItems) chargeBank.add(deg.settingsKey, 1000000);
const results: { tripResult: ReturnType<typeof doMonsterTrip>; commandResult: MinionKillReturn }[] = [];
const userStats = new MUserStats({ sacrificed_bank: {} } as any);

const attackStyleSets: AttackStyles[][] = [
	['attack', 'strength', 'defence'],
	['ranged'],
	['magic'],
	['ranged', 'defence'],
	['magic', 'defence']
];

const skillsAsXP: any = {};
const skillsAsLevels: any = {};
for (const skill of SkillsArray) {
	skillsAsLevels[skill] = 99;
	skillsAsXP[skill] = 15_000_000;
}
const materials = new MaterialBank();
for (const t of materialTypes) materials.add(t, 100000000);
const wildyGear = new Gear(maxRange.raw());
wildyGear.equip('Hellfire bow');
wildyGear.equip('Hellfire arrow', 10000);

const rangeGear = new Gear({
	head: 'Gorajan archer helmet',
	neck: 'Farsight snapshot necklace',
	body: 'Gorajan archer top',
	cape: 'Tidal collector (i)',
	hands: 'Gorajan archer gloves',
	legs: 'Gorajan archer legs',
	feet: 'Gorajan archer boots',
	'2h': 'Twisted bow',
	ring: 'Ring of piercing (i)',
	ammo: 'Dragon arrow'
});
rangeGear.equip('Dragon arrow', 1000000);
const gear = {
	mage: maxMage,
	melee: maxMelee,
	range: rangeGear,
	misc: new Gear(),
	skilling: new Gear(),
	wildy: wildyGear,
	fashion: new Gear(),
	other: new Gear()
};

const failures = new Set();
for (const monster of killableMonsters) {
	const monsterKC = 10000;
	const gearBank = new GearBank({
		chargeBank,
		gear,
		bank,
		skillsAsLevels,
		materials,
		pet: itemID('Ori'),
		skillsAsXP,
		minionName: 'Minion'
	});

	const pkEvasionExperience = 100000000;
	const master = slayerMasters.find(m => m.tasks.find(t => t.monster.id === monster.id));
	const task = master?.tasks.find(t => t.monster.id === monster.id);
	const currentSlayerTask =
		master && task
			? {
					currentTask: {
						id: 1,
						created_at: new Date(),
						quantity: 10000,
						quantity_remaining: 10000,
						slayer_master_id: master.id,
						monster_id: monster.id,
						skipped: false,
						user_id: ''
					},
					assignedTask: task,
					slayerMaster: master,
					slayerPoints: 1000
				}
			: {
					currentTask: null,
					assignedTask: null,
					slayerMaster: null,
					slayerPoints: 1
				};

	for (const isTryingToUseWildy of [true, false]) {
		if ((isTryingToUseWildy && !monster.wildy) || (monster.canBePked && !isTryingToUseWildy)) continue;
		for (const inputPVMMethod of PVM_METHODS) {
			for (const attackStyles of attackStyleSets) {
				if (['barrage', 'burst'].includes(inputPVMMethod) && !monster.canBarrage) continue;
				const bitfield: BitField[] = [];
				const kcBank = new KCBank();
				const commandResult = newMinionKillCommand({
					gearBank,
					attackStyles,
					currentSlayerTask: currentSlayerTask as any,
					monster,
					isTryingToUseWildy,
					monsterKC,
					inputPVMMethod,
					maxTripLength: MAX_TRIP_LENGTH,
					pkEvasionExperience,
					poh: {
						pool: 29_241
					} as PlayerOwnedHouse,
					inputQuantity: undefined,
					combatOptions: [],
					slayerUnlocks: [],
					favoriteFood: resolveItems(['Shark']),
					bitfield: [],
					currentPeak: { peakTier: 'medium' } as any,
					disabledInventions: []
				});
				if (typeof commandResult === 'string') {
					if (!failures.has(commandResult)) {
						console.log(commandResult);
					}
					failures.add(commandResult);
					continue;
				}
				if (commandResult.quantity === null || !commandResult.quantity) {
					throw new Error(`Invalid quantity: ${commandResult.quantity} for ${monster.name}`);
				}
				const {
					bob,
					usingCannon,
					cannonMulti,
					chinning,
					hasWildySupplies,
					died,
					pkEncounters,
					isInWilderness
				} = commandResult.currentTaskOptions;
				const tripResult = doMonsterTrip({
					type: 'MonsterKilling',
					monster,
					q: commandResult.quantity,
					cl: new Bank(),
					usingCannon,
					cannonMulti,
					bob,
					died,
					pkEncounters,
					hasWildySupplies,
					isInWilderness,
					hasEliteCA: true,
					hasKourendHard: true,
					kcBank,
					gearBank,
					tertiaryItemPercentageChanges: new Map(),
					slayerInfo: currentSlayerTask,
					slayerUnlocks,
					hasKourendElite: true,
					userStats,
					attackStyles,
					duration: commandResult.duration,
					bitfield,
					chinning,
					disabledInventions: []
				});

				results.push({ tripResult, commandResult });
			}
		}
	}
}

function sortingKey(a: (typeof results)[0]) {
	return `${a.tripResult.monster.name}.${a.commandResult.attackStyles.join('-')}.${JSON.stringify(a.commandResult.currentTaskOptions)}`;
}
results.sort((a, b) => sortingKey(a).localeCompare(sortingKey(b)));

const headers = [
	'Monster',
	'AttackStyle',
	'XP/hr',
	...skills.map(s => `${s} XP/hr`),
	'Options',
	'Food',
	'GP/hr',
	'Cost/hr',
	'Raw Command',
	'Raw Trip'
];
const tsvWriter = new TSVWriter('data/monster_data.tsv');

tsvWriter.writeRow(headers);

for (const { tripResult, commandResult } of results) {
	const xpHr = round(calcPerHour(tripResult.updateBank.xpBank.totalXP(), commandResult.duration));

	const options: string[] = [];
	if (commandResult.currentTaskOptions.bob === SlayerActivityConstants.IceBarrage) {
		options.push('Barrage');
	}
	if (commandResult.currentTaskOptions.bob === SlayerActivityConstants.IceBurst) {
		options.push('Burst');
	}
	if (commandResult.currentTaskOptions.chinning) {
		options.push('Chinning');
	}
	if (commandResult.currentTaskOptions.isInWilderness) {
		options.push('Is In Wilderness');
	}

	if (xpHr < 35_000) continue;

	const totalSharks = commandResult.updateBank.itemCostBank.amount('Shark');
	const sharksPerHour = calcPerHour(totalSharks, commandResult.duration);

	const styles = commandResult.attackStyles
		.join('-')
		.replace('attack', 'atk')
		.replace('defence', 'def')
		.replace('magic', 'mage')
		.replace('ranged', 'range')
		.replace('strength', 'str');

	tsvWriter.writeRow([
		tripResult.monster.name,
		styles,
		`${toKMB(xpHr)} XP/hr`,
		...skills.map(s => toKMB(calcPerHour(tripResult.updateBank.xpBank.amount(s as any), commandResult.duration))),
		options.join(' '),
		`${sharksPerHour.toFixed(1)} Sharks/hr`,
		`${convertBankToPerHourStats(commandResult.updateBank.itemLootBank.clone().add(commandResult.updateBank.itemLootBankNoCL), commandResult.duration)} Loot/hr`,
		`${convertBankToPerHourStats(commandResult.updateBank.itemCostBank, commandResult.duration)} Cost/hr`,
		JSON.stringify(omit(commandResult, ['updateBank'])),
		JSON.stringify(omit(tripResult, ['updateBank', 'slayerContext', 'monster']))
	]);
}
tsvWriter.end().then(() => process.exit());
