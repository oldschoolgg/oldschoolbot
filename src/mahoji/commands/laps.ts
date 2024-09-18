import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time } from 'e';
import { Bank } from 'oldschooljs';

import { BitField } from '../../lib/constants';
import { InventionID, inventionBoosts, inventionItemBoost } from '../../lib/invention/inventions';
import { courses } from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import type { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { calcMaxTripLength } from '../../lib/util/calcMaxTripLength';
import { updateBankSetting } from '../../lib/util/updateBankSetting';
import type { OSBMahojiCommand } from '../lib/util';

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

export function alching({
	user,
	tripLength,
	isUsingVoidling
}: {
	user: MUser;
	tripLength: number;
	isUsingVoidling: boolean;
}) {
	if (user.skillLevel(SkillsEnum.Magic) < 55) return null;
	const { bank } = user;
	const favAlchables = user.favAlchs(tripLength);

	if (favAlchables.length === 0) {
		return null;
	}

	const [itemToAlch] = favAlchables;

	const alchItemQty = bank.amount(itemToAlch.id);
	const nats = bank.amount('Nature rune');
	const fireRunes = bank.amount('Fire rune');

	const hasInfiniteFireRunes = user.hasEquipped(unlimitedFireRuneProviders);

	let maxCasts = Math.floor(tripLength / (Time.Second * (3 + 10)));
	if (isUsingVoidling) {
		maxCasts *= 3;
	}
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
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'alch',
			description: 'Do you want to alch while doing agility? (optional).',
			required: false
		}
	],
	run: async ({
		options,
		userID,
		channelID
	}: CommandRunOptions<{ name: string; quantity?: number; alch?: boolean }>) => {
		const user = await mUserFetch(userID);

		const course = courses.find(
			course =>
				stringMatches(course.id.toString(), options.name) ||
				course.aliases.some(alias => stringMatches(alias, options.name))
		);

		if (!course) {
			return 'Thats not a valid course.';
		}

		if (user.skillLevel(SkillsEnum.Agility) < course.level) {
			return `${user.minionName} needs ${course.level} agility to train at ${course.name}.`;
		}

		if (course.qpRequired && user.QP < course.qpRequired) {
			return `You need at least ${course.qpRequired} Quest Points to do this course.`;
		}

		if (course.name === 'Daemonheim Rooftop Course' && !user.bitfield.includes(BitField.HasDaemonheimAgilityPass)) {
			return 'The Daemonheim guards deny you access to the course.';
		}

		const maxTripLength = calcMaxTripLength(user, 'Agility');

		let timePerLap = course.lapTime * Time.Second;

		const boosts: string[] = [];
		if (user.hasEquippedOrInBank('Silverhawk boots')) {
			const boostedTimePerLap = Math.floor(timePerLap / inventionBoosts.silverHawks.agilityBoostMultiplier);
			const costRes = await inventionItemBoost({
				user,
				inventionID: InventionID.SilverHawkBoots,
				duration: Math.min(
					maxTripLength,
					(options.quantity ?? Math.floor(maxTripLength / boostedTimePerLap)) * boostedTimePerLap
				)
			});
			if (costRes.success) {
				timePerLap = boostedTimePerLap;
				boosts.push(
					`${inventionBoosts.silverHawks.agilityBoostMultiplier}x faster for Silverhawk boots (${costRes.messages})`
				);
			}
		}

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

		const alchResult =
			course.name === 'Ape Atoll Agility Course'
				? null
				: !options.alch
					? null
					: alching({
							user,
							tripLength: duration,
							isUsingVoidling: user.usingPet('Voidling')
						});
		if (alchResult !== null) {
			if (!user.owns(alchResult.bankToRemove)) {
				return `You don't own ${alchResult.bankToRemove}.`;
			}

			await user.removeItemsFromBank(alchResult.bankToRemove);
			response += `\n\nYour minion is alching ${alchResult.maxCasts}x ${alchResult.itemToAlch.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
			updateBankSetting('magic_cost_bank', alchResult.bankToRemove);
		}
		if (boosts.length > 0) {
			response += `\n**Boosts:** ${boosts.join(', ')}`;
		}

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>({
			courseID: course.name,
			userID: user.id,
			channelID: channelID.toString(),
			quantity,
			duration,
			type: 'Agility',
			alch:
				alchResult === null
					? null
					: {
							itemID: alchResult.itemToAlch.id,
							quantity: alchResult.maxCasts
						}
		});

		return response;
	}
};
