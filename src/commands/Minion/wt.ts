import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { Eatables } from '../../lib/eatables';
import hasItemEquipped from '../../lib/gear/functions/hasItemEquipped';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { WintertodtActivityTaskOptions } from '../../lib/types/minions';
import {
	addItemToBank,
	bankHasItem,
	calcWhatPercent,
	formatDuration,
	itemID,
	reduceNumByPercent
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import resolveItems from '../../lib/util/resolveItems';

export const warmGear = resolveItems([
	'Staff of fire',
	'Fire battlestaff',
	'Lava battlestaff',
	'Steam battlestaff',
	'Smoke battlestaff',
	'Mystic fire staff',
	'Mystic lava staff',
	'Mystic steam staff',
	'Mystic smoke staff',
	'Infernal axe',
	'Infernal pickaxe',
	'Bruma torch',
	'Tome of fire',
	'Pyromancer hood',
	'Pyromancer garb',
	'Pyromancer robe',
	'Pyromancer boots',
	'Warm gloves',
	'Fire cape',
	'Firemaking cape(t)',
	'Firemaking cape'
]) as number[];

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
			return msg.send(`You need 50 Firemaking to have a chance at defeating the Wintertodt.`);
		}

		const messages = [];

		let durationPerTodt = Time.Minute * 7.3;

		// Up to a 10% boost for 99 WC
		const wcBoost = (wcLevel + 1) / 10;
		if (wcBoost > 1) messages.push(`${wcBoost.toFixed(2)}% boost for Woodcutting level`);
		durationPerTodt = reduceNumByPercent(durationPerTodt, wcBoost);
		if (msg.author.hasItemEquippedAnywhere(itemID('Dwarven greataxe'))) {
			durationPerTodt /= 2;
		}
		const baseHealAmountNeeded = 20 * 8;
		let healAmountNeeded = baseHealAmountNeeded;
		let warmGearAmount = 0;

		for (const piece of warmGear) {
			if (hasItemEquipped(piece, msg.author.settings.get(UserSettings.Gear.Skilling))) {
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

		const quantity = Math.floor(msg.author.maxTripLength / durationPerTodt);

		const bank = msg.author.settings.get(UserSettings.Bank);
		for (const food of Eatables) {
			const amountNeeded = Math.ceil(healAmountNeeded / food.healAmount) * quantity;
			if (!bankHasItem(bank, food.id, amountNeeded)) {
				if (Eatables.indexOf(food) === Eatables.length - 1) {
					return msg.send(
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

		await addSubTaskToActivityTask<WintertodtActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				minigameID: MinigameIDsEnum.Wintertodt,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Wintertodt
			}
		);

		return msg.send(
			`${
				msg.author.minionName
			} is now off to kill Wintertodt ${quantity}x times, their trip will take ${formatDuration(
				durationPerTodt * quantity
			)}. (${formatDuration(durationPerTodt)} per todt)\n\n${messages.join(', ')}.`
		);
	}
}
