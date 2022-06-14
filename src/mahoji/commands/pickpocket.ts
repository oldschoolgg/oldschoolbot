import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Pickpocketables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, rogueOutfitPercentBonus, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../lib/util/cleanString';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const pickpocketCommand: OSBMahojiCommand = {
	name: 'pickpocket',
	description: 'Sends your minion to pickpocket to train Thieving.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		description: 'Sends your minion to pickpocket to train Thieving.',
		examples: ['/pickpocket name:Man']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The NPC you want to pickpocket.',
			required: true,
			autocomplete: async (value: string, user: APIUser) => {
				const mUser = await mahojiUsersSettingsFetch(user.id);
				const conLevel = getSkillsOfMahojiUser(mUser, true).thieving;
				return Pickpocketables.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
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
			description: 'The quantity (defaults to max).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await globalClient.fetchUser(userID);
		const pickpocketable = Pickpocketables.find(
			npc => stringMatches(npc.name, options.name) || npc.alias?.some(alias => stringMatches(alias, options.name))
		);

		if (!pickpocketable) return 'That is not a valid NPC to pickpocket.';

		if (pickpocketable.qpRequired && user.settings.get(UserSettings.QP) < pickpocketable.qpRequired) {
			return `You need atleast **${pickpocketable.qpRequired}** QP to pickpocket a ${pickpocketable.name}.`;
		}

		if (pickpocketable.itemsRequired && !user.allItemsOwned().has(pickpocketable.itemsRequired)) {
			return `You need these items to pickpocket this NPC: ${new Bank(pickpocketable.itemsRequired)}.`;
		}

		if (user.skillLevel(SkillsEnum.Thieving) < pickpocketable.level) {
			return `${user.minionName} needs ${pickpocketable.level} Thieving to pickpocket a ${pickpocketable.name}.`;
		}

		const timeToPickpocket = (pickpocketable.customTickRate ?? 2) * 600;

		const maxTripLength = user.maxTripLength('Pickpocket');

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / timeToPickpocket);

		const duration = quantity * timeToPickpocket;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of times you can pickpocket a ${
				pickpocketable.name
			} is ${Math.floor(maxTripLength / timeToPickpocket)}.`;
		}

		const boosts = [];

		const [hasArdyHard] = await userhasDiaryTier(user, ArdougneDiary.hard);
		if (hasArdyHard) {
			boosts.push('+10% chance of success from Ardougne Hard diary');
		}

		const [successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
			user.skillLevel(SkillsEnum.Thieving),
			pickpocketable,
			quantity,
			user.hasItemEquippedAnywhere(['Thieving cape', 'Thieving cape(t)']),
			hasArdyHard
		);

		const { foodRemoved } = await removeFoodFromUser({
			user,
			totalHealingNeeded: damageTaken,
			healPerAction: Math.ceil(damageTaken / quantity),
			activityName: 'Pickpocketing',
			attackStylesUsed: []
		});

		if (rogueOutfitPercentBonus(user) > 0) {
			boosts.push(`${rogueOutfitPercentBonus(user)}% chance of x2 loot due to rogue outfit equipped`);
		}

		updateBankSetting(globalClient, ClientSettings.EconomyStats.ThievingCost, foodRemoved);

		await addSubTaskToActivityTask<PickpocketActivityTaskOptions>({
			monsterID: pickpocketable.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Pickpocket',
			damageTaken,
			successfulQuantity,
			xpReceived
		});

		let str = `${user.minionName} is now going to pickpocket a ${
			pickpocketable.name
		} ${quantity}x times, it'll take around ${formatDuration(duration)} to finish. Removed ${foodRemoved}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return str;
	}
};
