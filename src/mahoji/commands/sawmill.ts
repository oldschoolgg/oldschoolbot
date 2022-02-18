import { Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { client } from '../..';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import { Planks } from '../../lib/minions/data/planks';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { addItemToBank, formatDuration, itemNameFromID, stringMatches, toKMB } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import itemID from '../../lib/util/itemID';
import { OSBMahojiCommand } from '../lib/util';

export const sawmillCommand: OSBMahojiCommand = {
	name: 'sawmill',
	description: 'Turn logs into planks at the sawmill, boosts are given for graceful and woodcutting guild access.',
	attributes: {
		categoryFlags: ['minion'],
		description: 'Turn logs into planks at the sawmill, boosts are given for graceful and woodcutting guild access.'
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The name of the plank you wish to make',
			required: true,
			autocomplete: async (value: string) => {
				return Planks.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase()))).map(
					i => ({ name: i.name, value: i.name })
				);
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount of planks you wish to make.',
			required: false,
			min_value: 1,
			max_value: 5000
		}
	],
	run: async ({
		channelID,
		options,
		userID
	}: CommandRunOptions<{
		name: string;
		quantity?: number;
	}>) => {
		const user = await client.fetchUser(userID.toString());
		let { name, quantity } = options;

		const plank = Planks.find(_plank => stringMatches(_plank.name, name));

		if (!plank) {
			return `Thats not a valid plank to make. Valid planks are **${Planks.map(plank => plank.name).join(', ')}.`;
		}

		const boosts = [];
		let timePerPlank = (Time.Second * 37) / 27;

		if (user.hasGracefulEquipped()) {
			timePerPlank *= 0.9;
			boosts.push('10% for Graceful');
		}

		const [hasFavour] = gotFavour(user, Favours.Hosidius, 75);
		if (user.skillLevel(SkillsEnum.Woodcutting) >= 60 && user.settings.get(UserSettings.QP) >= 50 && hasFavour) {
			timePerPlank *= 0.9;
			boosts.push('10% for Woodcutting Guild unlocked');
		}

		const maxTripLength = user.maxTripLength('Sawmill');
		// If no quantity provided, set it to the max.
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timePerPlank);
		}

		const inputItemOwned = user.bank().amount(plank.inputItem);
		if (inputItemOwned < quantity) {
			quantity = inputItemOwned;
		}

		if (quantity === 0) {
			return `You don't have any ${itemNameFromID(plank.inputItem)}`;
		}

		const GP = user.settings.get(UserSettings.GP);
		let cost = plank!.gpCost * quantity;

		if (GP < cost) {
			return `You need ${toKMB(cost)} GP to create ${quantity} planks.`;
		}

		const duration = quantity * timePerPlank;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of planks you can make is ${Math.floor(
				maxTripLength / timePerPlank
			)}.`;
		}

		await user.removeItemsFromBank(new Bank().add(plank!.inputItem, quantity));
		await user.removeGP(cost);

		await client.settings.update(
			ClientSettings.EconomyStats.ConstructCostBank,
			addItemToBank(client.settings.get(ClientSettings.EconomyStats.ConstructCostBank), itemID('Coins'), cost)
		);

		await addSubTaskToActivityTask<SawmillActivityTaskOptions>({
			plankID: plank!.outputItem,
			userID: user.id,
			channelID: channelID.toString(),
			plankQuantity: quantity,
			duration,
			type: 'Sawmill'
		});

		let response = `${user.minionName} is now creating ${quantity} ${itemNameFromID(plank.outputItem)}${
			quantity > 1 ? 's' : ''
		}. The Sawmill has charged you ${toKMB(cost)} GP. They'll come back in around ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			response += `\n\n **Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};
