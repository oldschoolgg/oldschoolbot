import { Time } from '@oldschoolgg/toolkit/datetime';
import { type CommandRunOptions, formatDuration, stringMatches } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType, bold } from 'discord.js';

import { type ZeroTimeActivityResult, attemptZeroTimeActivity } from '@/lib/util/zeroTimeActivity';
import { timePerAlchAgility } from '@/mahoji/lib/abstracted_commands/alchCommand';
import { quests } from '../../lib/minions/data/quests';
import { courses } from '../../lib/skilling/skills/agility';
import type { AgilityActivityTaskOptions } from '../../lib/types/minions';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';

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

                type AlchResult = Extract<ZeroTimeActivityResult, { type: 'alch' }>;
		let alchResult: AlchResult | null = null;
		let zeroTimeMessage: string | undefined;

                if (course.name !== 'Ape Atoll Agility Course') {
                        const itemsPerHour = Time.Hour / timePerAlchAgility;
                        const zeroTime = attemptZeroTimeActivity({
                                type: 'alch',
                                user,
                                duration,
                                variant: 'agility',
                                itemsPerHour
                        });

			if (zeroTime.result?.type === 'alch') {
				alchResult = zeroTime.result;
				await user.removeItemsFromBank(alchResult.bankToRemove);
				response += `\n\nYour minion is alching ${alchResult.quantity}x ${alchResult.item.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
				updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
			} else if (zeroTime.message) {
				zeroTimeMessage = zeroTime.message;
			}
		}

		if (!alchResult && zeroTimeMessage) {
			response += `\n\n${zeroTimeMessage}`;
		}

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>({
			courseID: course.id,
			userID: user.id,
			channelID,
			quantity,
			duration,
			type: 'Agility',
			alch: alchResult ? { itemID: alchResult.item.id, quantity: alchResult.quantity } : undefined
		});

		return response;
	}
};
