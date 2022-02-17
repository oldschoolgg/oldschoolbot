import { Time } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { client } from '../..';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { OSBMahojiCommand } from '../lib/util';

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

function alching(user: KlasaUser, tripLength: number, alch: boolean) {
	if (user.skillLevel(SkillsEnum.Magic) < 55) return null;
	const bank = user.bank();
	const favAlchables = user.getUserFavAlchs() as Item[];

	if (!alch) {
		return null;
	}
	if (favAlchables.length === 0) {
		return null;
	}

	const [itemToAlch] = favAlchables;

	const alchItemQty = bank.amount(itemToAlch.id);
	const nats = bank.amount('Nature rune');
	const fireRunes = bank.amount('Fire rune');

	const hasInfiniteFireRunes = user.hasItemEquippedAnywhere(unlimitedFireRuneProviders);

	let maxCasts = Math.floor(tripLength / (Time.Second * (3 + 10)));
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

	return {
		maxCasts,
		bankToRemove,
		itemToAlch
	};
}

export const lapsCommand: OSBMahojiCommand = {
	name: 'laps',
	description: 'Send your minion to train on an agility course.',
	attributes: {
		categoryFlags: ['minion', 'skilling'],
		description: 'Send your minion to train on an agility course.',
		examples: ['/laps Ape Atoll Course', '/laps course:Draynor Rooftop Course quantity:5 alch:True']
	},
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'course',
			description: 'The course you want to train on.',
			required: true,
			autocomplete: async (value: string) => {
				return Agility.Courses.filter(i =>
					!value ? true : i.name.toLowerCase().includes(value.toLowerCase())
				).map(i => ({ name: i.name, value: i.name }));
			}
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'quantity',
			description: 'The amount of laps you want to run.',
			required: false,
			min_value: 1,
			max_value: 200
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'alch',
			description: 'Set this to false to not alch while training (default true)',
			required: false
		}
	],
	run: async ({
		channelID,
		options,
		userID
	}: CommandRunOptions<{
		course: string;
		quantity?: number;
		alch?: boolean;
	}>) => {
		const user = await client.fetchUser(userID.toString());
		let { course, quantity, alch } = options;
		if (alch === undefined) alch = true;

		const courseObj = Agility.Courses.find(_course => stringMatches(_course.name, course));

		if (!courseObj) {
			return `Thats not a valid course. Valid courses are ${Agility.Courses.map(course => course.name).join(
				', '
			)}.`;
		}

		if (user.skillLevel(SkillsEnum.Agility) < courseObj.level) {
			return `${user.minionName} needs ${courseObj.level} agility to train at ${courseObj.name}.`;
		}

		if (courseObj.qpRequired && user.settings.get(UserSettings.QP) < courseObj.qpRequired) {
			return `You need atleast ${courseObj.qpRequired} Quest Points to do this course.`;
		}

		const maxTripLength = user.maxTripLength('Agility');
		const timePerLap = courseObj.lapTime * Time.Second;
		const maxLaps = Math.floor(maxTripLength / timePerLap);

		if (quantity === undefined) quantity = maxLaps;
		else quantity = quantity > maxLaps ? maxLaps : quantity;

		const duration = quantity * timePerLap;

		let response = `${user.minionName} is now doing ${quantity}x ${
			courseObj.name
		} laps, it'll take around ${formatDuration(duration)} to finish.`;

		const alchResult = courseObj.name === 'Ape Atoll Agility Course' || 'Penguin Agility Course' ? null : alching(user, duration, alch);
		if (alchResult !== null) {
			if (!user.owns(alchResult.bankToRemove)) {
				return `You don't own ${alchResult.bankToRemove}.`;
			}

			await user.removeItemsFromBank(alchResult.bankToRemove);
			response += `\n\nYour minion is alching ${alchResult.maxCasts}x ${alchResult.itemToAlch.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
			updateBankSetting(client, ClientSettings.EconomyStats.MagicCostBank, alchResult.bankToRemove);
		}

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>({
			courseID: courseObj.name,
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
