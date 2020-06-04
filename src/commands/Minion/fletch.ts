import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Fletching from '../../lib/skilling/skills/fletching';
import { SkillsEnum } from '../../lib/skilling/types';
import { FletchingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, removeItemFromBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] [fletchableName:...string]',
			usageDelim: ' '
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(msg: KlasaMessage, [quantity, fletchName]: [number, string]) {
		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Fletching.Fletchables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available fletching items.txt`
			);
		}
		await msg.author.settings.sync(true);
		const fletchableItem = Fletching.Fletchables.find(item =>
			stringMatches(item.name, fletchName)
		);

		if (!fletchableItem) {
			return msg.send(
				`That is not a valid fletchable item, to see the items available do \`${msg.cmdPrefix}fletch --items\``
			);
		}
		let sets = 'x';
		if (fletchableItem.outputMultiple) {
			sets = 'sets of';
		}

		if (msg.author.skillLevel(SkillsEnum.Fletching) < fletchableItem.level) {
			return msg.send(
				`${msg.author.minionName} needs ${fletchableItem.level} Fletching to fletch ${fletchableItem.name}.`
			);
		}

		// Get the base time to fletch the item then add on quarter of a second per item to account for banking/etc.
		let timeToFletchSingleItem = fletchableItem.tickRate * Time.Second * 0.6 + Time.Second / 4;
		if (fletchableItem.tickRate < 1) {
			timeToFletchSingleItem = fletchableItem.tickRate * Time.Second * 0.6;
		}

		quantity = checkActivityQuantity(
			msg.author,
			quantity,
			timeToFletchSingleItem,
			fletchableItem.inputItems
		);
		const duration = quantity * timeToFletchSingleItem;

		const userBank = msg.author.settings.get(UserSettings.Bank);
		// Remove the required items from their bank.
		let newBank = { ...userBank };
		for (const [itemID, qty] of Object.entries(fletchableItem.inputItems)) {
			newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
		}
		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask<FletchingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				fletchableName: fletchableItem.name,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Fletching
			}
		);

		return msg.send(
			`${msg.author.minionName} is now Fletching ${quantity} ${sets} ${
				fletchableItem.name
			}s, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
