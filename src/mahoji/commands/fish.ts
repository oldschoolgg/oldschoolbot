import { InventionID, inventionBoosts, inventionItemBoost } from '@/lib/bso/skills/invention/inventions.js';

import { formatDuration, reduceNumByPercent, stringSearch, Time } from '@oldschoolgg/toolkit';
import { Bank, ItemGroups, Items, itemID, Monsters } from 'oldschooljs';

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

		if (fish.qpRequired) {
			if (user.QP < fish.qpRequired) {
				return `You need ${fish.qpRequired} qp to catch those!`;
			}
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

		// If no quantity provided, set it to the max.
		let maxTripLength = await user.calcMaxTripLength('Fishing');
		let scaledTimePerFish = Time.Second * fish.timePerFish * (1 + (100 - user.skillsAsLevels.fishing) / 100);

		const boosts = [];
		const hasShelldon = user.usingPet('Shelldon');
		if (hasShelldon) {
			scaledTimePerFish /= 2;
			boosts.push('2x faster for Shelldon');
		}

		const boostedTimePerFish = reduceNumByPercent(scaledTimePerFish, inventionBoosts.mechaRod.speedBoostPercent);
		const res = await inventionItemBoost({
			user,
			inventionID: InventionID.MechaRod,
			duration: Math.min(
				maxTripLength,
				(options.quantity ?? Math.floor(maxTripLength / boostedTimePerFish)) * boostedTimePerFish
			)
		});
		if (res.success) {
			scaledTimePerFish = boostedTimePerFish;
			boosts.push(`${inventionBoosts.mechaRod.speedBoostPercent}% faster for Mecha rod (${res.messages})`);
		}

		switch (fish.bait) {
			case itemID('Fishing bait'):
				if (fish.name === 'Infernal eel') {
					scaledTimePerFish *= 1;
				} else if (user.hasEquippedOrInBank('Pearl fishing rod') && fish.name !== 'Infernal eel') {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl fishing rod');
				}
				break;
			case itemID('Feather'):
				if (fish.name === 'Barbarian fishing' && user.hasEquippedOrInBank('Pearl barbarian rod')) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl barbarian rod');
				} else if (user.hasEquippedOrInBank('Pearl fly fishing rod') && fish.name !== 'Barbarian fishing') {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Pearl fly fishing rod');
				}
				break;
			default:
				if (user.hasEquippedOrInBank('Crystal harpoon')) {
					scaledTimePerFish *= 0.95;
					boosts.push('5% for Crystal harpoon');
				}
				break;
		}

		if (user.hasEquippedOrInBank('Shark tooth necklace')) {
			scaledTimePerFish = reduceNumByPercent(scaledTimePerFish, 5);
			boosts.push('5% for Shark tooth necklace');
		}

		if (fish.id === itemID('Minnow')) {
			scaledTimePerFish *= Math.max(
				0.83,
				-0.000_541_351 * user.skillsAsLevels.fishing ** 2 + 0.089_066_3 * user.skillsAsLevels.fishing - 2.681_53
			);
		}

		const tackleBoxes = [
			"Champion's tackle box",
			'Professional tackle box',
			'Standard tackle box',
			'Basic tackle box'
		];
		for (let i = 0; i < tackleBoxes.length; i++) {
			if (user.hasEquippedOrInBank([tackleBoxes[i]])) {
				const num = Time.Minute * (tackleBoxes.length - i);
				maxTripLength += num;
				boosts.push(`${formatDuration(num)} for ${tackleBoxes[i]}`);
				break;
			}
		}
		if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
			boosts.push(
				`+9 trip minutes for having a ${
					user.allItemsOwned.has('Fish sack barrel') ? 'Fish sack barrel' : 'Fish barrel'
				}`
			);
		}

		let { quantity, flakes } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / scaledTimePerFish);

		let flakesQuantity: number | undefined;
		const cost = new Bank();

		if (flakes) {
			if (!user.bank.has('Spirit flakes')) {
				return 'You need to have at least one Spirit flake!';
			}

			flakesQuantity = Math.min(user.bank.amount('Spirit flakes'), quantity);
			boosts.push(`More fish from using ${flakesQuantity}x Spirit flakes`);
			cost.add('Spirit flakes', flakesQuantity);
		}

		if (fish.bait) {
			const baseCost = new Bank().add(fish.bait);

			const maxCanDo = user.bank.fits(baseCost);
			if (maxCanDo === 0) {
				return `You need ${Items.itemNameFromId(fish.bait)} to fish ${fish.name}!`;
			}
			if (maxCanDo < quantity) {
				quantity = maxCanDo;
			}

			cost.add(fish.bait, quantity);
		}

		if (cost.length > 0) {
			// Remove the bait and/or spirit flakes from their bank.
			await user.removeItemsFromBank(cost);
		}

		const duration = quantity * scaledTimePerFish;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${fish.name} you can fish is ${Math.floor(
				maxTripLength / scaledTimePerFish
			)}.`;
		}

		await ActivityManager.startTrip<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: user.id,
			channelId,
			quantity,
			iQty: options.quantity ? options.quantity : undefined,
			duration,
			type: 'Fishing',
			flakesQuantity
		});

		let response = `${user.minionName} is now fishing ${quantity}x ${fish.name}, it'll take around ${formatDuration(
			duration
		)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
});
