import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Activity } from '../../lib/constants';
import { FaladorDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import Crafting from '../../lib/skilling/skills/crafting';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['tan'],
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to craft items, or tan leather.',
			examples: ['+craft green dhide body', '+craft leather']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, craftName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(
							Crafting.Craftables.map(
								item =>
									`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
										.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
										.join(', ')}`
							).join('\n')
						),
						'Available crafting items.txt'
					)
				]
			});
		}

		if (typeof quantity === 'string') {
			craftName = quantity;
			quantity = null;
		}

		const craftable = Crafting.Craftables.find(item => stringMatches(item.name, craftName));

		if (!craftable) {
			return msg.channel.send(
				`That is not a valid craftable item, to see the items available do \`${msg.cmdPrefix}craft --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Crafting) < craftable.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${craftable.level} Crafting to craft ${craftable.name}.`
			);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.bank({ withGP: true });

		// Get the base time to craft the item then add on quarter of a second per item to account for banking/etc.
		let timeToCraftSingleItem = craftable.tickRate * Time.Second * 0.6 + Time.Second / 4;
		const [hasFallyHard] = await userhasDiaryTier(msg.author, FaladorDiary.hard);
		if (craftable.bankChest && (hasFallyHard || msg.author.skillLevel(SkillsEnum.Crafting) >= 99)) {
			timeToCraftSingleItem /= 3.25;
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Crafting);
		const quantitySpecified = quantity !== null;

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToCraftSingleItem);
			const max = userBank.fits(craftable.inputItems);
			if (max < quantity && max !== 0) quantity = max;
		}

		const duration = quantity * timeToCraftSingleItem;
		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${craftable.name}s you can craft is ${Math.floor(
					maxTripLength / timeToCraftSingleItem
				)}.`
			);
		}

		const itemsNeeded = craftable.inputItems.clone().multiply(quantity);

		// Check the user has all the required items to craft.
		if (!userBank.has(itemsNeeded.bank)) {
			return msg.channel.send(
				`You don't have enough items. For ${quantity}x ${craftable.name}, you're missing **${itemsNeeded
					.clone()
					.remove(userBank)}**.`
			);
		}

		await msg.author.removeItemsFromBank(itemsNeeded);

		updateBankSetting(this.client, ClientSettings.EconomyStats.CraftingCost, itemsNeeded.bank);

		await addSubTaskToActivityTask<CraftingActivityTaskOptions>({
			craftableID: craftable.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Crafting,
			quantitySpecified
		});

		return msg.channel.send(
			`${msg.author.minionName} is now crafting ${quantity}x ${
				craftable.name
			}, it'll take around ${formatDuration(duration)} to finish. Removed ${itemsNeeded} from your bank.`
		);
	}
}
