import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { ItemBank } from '../../lib/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { bankHasItem, formatDuration, itemID, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '<quantity:int{1}|name:...string> [name:...string]',
			usageDelim: ' ',
			categoryFlags: ['minion', 'skilling'],
			description: 'Sends your minion to smelt items, which is turning ores into bars.',
			examples: ['+smelt bronze']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, barName = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			barName = quantity;
			quantity = null;
		}

		const bar = Smithing.Bars.find(
			bar => stringMatches(bar.name, barName) || stringMatches(bar.name.split(' ')[0], barName)
		);

		if (!bar) {
			return msg.channel.send(
				`Thats not a valid bar to smelt. Valid bars are ${Smithing.Bars.map(bar => bar.name).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Smithing) < bar.level) {
			return msg.channel.send(`${msg.author.minionName} needs ${bar.level} Smithing to smelt ${bar.name}s.`);
		}

		// All bars take 2.4s to smith, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = Time.Second * 2.4 + Time.Second / 4;

		const maxTripLength = msg.author.maxTripLength(Activity.Smithing);

		// If no quantity provided, set it to the max.
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		await msg.author.settings.sync(true);
		const userBank = msg.author.settings.get(UserSettings.Bank);

		// Check the user has the required ores to smith these bars.
		// Multiplying the ore required by the quantity of bars.
		const requiredOres: [string, number][] = Object.entries(bar.inputOres);
		for (const [oreID, qty] of requiredOres) {
			if (!bankHasItem(userBank, parseInt(oreID), qty * quantity)) {
				return msg.channel.send(`You don't have enough ${itemNameFromID(parseInt(oreID))}.`);
			}
		}

		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${bar.name}s you can smelt is ${Math.floor(
					maxTripLength / timeToSmithSingleBar
				)}.`
			);
		}

		// Remove the ores from their bank.
		let newBank: ItemBank = { ...userBank };
		let costBank = new Bank();
		for (const [oreID, qty] of requiredOres) {
			if (newBank[parseInt(oreID)] < qty) {
				this.client.wtf(new Error(`${msg.author.sanitizedName} had insufficient ores to be removed.`));
				return;
			}
			costBank.add(parseInt(oreID), qty * quantity);
		}
		await msg.author.removeItemsFromBank(costBank);

		await addSubTaskToActivityTask<SmeltingActivityTaskOptions>({
			barID: bar.id,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Smelting
		});

		let goldGauntletMessage = '';
		if (bar.id === itemID('Gold bar') && msg.author.hasItemEquippedAnywhere(itemID('Goldsmith gauntlets'))) {
			goldGauntletMessage = '\n\n**Boosts:** 56.2 xp per gold bar for Goldsmith gauntlets.';
		}

		return msg.channel.send(
			`${msg.author.minionName} is now smelting ${quantity}x ${bar.name}, it'll take around ${formatDuration(
				duration
			)} to finish.${goldGauntletMessage}`
		);
	}
}
