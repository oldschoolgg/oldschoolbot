import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, round } from 'e';
import { Bank } from 'oldschooljs';

import Constructables from '../../lib/skilling/skills/construction/constructables';
import type { Skills } from '../../lib/types';
import type { ConstructionActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, hasSkillReqs } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';

const ds2Requirements: Skills = {
	magic: 75,
	smithing: 70,
	mining: 68,
	crafting: 62,
	agility: 60,
	thieving: 60,
	construction: 50,
	hitpoints: 50,
	herblore: 45,
	prayer: 42,
	strength: 50,
	woodcutting: 55,
	fishing: 53,
	cooking: 53,
	ranged: 30,
	defence: 40,
	firemaking: 49,
	fletching: 25,
	slayer: 18
};

export const buildCommand: OSBMahojiCommand = {
	name: 'build',
	description: 'Sends your minion to train Construction by building things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/build name:Crude chair']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The object you want to build.',
			required: true,
			autocomplete: async (value: string, user: User) => {
				const mUser = await mUserFetch(user.id);
				const conLevel = mUser.skillLevel('construction');
				return Constructables.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.filter(c => c.level <= conLevel)
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity you want to build (defaults to max).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);
		const object = Constructables.find(
			object =>
				stringMatches(object.id.toString(), options.name) ||
				stringMatches(object.name, options.name) ||
				stringMatches(object.name.split(' ')[0], options.name)
		);
		const [hasDs2Requirements, ds2Reason] = hasSkillReqs(user, ds2Requirements);

		if (!object) return 'Thats not a valid object to build.';

		if (user.skillLevel('construction') < object.level) {
			return `${user.minionName} needs ${object.level} Construction to create a ${object.name}.`;
		}

		if (object.name === 'Mythical cape (mounted)') {
			if (user.QP < 205) {
				return `${user.minionName} needs 205 Quest Points to build a ${object.name}.`;
			}
			if (!hasDs2Requirements) {
				return `In order to build a ${object.name}, you need: ${ds2Reason}.`;
			}
			if (!user.hasEquippedOrInBank('Mythical cape')) {
				return `${user.minionName} needs to own a Mythical cape to build a ${object.name}.`;
			}
		}

		const timeToBuildSingleObject = object.ticks * Time.Second * 0.6;

		const [plank, planksQtyCost] = object.input;

		const userBank = user.bank;
		const planksHas = userBank.amount(plank);

		const maxTripLength = calcMaxTripLength(user, 'Construction');

		let { quantity } = options;
		if (!quantity) {
			const maxForMaterials = planksHas / planksQtyCost;
			const maxForTime = Math.floor(maxTripLength / timeToBuildSingleObject);
			quantity = Math.floor(Math.min(maxForTime, Math.max(maxForMaterials, 1)));
		}

		const cost = new Bank().add(plank, planksQtyCost * quantity);

		const objectsPerInv = 26 / planksQtyCost;
		const invsPerTrip = round(quantity / objectsPerInv, 2);

		const duration = quantity * timeToBuildSingleObject;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)} minutes, try a lower quantity. The highest amount of ${object.name}s you can build is ${Math.floor(
				maxTripLength / timeToBuildSingleObject
			)}.`;
		}

		const gpNeeded = Math.floor(10_000 * (invsPerTrip / 8));
		cost.add('Coins', gpNeeded);
		if (!user.owns(cost)) return `You don't own: ${cost}.`;

		await transactItems({ userID: user.id, itemsToRemove: cost });

		updateBankSetting('construction_cost_bank', cost);

		await addSubTaskToActivityTask<ConstructionActivityTaskOptions>({
			objectID: object.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Construction'
		});

		const xpHr = `${(((object.xp * quantity) / (duration / Time.Minute)) * 60).toLocaleString()} XP/Hr`;

		return `${user.minionName} is now constructing ${quantity}x ${object.name}, it'll take around ${formatDuration(
			duration
		)} to finish. Removed ${cost} from your bank. **${xpHr}**

You paid ${gpNeeded.toLocaleString()} GP, because you used ${invsPerTrip} inventories of planks.
`;
	}
};
