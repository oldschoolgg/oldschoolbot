import { objectKeys } from 'e';
import { Bank } from 'oldschooljs';

import { Activity, Emoji } from '../../constants';
import killableMonsters from '../../minions/data/killableMonsters';
import { addMonsterXP, calculateMonsterFood } from '../../minions/functions';
import announceLoot from '../../minions/functions/announceLoot';
import hasEnoughFoodForMonster from '../../minions/functions/hasEnoughFoodForMonster';
import isImportantItemForMonster from '../../minions/functions/isImportantItemForMonster';
import removeFoodFromUser from '../../minions/functions/removeFoodFromUser';
import { ActivityTaskOptions, GroupMonsterActivityTaskOptions } from '../../types/minions';
import { noOp, randomItemFromArray } from '../../util';
import calcDurQty from '../../util/calcMassDurationQuantity';
import LfgInterface, {
	LfgCalculateDurationAndActivitiesPerTrip,
	LfgCalculateDurationAndActivitiesPerTripReturn,
	LfgCheckUserRequirements,
	LfgGetItemToRemoveFromBank,
	LfgHandleTripFinish,
	LfgHandleTripFinishReturn,
	lfgReturnMessageInterface
} from '../LfgInterface';

export default class implements LfgInterface {
	activity: ActivityTaskOptions = <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling };

	async HandleTripFinish(params: LfgHandleTripFinish): Promise<LfgHandleTripFinishReturn> {
		const { quantity, users, leader, duration } = <GroupMonsterActivityTaskOptions>params.data;
		const { queue, client } = params;
		const monsterID = queue.monster!.id;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		const teamsLoot: { [key: string]: Bank } = {};
		const kcAmounts: { [key: string]: number } = {};

		for (let i = 0; i < quantity; i++) {
			const loot = monster.table.kill(1, {});
			const userWhoGetsLoot = randomItemFromArray(users);
			const currentLoot = teamsLoot[userWhoGetsLoot];
			teamsLoot[userWhoGetsLoot] = loot.add(currentLoot);
			kcAmounts[userWhoGetsLoot] = Boolean(kcAmounts[userWhoGetsLoot]) ? ++kcAmounts[userWhoGetsLoot] : 1;
		}

		const leaderUser = await client.users.fetch(leader);

		let usersWithLoot: lfgReturnMessageInterface[] = [];

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await client.users.fetch(userID).catch(noOp);
			if (!user) continue;

			await addMonsterXP(user, {
				monsterID: monster.id,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask: false,
				taskQuantity: null
			});

			await user.addItemsToBank(loot, true);
			if (kcAmounts[user.id]) {
				await user.incrementMonsterScore(monsterID, kcAmounts[user.id]);
			}
			const purple = Object.keys(loot.bank).some(itemID => isImportantItemForMonster(parseInt(itemID), monster));

			usersWithLoot.push({ user, emoji: purple ? Emoji.Purple : false, lootedItems: loot });

			await announceLoot(client, leaderUser, monster, loot.bank, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);

		return { usersWithLoot, usersWithoutLoot };
	}

	async calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<LfgCalculateDurationAndActivitiesPerTripReturn> {
		const calcDur = await calcDurQty(params.party, params.queue.monster!, params.quantity);
		return {
			activitiesThisTrip: calcDur[0],
			durationOfTrip: calcDur[1],
			timePerActivity: calcDur[2],
			extraMessages: calcDur[3]
		};
	}

	async checkUserRequirements(params: LfgCheckUserRequirements): Promise<string[]> {
		let returnMessage: string[] = [];

		if (params.user.minionIsBusy) {
			returnMessage.push("You are busy right now and can't join this queue!");
		}

		if (params.user.isIronman) {
			returnMessage.push("As an ironman, you can't join mass groups.");
		}

		const [hasReqs, reason] = params.user.hasMonsterRequirements(params.queue.monster!);
		if (!hasReqs) {
			returnMessage.push(`You don't meet the requirements for this monster: ${reason}`);
		}

		if (!hasEnoughFoodForMonster(params.queue.monster!, params.user, params.quantity, params.party.length)) {
			const [healAmountNeeded] = calculateMonsterFood(params.queue.monster!, params.user);
			returnMessage.push(
				`You don't have enough food. You need at least ${
					healAmountNeeded! * params.quantity
				} HP in food to join this queue.`
			);
		}

		return returnMessage;
	}

	async getItemToRemoveFromBank(params: LfgGetItemToRemoveFromBank): Promise<Bank> {
		const totalLoot = new Bank();
		const monster = params.queue.monster!;
		if (monster.healAmountNeeded) {
			const [healAmountNeeded] = calculateMonsterFood(monster, params.user);
			const [, lootToRemove] = await removeFoodFromUser({
				client: params.client!,
				user: params.user,
				totalHealingNeeded: Math.ceil(healAmountNeeded / params.party.length) * params.quantity,
				healPerAction: Math.ceil(healAmountNeeded / params.quantity),
				activityName: monster.name,
				attackStylesUsed: objectKeys(monster.minimumGearRequirements ?? {}),
				dryRun: true
			});
			totalLoot.add(lootToRemove);
		}
		return totalLoot;
	}

	checkTeamRequirements(): string[] {
		return [];
	}
}
