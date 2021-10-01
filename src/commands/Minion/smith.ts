import { MessageAttachment } from 'discord.js';
import { calcPercentOfNum, Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Gear } from '../../lib/structures/Gear';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export function hasBlackSmithEquipped(setup: Gear) {
	return setup.hasEquipped([
		'Blacksmith helmet',
		'Blacksmith top',
		'Blacksmith apron',
		'Blacksmith boots',
		'Blacksmith gloves'
	]);
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
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

		if (smithedItem.requiresBlacksmith && !hasBlackSmithEquipped(msg.author.getGear('skilling'))) {
			return msg.channel.send('You need the Blacksmith outfit to smith this item.');
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return msg.channel.send(
				`${msg.author.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`
			);
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		let timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4;
		if (msg.author.hasItemEquippedAnywhere('Dwarven greathammer')) {
			timeToSmithSingleBar /= 2;
		} else if (msg.author.usingPet('Takon')) {
			timeToSmithSingleBar /= 4;
		}

		let maxTripLength = msg.author.maxTripLength(Activity.Smithing);
		if (smithedItem.name === 'Cannonball') {
			maxTripLength *= 2;
		}

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		if (smithedItem.name.includes('Gorajan')) {
			quantity = 1;
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

		const hasScroll = msg.author.owns('Scroll of efficiency');
		if (hasScroll) {
			for (const [item, qty] of baseCost.items()) {
				const saved = Math.floor(calcPercentOfNum(15, qty));
				cost.remove(item.id, qty - saved);
			}
		}

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
			type: Activity.Smithing
		});

		let str = `${msg.author.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
			smithedItem.name
		}, using ${cost}, it'll take around ${formatDuration(duration)} to finish.`;

		if (msg.author.usingPet('Takon')) {
			str += ' Takon is Smithing for you, at incredible speeds and skill.';
		}
		if (hasScroll) {
			str += ' Your Scroll of efficiency enables you to save 15% of the bars used.';
		}

		return msg.channel.send(str);
	}
}
