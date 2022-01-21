import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

export const smeltingCommand: OSBMahojiCommand = {
	name: 'smelt',
	description: 'Smelt ores/items.',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the thing you want to smelt.',
			required: true,
			autocomplete: async (value: string) => {
				return Smithing.Bars.filter(bar => bar.name.toLowerCase().includes(value.toLowerCase()))
					.slice(0, 10)
					.map(i => ({ name: i.name, value: i.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to smelt.',
			required: false,
			min_value: 1,
			max_value: 100_000
		}
	],
	run: async ({ member, options, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		let { name, quantity } = options;

		const user = await client.fetchUser(member.user.id);

		const bar = Smithing.Bars.find(
			bar => stringMatches(bar.name, name) || stringMatches(bar.name.split(' ')[0], name)
		);

		if (!bar) {
			return `Thats not a valid bar to smelt. Valid bars are ${Smithing.Bars.map(bar => bar.name).join(', ')}.`;
		}

		if (user.skillLevel(SkillsEnum.Smithing) < bar.level) {
			return `${user.minionName} needs ${bar.level} Smithing to smelt ${bar.name}s.`;
		}

		// All bars take 2.4s to smith, add on quarter of a second to account for banking/etc.
		const timeToSmithSingleBar = Time.Second * 2.4 + Time.Second / 4;

		const maxTripLength = user.maxTripLength('Smithing');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		const baseCost = new Bank(bar.inputOres);

		const maxCanDo = user.bank().fits(baseCost);
		if (maxCanDo === 0) {
			return "You don't have enough supplies to smelt even one of this item!";
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const cost = new Bank();
		cost.add(baseCost.multiply(quantity));

		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${bar.name}s you can smelt is ${Math.floor(
				maxTripLength / timeToSmithSingleBar
			)}.`;
		}

		await user.removeItemsFromBank(cost);
		updateBankSetting(client, ClientSettings.EconomyStats.SmithingCost, cost);

		await addSubTaskToActivityTask<SmeltingActivityTaskOptions>({
			barID: bar.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Smelting'
		});

		let goldGauntletMessage = '';
		if (bar.id === itemID('Gold bar') && user.hasItemEquippedAnywhere('Goldsmith gauntlets')) {
			goldGauntletMessage = '\n\n**Boosts:** 56.2 xp per gold bar for Goldsmith gauntlets.';
		}

		return `${user.minionName} is now smelting ${quantity}x ${bar.name}, it'll take around ${formatDuration(
			duration
		)} to finish.${goldGauntletMessage}`;
	}
};
