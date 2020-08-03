import { CommandStore, KlasaUser, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { MakePartyOptions } from '../../lib/types';
import { minionNotBusy, requiresMinion, ironsCantUse } from '../../lib/minions/decorators';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { Activity, Tasks, Emoji } from '../../lib/constants';
import { rand, formatDuration, addItemToBank } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { reducedTimeForGroup, findMonster } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import { Eatables } from '../../lib/eatables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';

const { ceil } = Math;

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int] <monster:string>',
			usageDelim: ' ',
			cooldown: 5,
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			aliases: ['mass']
		});
	}

	calcDurQty(users: KlasaUser[], monster: KillableMonster, quantity: number | undefined) {
		const perKillTime = reducedTimeForGroup(users, monster);
		const maxQty = Math.floor(users[0].maxTripLength / perKillTime);
		if (!quantity) quantity = maxQty;
		if (quantity > maxQty) {
			throw `The max amount of ${monster.name} this party can kill per trip is ${maxQty}.`;
		}
		const duration = quantity * perKillTime - monster.respawnTime!;
		return [quantity, duration, perKillTime];
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

			if (!hasEnoughFoodForMonster(monster, user, quantity) && 1 > 2) {
				throw `${user.username} doesn't have enough food.`;
			}
		}
	}

	@minionNotBusy
	@requiresMinion
	@ironsCantUse
	async run(msg: KlasaMessage, [inputQuantity, monsterName]: [number | undefined, string]) {
		const monster = findMonster(monsterName);
		if (!monster) throw `That monster doesn't exist!`;
		if (!monster.groupKillable) throw `This monster can't be killed in groups!`;

		this.checkReqs([msg.author], monster, 2);

		const partyOptions: MakePartyOptions = {
			leader: msg.author,
			minSize: 2,
			maxSize: 50,
			message: `${msg.author.username} is doing a ${monster.name} mass! Anyone can click the ${Emoji.Join} reaction to join, click it again to leave.`,
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

				if (1 > 2) {
					try {
						calculateMonsterFood(monster, user);
					} catch (err) {
						return [true, err];
					}

					if (!hasEnoughFoodForMonster(monster, user, 2) && 1 > 2) {
						return [true, "you don't have enough food."];
					}
				}

				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		const [quantity, duration, perKillTime] = this.calcDurQty(users, monster, inputQuantity);

		this.checkReqs(users, monster, quantity);

		if (1 > 2) {
			for (const user of users) {
				let [healAmountNeeded] = calculateMonsterFood(monster, user);

				healAmountNeeded = Math.ceil(healAmountNeeded / users.length);

				for (const food of Eatables) {
					const amountNeeded = ceil(healAmountNeeded / food.healAmount!) * quantity;
					if (user.numItemsInBankSync(food.id) < amountNeeded) {
						if (Eatables.indexOf(food) === Eatables.length - 1) {
							throw `You don't have enough food to kill ${
								monster.name
							}! You need enough food to heal atleast ${healAmountNeeded} HP (${healAmountNeeded /
								quantity} per kill) You can use these food items: ${Eatables.map(
								i => i.name
							).join(', ')}.`;
						}
						continue;
					}

					await user.removeItemFromBank(food.id, amountNeeded);

					// Track this food cost in Economy Stats
					await this.client.settings.update(
						ClientSettings.EconomyStats.PVMCost,
						addItemToBank(
							this.client.settings.get(ClientSettings.EconomyStats.PVMCost),
							food.id,
							amountNeeded
						)
					);

					break;
				}
			}
		}

		const data: GroupMonsterActivityTaskOptions = {
			monsterID: monster.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.GroupMonsterKilling,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + duration,
			leader: msg.author.id,
			users: users.map(u => u.id)
		};

		await addSubTaskToActivityTask(this.client, Tasks.MonsterKillingTicker, data);
		for (const user of users) user.incrementMinionDailyDuration(duration);

		return msg.channel.send(
			`${partyOptions.leader.username}'s party (${users
				.map(u => u.username)
				.join(', ')}) is now off to kill ${quantity}x ${
				monster.name
			}. Each kill takes ${formatDuration(perKillTime)} instead of ${formatDuration(
				monster.timeToFinish
			)}- the total trip will take ${formatDuration(duration)}`
		);
	}
}
