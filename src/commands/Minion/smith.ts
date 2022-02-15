import { MessageAttachment } from 'discord.js';
import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description:
				'Sends your minion to smith items, which is turning bars into smithed items, like weapons and armor.',
			examples: ['+smith mithril sword', '+smith rune platebody']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, smithableItem = '']: [null | number | string, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.send({
				files: [
					new MessageAttachment(
						Buffer.from(
							Smithing.SmithableItems.map(
								item =>
									`${item.name} - lvl ${item.level} : ${Object.entries(item.inputBars)
										.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
										.join(', ')}`
							).join('\n')
						),
						'Available Smithing items.txt'
					)
				]
			});
		}

		if (typeof quantity === 'string') {
			smithableItem = quantity;
			quantity = null;
		}

		const smithedItem = Smithing.SmithableItems.find(_smithedItem =>
			stringMatches(_smithedItem.name, smithableItem)
		);

		if (!smithedItem) {
			return msg.channel.send(
				`That is not a valid item to smith, to see the items availible do \`${msg.cmdPrefix}smith --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`
			);
		}

		const userQP = msg.author.settings.get(UserSettings.QP);

		if (smithedItem.qpRequired && userQP < smithedItem.qpRequired) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${smithedItem.qpRequired} QP to smith ${smithedItem.name}`
			);
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4;

		let maxTripLength = msg.author.maxTripLength('Smithing');
		if (smithedItem.name === 'Cannonball') {
			maxTripLength *= 2;
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		await msg.author.settings.sync(true);
		const baseCost = new Bank(smithedItem.inputBars);

		const maxCanDo = msg.author.bank().fits(baseCost);
		if (maxCanDo === 0) {
			return msg.channel.send("You don't have enough supplies to smith even one of this item!");
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const cost = new Bank();
		cost.add(baseCost.multiply(quantity));

		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${smithedItem.name}s you can smith is ${Math.floor(
					maxTripLength / timeToSmithSingleBar
				)}.`
			);
		}

		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.SmithingCost, cost);

		await addSubTaskToActivityTask<SmithingActivityTaskOptions>({
			smithedBarID: smithedItem.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: 'Smithing'
		});

		return msg.channel.send(
			`${msg.author.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
				smithedItem.name
			}, removed ${cost} from your bank, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
