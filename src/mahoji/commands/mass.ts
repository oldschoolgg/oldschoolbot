import { TextChannel } from 'discord.js';
import { objectKeys, Time } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions, MessageFlags } from 'mahoji';

import { setupParty } from '../../extendables/Message/Party';
import { Emoji } from '../../lib/constants';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { KillableMonster } from '../../lib/minions/types';
import { GroupMonsterActivityTaskOptions } from '../../lib/types/minions';
import { channelIsSendable, formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import findMonster from '../../lib/util/findMonster';
import { OSBMahojiCommand } from '../lib/util';

function checkReqs(users: KlasaUser[], monster: KillableMonster, quantity: number) {
	// Check if every user has the requirements for this monster.
	for (const user of users) {
		if (!user.hasMinion) {
			throw `${user.username} doesn't have a minion, so they can't join!`;
		}

		if (user.minionIsBusy) {
			throw `${user.username} is busy right now and can't join!`;
		}

		if (user.isIronman) {
			throw `${user.username} is an ironman, so they can't join!`;
		}

		const [hasReqs, reason] = user.hasMonsterRequirements(monster);
		if (!hasReqs) {
			throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
		}

		if (1 > 2 && !hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
			throw `${
				users.length === 1 ? "You don't" : `${user.username} doesn't`
			} have enough food. You need at least ${monster!.healAmountNeeded! * quantity} HP in food to ${
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
		interaction.deferReply();
		const user = await globalClient.fetchUser(userID);
		if (user.isIronman) return 'Ironmen cannot do masses.';
		const channel = globalClient.channels.cache.get(channelID.toString());
		if (!channel || !channelIsSendable(channel)) return 'Invalid channel.';
		const monster = findMonster(options.monster);
		if (!monster) throw "That monster doesn't exist!";
		if (!monster.groupKillable) throw "This monster can't be killed in groups!";

		checkReqs([user], monster, 2);

		let [users, reactionAwaiter] = await setupParty(channel as TextChannel, user, {
			leader: user,
			minSize: 2,
			maxSize: 10,
			ironmanAllowed: false,
			message: `${user.username} is doing a ${monster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
			customDenier: async user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (user.minionIsBusy) {
					return [true, 'your minion is busy.'];
				}
				const [hasReqs, reason] = user.hasMonsterRequirements(monster);
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
		try {
			await reactionAwaiter();
		} catch (err: any) {
			return {
				content: typeof err === 'string' ? err : 'Your mass failed to start.',
				flags: MessageFlags.Ephemeral
			};
		}
		users = users.filter(i => !i.minionIsBusy);

		const [quantity, duration, perKillTime, boostMsgs] = await calcDurQty(users, monster, undefined);

		checkReqs(users, monster, quantity);

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
			monsterID: monster.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'GroupMonsterKilling',
			leader: user.id,
			users: users.map(u => u.id)
		});

		let killsPerHr = `${Math.round((quantity / (duration / Time.Minute)) * 60).toLocaleString()} Kills/hr`;

		if (boostMsgs.length > 0) {
			killsPerHr += `\n\n${boostMsgs.join(', ')}.`;
		}
		return `${user.username}'s party (${users.map(u => u.username).join(', ')}) is now off to kill ${quantity}x ${
			monster.name
		}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
			monster.timeToFinish
		)}- the total trip will take ${formatDuration(duration)}. ${killsPerHr}`;
	}
};
