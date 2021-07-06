import { percentChance, Time } from 'e';
import { Bank, Misc } from 'oldschooljs';

import { Activity, Emoji, NIGHTMARE_ID, ZAM_HASTA_CRUSH } from '../../constants';
import { addMonsterXP, calculateMonsterFood } from '../../minions/functions';
import announceLoot from '../../minions/functions/announceLoot';
import hasEnoughFoodForMonster from '../../minions/functions/hasEnoughFoodForMonster';
import isImportantItemForMonster from '../../minions/functions/isImportantItemForMonster';
import { ItemBank } from '../../types';
import {
	ActivityTaskOptions,
	GroupMonsterActivityTaskOptions,
	NightmareActivityTaskOptions
} from '../../types/minions';
import { addBanks, noOp, randomVariation } from '../../util';
import calcDurQty from '../../util/calcMassDurationQuantity';
import { getNightmareGearStats } from '../../util/getNightmareGearStats';
import resolveItems from '../../util/resolveItems';
import LfgInterface, {
	LfgCalculateDurationAndActivitiesPerTrip,
	LfgCalculateDurationAndActivitiesPerTripReturn,
	LfgCheckUserRequirements,
	LfgGetItemToRemoveFromBank,
	LfgHandleTripFinish,
	LfgHandleTripFinishReturn,
	lfgReturnMessageInterface
} from '../LfgInterface';
import Default from './Default';

const inquisitorItems = resolveItems([
	"Inquisitor's great helm",
	"Inquisitor's hauberk",
	"Inquisitor's plateskirt",
	"Inquisitor's mace"
]);

interface NightmareUser {
	id: string;
	chanceOfDeath: number;
	damageDone: number;
}

export default class extends Default implements LfgInterface {
	activity: ActivityTaskOptions = <GroupMonsterActivityTaskOptions>{ type: Activity.GroupMonsterKilling };

	async HandleTripFinish(params: LfgHandleTripFinish): Promise<LfgHandleTripFinishReturn> {
		let usersWithLoot: lfgReturnMessageInterface[] = [];
		let extraMessage = [];

		const { leader, users, quantity, duration } = <NightmareActivityTaskOptions>params.data;
		const { client } = params;

		const teamsLoot: { [key: string]: ItemBank } = {};
		const kcAmounts: { [key: string]: number } = {};

		const parsedUsers: NightmareUser[] = [];
		const totalLoot = new Bank();

		// For each user in the party, calculate their damage and death chance.
		for (const id of users) {
			const user = await client.users.fetch(id).catch(noOp);
			if (!user) continue;
			const [data] = getNightmareGearStats(user, users);
			parsedUsers.push({ ...data, id: user.id });
		}

		// Store total amount of deaths
		const deaths: Record<string, number> = {};

		for (let i = 0; i < quantity; i++) {
			const loot = Misc.Nightmare.kill({
				team: parsedUsers.map(user => ({
					id: user.id,
					damageDone: users.length === 1 ? 2400 : randomVariation(user.damageDone, 5)
				}))
			});

			// Give every team member a +1 to their KC.
			for (const user of parsedUsers) {
				kcAmounts[user.id] = Boolean(kcAmounts[user.id]) ? ++kcAmounts[user.id] : 1;
			}

			for (const user of parsedUsers) {
				if (percentChance(user.chanceOfDeath)) {
					deaths[user.id] = deaths[user.id] ? ++deaths[user.id] : 1;
					kcAmounts[user.id]--;
				} else {
					teamsLoot[user.id] = addBanks([teamsLoot[user.id] ?? {}, loot[user.id]]);
				}
			}
		}

		const leaderUser = await client.users.fetch(leader);

		for (const [userID, loot] of Object.entries(teamsLoot)) {
			const user = await client.users.fetch(userID).catch(noOp);
			if (!user) continue;
			await addMonsterXP(user, {
				monsterID: NIGHTMARE_ID,
				quantity: Math.ceil(quantity / users.length),
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			totalLoot.add(loot);
			await user.addItemsToBank(loot, true);
			const kcToAdd = kcAmounts[user.id];
			if (kcToAdd) await user.incrementMonsterScore(params.queue.monster!.id, kcToAdd);
			const purple = Object.keys(loot).some(itemID =>
				isImportantItemForMonster(parseInt(itemID), params.queue.monster!)
			);
			usersWithLoot.push({ user, emoji: purple ? Emoji.Purple : false, lootedItems: new Bank(loot) });
			announceLoot(client, leaderUser, params.queue.monster!, loot, {
				leader: leaderUser,
				lootRecipient: user,
				size: users.length
			});
		}

		// Show deaths in the result
		const deathEntries = Object.entries(deaths);
		if (deathEntries.length > 0) {
			const deaths = [];
			for (const [id, qty] of deathEntries) {
				const user = await client.users.fetch(id).catch(noOp);
				if (!user) continue;
				deaths.push(`**${user.username}**: ${qty}x`);
			}
			extraMessage.push(`**Deaths**: ${deaths.join(', ')}.`);
		}

		const usersWithoutLoot = users.filter(id => !teamsLoot[id]);

		return { usersWithLoot, usersWithoutLoot, extraMessage };
	}

	async checkUserRequirements(params: LfgCheckUserRequirements): Promise<string[]> {
		let returnMessage: string[] = [];

		if (params.user.minionIsBusy) {
			returnMessage.push("You are busy right now and can't join this queue!");
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

	async calculateDurationAndActivitiesPerTrip(
		params: LfgCalculateDurationAndActivitiesPerTrip
	): Promise<LfgCalculateDurationAndActivitiesPerTripReturn> {
		const { queue, party } = params;

		let effectiveTime = queue.monster!.timeToFinish;

		for (const user of party) {
			const [data] = getNightmareGearStats(
				user,
				party.map(u => u.id)
			);

			// Special inquisitor outfit damage boost
			const meleeGear = user.getGear('melee');
			if (meleeGear.hasEquipped(inquisitorItems, true)) {
				effectiveTime *= party.length === 1 ? 0.9 : 0.97;
			} else {
				for (const inqItem of inquisitorItems) {
					if (meleeGear.hasEquipped([inqItem])) {
						effectiveTime *= party.length === 1 ? 0.98 : 0.995;
					}
				}
			}

			// Increase duration for each bad weapon.
			if (data.attackCrushStat < ZAM_HASTA_CRUSH) {
				effectiveTime *= 1.05;
			}

			// Increase duration for lower melee-strength gear.
			if (data.percentMeleeStrength < 40) {
				effectiveTime *= 1.06;
			} else if (data.percentMeleeStrength < 50) {
				effectiveTime *= 1.03;
			} else if (data.percentMeleeStrength < 60) {
				effectiveTime *= 1.02;
			}

			// Increase duration for lower KC.
			if (data.kc < 10) {
				effectiveTime *= 1.15;
			} else if (data.kc < 25) {
				effectiveTime *= 1.05;
			} else if (data.kc < 50) {
				effectiveTime *= 1.02;
			} else if (data.kc < 100) {
				effectiveTime *= 0.98;
			} else {
				effectiveTime *= 0.96;
			}
		}

		let [quantity, duration, perKillTime, messages] = await calcDurQty(
			party,
			{ ...params.queue.monster!, timeToFinish: effectiveTime },
			undefined,
			Time.Minute * 5,
			Time.Minute * 30
		);
		duration = quantity * perKillTime - params.queue.monster!.respawnTime!;

		return {
			activitiesThisTrip: quantity,
			durationOfTrip: duration,
			timePerActivity: perKillTime,
			extraMessages: messages
		};
	}

	async getItemToRemoveFromBank(params: LfgGetItemToRemoveFromBank): Promise<Bank> {
		return super.getItemToRemoveFromBank(params);
	}

	checkTeamRequirements(): string[] {
		return [];
	}
}
