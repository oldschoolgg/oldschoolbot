import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { resolveItems } from 'oldschooljs/dist/util/util';
import Smithing from '../../lib/skilling/skills/smithing';
import { SkillsEnum } from '../../lib/skilling/types';
import type { SmeltingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, formatSkillRequirements, itemID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';
import { userHasGracefulEquipped } from '../mahojiSettings';

export const smeltingCommand: OSBMahojiCommand = {
	name: 'smelt',
	description: 'Smelt ores/items.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
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
			name: 'blast_furnace',
			description: 'If you want to blast furnace the bars.',
			required: false
		}
	],
	run: async ({
		userID,
		options,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; blast_furnace?: boolean }>) => {
		let { name, quantity, blast_furnace } = options;
		const user = await mUserFetch(userID);
		if (blast_furnace === undefined) blast_furnace = false;
		const boosts = [];

		const bar = blast_furnace
			? Smithing.BlastableBars.find(
					bar => stringMatches(bar.name, name) || stringMatches(bar.name.split(' ')[0], name)
				)
			: Smithing.Bars.find(bar => stringMatches(bar.name, name) || stringMatches(bar.name.split(' ')[0], name));

		if (!bar) {
			if (blast_furnace) {
				return `Thats not a valid bar to blast furnace. Valid bars are ${Smithing.BlastableBars.map(
					bar => bar.name
				).join(', ')}.`;
			}
			return `Thats not a valid bar to smelt. Valid bars are ${Smithing.Bars.map(bar => bar.name).join(', ')}.`;
		}

		if (user.skillLevel('smithing') < bar.level) {
			return `${user.minionName} needs ${bar.level} Smithing to smelt ${bar.name}s.`;
		}

		// All bars take 2.4s to smith normally, add on quarter of a second to account for banking/etc.
		let timeToSmithSingleBar = blast_furnace ? bar.timeToUse + Time.Second / 10 : bar.timeToUse + Time.Second / 4;

		if (blast_furnace) {
			const requiredSkills = {
				[SkillsEnum.Crafting]: 12,
				[SkillsEnum.Firemaking]: 16,
				[SkillsEnum.Magic]: 33,
				[SkillsEnum.Mining]: 50,
				[SkillsEnum.Smithing]: 20,
				[SkillsEnum.Thieving]: 13
			};
			if (!user.hasSkillReqs(requiredSkills)) {
				return `You don't have the required stats to use the Blast Furnace, you need: ${formatSkillRequirements(
					requiredSkills
				)}`;
			}

			// Boosts
			if (
				user.hasEquippedOrInBank('Coal bag') &&
				resolveItems(['Steel bar', 'Mithril bar', 'Adamantite bar', 'Runite bar']).includes(bar.id)
			) {
				boosts.push('60% for coal bag');
				timeToSmithSingleBar *= 0.625;
			}
			if (!userHasGracefulEquipped(user)) {
				timeToSmithSingleBar *= 1.075;
				boosts.push('-7.5% penalty for not having graceful equipped.');
			}
		}

		const maxTripLength = calcMaxTripLength(user, 'Smithing');

		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timeToSmithSingleBar);
		}

		const itemsNeeded = bar.inputOres.clone();

		const maxCanDo = user.bank.fits(itemsNeeded);
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

		let coinsToRemove = 0;
		if (blast_furnace) {
			const gpPerHour = (user.isIronman ? 1 : 3.5) * 72_000;
			coinsToRemove = Math.floor(gpPerHour * (duration / Time.Hour));
			const gp = user.GP;
			if (gp < coinsToRemove) {
				return `You need at least ${coinsToRemove} GP to work at the Blast Furnace.`;
			}

			cost.add('Coins', coinsToRemove);
		}

		await transactItems({ userID: user.id, itemsToRemove: cost });
		updateBankSetting('smithing_cost', cost);

		await addSubTaskToActivityTask<SmeltingActivityTaskOptions>({
			barID: bar.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			blastf: blast_furnace,
			duration,
			type: 'Smelting'
		});

		if (bar.id === itemID('Gold bar') && user.hasEquipped('Goldsmith gauntlets')) {
			boosts.push('56.2 xp per gold bar for Goldsmith gauntlets');
		}

		const response = `${user.minionName} is now smelting ${quantity}x ${
			bar.name
		}, it'll take around ${formatDuration(duration)} to finish. ${
			blast_furnace ? `You paid ${coinsToRemove} GP to use the Blast Furnace.` : ''
		} ${boosts.length > 0 ? `\n\n**Boosts: ** ${boosts.join(', ')}` : ''}`;

		return response;
	}
};
