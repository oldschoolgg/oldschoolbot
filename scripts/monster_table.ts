import { calcPerHour } from '@oldschoolgg/toolkit/util';
import type { PlayerOwnedHouse } from '@prisma/client';
import { Time } from 'e';
import { Bank, Items, convertBankToPerHourStats } from 'oldschooljs';

import '../src/lib/safeglobals';

import { omit } from 'remeda';
import { type BitField, PVM_METHODS } from '../src/lib/constants';
import { degradeableItems } from '../src/lib/degradeableItems';
import { SlayerActivityConstants } from '../src/lib/minions/data/combatConstants';
import killableMonsters from '../src/lib/minions/data/killableMonsters';
import type { AttackStyles } from '../src/lib/minions/functions';
import { SkillsArray, SkillsEnum } from '../src/lib/skilling/types';
import { slayerMasters } from '../src/lib/slayer/slayerMasters';
import type { SlayerTaskUnlocksEnum } from '../src/lib/slayer/slayerUnlocks';
import { ChargeBank } from '../src/lib/structures/Bank';
import { Gear } from '../src/lib/structures/Gear';
import { GearBank } from '../src/lib/structures/GearBank';
import { KCBank } from '../src/lib/structures/KCBank';
import { MUserStats } from '../src/lib/structures/MUserStats';
import { resolveItems, toKMB } from '../src/lib/util';
import {
	type MinionKillReturn,
	newMinionKillCommand
} from '../src/mahoji/lib/abstracted_commands/minionKill/newMinionKill';
import { doMonsterTrip } from '../src/tasks/minions/monsterActivity';
import { TSVWriter } from './TSVWriter';

const MAX_TRIP_LENGTH = Time.Hour * 600;
const skills = ['attack', 'strength', 'defence', 'magic', 'ranged', 'hitpoints', 'slayer'];

function round(int: number) {
	return Math.round(int / 1000) * 1000;
}
const slayerUnlocks: SlayerTaskUnlocksEnum[] = [];
const bank = new Bank();
for (const item of Items.values()) bank.add(item.id, 1000000);
bank.add('Black chinchompa', 100000000);
const chargeBank = new ChargeBank();
for (const deg of degradeableItems) chargeBank.add(deg.settingsKey, 1000000);
const results: { tripResult: ReturnType<typeof doMonsterTrip>; commandResult: MinionKillReturn }[] = [];
const userStats = new MUserStats({} as any);

const attackStyleSets: AttackStyles[][] = [
	[SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence],
	[SkillsEnum.Ranged],
	[SkillsEnum.Magic],
	[SkillsEnum.Ranged, SkillsEnum.Defence],
	[SkillsEnum.Magic, SkillsEnum.Defence]
];

const skillsAsLevels: any = {};
for (const skill of SkillsArray) {
	skillsAsLevels[skill] = 99;
}

for (const monster of killableMonsters) {
	const monsterKC = 10000;
	const gearBank = new GearBank({
		chargeBank,
		gear: {
			mage: new Gear(),
			melee: new Gear(),
			range: new Gear(),
			misc: new Gear(),
			skilling: new Gear(),
			wildy: new Gear(),
			fashion: new Gear(),
			other: new Gear()
		},
		bank,
		skillsAsLevels
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
		for (const inputPVMMethod of PVM_METHODS) {
			for (const attackStyles of attackStyleSets) {
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
					currentPeak: { peakTier: 'medium' } as any
				});
				if (typeof commandResult === 'string') continue;
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
					chinning
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
