import { formatDuration, stringSearch } from '@oldschoolgg/toolkit';
import { Bank, Monsters } from 'oldschooljs';

import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import {
	anglerItemsArr,
	type SharkLureQuantity,
	sharkLureQuantities
} from '@/lib/skilling/skills/fishing/fishingUtil.js';
import type { FishingActivityTaskOptions } from '@/lib/types/minions.js';
import { bankToStrShortNames, formatSkillRequirements } from '@/lib/util/smallUtils.js';

const FEATHER_PACK_SIZE = 100;

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
			name: 'powerfish',
			description: 'Powerfish for higher XP/hour at the cost of banking any loot.',
			required: false
		},
		{
			type: 'Boolean',
			name: 'spirit_flakes',
			description: 'Use Spirit flakes for a 50% chance at extra fish.',
			required: false
		},
		{
			type: 'Integer',
			name: 'shark_lure',
			description: 'Use Shark lures (Sharks only).',
			required: false,
			choices: sharkLureQuantities.map(value => ({ name: value.toString(), value }))
		}
	],
	run: async ({ options, user, channelId }) => {
		const spot = Fishing.Fishes.find(fish => stringSearch(fish.name, options.name));
		if (!spot) {
			return 'Thats not a valid spot you can fish at.';
		}

		if (!spot.subfishes || spot.subfishes.length === 0) {
			return `${spot.name} is not supported yet.`;
		}

		if (spot.skillReqs && !user.hasSkillReqs(spot.skillReqs)) {
			return `To fish ${spot.name}, you need ${formatSkillRequirements(spot.skillReqs)}.`;
		}

		const minimumFishingLevel = Math.min(...spot.subfishes.map(sub => sub.level ?? 1));
		if (user.skillsAsLevels.fishing < minimumFishingLevel) {
			return `${user.minionName} needs ${minimumFishingLevel} Fishing to fish ${spot.name}.`;
		}

		if (spot.qpRequired && user.QP < spot.qpRequired) {
			return `You need ${spot.qpRequired} qp to catch those!`;
		}

		if (spot.name === 'Infernal eel') {
			const jadKC = await user.getKC(Monsters.TzTokJad.id);
			if (jadKC === 0) {
				return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
			}
		}

		if (spot.name === 'Minnow' && anglerItemsArr.some(piece => !user.hasEquippedOrInBank(piece.id))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		const maxTripLength = await user.calcMaxTripLength('Fishing');
		const hasWildyEliteDiary = user.hasDiary('wilderness.elite');
		const sharkLureQuantity = (options.shark_lure ?? 0) as SharkLureQuantity;
		if (sharkLureQuantity > 0 && spot.name !== 'Shark') {
			return 'Shark lures can only be used while fishing Sharks.';
		}

		const result = Fishing.util.calcFishingTripStart({
			gearBank: user.gearBank,
			fish: spot,
			maxTripLength,
			quantityInput: options.quantity,
			wantsToUseFlakes: Boolean(options.spirit_flakes),
			powerfish: Boolean(options.powerfish),
			hasWildyEliteDiary,
			sharkLureQuantity
		});

		if (typeof result === 'string') {
			return result;
		}

		if (result.featherPacksToOpen && result.featherPacksToOpen > 0) {
			const packsToOpen = result.featherPacksToOpen;
			try {
				await user.transactItems({
					itemsToRemove: new Bank().add('Feather pack', packsToOpen),
					itemsToAdd: new Bank().add('Feather', packsToOpen * FEATHER_PACK_SIZE)
				});
			} catch (err) {
				if (err instanceof Error) {
					return err.message;
				}
				throw err;
			}
		}

		if (result.suppliesToRemove.length > 0) {
			try {
				await user.transactItems({ itemsToRemove: result.suppliesToRemove });
			} catch (err) {
				if (err instanceof Error) {
					return err.message;
				}
				throw err;
			}
		}

		await ActivityManager.startTrip<FishingActivityTaskOptions>({
			fishID: spot.name,
			userID: user.id,
			channelId,
			quantity: result.quantity,
			qty: result.catches,
			loot: result.loot,
			flakesToRemove: result.flakesBeingUsed,
			blessingExtra: result.blessingExtra,
			flakeExtra: result.flakeExtra,
			powerfish: result.isPowerfishing,
			spiritFlakes: result.isUsingSpiritFlakes,
			spiritFlakePreference: result.spiritFlakePreference,
			sharkLureQuantity: result.sharkLureQuantity,
			sharkLuresToConsume: result.sharkLuresToConsume,
			sharkLurePreference: result.sharkLurePreference,
			usedBarbarianCutEat: result.usedBarbarianCutEat,
			extraCatchRolls: result.extraCatchRolls,
			iQty: options.quantity ? options.quantity : undefined,
			duration: result.duration,
			type: 'Fishing'
		});

		let response = `${user.minionName} is now fishing ${spot.name}, it'll take around ${formatDuration(result.duration)} to finish.`;

		if (result.suppliesToRemove.length > 0) {
			response += `\n\n**Used Supplies:** ${bankToStrShortNames(result.suppliesToRemove)}.`;
		}

		if ((result.sharkLureQuantity ?? 0) > 0 && result.sharkLuresToConsume) {
			response += `\n\nUsing ${result.sharkLureQuantity}x Shark lures per catch (${result.sharkLuresToConsume.toLocaleString()} total).`;
		}

		if (result.boosts.length > 0) {
			response += `\n\n**Boosts:** ${result.boosts.join(', ')}.`;
		}

		return response;
	}
});
