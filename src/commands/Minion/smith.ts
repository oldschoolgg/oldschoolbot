import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmithingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, removeItemFromBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] [smithableItem:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, smithableItem]: [number, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Smithing.SmithableItems.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputBars)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available Smithing items.txt`
			);
		}

		await msg.author.settings.sync(true);
		const smithedItem = Smithing.SmithableItems.find(
			_smithedItem =>
				stringMatches(_smithedItem.name, smithableItem) ||
				stringMatches(_smithedItem.name.split(' ')[0], smithableItem)
		);

		if (!smithedItem) {
			return msg.send(
				`That is not a valid item to smith, to see the items availible do \`${msg.cmdPrefix}smith --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < smithedItem.level) {
			return msg.send(
				`${msg.author.minionName} needs ${smithedItem.level} Smithing to smith ${smithedItem.name}s.`
			);
		}

		// Time to smith an item, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = smithedItem.timeToUse + Time.Second / 4;

		quantity = checkActivityQuantity(
			msg.author,
			quantity,
			timeToSmithSingleBar,
			smithedItem.inputBars
		);
		const duration = quantity * timeToSmithSingleBar;

		const userBank = msg.author.settings.get(UserSettings.Bank);
		// Remove the bars from their bank.
		let usedbars = 0;
		let newBank = { ...userBank };
		for (const [barID, qty] of Object.entries(smithedItem.inputBars)) {
			if (newBank[parseInt(barID)] < qty) {
				this.client.wtf(
					new Error(`${msg.author.sanitizedName} had insufficient bars to be removed.`)
				);
				return;
			}
			newBank = removeItemFromBank(newBank, parseInt(barID), qty * quantity);
			usedbars = qty * quantity;
		}

		await addSubTaskToActivityTask<SmithingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				smithedBarID: smithedItem.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Smithing
			}
		);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		return msg.send(
			`${msg.author.minionName} is now smithing ${quantity * smithedItem.outputMultiple}x ${
				smithedItem.name
			}, using ${usedbars} bars, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
