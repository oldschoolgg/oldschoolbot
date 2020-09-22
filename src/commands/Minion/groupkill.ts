import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { addBanks } from 'oldschooljs/dist/util';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Emoji, Tasks } from '../../lib/constants';
import { Eatables } from '../../lib/eatables';
import { ironsCantUse, minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { findMonster, reducedTimeForGroup } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import getUserFoodFromBank from '../../lib/minions/functions/getUserFoodFromBank';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { MakePartyOptions } from '../../lib/types';
import { formatDuration, removeBankFromBank } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int] <monster:...string>',
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
			const monsterFoodNeeded =
				Math.ceil(calculateMonsterFood(monster, user)[0] / users.length) * quantity;
			if (
				monster.healAmountNeeded &&
				!getUserFoodFromBank(user.settings.get(UserSettings.Bank), monsterFoodNeeded)
			) {
				throw `${user.username} doesn't have enough food. You need at least ${
					monsterFoodNeeded < monster.healAmountNeeded
						? monster.healAmountNeeded
						: monsterFoodNeeded
				} HP in food to enter the mass.`;
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

				if (monster.healAmountNeeded) {
					try {
						calculateMonsterFood(monster, user);
					} catch (err) {
						return [true, err];
					}

					// Ensure people have enough food for at least 2 full KC
					// This makes it so the users will always have enough food for any amount of KC
					if (
						!getUserFoodFromBank(
							user.settings.get(UserSettings.Bank),
							monster.healAmountNeeded * 2
						)
					) {
						return [
							true,
							`You don't have enough food. You need at least ${monster.healAmountNeeded *
								2} HP in food to enter the mass.`
						];
					}
				}

				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);
		if (users.length < 3 && monster.id === 696969) {
			throw `You need at least 3 people to fight the Dwarf king.`;
		}
		const [quantity, duration, perKillTime] = this.calcDurQty(users, monster, inputQuantity);

		this.checkReqs(users, monster, quantity);

		if (monster.healAmountNeeded) {
			for (const user of users) {
				await user.settings.sync(true);
				const userBank = user.settings.get(UserSettings.Bank);
				const [healAmountNeeded] = calculateMonsterFood(monster, user);
				const foodToRemove = getUserFoodFromBank(
					userBank,
					Math.ceil(healAmountNeeded / users.length) * quantity
				);
				if (!foodToRemove) {
					throw `You don't have enough food to kill ${
						monster.name
					}! You need enough food to heal at least ${healAmountNeeded} HP (${Math.ceil(
						healAmountNeeded / quantity
					)} per kill). You can use these food items: ${Eatables.map(i => i.name).join(
						', '
					)}.`;
				} else {
					await user.settings.update(
						UserSettings.Bank,
						removeBankFromBank(userBank, foodToRemove)
					);
					await this.client.settings.update(
						ClientSettings.EconomyStats.PVMCost,
						addBanks([
							this.client.settings.get(ClientSettings.EconomyStats.PVMCost),
							foodToRemove
						])
					);
				}
			}
		}

		await addSubTaskToActivityTask<GroupMonsterActivityTaskOptions>(
			this.client,
			Tasks.MonsterKillingTicker,
			{
				monsterID: monster.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.GroupMonsterKilling,
				leader: msg.author.id,
				users: users.map(u => u.id)
			}
		);
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
