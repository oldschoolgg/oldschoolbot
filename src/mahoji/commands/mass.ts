import { formatDuration, Time } from '@oldschoolgg/toolkit';

import type { GearSetupType } from '@/prisma/main/enums.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import calculateMonsterFood from '@/lib/minions/functions/calculateMonsterFood.js';
import hasEnoughFoodForMonster from '@/lib/minions/functions/hasEnoughFoodForMonster.js';
import removeFoodFromUser from '@/lib/minions/functions/removeFoodFromUser.js';
import type { KillableMonster } from '@/lib/minions/types.js';
import type { GroupMonsterActivityTaskOptions } from '@/lib/types/minions.js';
import calcDurQty from '@/lib/util/calcMassDurationQuantity.js';
import findMonster from '@/lib/util/findMonster.js';

async function checkReqs(users: MUser[], monster: KillableMonster, quantity: number) {
	// Check if every user has the requirements for this monster.
	for (const user of users) {
		if (!user.hasMinion) {
			return `${user.usernameOrMention} doesn't have a minion, so they can't join!`;
		}

		if (await user.minionIsBusy()) {
			return `${user.usernameOrMention} is busy right now and can't join!`;
		}

		if (user.user.minion_ironman) {
			return `${user.usernameOrMention} is an ironman, so they can't join!`;
		}

		const [hasReqs, reason] = await user.hasMonsterRequirements(monster);
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

export const massCommand = defineCommand({
	name: 'mass',
	description: 'Arrange to mass bosses, killing them as a group.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/mass name:General graardor']
	},
	options: [
		{
			type: 'String',
			name: 'monster',
			description: 'The boss you want to mass.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				return killableMonsters
					.filter(i => i.groupKillable)
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({ name: i.name, value: i.name }));
			}
		}
	],
	run: async ({ interaction, options, user, channelId }) => {
		await interaction.defer();

		if (user.user.minion_ironman) return 'Ironmen cannot do masses.';
		const monster = findMonster(options.monster);
		if (!monster) return "That monster doesn't exist!";
		if (!monster.groupKillable) return "This monster can't be killed in groups!";

		const check = await checkReqs([user], monster, 2);
		if (check) return check;

		const users: MUser[] = await globalClient.makeParty({
			interaction,
			leader: user,
			minSize: 2,
			maxSize: 10,
			ironmanAllowed: false,
			message: `${user.badgedUsername} is doing a ${monster.name} mass! Use the buttons below to join/leave.`,
			customDenier: async user => {
				if (!user.hasMinion) {
					return [true, "you don't have a minion."];
				}
				if (await user.minionIsBusy()) {
					return [true, 'your minion is busy.'];
				}
				const [hasReqs, reason] = await user.hasMonsterRequirements(monster);
				if (!hasReqs) {
					return [true, `you don't have the requirements for this monster; ${reason}`];
				}
				return [false];
			}
		});

		const unchangedUsers = [...users];
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
					attackStylesUsed: Object.keys(monster.minimumGearRequirements ?? {}) as GearSetupType[]
				});
			}
		}

		await ActivityManager.startTrip<GroupMonsterActivityTaskOptions>({
			mi: monster.id,
			userID: user.id,
			channelId,
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
});
