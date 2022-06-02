import { APIUser, ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';

import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import { Favours, gotFavour } from '../../lib/minions/data/kourendFavour';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { Stealable, stealables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, rand, rogueOutfitPercentBonus, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { stringMatches } from '../../lib/util/cleanString';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';
import { OSBMahojiCommand } from '../lib/util';
import { getSkillsOfMahojiUser, mahojiUsersSettingsFetch } from '../mahojiSettings';

export const stealCommand: OSBMahojiCommand = {
	name: 'steal',
	description: 'Sends your minion to steal to train Thieving.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		description: 'Sends your minion to steal to train Thieving.',
		examples: ['/steal name:Man']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The object you try to steal from.',
			required: true,
			autocomplete: async (value: string, user: APIUser) => {
				const mUser = await mahojiUsersSettingsFetch(user.id);
				const conLevel = getSkillsOfMahojiUser(mUser, true).thieving;
				return stealables
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
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
		stealables;
		const stealable: Stealable | undefined = stealables.find(
			obj => stringMatches(obj.name, options.name) || obj.alias?.some(alias => stringMatches(alias, options.name))
		);

		if (!stealable) {
			return `That is not a valid NPC/Stall to pickpocket or steal from, try pickpocketing or stealing from one of the following: ${stealables
				.map(obj => obj.name)
				.join(', ')}.`;
		}

		if (stealable.qpRequired && user.settings.get(UserSettings.QP) < stealable.qpRequired) {
			return `You need atleast **${stealable.qpRequired}** QP to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		if (stealable.itemsRequired && !user.allItemsOwned().has(stealable.itemsRequired)) {
			return `You need these items to ${
				stealable.type === 'pickpockable' ? 'pickpocket this NPC' : 'steal from this stall'
			}: ${new Bank(stealable.itemsRequired)}.`;
		}

		if (user.skillLevel(SkillsEnum.Thieving) < stealable.level) {
			return `${user.minionName} needs ${stealable.level} Thieving to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		const [hasFavour, requiredPoints] = gotFavour(user, Favours.Hosidius, 15);
		if (!hasFavour && stealable.name === 'Fruit stall') {
			return `${user.minionName} needs ${requiredPoints}% Hosidius Favour to steal fruit from the Fruit stalls!`;
		}

		const timeToTheft =
			stealable.type === 'pickpockable' ? (stealable.customTickRate ?? 2) * 600 : stealable.respawnTime;

		if (!timeToTheft) {
			return 'This NPC/Stall is not working as intended, report it.';
		}

		const maxTripLength = user.maxTripLength('Pickpocket');

		let { quantity } = options;
		if (!quantity) quantity = Math.floor(maxTripLength / timeToTheft);

		const duration = quantity * timeToTheft;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of times you can ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name} is ${Math.floor(maxTripLength / timeToTheft)}.`;
		}

		const boosts = [];
		let successfulQuantity = 0;
		let xpReceived = 0;
		let damageTaken = 0;

		let str = `${user.minionName} is now going to ${
			stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
		} a ${stealable.name} ${quantity}x times, it'll take around ${formatDuration(duration)} to finish.`;

		if (stealable.type === 'pickpockable') {
			const [hasArdyHard] = await userhasDiaryTier(user, ArdougneDiary.hard);
			if (hasArdyHard) {
				boosts.push('+10% chance of success from Ardougne Hard diary');
			}

			[successfulQuantity, damageTaken, xpReceived] = calcLootXPPickpocketing(
				user.skillLevel(SkillsEnum.Thieving),
				stealable,
				quantity,
				user.hasItemEquippedAnywhere(['Thieving cape', 'Thieving cape(t)']),
				hasArdyHard
			);

			if (rogueOutfitPercentBonus(user) > 0) {
				boosts.push(`${rogueOutfitPercentBonus(user)}% chance of x2 loot due to rogue outfit equipped`);
			}

			const { foodRemoved } = await removeFoodFromUser({
				user,
				totalHealingNeeded: damageTaken,
				healPerAction: Math.ceil(damageTaken / quantity),
				activityName: 'Pickpocketing',
				attackStylesUsed: []
			});

			updateBankSetting(globalClient, ClientSettings.EconomyStats.ThievingCost, foodRemoved);
			str += ` Removed ${foodRemoved}.`;
		} else {
			// Up to 5% fail chance, random
			successfulQuantity = Math.floor((quantity * rand(95, 100)) / 100);
			xpReceived = successfulQuantity * stealable.xp;
		}

		await addSubTaskToActivityTask<PickpocketActivityTaskOptions>({
			monsterID: stealable.id,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Pickpocket',
			damageTaken,
			successfulQuantity,
			xpReceived
		});

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}

		return str;
	}
};
