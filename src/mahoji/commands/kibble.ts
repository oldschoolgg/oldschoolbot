import { kibbles } from '@/lib/bso/kibble.js';

import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import { type Eatable, Eatables } from '@/lib/data/eatables.js';
import { getRealHealAmount } from '@/lib/minions/functions/getUserFoodFromBank.js';
import type { KibbleOptions } from '@/lib/types/minions.js';

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
			type: 'String',
			name: 'kibble',
			description: 'The kibble you want to make.',
			required: true,
			choices: kibbles.map(i => i.item.name).map(i => ({ name: i, value: i }))
		},
		{
			type: 'Integer',
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
		if (user.skillLevel('cooking') < kibble.level) {
			return `You need level ${kibble.level} Cooking to make this kibble.`;
		}
		if (user.skillLevel('herblore') < kibble.level - 20) {
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
				.map(i => Items.itemNameFromId(i.raw!))
				.join(', ')}.`;
		}
		const fishNeeded = calcFish(rawFishComponent);
		cost.add(rawFishComponent.raw!, fishNeeded);

		let timePer = Time.Second * 2;
		if (user.usingPet('Remy')) {
			timePer = Math.floor(timePer / 2);
		}
		const duration = timePer * options.quantity;
		const maxTripLength = user.calcMaxTripLength('KibbleMaking');
		if (duration > user.calcMaxTripLength('KibbleMaking')) {
			return `The maximum amount of ${kibble.item.name} you can create in ${formatDuration(
				user.calcMaxTripLength('KibbleMaking')
			)} is ${Math.floor(maxTripLength / timePer)}.`;
		}

		if (!user.owns(cost)) {
			return `You don't own ${cost}.`;
		}

		await user.removeItemsFromBank(cost);
		await ClientSettings.updateBankSetting('kibble_cost', cost);

		await ActivityManager.startTrip<KibbleOptions>({
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
