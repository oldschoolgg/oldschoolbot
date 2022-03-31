import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import {
	formatDuration,
	formatSkillRequirements,
	itemID,
	skillsMeetRequirements,
	stringMatches,
	updateBankSetting
} from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

export const smeltingCommand: OSBMahojiCommand = {
	name: 'smelt',
	description: 'Smelt ores/items.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		description: 'Smelt ores/items',
		examples: ['/smelt runite bar', '/smelt runite bar [quantity: 1]']
	},
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
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'blastfurnace',
			description: 'If you want to blast furnace the bars.',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; blastfurnace?: boolean }>) => {
		let { name, quantity, blastfurnace } = options;
		const user = await client.fetchUser(userID);
		if (blastfurnace === undefined) blastfurnace = false;

		const bar = Smithing.Bars.find(
			bar => stringMatches(bar.name, name) || stringMatches(bar.name.split(' ')[0], name)
		);

		const blastbar = Smithing.BlastableBars.find(
			bar => stringMatches(bar.name, name) || stringMatches(bar.name.split(' ')[0], name)
		);

		if (!bar) {
			return `Thats not a valid bar to smelt. Valid bars are ${Smithing.Bars.map(bar => bar.name).join(', ')}.`;
		}

		if (!blastbar) {
			return `Thats not a valid bar to blast furance. Valid bars are ${Smithing.BlastableBars.map(
				bar => bar.name
			).join(', ')}.`;
		}

		if (user.skillLevel(SkillsEnum.Smithing) < bar.level) {
			return `${user.minionName} needs ${bar.level} Smithing to smelt ${bar.name}s.`;
		}

		if (blastfurnace) {
			const requiredSkills = {
				crafting: 12,
				firemaking: 16,
				magic: 33,
				mining: 50,
				smithing: 20,
				thieving: 13
			};
			if (!skillsMeetRequirements(user.rawSkills, requiredSkills)) {
				return `You don't have the required stats to use the Blast Furnace, you need: ${formatSkillRequirements(
					requiredSkills
				)}`;
			}
		}

		// All bars take 2.4s to smith, add on quarter of a second to account for banking/etc.
		let timeToSmithSingleBar = Time.Second * 2.4 + Time.Second / 4;
		if (blastfurnace) {
			timeToSmithSingleBar = blastbar.timeToUse + Time.Second / 10;
		}

		// check if they have a coal bag
		let coalbag = '';
		if (
			user.hasItemEquippedOrInBank(itemID('Coal bag')) &&
			(blastbar.id === itemID('Steel Bar') ||
				blastbar.id === itemID('Mithril Bar') ||
				blastbar.id === itemID('Adamantite Bar') ||
				blastbar.id === itemID('Runite Bar'))
		) {
			coalbag = '\n\n**Boosts:** 60% speed boost for coal bag.';
			timeToSmithSingleBar *= 0.625;
		}
		let graceful = '';
		if (!user.hasGracefulEquipped()) {
			timeToSmithSingleBar *= 1.075;
			graceful = '\n-7.5% time penalty for not having graceful equipped.';
		}

		const maxTripLength = user.maxTripLength('Smithing');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		let itemsNeeded = new Bank(bar.inputOres);
		if (blastfurnace) itemsNeeded = blastbar.inputOres.clone().multiply(quantity);

		const maxCanDo = user.bank().fits(itemsNeeded);
		if (maxCanDo === 0) {
			return "You don't have enough supplies to smelt even one of this item!";
		}
		if (maxCanDo < quantity) {
			quantity = maxCanDo;
		}

		const cost = new Bank();
		cost.add(itemsNeeded.multiply(quantity));

		const duration = quantity * timeToSmithSingleBar;
		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${bar.name}s you can smelt is ${Math.floor(
				maxTripLength / timeToSmithSingleBar
			)}.`;
		}

		if (blastfurnace) {
			const gpPerHour = (user.isIronman ? 1 : 3.5) * 72_000;
			const coinsToRemove = Math.floor(gpPerHour * (duration / Time.Hour));
			const gp = user.settings.get(UserSettings.GP);
			if (gp < coinsToRemove) {
				return `You need atleast ${coinsToRemove} GP to work at the Blast Furnace.`;
			}

			cost.add('Coins', coinsToRemove);
		}

		await user.removeItemsFromBank(cost);
		updateBankSetting(client, ClientSettings.EconomyStats.SmithingCost, cost);

		await addSubTaskToActivityTask<SmeltingActivityTaskOptions>({
			barID: bar.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			blastf: blastfurnace,
			duration,
			type: 'Smelting'
		});

		let goldGauntletMessage = '';
		if (bar.id === itemID('Gold bar') && user.hasItemEquippedAnywhere('Goldsmith gauntlets')) {
			goldGauntletMessage = '\n\n**Boosts:** 56.2 xp per gold bar for Goldsmith gauntlets.';
		}

		let response = `${user.minionName} is now smelting ${quantity}x ${bar.name}, it'll take around ${formatDuration(
			duration
		)} to finish.${goldGauntletMessage}`;

		if (blastfurnace) {
			response += `You paid ${coinsToRemove} GP to use the Blast Furnace.${goldGauntletMessage}${coalbag}${graceful}`;
		}
		return response;
	}
};
