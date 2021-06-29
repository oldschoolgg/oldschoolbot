import { objectKeys } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { availableQueues, QueueProperties } from '../../commands/Minion/lfg';
import { Activity } from '../constants';
import killableMonsters from '../minions/data/killableMonsters';
import { addMonsterXP, calculateMonsterFood } from '../minions/functions';
import announceLoot from '../minions/functions/announceLoot';
import hasEnoughFoodForMonster from '../minions/functions/hasEnoughFoodForMonster';
import isImportantItemForMonster from '../minions/functions/isImportantItemForMonster';
import removeFoodFromUser from '../minions/functions/removeFoodFromUser';
import { ActivityTaskOptions, GroupMonsterActivityTaskOptions, LfgActivityTaskOptions } from '../types/minions';
import { noOp, randomItemFromArray } from '../util';
import calcDurQty from '../util/calcMassDurationQuantity';
import LfgInterface from './LfgInterface';
import { lfgReturnMessageInterface } from './LfgUtils';

export default class implements LfgInterface {
	activity: ActivityTaskOptions = <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling };

	async HandleTripFinish(
		data: LfgActivityTaskOptions,
		client: KlasaClient
	): Promise<[lfgReturnMessageInterface[], string[], string]> {
		const { quantity, users, leader, duration } = data;
		const queue = availableQueues.find(queue => queue.uniqueID === data.queueId)!;
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
		let extraMessage = '';

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
			const purple = Object.keys(loot).some(itemID => isImportantItemForMonster(parseInt(itemID), monster));

			usersWithLoot.push({ user, hasPurple: purple, lootedItems: loot });

			await announceLoot(client, leaderUser, monster, loot.bank, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);

		return [usersWithLoot, usersWithoutLoot, extraMessage];
	}

	async calculateDurationAndActivitiesPerTrip(
		users: KlasaUser[],
		queue: QueueProperties
	): Promise<[number, number, number, string[]]> {
		return calcDurQty(users, queue.monster!, undefined);
	}

	checkUserRequirements(user: KlasaUser, quantity: number, partySize: number, queue: QueueProperties): any {
		let returnMessage: string[] = [];

		if (user.minionIsBusy) {
			returnMessage.push("You are busy right now and can't join this queue!");
		}

		if (user.isIronman) {
			returnMessage.push("As an ironman, you can't join mass groups.");
		}

		const [hasReqs, reason] = user.hasMonsterRequirements(queue.monster!);
		if (!hasReqs) {
			returnMessage.push(`You don't meet the requirements for this monster: ${reason}`);
		}

		if (!hasEnoughFoodForMonster(queue.monster!, user, quantity, partySize)) {
			const [healAmountNeeded] = calculateMonsterFood(queue.monster!, user);
			returnMessage.push(
				`You don't have enough food. You need at least ${
					healAmountNeeded! * quantity
				} HP in food to join this queue.`
			);
		}

		return returnMessage;
	}

	async getItemToRemoveFromBank(
		users: KlasaUser[],
		numberOfKills: number,
		client: KlasaClient,
		queue: QueueProperties
	) {
		const monsterID = queue.monster!.id;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;
		if (monster.healAmountNeeded) {
			for (const user of users) {
				const [healAmountNeeded] = calculateMonsterFood(monster, user);
				await removeFoodFromUser({
					client,
					user,
					totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * numberOfKills,
					healPerAction: Math.ceil(healAmountNeeded / numberOfKills),
					activityName: monster.name,
					attackStylesUsed: objectKeys(monster.minimumGearRequirements ?? {})
				});
			}
		}
	}
}
