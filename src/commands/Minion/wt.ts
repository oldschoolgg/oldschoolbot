import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import {
	rand,
	reduceNumByPercent,
	calcWhatPercent,
	formatDuration,
	addItemToBank
} from '../../lib/util';
import { WintertodtActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { SkillsEnum } from '../../lib/skilling/types';
import { Cookables } from '../../lib/skilling/skills/cooking';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import bankHasItem from '../../lib/util/bankHasItem';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import resolveItems from '../../lib/util/resolveItems';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';

const healingFoods = Cookables.filter(item => item.healAmount).reverse();

const pyroPieces = resolveItems([
	'Pyromancer hood',
	'Pyromancer garb',
	'Pyromancer robe',
	'Pyromancer boots',
	'Warm gloves',
	'Bruma torch'
]) as number[];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wintertodt'],
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ATTACH_FILES']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		const fmLevel = msg.author.skillLevel(SkillsEnum.Firemaking);
		const wcLevel = msg.author.skillLevel(SkillsEnum.Woodcutting);
		if (fmLevel < 50) {
			throw `You need 50 Firemaking to have a chance at defeating the Wintertodt.`;
		}

		const messages = [];

		let durationPerTodt = Time.Minute * 7.3;

		// Up to a 5% boost for 99 WC
		const wcBoost = calcWhatPercent(wcLevel + 1, 100) / 10;
		if (wcBoost > 1) messages.push(`${wcBoost.toFixed(2)}% boost for Woodcutting level`);
		durationPerTodt = reduceNumByPercent(durationPerTodt, wcBoost);

		const baseHealAmountNeeded = 20 * 8;
		let healAmountNeeded = baseHealAmountNeeded;

		for (const piece of pyroPieces) {
			if (hasItemEquipped(piece, msg.author.settings.get(UserSettings.Gear.Skilling))) {
				healAmountNeeded -= 14;
				durationPerTodt = reduceNumByPercent(durationPerTodt, 5);
			}
		}
		if (healAmountNeeded !== baseHealAmountNeeded) {
			messages.push(
				`${calcWhatPercent(
					baseHealAmountNeeded - healAmountNeeded,
					baseHealAmountNeeded
				)}% less food for wearing Pyromancer pieces`
			);
		}
		const quantity = Math.floor(msg.author.maxTripLength / durationPerTodt);

		const bank = msg.author.settings.get(UserSettings.Bank);
		for (const food of healingFoods) {
			const amountNeeded = Math.ceil(healAmountNeeded / food.healAmount!) * quantity;
			if (!bankHasItem(bank, food.id, amountNeeded)) {
				if (healingFoods.indexOf(food) === healingFoods.length - 1) {
					throw `You don't have enough food to do Wintertodt! You can use these food items: ${healingFoods
						.map(i => i.name)
						.join(', ')}.`;
				}
				continue;
			}

			messages.push(`Removed ${amountNeeded}x ${food.name}'s from your bank`);
			await msg.author.removeItemFromBank(food.id, amountNeeded);

			// Track this food cost in Economy Stats
			await this.client.settings.update(
				ClientSettings.EconomyStats.WintertodtCost,
				addItemToBank(
					this.client.settings.get(ClientSettings.EconomyStats.WintertodtCost),
					food.id,
					amountNeeded
				)
			);

			break;
		}

		const data: WintertodtActivityTaskOptions = {
			minigameID: MinigameIDsEnum.Wintertodt,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration: durationPerTodt * quantity,
			type: Activity.Wintertodt,
			id: rand(1, 10_000_000),
			finishDate: Date.now() + 1
		};

		await addSubTaskToActivityTask(this.client, Tasks.MinigameTicker, data);

		return msg.send(
			`Doing ${quantity} Wintertodt - will take ${formatDuration(
				durationPerTodt
			)} per todt, ${formatDuration(durationPerTodt * quantity)} in total.\n\n${messages.join(
				', '
			)}.`
		);
	}
}
