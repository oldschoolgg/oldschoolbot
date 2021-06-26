import { objectKeys, Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

import { Activity, Emoji } from '../../lib/constants';
import { ironsCantUse, minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { KillableMonster } from '../../lib/minions/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { GroupMonsterActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import calcDurQty from '../../lib/util/calcMassDurationQuantity';
import findMonster from '../../lib/util/findMonster';

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

	checkReqs(params: Record<string, any>) {
		let monster: KillableMonster = params.lookingForGroup ? params.lookingForGroup.monster : params.monster;
		let users = <KlasaUser[]>params.users;
		let quantity = <number>params.quantity;
		let returnMessage: string[] = [];
		// Check if every user has the requirements for this monster.
		for (const user of users) {
			if (!user.hasMinion) {
				returnMessage.push(`${user.username} doesn't have a minion, so they can't join!`);
			}

			if (user.minionIsBusy) {
				returnMessage.push(`${user.username} is busy right now and can't join!`);
			}

			if (user.isIronman) {
				returnMessage.push(`${user.username} is an ironman, so they can't join!`);
			}

			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs) {
				returnMessage.push(`${user.username} doesn't have the requirements for this monster: ${reason}`);
			}

			if (1 > 2 && !hasEnoughFoodForMonster(monster, user, quantity, users.length)) {
				returnMessage.push(
					`${
						users.length === 1 ? "You don't" : `${user.username} doesn't`
					} have enough food. You need at least ${monster!.healAmountNeeded! * quantity} HP in food to ${
						users.length === 1 ? 'start the mass' : 'enter the mass'
					}.`
				);
			}

			if (params.throw === true && returnMessage.length > 0) {
				throw `${returnMessage.join('\n')}`;
			} else if (users.length === 1) {
				if (returnMessage.length > 0) {
					return { allowed: false, reasons: returnMessage.join('\n') };
				}
				return { allowed: true };
			}
		}
	}

	// Remove the necessary items from the users before starting the trip
	async removeItems(params: Record<string, any>) {
		let monster: KillableMonster = params.lookingForGroup ? params.lookingForGroup.monster : params.monster;
		let users = <KlasaUser[]>params.users;
		let numberOfKills: number = params.quantity;

		if (monster.healAmountNeeded) {
			for (const user of users) {
				const [healAmountNeeded] = calculateMonsterFood(monster, user);
				await removeFoodFromUser({
					client: this.client,
					user,
					totalHealingNeeded: Math.ceil(healAmountNeeded / users.length) * numberOfKills,
					healPerAction: Math.ceil(healAmountNeeded / numberOfKills),
					activityName: monster.name,
					attackStylesUsed: objectKeys(monster.minimumGearRequirements ?? {})
				});
			}
		}
	}

	async calcDurQty(params: Record<string, any>): Promise<[number, number, number, string[]]> {
		return calcDurQty(
			params.users,
			params.lookingForGroup ? params.lookingForGroup.monster : params.monster,
			params.quantity
		);
	}

	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async run(msg: KlasaMessage, [monsterName, maximumSizeForParty]: [string, number]) {
		const monster = findMonster(monsterName);
		if (!monster) throw "That monster doesn't exist!";
		if (!monster.groupKillable) throw "This monster can't be killed in groups!";

		this.checkReqs({ users: [msg.author], monster, quantity: 2, throw: true });

		const maximumSize = 50;

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: (maximumSizeForParty ?? maximumSize) - 1,
			ironmanAllowed: false,
			message: `${msg.author.username} is doing a ${monster.name} mass! Anyone can click the ${
				Emoji.Join
			} reaction to join, click it again to leave. The maximum size for this mass is ${
				maximumSizeForParty ?? maximumSize
			}.`,
			customDenier: user => {
				const reqs = this.checkReqs({ users: [user], monster, quantity: 2 });
				if (reqs!.reasons) {
					return [true, reqs!.reasons];
				}
				return [false];
			}
		};
		const users = await msg.makePartyAwaiter(partyOptions);
		const [quantity, duration, perKillTime, boostMsgs] = await this.calcDurQty({ users, monster });
		this.checkReqs({ users, monster, quantity, throw: true });
		await this.removeItems({ users, monster, quantity });
		await addSubTaskToActivityTask<GroupMonsterActivityTaskOptions>({
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.GroupMonsterKilling,
			leader: msg.author.id,
			users: users.map(u => u.id)
		});

		let killsPerHr = `${Math.round((quantity / (duration / Time.Minute)) * 60).toLocaleString()} Kills/hr`;

		if (boostMsgs.length > 0) {
			killsPerHr += `\n\n${boostMsgs.join(', ')}.`;
		}
		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to kill ${quantity}x ${monster.name}. Each kill takes ${formatDuration(
				perKillTime
			)} instead of ${formatDuration(monster.timeToFinish)}- the total trip will take ${formatDuration(
				duration
			)}. ${killsPerHr}`
		);
	}
}
