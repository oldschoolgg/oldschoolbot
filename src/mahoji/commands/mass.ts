import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { TextChannel } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, objectKeys } from 'e';

import killableMonsters from '../../lib/minions/data/killableMonsters';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import type { KillableMonster } from '../../lib/minions/types';
import { setupParty } from '../../lib/party';
import type { GroupMonsterActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import findMonster from '../../lib/util/findMonster';
import { deferInteraction } from '../../lib/util/interactionReply';
import type { OSBMahojiCommand } from '../lib/util';
import { hasMonsterRequirements } from '../mahojiSettings';

async function checkReqs(users: MUser[], monster: KillableMonster, quantity: number) {
	// Check if every user has the requirements for this monster.
	for (const user of users) {
		if (!user.user.minion_hasBought) {
			return `${user.usernameOrMention} doesn't have a minion, so they can't join!`;
		}

		if (user.minionIsBusy) {
			return `${user.usernameOrMention} is busy right now and can't join!`;
		}

		if (user.user.minion_ironman) {
			return `${user.usernameOrMention} is an ironman, so they can't join!`;
		}

		const [hasReqs, reason] = await hasMonsterRequirements(user, monster);
		if (!hasReqs) {
			return `${user.usernameOrMention} doesn't have the requirements for this monster: ${reason}`;
		}

		if (1 > 2 && !hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
			return `${
				users.length === 1 ? "You don't" : `${user.usernameOrMention} doesn't`
			} have enough food. You need at least ${monster.healAmountNeeded! * quantity} HP in food to ${
				users.length === 1 ? 'start the mass' : 'enter the mass'
			}.`;
		}
	}
}

export const massCommand: OSBMahojiCommand = {
	name: 'mass',
	description: 'Arrange to mass bosses, killing them as a group.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/mass name:General graardor']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'monster',
			description: 'The boss you want to mass.',
			required: true,
			autocomplete: async value => {
				return killableMonsters
					.filter(i => i.groupKillable)
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({ name: i.name, value: i.name }));
			}
		}
	],
	run: async ({ interaction, options, userID, channelID }: CommandRunOptions<{ monster: string }>) => {
		await deferInteraction(interaction);
		const user = await mUserFetch(userID);
		if (user.user.minion_ironman) return 'Ironmen cannot do masses.';
		const channel = globalClient.channels.cache.get(channelID);
		if (!channel || !channelIsSendable(channel)) return 'Invalid channel.';
		const monster = findMonster(options.monster);
		if (!monster) return "That monster doesn't exist!";
		if (!monster.groupKillable) return "This monster can't be killed in groups!";

		const check = await checkReqs([user], monster, 2);
		if (check) return check;

		let users: MUser[] = [];
		try {
			users = await setupParty(channel as TextChannel, user, {
				leader: user,
				minSize: 2,
				maxSize: 10,
				ironmanAllowed: false,
				message: `${user.badgedUsername} is doing a ${monster.name} mass! Use the buttons below to join/leave.`,
				customDenier: async user => {
					if (!user.user.minion_hasBought) {
						return [true, "you don't have a minion."];
					}
					if (user.minionIsBusy) {
						return [true, 'your minion is busy.'];
					}
					const [hasReqs, reason] = await hasMonsterRequirements(user, monster);
					if (!hasReqs) {
						return [true, `you don't have the requirements for this monster; ${reason}`];
					}

					if (1 > 2 && monster.healAmountNeeded) {
						try {
							calculateMonsterFood(monster, user);
						} catch (err: any) {
							return [true, err];
						}

						// Ensure people have enough food for at least 2 full KC
						// This makes it so the users will always have enough food for any amount of KC
						if (1 > 2 && !hasEnoughFoodForMonster(monster, user, 2)) {
							return [
								true,
								`You don't have enough food. You need at least ${
									monster.healAmountNeeded * 2
								} HP in food to enter the mass.`
							];
						}
					}

					return [false];
				}
			});
		} catch (err: any) {
			return {
				content: typeof err === 'string' ? err : 'Your mass failed to start.',
				ephemeral: true
			};
		}
		const unchangedUsers = [...users];
		users = users.filter(i => !i.minionIsBusy);
		const usersKickedForBusy = unchangedUsers.filter(i => !users.includes(i));

		const durQtyRes = await calcDurQty(users, monster, undefined);
		if (typeof durQtyRes === 'string') return durQtyRes;
		const [quantity, duration, perKillTime, boostMsgs] = durQtyRes;

		const checkRes = await checkReqs(users, monster, quantity);
		if (checkRes) return checkRes;

		if (1 > 2 && monster.healAmountNeeded) {
			for (const user of users) {
				const [healAmountNeeded] = calculateMonsterFood(monster, user);
				await removeFoodFromUser({
					user,
					totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * quantity,
					healPerAction: Math.ceil(healAmountNeeded / quantity),
					activityName: monster.name,
					attackStylesUsed: objectKeys(monster.minimumGearRequirements ?? {})
				});
			}
		}

		await addSubTaskToActivityTask<GroupMonsterActivityTaskOptions>({
			mi: monster.id,
			userID: user.id,
			channelID: channelID.toString(),
			q: quantity,
			duration,
			type: 'GroupMonsterKilling',
			leader: user.id,
			users: users.map(u => u.id)
		});

		let killsPerHr = `${Math.round((quantity / (duration / Time.Minute)) * 60).toLocaleString()} Kills/hr`;

		if (boostMsgs.length > 0) {
			killsPerHr += `\n\n${boostMsgs.join(', ')}.`;
		}
		let str = `${user.usernameOrMention}'s party (${users
			.map(u => u.usernameOrMention)
			.join(', ')}) is now off to kill ${quantity}x ${monster.name}. Each kill takes ${formatDuration(
			perKillTime
		)} instead of ${formatDuration(monster.timeToFinish)}- the total trip will take ${formatDuration(
			duration
		)}. ${killsPerHr}`;

		if (usersKickedForBusy.length > 0) {
			str += `\nThe following users were removed, because their minion became busy before the mass started: ${usersKickedForBusy
				.map(i => i.usernameOrMention)
				.join(', ')}.`;
		}

		return str;
	}
};
