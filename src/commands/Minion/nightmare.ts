import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Monsters } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { bosses } from '../../lib/collectionLog';
import { Activity, Emoji, Tasks } from '../../lib/constants';
import { Eatables } from '../../lib/eatables';
import { GearSetupTypes, GearStat } from '../../lib/gear/types';
import { ironsCantUse, minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { findMonster, reducedTimeForGroup } from '../../lib/minions/functions';
import calculateMonsterFood from '../../lib/minions/functions/calculateMonsterFood';
import hasEnoughFoodForMonster from '../../lib/minions/functions/hasEnoughFoodForMonster';
import { GroupMonsterActivityTaskOptions, KillableMonster } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { MakePartyOptions } from '../../lib/types';
import { addItemToBank, formatDuration, itemID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';

const { ceil } = Math;

/**
 * get mass changes from bso
 * You need a crush weapon
 * chance of death
 * must use hasta
 * make hasta creatable
 * sarachnis https://github.com/oldschoolgg/oldschooljs/blob/811075e427d9d064a1269a4872aada3ed135334b/src/simulation/monsters/bosses/Sarachnis.ts
 * deply some bso changes
 */

const NightmareMonster: KillableMonster = {
	id: 9415,
	name: 'The Nightmare',
	aliases: ['nightmare', 'the nightmare'],
	timeToFinish: Time.Minute * 22,
	table: Monsters.GeneralGraardor,
	emoji: '<:Little_nightmare:758149284952014928>',
	wildy: false,
	canBeKilled: false,
	difficultyRating: 7,
	notifyDrops: resolveItems([]),
	qpRequired: 10,
	groupKillable: true,
	respawnTime: Time.Minute * 1.5,
	levelRequirements: {
		prayer: 43
	},
	uniques: [],
	healAmountNeeded: 40 * 20,
	attackStyleToUse: GearSetupTypes.Melee,
	attackStylesUsed: [GearStat.AttackSlash],
	minimumGearRequirements: {
		[GearStat.DefenceSlash]: 150,
		[GearStat.AttackCrush]: 80
	}
};

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<solo|mass>',
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

			const [hasReqs, reason] = user.hasMonsterRequirements(monster);
			if (!hasReqs) {
				throw `${user.username} doesn't have the requirements for this monster: ${reason}`;
			}

			if (!hasEnoughFoodForMonster(monster, user, quantity)) {
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

				try {
					calculateMonsterFood(monster, user);
				} catch (err) {
					return [true, err];
				}

				if (!hasEnoughFoodForMonster(monster, user, 2)) {
					return [true, "you don't have enough food."];
				}

				return [false];
			}
		};

		const users = await msg.makePartyAwaiter(partyOptions);

		const [quantity, duration, perKillTime] = this.calcDurQty(users, monster, inputQuantity);

		this.checkReqs(users, monster, quantity);

		for (const user of users) {
			await user.settings.sync(true);
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
