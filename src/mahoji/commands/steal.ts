import { stringMatches } from '@oldschoolgg/toolkit/util';
import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import type { User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { randInt } from 'e';

import { formatDuration } from '@oldschoolgg/toolkit/util';
import { ArdougneDiary, userhasDiaryTier } from '../../lib/diaries';
import removeFoodFromUser from '../../lib/minions/functions/removeFoodFromUser';
import type { Stealable } from '../../lib/skilling/skills/thieving/stealables';
import { stealables } from '../../lib/skilling/skills/thieving/stealables';
import { SkillsEnum } from '../../lib/skilling/types';
import type { PickpocketActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { logError } from '../../lib/util/logError';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import { calcLootXPPickpocketing } from '../../tasks/minions/pickpocketActivity';
import type { OSBMahojiCommand } from '../lib/util';
import { rogueOutfitPercentBonus } from '../mahojiSettings';

export const stealCommand: OSBMahojiCommand = {
	name: 'steal',
	description: 'Sends your minion to steal to train Thieving.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/steal name:Man']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The object you try to steal from.',
			required: true,
			autocomplete: async (value: string, user: User) => {
				const mUser = await mUserFetch(user.id);
				const conLevel = mUser.skillLevel('thieving');
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
		const user = await mUserFetch(userID);

		const stealable: Stealable | undefined = stealables.find(
			obj =>
				stringMatches(obj.name, options.name) ||
				stringMatches(obj.id.toString(), options.name) ||
				obj.aliases?.some(alias => stringMatches(alias, options.name))
		);

		if (!stealable) {
			return `That is not a valid NPC/Stall to pickpocket or steal from, try pickpocketing or stealing from one of the following: ${stealables
				.map(obj => obj.name)
				.join(', ')}.`;
		}

		if (stealable.qpRequired && user.QP < stealable.qpRequired) {
			return `You need at least **${stealable.qpRequired}** QP to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		if (stealable.fireCapeRequired) {
			if (user.cl.amount('Fire cape') === 0) {
				return `In order to ${
					stealable.type === 'pickpockable' ? 'pickpocket this NPC' : 'steal from this stall'
				}, you need a fire cape in your collection log.`;
			}
		}

		if (user.skillLevel(SkillsEnum.Thieving) < stealable.level) {
			return `${user.minionName} needs ${stealable.level} Thieving to ${
				stealable.type === 'pickpockable' ? 'pickpocket' : 'steal from'
			} a ${stealable.name}.`;
		}

		const timeToTheft =
			stealable.type === 'pickpockable' ? (stealable.customTickRate ?? 2) * 600 : stealable.respawnTime;

		if (!timeToTheft) {
			logError(new Error('respawnTime missing from stealable object.'), {
				userID: user.id,
				stealable: stealable.name
			});
			return 'This NPC/Stall is missing variable respawnTime.';
		}

		const maxTripLength = calcMaxTripLength(user, 'Pickpocket');

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
				user.hasEquipped(['Thieving cape', 'Thieving cape(t)']),
				hasArdyHard
			);

			if (user.hasEquipped(['Thieving cape', 'Thieving cape(t)'])) {
				boosts.push('+10% chance of success from Thieving cape');
			}

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

			updateBankSetting('economyStats_thievingCost', foodRemoved);
			str += ` Removed ${foodRemoved}.`;
		} else {
			// Up to 5% fail chance, random
			successfulQuantity = Math.floor((quantity * randInt(95, 100)) / 100);
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
