import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Crafting from '../../lib/skilling/skills/crafting';
import { SkillsEnum } from '../../lib/skilling/types';
import { CraftingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, removeItemFromBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['tan'],
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] [craftName:...string]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, craftName]: [number, string]) {
		await msg.author.settings.sync(true);

		if (msg.flagArgs.items) {
			return msg.channel.sendFile(
				Buffer.from(
					Crafting.Craftables.map(
						item =>
							`${item.name} - lvl ${item.level} : ${Object.entries(item.inputItems)
								.map(entry => `${entry[1]} ${itemNameFromID(parseInt(entry[0]))}`)
								.join(', ')}`
					).join('\n')
				),
				`Available crafting items.txt`
			);
		}

		const Craft = Crafting.Craftables.find(item => stringMatches(item.name, craftName));

		if (!Craft) {
			return msg.send(
				`That is not a valid craftable item, to see the items available do \`${msg.cmdPrefix}craft --items\``
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Crafting) < Craft.level) {
			return msg.send(
				`${msg.author.minionName} needs ${Craft.level} Crafting to craft ${Craft.name}.`
			);
		}

		// Get the base time to craft the item then add on quarter of a second per item to account for banking/etc.
		const timeToCraftSingleItem = Craft.tickRate * Time.Second * 0.6 + Time.Second / 4;

		quantity = checkActivityQuantity(
			msg.author,
			quantity,
			timeToCraftSingleItem,
			Craft.inputItems
		);
		const duration = quantity * timeToCraftSingleItem;

		const userBank = msg.author.settings.get(UserSettings.Bank);
		// Remove the required items from their bank.
		let newBank = { ...userBank };
		for (const [itemID, qty] of Object.entries(Craft.inputItems)) {
			if (parseInt(itemID) === 995) {
				await msg.author.removeGP(qty * quantity);
				continue;
			}
			newBank = removeItemFromBank(newBank, parseInt(itemID), qty * quantity);
		}
		await msg.author.settings.update(UserSettings.Bank, newBank);

		await addSubTaskToActivityTask<CraftingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				craftableID: Craft.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Crafting
			}
		);

		return msg.send(
			`${msg.author.minionName} is now crafting ${quantity}x ${
				Craft.name
			}, it'll take around ${formatDuration(duration)} to finish.`
		);
	}
}
