import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { type Eatable, Eatables } from '../../lib/data/eatables';
import { kibbles } from '../../lib/data/kibble';
import { getRealHealAmount } from '../../lib/minions/functions/getUserFoodFromBank';
import { SkillsEnum } from '../../lib/skilling/types';
import type { KibbleOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';

export const kibbleCommand: OSBMahojiCommand = {
	name: 'kibble',
	description: 'Make kibble from herbs and crops.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/kibble name:Simple kibble quantity:100']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'kibble',
			description: 'The kibble you want to make.',
			required: true,
			choices: kibbles.map(i => i.item.name).map(i => ({ name: i, value: i }))
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to make.',
			required: true,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ kibble: string; quantity: number }>) => {
		const user = await mUserFetch(userID);
		const kibble = kibbles.find(e => [e.item.name, e.type].some(s => stringMatches(s, options.kibble)));
		if (!kibble) {
			return `No matching kibble found, they are: ${kibbles.map(k => k.item.name).join(', ')}.`;
		}
		if (user.skillLevel(SkillsEnum.Cooking) < kibble.level) {
			return `You need level ${kibble.level} Cooking to make this kibble.`;
		}
		if (user.skillLevel(SkillsEnum.Herblore) < kibble.level - 20) {
			return `You need level ${kibble.level} Herblore to make this kibble.`;
		}
		const userBank = user.bank;

		const cost = new Bank();
		const qtyPerComponent = 5 * (kibbles.indexOf(kibble) + 1);
		const totalQtyPerComponent = qtyPerComponent * options.quantity;

		const herbComponent = kibble.herbComponent.find(i => userBank.amount(i.id) >= totalQtyPerComponent);
		if (!herbComponent) {
			return `You need ${qtyPerComponent} of one of these herbs for ${kibble.item.name}: ${kibble.herbComponent
				.map(i => i.name)
				.join(', ')}.`;
		}
		cost.add(herbComponent.id, totalQtyPerComponent);

		const herbsNeeded = Math.ceil(totalQtyPerComponent / 2);
		const cropComponent = kibble.cropComponent.find(i => userBank.amount(i.id) >= herbsNeeded);
		if (!cropComponent) {
			return `You need ${herbsNeeded} of one of these crops for ${kibble.item.name}: ${kibble.cropComponent
				.map(i => i.name)
				.join(', ')}.`;
		}
		cost.add(cropComponent.id, herbsNeeded);

		const healAmountNeeded = qtyPerComponent * kibble.minimumFishHeal;
		const calcFish = (fish: Eatable) =>
			Math.ceil((healAmountNeeded * options.quantity) / getRealHealAmount(user.gearBank, fish.healAmount));
		const suitableFish = Eatables.filter(
			i => i.raw && getRealHealAmount(user.gearBank, i.healAmount) >= kibble.minimumFishHeal
		).sort(
			(a, b) => getRealHealAmount(user.gearBank, a.healAmount) - getRealHealAmount(user.gearBank, b.healAmount)
		);

		const rawFishComponent = suitableFish.find(i => userBank.amount(i.raw!) >= calcFish(i));
		if (!rawFishComponent) {
			return `You don't have enough raw fish, you can use these raw fish for ${kibble.item.name}: ${suitableFish
				.map(i => itemNameFromID(i.raw!))
				.join(', ')}.`;
		}
		const fishNeeded = calcFish(rawFishComponent);
		cost.add(rawFishComponent.raw!, fishNeeded);

		let timePer = Time.Second * 2;
		if (user.usingPet('Remy')) {
			timePer = Math.floor(timePer / 2);
		}
		const duration = timePer * options.quantity;
		const maxTripLength = calcMaxTripLength(user, 'KibbleMaking');
		if (duration > calcMaxTripLength(user, 'KibbleMaking')) {
			return `The maximum amount of ${kibble.item.name} you can create in ${formatDuration(
				calcMaxTripLength(user, 'KibbleMaking')
			)} is ${Math.floor(maxTripLength / timePer)}.`;
		}

		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}

		await user.removeItemsFromBank(cost);
		updateBankSetting('kibble_cost', cost);

		await addSubTaskToActivityTask<KibbleOptions>({
			userID: user.id,
			channelID: channelID.toString(),
			quantity: options.quantity,
			duration,
			type: 'KibbleMaking',
			kibbleType: kibble.type
		});

		let message = `${user.minionName} is now creating ${options.quantity}x ${
			kibble.item.name
		}, it will take ${formatDuration(duration)}. Removed ${cost} from your bank.`;
		if (user.usingPet('Remy')) {
			message += '\n**Boosts:** 2x boost for Remy';
		}
		return message;
	}
};
