import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { ItemBank } from '../../lib/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, removeItemFromBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import checkActivityQuantity from '../../lib/util/checkActivityQuantity';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}] <barName:...string>',
			usageDelim: ' '
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, barName]: [number, string]) {
		await msg.author.settings.sync(true);
		const bar = Smithing.Bars.find(
			bar =>
				stringMatches(bar.name, barName) || stringMatches(bar.name.split(' ')[0], barName)
		);

		if (!bar) {
			return msg.send(
				`Thats not a valid bar to smelt. Valid bars are ${Smithing.Bars.map(
					bar => bar.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < bar.level) {
			return msg.send(
				`${msg.author.minionName} needs ${bar.level} Smithing to smelt ${bar.name}s.`
			);
		}

		// All bars take 2.4s to smith, add on quarter of a second to account for banking/etc.
		const timeToSmeltSingleBar = Time.Second * 2.4 + Time.Second / 4;

		quantity = checkActivityQuantity(msg.author, quantity, timeToSmeltSingleBar, bar.inputOres);
		const duration = quantity * timeToSmeltSingleBar;

		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Remove the ores from their bank.
		let newBank: ItemBank = { ...userBank };
		for (const [oreID, qty] of Object.entries(bar.inputOres)) {
			if (newBank[parseInt(oreID)] < qty) {
				this.client.wtf(
					new Error(`${msg.author.sanitizedName} had insufficient ores to be removed.`)
				);
				return;
			}
			newBank = removeItemFromBank(newBank, parseInt(oreID), qty * quantity);
		}

		await addSubTaskToActivityTask<SmeltingActivityTaskOptions>(
			this.client,
			Tasks.SkillingTicker,
			{
				barID: bar.id,
				userID: msg.author.id,
				channelID: msg.channel.id,
				quantity,
				duration,
				type: Activity.Smelting
			}
		);
		await msg.author.settings.update(UserSettings.Bank, newBank);

		let goldGauntletMessage = ``;
		if (
			bar.id === itemID('Gold bar') &&
			msg.author.hasItemEquippedAnywhere(itemID('Goldsmith gauntlets'))
		) {
			goldGauntletMessage = `\n\n**Boosts:** 56.2 xp per gold bar for Goldsmith gauntlets.`;
		}

		return msg.send(
			`${msg.author.minionName} is now smelting ${quantity}x ${
				bar.name
			}, it'll take around ${formatDuration(duration)} to finish.${goldGauntletMessage}`
		);
	}
}
