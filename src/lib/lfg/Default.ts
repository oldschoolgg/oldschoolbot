import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { availableQueues, QueueProperties } from '../../commands/Minion/lfg';
import { Activity, Emoji } from '../constants';
import killableMonsters from '../minions/data/killableMonsters';
import { addMonsterXP } from '../minions/functions';
import announceLoot from '../minions/functions/announceLoot';
import hasEnoughFoodForMonster from '../minions/functions/hasEnoughFoodForMonster';
import isImportantItemForMonster from '../minions/functions/isImportantItemForMonster';
import { ActivityTaskOptions, GroupMonsterActivityTaskOptions, LfgActivityTaskOptions } from '../types/minions';
import { noOp, randomItemFromArray } from '../util';
import calcDurQty from '../util/calcMassDurationQuantity';
import LfgInterface from './LfgInterface';

export default class implements LfgInterface {
	activity: ActivityTaskOptions = <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling };

	async HandleTripFinish(data: LfgActivityTaskOptions, client: KlasaClient): Promise<[string, Bank]> {
		const { quantity, users, leader, duration } = data;
		const queue = availableQueues.find(queue => queue.uniqueID === data.queueId)!;
		const monsterID = queue.monster!.id;
		const monster = killableMonsters.find(mon => mon.id === monsterID)!;

		// const { monsterID, channelID, quantity, users, leader, duration } = data;
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

		let resultStr = '';

		resultStr = `${leaderUser}, your party finished killing ${quantity}x ${monster.name}!\n\n`;

		const totalLoot = new Bank();

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
			totalLoot.add(loot);
			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) user.incrementMonsterScore(monsterID, kcToAdd);
			const purple = Object.keys(loot).some(itemID => isImportantItemForMonster(parseInt(itemID), monster));

			// Add LFG loot
			// Add normal loot
			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${loot}||\n`;

			resultStr += `${purple ? Emoji.Purple : ''} **${user} received:** ||${loot}||\n`;

			announceLoot(client, leaderUser, monster, loot.bank, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);
		if (usersWithoutLoot.length > 0) {
			resultStr += `${usersWithoutLoot.map(id => `<@${id}>`).join(', ')} - Got no loot, sad!`;
		}

		return [resultStr, totalLoot];
	}

	async calculateDurationAndActivitiesPerTrip(
		users: KlasaUser[],
		queue: QueueProperties
	): Promise<[number, number, number, string[]]> {
		return calcDurQty(users, queue.monster!, undefined);
	}

	checkUserRequirements(user: KlasaUser, quantity: number, queue: QueueProperties): any {
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

		if (!hasEnoughFoodForMonster(queue.monster!, user, 2, 1)) {
			returnMessage.push(
				`"You don't have enough food. You need at least ${
					queue.monster!.healAmountNeeded! * quantity
				} HP in food to join this queue.`
			);
		}

		return returnMessage;
	}

	async getItemToRemoveFromBank(params: Record<string, any>) {
		let name = params;
		params = name;
		// let monster: KillableMonster = params.lookingForGroup ? params.lookingForGroup.monster : params.monster;
		// let users = <KlasaUser[]>params.users;
		// let numberOfKills: number = params.quantity;
		// let { client } = params;
		//
		// if (monster.healAmountNeeded) {
		// 	for (const user of users) {
		// 		const [healAmountNeeded] = calculateMonsterFood(monster, user);
		// 		await removeFoodFromUser({
		// 			client,
		// 			user,
		// 			totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * numberOfKills,
		// 			healPerAction: Math.ceil(healAmountNeeded / numberOfKills),
		// 			activityName: monster.name,
		// 			attackStylesUsed: objectKeys(monster.minimumGearRequirements ?? {})
		// 		});
		// 	}
		// }
	}
}
