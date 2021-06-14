import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity, Time } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AgilityActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

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

export function alching(user: KlasaUser, tripLength: number) {
	if (user.skillLevel(SkillsEnum.Magic) < 55) return null;
	const bank = user.bank();
	const favAlchables = user.settings
		.get(UserSettings.FavoriteAlchables)
		.filter(id => bank.has(id))
		.map(getOSItem)
		.filter(i => i.highalch > 0)
		.sort((a, b) => b.highalch - a.highalch);

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

	return {
		maxCasts,
		bankToRemove,
		itemToAlch
	};
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[quantity:int{1}|name:...string] [name:...string]',
			usageDelim: ' ',
			description: 'Sends your minion to do laps of an agility course.',
			examples: ['+laps gnome', '+laps 5 draynor'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage, [quantity, name = '']: [null | number | string, string]) {
		if (typeof quantity === 'string') {
			name = quantity;
			quantity = null;
		}

		const course = Agility.Courses.find(course =>
			course.aliases.some(alias => stringMatches(alias, name))
		);

		if (!course) {
			return msg.send(
				`Thats not a valid course. Valid courses are ${Agility.Courses.map(
					course => course.name
				).join(', ')}.`
			);
		}

		if (msg.author.skillLevel(SkillsEnum.Agility) < course.level) {
			return msg.send(
				`${msg.author.minionName} needs ${course.level} agility to train at ${course.name}.`
			);
		}

		if (course.qpRequired && msg.author.settings.get(UserSettings.QP) < course.qpRequired) {
			return msg.send(
				`You need atleast ${course.qpRequired} Quest Points to do this course.`
			);
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Agility);

		// If no quantity provided, set it to the max.
		const timePerLap = course.lapTime * Time.Second;
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timePerLap);
		}
		const duration = quantity * timePerLap;

		if (duration > maxTripLength) {
			return msg.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${
					course.name
				} laps you can do is ${Math.floor(maxTripLength / timePerLap)}.`
			);
		}

		let response = `${msg.author.minionName} is now doing ${quantity}x ${
			course.name
		} laps, it'll take around ${formatDuration(duration)} to finish.`;

		const alchResult = alching(msg.author, duration);
		if (alchResult !== null) {
			if (course.name === 'Ape Atoll Agility Course') {
				return msg.channel.send(
					`<:karamjanMonkey:739460740871749742> Monkey's can't alch!`
				);
			}
			if (!msg.author.owns(alchResult.bankToRemove)) {
				return msg.channel.send(`You don't own ${alchResult.bankToRemove}.`);
			}
			await msg.author.removeItemsFromBank(alchResult.bankToRemove);
			response += `\n\nYour minion is alching ${alchResult.maxCasts}x ${alchResult.itemToAlch.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
			updateBankSetting(
				this.client,
				ClientSettings.EconomyStats.MagicCostBank,
				alchResult.bankToRemove
			);
		}

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>(this.client, {
			courseID: course.name,
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity,
			duration,
			type: Activity.Agility,
			alch:
				alchResult === null
					? null
					: {
							itemID: alchResult.itemToAlch.id,
							quantity: alchResult.maxCasts
					  }
		});

		return msg.send(response);
	}
}
