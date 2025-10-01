import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType, bold } from 'discord.js';

import { quests } from '@/lib/minions/data/quests.js';
import { courses } from '@/lib/skilling/skills/agility.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import {
	type AttemptZeroTimeActivityOptions,
	attemptZeroTimeActivity,
	getZeroTimeActivityPreferences,
	type ZeroTimeActivityResult
} from '@/lib/util/zeroTimeActivity.js';
import { timePerAlchAgility } from '@/mahoji/lib/abstracted_commands/alchCommand.js';

const AGILITY_FLETCH_ITEMS_PER_HOUR = 15_000;
const AGILITY_ALCHES_PER_HOUR = Time.Hour / timePerAlchAgility;

export const lapsCommand: OSBMahojiCommand = {
	name: 'laps',
	description: 'Do laps on Agility courses to train Agility.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/laps name:Ardougne rooftop course']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'name',
			description: 'The course you want to do laps on.',
			required: true,
			autocomplete: async (value: string) => {
				return courses
					.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
					.map(i => ({
						name: i.name,
						value: i.name
					}));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The quantity of laps you want to do (optional).',
			required: false,
			min_value: 1
		}
	],
	run: async ({ options, userID, channelID }: CommandRunOptions<{ name: string; quantity?: number }>) => {
		const user = await mUserFetch(userID);

		const course = courses.find(
			course =>
				stringMatches(course.id.toString(), options.name) ||
				course.aliases.some(alias => stringMatches(alias, options.name))
		);

		if (!course) {
			return 'Thats not a valid course.';
		}

		if (user.skillsAsLevels.agility < course.level) {
			return `${user.minionName} needs ${course.level} agility to train at ${course.name}.`;
		}

		if (course.qpRequired && user.QP < course.qpRequired) {
			return `You need at least ${course.qpRequired} Quest Points to do this course.`;
		}

		// Check for quest requirements
		if (course.requiredQuests) {
			const incompleteQuest = course.requiredQuests.find(quest => !user.user.finished_quest_ids.includes(quest));
			if (incompleteQuest) {
				return `You need to have completed the ${bold(
					quests.find(i => i.id === incompleteQuest)!.name
				)} quest to attempt the ${course.name} agility course.`;
			}
		}

		const maxTripLength = calcMaxTripLength(user, 'Agility');

		// If no quantity provided, set it to the max.
		const timePerLap = course.lapTime * Time.Second;
		let { quantity } = options;
		if (!quantity) {
			quantity = Math.floor(maxTripLength / timePerLap);
		}
		const duration = quantity * timePerLap;

		if (duration > maxTripLength) {
			return `${user.minionName} can't go on trips longer than ${formatDuration(
				maxTripLength
			)}, try a lower quantity. The highest amount of ${course.name} laps you can do is ${Math.floor(
				maxTripLength / timePerLap
			)}.`;
		}

		let response = `${user.minionName} is now doing ${quantity}x ${
			course.name
		} laps, it'll take around ${formatDuration(duration)} to finish.`;

		type FletchResult = Extract<ZeroTimeActivityResult, { type: 'fletch' }>;
		type AlchResult = Extract<ZeroTimeActivityResult, { type: 'alch' }>;
		let fletchResult: FletchResult | null = null;
		let alchResult: AlchResult | null = null;
		const zeroTimeMessages: string[] = [];
		const preferences = getZeroTimeActivityPreferences(user);
				const failureMessages: string[] = [];

		for (const preference of preferences) {
			if (preference.type === 'alch' && course.name === 'Ape Atoll Agility Course') {
				failureMessages.push(
					 alching is unavailable on this course.
				);
				continue;
			}

			const attemptOptions: AttemptZeroTimeActivityOptions =
				preference.type === 'alch'
					? {
						user,
						duration,
						preference: preference as ZeroTimeActivityPreference & { type: 'alch' },
						variant: 'agility',
						itemsPerHour: AGILITY_ALCHES_PER_HOUR
					  }
					: {
						user,
						duration,
						preference: preference as ZeroTimeActivityPreference & { type: 'fletch' },
						itemsPerHour: AGILITY_FLETCH_ITEMS_PER_HOUR
					  };

			const attempt = attemptZeroTimeActivity(attemptOptions);

			if (attempt.result) {
				if (attempt.result.type === 'fletch') {
					fletchResult = attempt.result;
				} else {
					alchResult = attempt.result;
				}
				break;
			}

			if (attempt.message) {
				failureMessages.push(
					 : 
				);
			}
		}
if (fletchResult) {
			await user.removeItemsFromBank(fletchResult.itemsToRemove);
			const _setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
			const _prefix =
				fletchResult.preference.role === 'fallback' ? 'Using fallback preference, your minion is' : 'Your minion is';
			response += \n\n fletching   while training. Removed  from your bank.;
		}

		if (alchResult) {
			await user.removeItemsFromBank(alchResult.bankToRemove);
			const _prefix =
				alchResult.preference.role === 'fallback' ? 'Using fallback preference, your minion is' : 'Your minion is';
			response += \n\n alching x  while training. Removed  from your bank.;
			updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
		}

		if (failureMessages.length > 0) {
			zeroTimeMessages.push(...failureMessages);
		}

		if (zeroTimeMessages.length > 0) {
			response += \n\n;
		}
		}

		await addSubTaskToActivityTask<_AgilityActivityTaskOptions>({
			courseID: course.id,
			userID: user.id,
			channelID,
			quantity,
			duration,
			type: 'Agility',
			alch: alchResult ? { itemID: alchResult.item.id, quantity: alchResult.quantity } : undefined,
			_fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined
		}
)

return response;
}
}
