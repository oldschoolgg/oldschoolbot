import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType, bold } from 'discord.js';

import { quests } from '@/lib/minions/data/quests.js';
import { courses } from '@/lib/skilling/skills/agility.js';
import type { AgilityActivityTaskOptions } from '@/lib/types/minions.js';
import addSubTaskToActivityTask from '@/lib/util/addSubTaskToActivityTask.js';
import { calcMaxTripLength } from '@/lib/util/calcMaxTripLength.js';
import { updateBankSetting } from '@/lib/util/updateBankSetting.js';
import {
	attemptZeroTimeActivity,
	describeZeroTimePreference,
	getZeroTimeActivityPreferences,
	getZeroTimePreferenceLabel,
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

		if (course.requiredQuests) {
			const incompleteQuest = course.requiredQuests.find(quest => !user.user.finished_quest_ids.includes(quest));
			if (incompleteQuest) {
				return `You need to have completed the ${bold(
					quests.find(i => i.id === incompleteQuest)!.name
				)} quest to attempt the ${course.name} agility course.`;
			}
		}

		const maxTripLength = calcMaxTripLength(user, 'Agility');
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
		const infoMessages: string[] = [];
		const preferences = getZeroTimeActivityPreferences(user);

		if (preferences.length > 0) {
			const alchDisabledReason =
				course.name === 'Ape Atoll Agility Course'
					? 'Alching is unavailable on this course because your minion must hold a greegree.'
					: undefined;

			const outcome = attemptZeroTimeActivity({
				user,
				duration,
				preferences,
				alch: {
					variant: 'agility',
					itemsPerHour: AGILITY_ALCHES_PER_HOUR,
					...(alchDisabledReason ? { disabledReason: alchDisabledReason } : {})
				},
				fletch: { itemsPerHour: AGILITY_FLETCH_ITEMS_PER_HOUR }
			});

			if (outcome.result?.type === 'fletch') {
				fletchResult = outcome.result;
			} else if (outcome.result?.type === 'alch') {
				alchResult = outcome.result;
			}

			const formattedFailures = outcome.failures
				.filter(failure => failure.message)
				.map(failure => `${getZeroTimePreferenceLabel(failure.preference)}: ${failure.message}`);

			if (outcome.result) {
				if (outcome.result.preference.role === 'fallback') {
					const fallbackDescription = describeZeroTimePreference(outcome.result.preference);
					const prefix = formattedFailures.length > 0 ? `${formattedFailures.join(' ')} ` : '';
					infoMessages.push(`${prefix}Falling back to ${fallbackDescription}.`.trim());
				}
			} else if (formattedFailures.length > 0) {
				infoMessages.push(...formattedFailures);
			}
		}

		if (fletchResult) {
			await user.removeItemsFromBank(fletchResult.itemsToRemove);
			const setsText = fletchResult.fletchable.outputMultiple ? ' sets of' : '';
			const prefix =
				fletchResult.preference.role === 'fallback'
					? 'Using fallback preference, your minion is'
					: 'Your minion is';
			response += `\n\n${prefix} fletching ${fletchResult.quantity}${setsText} ${fletchResult.fletchable.name} while training. Removed ${fletchResult.itemsToRemove} from your bank.`;
		}

		if (alchResult) {
			await user.removeItemsFromBank(alchResult.bankToRemove);
			const prefix =
				alchResult.preference.role === 'fallback'
					? 'Using fallback preference, your minion is'
					: 'Your minion is';
			response += `\n\n${prefix} alching ${alchResult.quantity}x ${alchResult.item.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
			updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
		}

		if (infoMessages.length > 0) {
			response += `\n\n${infoMessages.join('\n')}`;
		}

		const zeroTimePreferenceRole = fletchResult?.preference.role ?? alchResult?.preference.role ?? null;

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>({
			courseID: course.id,
			userID: user.id,
			channelID,
			quantity,
			duration,
			type: 'Agility',
			alch: alchResult ? { itemID: alchResult.item.id, quantity: alchResult.quantity } : undefined,
			fletch: fletchResult ? { id: fletchResult.fletchable.id, qty: fletchResult.quantity } : undefined,
			zeroTimePreferenceRole
		});

		return response;
	}
};
