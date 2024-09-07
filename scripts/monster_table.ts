import { writeFileSync } from 'node:fs';
import { calcPerHour } from '@oldschoolgg/toolkit';
import type { PlayerOwnedHouse } from '@prisma/client';
import { Time } from 'e';
import { Bank, Items } from 'oldschooljs';
import { SkillsEnum } from 'oldschooljs/dist/constants';
import { resolveItems, toKMB } from 'oldschooljs/dist/util';

import '../src/lib/safeglobals';

import { type BitField, PVM_METHODS } from '../src/lib/constants';
import { degradeableItems } from '../src/lib/degradeableItems';
import { SlayerActivityConstants } from '../src/lib/minions/data/combatConstants';
import killableMonsters from '../src/lib/minions/data/killableMonsters';
import type { AttackStyles } from '../src/lib/minions/functions';
import { SkillsArray } from '../src/lib/skilling/types';
import { slayerMasters } from '../src/lib/slayer/slayerMasters';
import type { SlayerTaskUnlocksEnum } from '../src/lib/slayer/slayerUnlocks';
import { ChargeBank } from '../src/lib/structures/Bank';
import { Gear } from '../src/lib/structures/Gear';
import { GearBank } from '../src/lib/structures/GearBank';
import { KCBank } from '../src/lib/structures/KCBank';
import { MUserStats } from '../src/lib/structures/MUserStats';
import { newMinionKillCommand } from '../src/mahoji/lib/abstracted_commands/minionKill/newMinionKill';
import { doMonsterTrip } from '../src/tasks/minions/monsterActivity';

const MAX_TRIP_LENGTH = Time.Hour * 1;

const slayerUnlocks: SlayerTaskUnlocksEnum[] = [];
const bank = new Bank();
for (const item of Items.values()) bank.add(item.id, 1000000);
const chargeBank = new ChargeBank();
for (const deg of degradeableItems) chargeBank.add(deg.settingsKey, 1000000);
const results: any = [];
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
				const tripTresult = doMonsterTrip({
					type: 'MonsterKilling',
					mi: monster.id,
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

				results.push({ tripTresult, commandResult });
			}
		}
	}
}

results.sort((a, b) => b.tripTresult.updateBank.xpBank.totalXP() - a.tripTresult.updateBank.xpBank.totalXP());

const headers = ['Monster', 'AttackStyle', 'XP/hr', 'GP/hr', 'Cost/hr', 'Profitability', 'XP', 'Options'];
const rows = results
	.map(({ tripTresult, commandResult }) => {
		const xpHr = calcPerHour(tripTresult.updateBank.xpBank.totalXP(), commandResult.duration);
		const gpHr = calcPerHour(tripTresult.updateBank.itemLootBank.value(), commandResult.duration);
		const costHr = calcPerHour(commandResult.updateBank.itemCostBank.value(), commandResult.duration);

		const options: any = [];
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

		if (xpHr < 35_000 && gpHr < 300_000) return null;

		return [
			tripTresult.monster.name,
			commandResult.attackStyles
				.join('-')
				.replace('attack', 'atk')
				.replace('defence', 'def')
				.replace('magic', 'mage')
				.replace('ranged', 'range')
				.replace('strength', 'str'),
			`${toKMB(xpHr)} XP/hr`,
			`${toKMB(gpHr)} GP/hr`,
			`${toKMB(costHr)} cost gp/hr`,
			costHr > 0 ? (gpHr / costHr).toFixed(1) : '',
			tripTresult.updateBank.xpBank.totalXP(),
			options.join(' ')
		];
	})
	.filter(i => Boolean(i));
writeFileSync('data/monster_data.csv', [headers, ...rows].map(row => row.join('\t')).join('\n'));
// writeFileSync('data/monster_data.md', makeTable(headers, rows));
process.exit();
