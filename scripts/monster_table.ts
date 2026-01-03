import './base.js';

import { writeFileSync } from 'node:fs';
import { calcPerHour, Time } from '@oldschoolgg/toolkit';
import { Bank, convertBankToPerHourStats, EItem, Items } from 'oldschooljs';
import { omit } from 'remeda';

import type { PlayerOwnedHouse } from '@/prisma/main.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import { PeakTier } from '@/lib/util/peaks.js';
import { type BitField, PVM_METHODS } from '../src/lib/constants.js';
import { degradeableItems } from '../src/lib/degradeableItems.js';
import { SlayerActivityConstants } from '../src/lib/minions/data/combatConstants.js';
import { SkillsArray } from '../src/lib/skilling/types.js';
import { slayerMasters } from '../src/lib/slayer/slayerMasters.js';
import { SlayerRewardsShop, type SlayerTaskUnlocksEnum } from '../src/lib/slayer/slayerUnlocks.js';
import { ChargeBank } from '../src/lib/structures/Bank.js';
import { Gear } from '../src/lib/structures/Gear.js';
import { GearBank } from '../src/lib/structures/GearBank.js';
import { KCBank } from '../src/lib/structures/KCBank.js';
import {
	type MinionKillReturn,
	newMinionKillCommand
} from '../src/mahoji/lib/abstracted_commands/minionKill/newMinionKill.js';
import { doMonsterTrip } from '../src/tasks/minions/monsterActivity.js';

const skills = ['attack', 'strength', 'defence', 'magic', 'ranged', 'hitpoints', 'slayer'];

function round(int: number) {
	return Math.round(int / 1000) * 1000;
}

const slayerUnlocks: SlayerTaskUnlocksEnum[] = SlayerRewardsShop.map(i => i.id);

const bank = new Bank();
for (const item of Items.values()) bank.add(item.id, 1000000);

bank.add('Black chinchompa', 100000000);
bank.add('Shark', 100000000);

const chargeBank = new ChargeBank();
for (const deg of degradeableItems) chargeBank.add(deg.settingsKey, 1_000_000);

const attackStyleSets: AttackStyles[][] = [
	['attack', 'strength', 'defence'],
	['ranged'],
	['magic']
	// ['ranged', 'defence'],
	// ['magic', 'defence']
];

const skillsAsXP: any = {};
const skillsAsLevels: any = {};
for (const skill of SkillsArray) {
	skillsAsLevels[skill] = 99;
	skillsAsXP[skill] = 15_000_000;
}

function getSlayerTask(monster: KillableMonster) {
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
					slayerPoints: 1000,
					statsWithStreaks: {
						slayer_task_streak: 1,
						slayer_wildy_task_streak: 1
					}
				}
			: {
					currentTask: null,
					assignedTask: null,
					slayerMaster: null,
					slayerPoints: 1,
					statsWithStreaks: {
						slayer_task_streak: 1,
						slayer_wildy_task_streak: 1
					}
				};
	return currentSlayerTask;
}

function makeGearBank(): GearBank {
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
		skillsAsXP,
		minionName: 'Minion'
	});
	return gearBank;
}
const gearBank = makeGearBank();

async function main() {
	const results: { tripResult: ReturnType<typeof doMonsterTrip>; commandResult: MinionKillReturn; time: number }[] =
		[];

	for (const monster of killableMonsters) {
		const currentSlayerTask = getSlayerTask(monster);
		for (const inputPVMMethod of PVM_METHODS) {
			for (const attackStyles of attackStyleSets) {
				const MAX_TRIP_LENGTH = monster.timeToFinish < Time.Second * 30 ? Time.Hour * 100 : Time.Hour * 600;

				const start = performance.now();
				const bitfield: BitField[] = [];
				const kcBank = new KCBank();
				const commandResult = newMinionKillCommand({
					gearBank,
					attackStyles,
					currentSlayerTask: currentSlayerTask,
					monster,
					isTryingToUseWildy: Boolean(monster.wildy || monster.canBePked),
					monsterKC: 10000,
					inputPVMMethod,
					maxTripLength: MAX_TRIP_LENGTH,
					pkEvasionExperience: 100000000,
					poh: {
						pool: 29_241
					} as PlayerOwnedHouse,
					inputQuantity: undefined,
					combatOptions: [],
					slayerUnlocks: [],
					favoriteFood: [EItem.SHARK],
					bitfield: [],
					currentPeak: { peakTier: PeakTier.Medium, startTime: Date.now(), finishTime: Date.now() + 1000 }
				});
				if (typeof commandResult === 'string') return null;
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
					attackStyles,
					duration: commandResult.duration,
					bitfield,
					chinning,
					slayerBraceletCharges: { slaughter: 0, expeditious: 0 },
					slayerJewelleryConfig: {}
				});
				const end = performance.now();

				results.push({ tripResult, commandResult, time: end - start });
			}
		}
	}
	writeFileSync(
		'data/monster_table_raw.json',
		JSON.stringify(
			results
				.map(_r => ({
					tripResult: omit(_r.tripResult, ['slayerContext']),
					commandResult: _r.commandResult
				}))
				.slice(0, 10),
			null,
			4
		)
	);

	const parsedResults = [];

	for (const { tripResult, commandResult, time } of results) {
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

		const totalLoot: Bank = tripResult.updateBank.itemLootBank.clone().freeze();

		parsedResults.push({
			monster: tripResult.monster.name,
			attackStyles: styles,
			xpHr,
			skills: skills.map(s => calcPerHour(tripResult.updateBank.xpBank.amount(s as any), commandResult.duration)),
			options,
			sharksPerHour,
			lootPerHour: convertBankToPerHourStats(totalLoot, commandResult.duration),
			costPerHour: convertBankToPerHourStats(commandResult.updateBank.itemCostBank, commandResult.duration),
			gpHr: calcPerHour(totalLoot.value(), commandResult.duration),
			totalLoot,
			totalValue: totalLoot.value(),
			time
		});
	}

	parsedResults.sort((a, b) => b.time - a.time);

	writeFileSync('data/monster_data.json', JSON.stringify(parsedResults, null, 4));
}

main();
