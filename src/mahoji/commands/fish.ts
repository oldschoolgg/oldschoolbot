import { formatDuration, stringSearch } from '@oldschoolgg/toolkit';
import { EMonster, ItemGroups } from 'oldschooljs';

import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { FishingActivityTaskOptions } from '@/lib/types/minions.js';
export const fishCommand = defineCommand({
	name: 'fish',
	description: 'Send your minion to fish fish.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/fish name:Shrimp']
	},
	options: [
		{
			type: 'String',
			name: 'name',
			description: 'The thing you want to fish.',
			required: true,
			autocomplete: async ({ value }: StringAutoComplete) => {
				return Fishing.Fishes.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity you want to fish (optional).',
			required: false,
			min_value: 1
		},
		{
			type: 'Boolean',
			name: 'flakes',
			description: 'Use spirit flakes?',
			required: false
		}
	],
	run: async ({ options, user, channelId }) => {
		const fish = Fishing.Fishes.find(fish => stringSearch(fish.name, options.name));
		if (!fish) return 'Thats not a valid fish to catch.';

		if (user.skillsAsLevels.fishing < fish.level) {
			return `${user.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`;
		}

		if (fish.qpRequired && user.QP < fish.qpRequired) {
			return `You need ${fish.qpRequired} qp to catch those!`;
		}

		if (
			fish.name === 'Barbarian fishing' &&
			(user.skillsAsLevels.agility < 15 || user.skillsAsLevels.strength < 15)
		) {
			return 'You need at least 15 Agility and Strength to do Barbarian Fishing.';
		}

		if (fish.name === 'Infernal eel') {
			const jadKC = await user.getKC(EMonster.TZTOKJAD);
			if (jadKC === 0) {
				return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
			}
		}

		if (fish.name === 'Minnow' && ItemGroups.anglerOutfit.some(_piece => !user.hasEquippedOrInBank(_piece))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		const maxTripLength = await user.calcMaxTripLength('Fishing');

		const res = Fishing.util.calcFishingTripStart({
			gearBank: user.gearBank,
			fish,
			maxTripLength,
			quantityInput: options.quantity,
			wantsToUseFlakes: Boolean(options.flakes)
		});
		if (typeof res === 'string') {
			return res;
		}

		if (res.cost.length > 0) {
			if (!user.owns(res.cost)) {
				return `You don't own the required items to fish ${fish.name}, you need: ${res.cost}.`;
			}
			await user.transactItems({
				itemsToRemove: res.cost
			});
		}

		await ActivityManager.startTrip<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: user.id,
			channelId,
			quantity: res.quantity,
			iQty: options.quantity ? options.quantity : undefined,
			duration: res.duration,
			type: 'Fishing',
			flakesQuantity: res.flakesBeingUsed
		});

		let response = `${user.minionName} is now fishing ${res.quantity}x ${fish.name}, it'll take around ${formatDuration(
			res.duration
		)} to finish.`;

		if (res.boosts.length > 0) {
			response += `\n\n**Boosts:** ${res.boosts.join(', ')}.`;
		}

		return response;
	}
});
