import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { HerbloreActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['crush', 'clean'],
			altProtection: true,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, mixName = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(
							Herblore.Mixables.map(
								item =>
									`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
										.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
										.join(', ')}`
							).join('\n')
						),
						'Available Herblore potions and items.txt'
					)
				]
			});
		}

		if (typeof quantity === 'string') {
			mixName = quantity;
			quantity = null;
		}
		const mixableItem = Herblore.Mixables.find(item => item.aliases.some(alias => stringMatches(alias, mixName)));

		if (!mixableItem) {
			return msg.channel.send(
				`That is not a valid mixable item, to see the items available do \`${msg.cmdPrefix}mix --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Herblore) < mixableItem.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${mixableItem.level} Herblore to make ${mixableItem.name}.`
			);
		}

		if (mixableItem.qpRequired && msg.author.settings.get(UserSettings.QP) < mixableItem.qpRequired) {
			return msg.channel.send(`You need atleast **${mixableItem.qpRequired}** QP to make ${mixableItem.name}.`);
		}

		let sets = 'x';
		let cost = 'is now';
		if (mixableItem.outputMultiple) {
			sets = 'batches of';
		}

		await msg.author.settings.sync(true);
		let requiredItems = new Bank(mixableItem.inputItems);

		// Get the base time to mix the item then add on quarter of a second per item to account for banking/etc.
		let timeToMixSingleItem =
			mixableItem.tickRate * Time.Second * 0.6 + mixableItem.bankTimePerPotion * Time.Second;

		const zahur = Boolean(msg.flagArgs.zahur);
		if (zahur && mixableItem.zahur === true) {
			timeToMixSingleItem = 0.000_001;
			requiredItems.add('Coins', 200);
			cost = "decided to pay Zahur 200 gp for each potion so they don't have to go";
		}
		if (msg.flagArgs.wesley && mixableItem.wesley === true) {
			timeToMixSingleItem = 0.000_001;
			requiredItems.add('Coins', 50);
			cost = "decided to pay Wesley 50 gp for each item so they don't have to go";
		}

		const maxTripLength = msg.author.maxTripLength('Herblore');

		// If no quantity provided, set it to the max the player can make by either the items in bank or max time.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToMixSingleItem);
		}

		const baseCost = new Bank(mixableItem.inputItems);

		const maxCanDo = msg.author.bank({ withGP: true }).fits(baseCost);
		if (maxCanDo === 0) {
			return msg.channel.send("You don't have enough supplies to mix even one of this item!");
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const duration = quantity * timeToMixSingleItem;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${mixableItem.name}s you can make is ${Math.floor(
					maxTripLength / timeToMixSingleItem
				)}.`
			);
		}

		const finalCost = requiredItems.multiply(quantity);
		if (!msg.author.owns(finalCost)) {
			return msg.channel.send(`You don't own: ${finalCost}.`);
		}
		await msg.author.removeItemsFromBank(finalCost);

		updateBankSetting(this.client, ClientSettings.EconomyStats.HerbloreCostBank, finalCost);

		await addSubTaskToActivityTask<HerbloreActivityTaskOptions>({
			mixableID: mixableItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			zahur,
			quantity,
			duration,
			type: 'Herblore'
		});

		return msg.channel.send(
			`${msg.author.minionName} ${cost} making ${quantity} ${sets} ${
				mixableItem.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
