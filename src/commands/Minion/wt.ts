import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { Eatables } from '../../lib/data/eatables';
import { warmGear } from '../../lib/data/filterables';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { WintertodtActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, bankHasItem, calcWhatPercent, formatDuration, reduceNumByPercent } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wintertodt'],
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ATTACH_FILES'],
			categoryFlags: ['minion', 'skilling', 'minigame'],
			description: 'Sends your minion to fight the Wintertodt. Requires food and warm items.',
			examples: ['+wt']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage) {
		const fmLevel = msg.author.skillLevel(SkillsEnum.Firemaking);
		const wcLevel = msg.author.skillLevel(SkillsEnum.Woodcutting);
		if (fmLevel < 50) {
			return msg.channel.send('You need 50 Firemaking to have a chance at defeating the Wintertodt.');
		}

		const messages = [];

		let durationPerTodt = Time.Minute * 7.3;

		// Up to a 10% boost for 99 WC
		const wcBoost = (wcLevel + 1) / 10;
		if (wcBoost > 1) messages.push(`${wcBoost.toFixed(2)}% boost for Woodcutting level`);
		durationPerTodt = reduceNumByPercent(durationPerTodt, wcBoost);

		const baseHealAmountNeeded = 20 * 8;
		let healAmountNeeded = baseHealAmountNeeded;
		let warmGearAmount = 0;

		for (const piece of warmGear) {
			if (msg.author.getGear('skilling').hasEquipped([piece])) {
				warmGearAmount++;
			}
			if (warmGearAmount > 4) break;
		}

		healAmountNeeded -= warmGearAmount * 15;
		durationPerTodt = reduceNumByPercent(durationPerTodt, 5 * warmGearAmount);

		if (healAmountNeeded !== baseHealAmountNeeded) {
			messages.push(
				`${calcWhatPercent(
					baseHealAmountNeeded - healAmountNeeded,
					baseHealAmountNeeded
				)}% less food for wearing warm gear`
			);
		}

		const quantity = Math.floor(msg.author.maxTripLength(Activity.Wintertodt) / durationPerTodt);

		const bank = msg.author.settings.get(UserSettings.Bank);
		for (const food of Eatables) {
			const amountNeeded = Math.ceil(healAmountNeeded / food.healAmount) * quantity;
			if (!bankHasItem(bank, food.id, amountNeeded)) {
				if (Eatables.indexOf(food) === Eatables.length - 1) {
					return msg.channel.send(
						`You don't have enough food to do Wintertodt! You can use these food items: ${Eatables.map(
							i => i.name
						).join(', ')}.`
					);
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

		const duration = durationPerTodt * quantity;

		await addSubTaskToActivityTask<WintertodtActivityTaskOptions>({
			minigameID: 'Wintertodt',
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Wintertodt
		});

		return msg.channel.send(
			`${
				msg.author.minionName
			} is now off to kill Wintertodt ${quantity}x times, their trip will take ${formatDuration(
				durationPerTodt * quantity
			)}. (${formatDuration(durationPerTodt)} per todt)\n\n${messages.join(', ')}.`
		);
	}
}
