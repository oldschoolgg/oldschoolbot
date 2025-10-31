import { bold } from '@oldschoolgg/discord';
import { formatDuration, stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { quests } from '@/lib/minions/data/quests.js';
import { courses } from '@/lib/skilling/skills/agility.js';
import type { AgilityActivityTaskOptions } from '@/lib/types/minions.js';
import { timePerAlchAgility } from '@/mahoji/lib/abstracted_commands/alchCommand.js';

const unlimitedFireRuneProviders = [
	'Staff of fire',
	'Fire battlestaff',
	'Mystic fire staff',
	'Lava battlestaff',
	'Mystic lava staff',
	'Steam battlestaff',
	'Mystic steam staff',
	'Smoke battlestaff',
	'Mystic smoke staff',
	'Tome of fire'
];

function alching(user: MUser, tripLength: number) {
	if (user.skillsAsLevels.magic < 55) return null;
	const { bank } = user;
	const favAlchables = user.favAlchs(tripLength, true);

	if (favAlchables.length === 0) {
		return null;
	}

	const [itemToAlch] = favAlchables;

	const alchItemQty = bank.amount(itemToAlch.id);
	const nats = bank.amount('Nature rune');
	const fireRunes = bank.amount('Fire rune');

	const hasInfiniteFireRunes = user.hasEquipped(unlimitedFireRuneProviders);

	let maxCasts = Math.floor(tripLength / timePerAlchAgility);
	maxCasts = Math.min(alchItemQty, maxCasts);
	maxCasts = Math.min(nats, maxCasts);
	if (!hasInfiniteFireRunes) {
		maxCasts = Math.min(fireRunes / 5, maxCasts);
	}
	maxCasts = Math.floor(maxCasts);

	const bankToRemove = new Bank().add('Nature rune', maxCasts).add(itemToAlch.id, maxCasts);
	if (!hasInfiniteFireRunes) {
		bankToRemove.add('Fire rune', maxCasts * 5);
	}

	if (maxCasts === 0 || bankToRemove.length === 0) return null;

	const alchGP = itemToAlch.highalch! * maxCasts;
	const bankToAdd = new Bank().add('Coins', alchGP);

	return {
		maxCasts,
		bankToRemove,
		itemToAlch,
		bankToAdd
	};
}

export const lapsCommand = defineCommand({
	name: 'laps',
	description: 'Do laps on Agility courses to train Agility.',
	attributes: {
		requiresMinion: true,
		requiresMinionNotBusy: true,
		examples: ['/laps name:Ardougne rooftop course']
	},
	options: [
		{
			type: 'String',
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
			type: 'Integer',
			name: 'quantity',
			description: 'The quantity of laps you want to do (optional).',
			required: false,
			min_value: 1
		},
		{
			type: 'Boolean',
			name: 'alch',
			description: 'Do you want to alch while doing agility? (optional).',
			required: false
		}
	],
	run: async ({ options, user, channelID }) => {
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

		const maxTripLength = await user.calcMaxTripLength('Agility');

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

		const alchResult = course.name === 'Ape Atoll Agility Course' || !options.alch ? null : alching(user, duration);
		if (alchResult !== null) {
			if (!user.owns(alchResult.bankToRemove)) {
				return `You don't own ${alchResult.bankToRemove}.`;
			}

			await user.removeItemsFromBank(alchResult.bankToRemove);
			response += `\n\nYour minion is alching ${alchResult.maxCasts}x ${alchResult.itemToAlch.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
			await ClientSettings.updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
		}

		await ActivityManager.startTrip<AgilityActivityTaskOptions>({
			courseID: course.id,
			userID: user.id,
			channelID,
			quantity,
			duration,
			type: 'Agility',
			alch:
				alchResult === null
					? undefined
					: {
							itemID: alchResult.itemToAlch.id,
							quantity: alchResult.maxCasts
						}
		});

		return response;
	}
});
