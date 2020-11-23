import { objectKeys, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Emoji } from '../../lib/constants';
import { ironsCantUse, minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { findMonster } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<monster:string> [quantity:int{2,50}]',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			aliases: ['mass'],
			description: 'Allows you to mass/groupkill bosses with other people.',
			examples: ['+mass corp', '+mass bandos'],
			categoryFlags: ['minion', 'pvm']
		});
	}

	checkReqs(users: KlasaUser[], monster: KillableMonster, quantity: number) {
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
					users.length === 1 ? `You don't` : `${user.username} doesn't`
				} have enough food. You need at least ${
					monster!.healAmountNeeded! * quantity
				} HP in food to ${users.length === 1 ? 'start the mass' : 'enter the mass'}.`;
			}
		}
	}

	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async run(msg: KlasaMessage, [monsterName, maximumSizeForParty]: [string, number]) {
		const monster = findMonster(monsterName);
		if (!monster) throw `That monster doesn't exist!`;
		if (!monster.groupKillable) throw `This monster can't be killed in groups!`;

		this.checkReqs([msg.author], monster, 2);

		const maximumSize = 50;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: (maximumSizeForParty ?? maximumSize) - 1,
			ironmanAllowed: false,
			message: `${msg.author.username} is doing a ${
				monster.name
			} mass! Anyone can click the ${
				Emoji.Join
			} reaction to join, click it again to leave. The maximum size for this mass is ${
				maximumSizeForParty ?? maximumSize
			}.`,
			customDenier: user => {
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
					} catch (err) {
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
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		const [quantity, duration, perKillTime, boostMsgs] = await calcDurQty(
			users,
			monster,
			undefined
		);

		this.checkReqs(users, monster, quantity);

		if (1 > 2 && monster.healAmountNeeded) {
			for (const user of users) {
				const [healAmountNeeded] = calculateMonsterFood(monster, user);
				await removeFoodFromUser({
					client: this.client,
					user,
					totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * quantity,
					healPerAction: Math.ceil(healAmountNeeded / quantity),
					activityName: monster.name,
					attackStylesUsed: objectKeys(monster.minimumGearRequirements ?? {})
				});
			}
		}
		const hits = 0;

		await addSubTaskToActivityTask<GroupMonsterActivityTaskOptions>(this.client, {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			hits,
			duration,
			type: Activity.GroupMonsterKilling,
			leader: msg.author.id,
			users: users.map(u => u.id)
		});
		for (const user of users) user.incrementMinionDailyDuration(duration);

		let killsPerHr = `${Math.round(
			(quantity / (duration / Time.Minute)) * 60
		).toLocaleString()} Kills/hr`;

		if (boostMsgs.length > 0) {
			killsPerHr += `\n\n${boostMsgs.join(', ')}.`;
		}
		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to kill ${quantity}x ${
				monster.name
			}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
				monster.timeToFinish
			)}- the total trip will take ${formatDuration(duration)}. ${killsPerHr}`
		);
	}
}
