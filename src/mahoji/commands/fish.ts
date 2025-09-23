import { Time } from '@oldschoolgg/toolkit';
import { formatDuration, stringSearch } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { ItemGroups, Items, Monsters } from 'oldschooljs';

import { bsoTackleBoxes } from '@/lib/bso/bsoConstants.js';
import { InventionID, inventionBoosts, inventionItemBoost } from '@/lib/invention/inventions.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import type { FishingActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';

export const fishCommand: OSBMahojiCommand = {
	name: 'fish',
	description: 'Send your minion to fish fish.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/fish name:Shrimp']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The thing you want to fish.',
			required: true,
			autocomplete: async (value: string) => {
				return Fishing.Fishes.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({
					name: i.name,
					value: i.name
				}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to fish (optional).',
			required: false,
			min_value: 1
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'flakes',
			description: 'Use spirit flakes?',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; flakes?: boolean }>) => {
		const fish = Fishing.Fishes.find(fish => stringSearch(fish.name, options.name));
		if (!fish) return 'Thats not a valid fish to catch.';

		const user = await mUserFetch(userID);
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
			const jadKC = await user.getKC(Monsters.TzTokJad.id);
			if (jadKC === 0) {
				return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
			}
		}

		if (fish.name === 'Minnow' && ItemGroups.anglerOutfit.some(_piece => !user.hasEquippedOrInBank(_piece))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		const boosts = [];

		// If no quantity provided, set it to the max.
		let maxTripLength = calcMaxTripLength(user, 'Fishing');

		for (let i = 0; i < bsoTackleBoxes.length; i++) {
			if (user.hasEquippedOrInBank([bsoTackleBoxes[i]])) {
				const num = Time.Minute * (bsoTackleBoxes.length - i);
				maxTripLength += num;
				boosts.push(`${formatDuration(num)} for ${Items.itemNameFromId(bsoTackleBoxes[i])}`);
				break;
			}
		}

		const fishingTripArgs: Parameters<typeof Fishing.util.calcFishingTripStart>[0] = {
			gearBank: user.gearBank,
			fish,
			maxTripLength,
			quantityInput: options.quantity,
			wantsToUseFlakes: Boolean(options.flakes),
			isUsingMechaRod: false
		};

		const resultWithInvention = Fishing.util.calcFishingTripStart({ ...fishingTripArgs, isUsingMechaRod: true });

		const mechaRodResult =
			typeof resultWithInvention === 'string'
				? null
				: await inventionItemBoost({
						user,
						inventionID: InventionID.MechaRod,
						duration: resultWithInvention.duration
					});
		if (mechaRodResult?.success) {
			boosts.push(
				`${inventionBoosts.mechaRod.speedBoostPercent}% faster for Mecha rod (${mechaRodResult.messages})`
			);
		}

		const res = Fishing.util.calcFishingTripStart({
			gearBank: user.gearBank,
			fish,
			maxTripLength,
			quantityInput: options.quantity,
			wantsToUseFlakes: Boolean(options.flakes),
			isUsingMechaRod: mechaRodResult?.success ?? false
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

		if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
			res.boosts.push(
				`+9 trip minutes for having a ${
					user.allItemsOwned.has('Fish sack barrel') ? 'Fish sack barrel' : 'Fish barrel'
				}`
			);
		}

		await addSubTaskToActivityTask<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: user.id,
			channelID,
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
};
