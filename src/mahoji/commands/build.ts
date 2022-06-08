import { reduceNumByPercent, round, Time } from 'e';
import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import Constructables from '../../lib/skilling/skills/construction/constructables';
import { SkillsEnum } from '../../lib/skilling/types';
import { ConstructionActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../lib/util/cleanString';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const buildCommand: OSBMahojiCommand = {
	name: 'build',
	description: 'Sends your minion to train Construction by building things.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		description: 'Sends your minion to train Construction by building things.',
		examples: ['/build name:Crude chair']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The object you want to build.',
			required: true,
			autocomplete: async (value: string, user: APIUser) => {
				const mUser = await mahojiUsersSettingsFetch(user.id);
				const conLevel = getSkillsOfMahojiUser(mUser, true).construction;
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
		const user = await globalClient.fetchUser(userID);
		const object = Constructables.find(
			object => stringMatches(object.name, options.name) || stringMatches(object.name.split(' ')[0], options.name)
		);

		if (!object) return 'Thats not a valid object to build.';

		if (user.skillLevel(SkillsEnum.Construction) < object.level) {
			return `${user.minionName} needs ${object.level} Construction to create a ${object.name}.`;
		}

		let timeToBuildSingleObject = object.ticks * 300;

		const [plank, planksQtyCost] = object.input;

		const userBank = user.bank();
		const planksHas = userBank.amount(plank);

		const maxTripLength = user.maxTripLength('Construction');

		let { quantity } = options;
		if (!quantity) {
			const maxForMaterials = planksHas / planksQtyCost;
			const maxForTime = Math.floor(maxTripLength / timeToBuildSingleObject);
			quantity = Math.floor(Math.min(maxForTime, Math.max(maxForMaterials, 1)));
		}

		const cost = new Bank().add(plank, planksQtyCost * quantity);
		const hasScroll = user.owns('Scroll of proficiency');
		if (hasScroll) {
			cost.bank[plank] = Math.floor(reduceNumByPercent(cost.bank[plank], 15));
		}

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

		await user.removeItemsFromBank(cost);

		updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, cost);

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
${hasScroll ? 'Your Scroll of proficiency allows you to save 15% of your planks.' : ''}`;
	}
};
