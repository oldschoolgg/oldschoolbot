import { stringMatches } from '@oldschoolgg/toolkit';
import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';
import TzTokJad from 'oldschooljs/dist/simulation/monsters/special/TzTokJad';

import Fishing from '../../lib/skilling/skills/fishing';
import { SkillsEnum } from '../../lib/skilling/types';
import type { FishingActivityTaskOptions } from '../../lib/types/minions';
//import { formatDuration, itemID, itemNameFromID } from '../../lib/util';
import { formatDuration,  itemNameFromID } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import type { OSBMahojiCommand } from '../lib/util';



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
			name: 'minutes',
			description: 'Trip length in minutes (optional).',
			required: false,
			min_value: 1,
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'powerfish',
			description: 'Set this to true to powerfish. Higher xp/hour, No loot (default false, optional).',
			required: false
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'spirit_flakes',
			description: 'Set this to true to use spirit flakes. (default false, optional).',
			required: false
		}
	],
	run: async ({ 
		options, 
		userID, 
		channelID 
		}: CommandRunOptions<{ 
			name: string; 
			minutes?: number, 
			powerfish?: boolean, 
			spirit_flakes?: boolean 
		}>) => {
		const user = await mUserFetch(userID);
		const fish = Fishing.Fishes.find(
			fish =>
				stringMatches(fish.id, options.name) ||
				stringMatches(fish.name, options.name) ||
				fish.alias?.some(alias => stringMatches(alias, options.name))
		);
		if (!fish) return 'Thats not a valid fish to catch.';

		let { minutes, powerfish, spirit_flakes } = options;
		
		powerfish = powerfish ?? false;
		if (powerfish) {
			spirit_flakes = false; // don't use flakes if power fishing
		}
		spirit_flakes = spirit_flakes ?? false;

		if (user.skillLevel(SkillsEnum.Fishing) < fish.level) {
			return `${user.minionName} needs ${fish.level} Fishing to fish ${fish.name}.`;
		}

		if (fish.qpRequired) {
			if (user.QP < fish.qpRequired) {
				return `You need ${fish.qpRequired} qp to catch those!`;
			}
		}

		if (
			fish.name === 'Barbarian fishing' &&
			(user.skillLevel(SkillsEnum.Agility) < 15 || user.skillLevel(SkillsEnum.Strength) < 15)
		) {
			return 'You need at least 15 Agility and Strength to do Barbarian Fishing.';
		}

		if (fish.name === 'Infernal eel') {
			const jadKC = await user.getKC(TzTokJad.id);
			if (jadKC === 0) {
				return 'You are not worthy JalYt. Before you can fish Infernal Eels, you need to have defeated the mighty TzTok-Jad!';
			}
		}
		const anglerOutfit = Object.keys(Fishing.anglerItems).map(i => itemNameFromID(Number.parseInt(i)));
		if (fish.name === 'Minnow' && anglerOutfit.some(test => !user.hasEquippedOrInBank(test!))) {
			return 'You need to own the Angler Outfit to fish for Minnows.';
		}

		const boosts = [];
		if (fish.name === 'Tuna' || fish.name === 'Swordfish' || fish.name === 'Shark' || fish.name === 'Tuna/Swordfish') {
			if (user.hasEquipped('Crystal harpoon')) {
				boosts.push('35% for Crystal harpoon');
			} else if (user.hasEquipped('Dragon harpoon')) {
				boosts.push('20% for Dragon harpoon');
			} else if (user.hasEquipped('Infernal harpoon')) {
				boosts.push('20% for Infernal harpoon');
			}
		} 

		if (!powerfish) {	
			if (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel')) {
				if (fish.name != 'Minnow' && fish.name != 'Karambwanji' && fish.name != 'Infernal eel'){
					boosts.push(`+9 trip minutes for having a ${user.allItemsOwned.has('Fish sack barrel') ? 'Fish sack barrel' : 'Fish barrel'}`	);
				} else {
					boosts.push(`+9 trip minutes and +28 inventory slots for having a ${user.allItemsOwned.has('Fish sack barrel') ? 'Fish sack barrel' : 'Fish barrel'}`	);
				}
			}
		}

		if (spirit_flakes) {
			if (!user.bank.has('Spirit flakes')) {
				return 'You need to have at least one spirit flake!';
			}

			boosts.push(`50% more fish from using spirit flakes`);
		}
		
		if (powerfish) {
			boosts.push('**Powerfishing**');
		}
		
		if (fish.bait) {
			const baseCost = new Bank().add(fish.bait);
			const maxCanDo = user.bank.fits(baseCost);
			if (maxCanDo === 0) {
				return `You need ${itemNameFromID(fish.bait)} to fish ${fish.name}!`;
			}
		}
		
		
		minutes = minutes ?? 0;
		let tripTicks = 0
		if (minutes === 0) {
			let maxTripLength = calcMaxTripLength(user, 'Fishing');
			if (!powerfish && (user.allItemsOwned.has('Fish sack barrel') || user.allItemsOwned.has('Fish barrel'))) {
				maxTripLength += Time.Minute * 9;
			}
			tripTicks = maxTripLength / (Time.Second * 0.6);
		} else {
			tripTicks = 100*minutes
		}
	
		const duration = Time.Second* 0.6 * tripTicks;
		

		await addSubTaskToActivityTask<FishingActivityTaskOptions>({
			fishID: fish.id,
			userID: user.id,
			channelID: channelID.toString(),
			duration: duration,
			minutes: minutes,
			tripTicks: tripTicks,
			powerfish: powerfish,
			spirit_flakes: spirit_flakes,
			type: 'Fishing'
		});

		let response = `${user.minionName} is now fishing ${fish.name}, it'll take around ${formatDuration(duration)} to finish.`;

		if (boosts.length > 0) {
			response += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return response;
	}
};

