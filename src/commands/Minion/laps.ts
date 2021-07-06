import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { globetrotterReqs } from '../../lib/customItems';
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
import itemID from '../../lib/util/itemID';
import { GlobetrottlerOutfit } from './mclue';

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

const globetrotterTickets = new Bank({
	'Globetrotter message (beginner)': 1,
	'Globetrotter message (easy)': 1,
	'Globetrotter message (medium)': 1,
	'Globetrotter message (hard)': 1,
	'Globetrotter message (elite)': 1,
	'Globetrotter message (master)': 1
});

export function alching(user: KlasaUser, tripLength: number, isUsingVoidling: boolean) {
	if (user.skillLevel(SkillsEnum.Magic) < 55) return null;
	const bank = user.bank();
	const favAlchables = user.settings
		.get(UserSettings.FavoriteAlchables)
		.filter(id => bank.has(id))
		.map(getOSItem)
		.filter(i => i.tradeable_on_ge && i.highalch > 0)
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

		const course = Agility.Courses.find(course => course.aliases.some(alias => stringMatches(alias, name)));

		if (!course) {
			return msg.channel.send(
				`Thats not a valid course. Valid courses are ${Agility.Courses.map(course => course.name).join(', ')}.`
			);
		}

		const itemsToRemove = new Bank();
		let ticket = undefined;
		let challengeStr = '';
		let challengeMode = false;

		// Some validations for the gielinor challenge
		if (course.name === 'Gielinor Challenge Course') {
			// If the user doesnt have all the pieces, a few more checks are required
			let successfulLaps = msg.author.settings.get(UserSettings.LapsScores)[course.id] ?? 0;
			challengeMode = !new Bank(msg.author.collectionLog).has(GlobetrottlerOutfit);
			if (challengeMode) {
				ticket = globetrotterTickets.items().find(t => (msg.author.bank().has(t[0].id) ? t[0] : false));
				if (!msg.author.hasSkillReqs(globetrotterReqs)[0]) {
					return msg.channel.send(
						`You knocks on the course entrance, but no one answers. Maybe you are not worthy enough for the challenge?${
							ticket
								? ' You should examine the message you received more thoroughly, it may have the answers you need.'
								: ''
						}`
					);
				}
				if (!ticket) {
					if (successfulLaps > 0) {
						return msg.channel.send(
							"You knock on the course entrance... The gatekeeper answers and extends its hands... You forgot the entrance ticket. The gatekeeper doesn't get fooled by your attempts and tells you to come back when you have a ticket."
						);
					}
					return msg.channel.send(
						"As you knock on the course entrance... Someone answers, but they don't say anything. You feel the gatekeeper gaze and somehow you know, you are missing something. What could it be?"
					);
				}
				itemsToRemove.add(ticket[0].id);
				// The requirements increases every time the challenge is beaten.
				const requiredBank = new Bank({
					[itemID('Stamina potion(4)')]: Math.max(4, 4 * successfulLaps),
					[itemID('Saradomin brew(4)')]: Math.max(15, 15 * successfulLaps),
					[itemID('Super restore(4)')]: Math.max(5, 5 * successfulLaps)
				});
				if (!msg.author.bank().has(requiredBank.bank)) {
					return msg.channel.send(
						`As you prepare for the challenge ahead, you notice it will probably be much harder than it seems. Maybe you should bring more supplies, like ${requiredBank.remove(
							msg.author.bank()
						)}.`
					);
				}
				itemsToRemove.add(requiredBank.bank);
			}
			challengeStr = `${
				challengeMode
					? successfulLaps > 0
						? `As you have completed the challenge ${successfulLaps} times before, the gatekeeper increases its difficulty!`
						: "The gatekeeper takes it easy on you, as you have never completed the challenge before, but it still won't be easy!"
					: 'The gatekeeper notices your achievements and bows to you. You are experienced enough to complete the challenge without using any supply.'
			}`;
		} else {
			if (msg.author.skillLevel(SkillsEnum.Agility) < course.level) {
				return msg.channel.send(
					`${msg.author.minionName} needs ${course.level} agility to train at ${course.name}.`
				);
			}

			if (course.qpRequired && msg.author.settings.get(UserSettings.QP) < course.qpRequired) {
				return msg.channel.send(`You need atleast ${course.qpRequired} Quest Points to do this course.`);
			}
		}

		const maxTripLength = msg.author.maxTripLength(Activity.Agility);

		// If no quantity provided, set it to the max.
		const timePerLap = course.lapTime * Time.Second;
		if (quantity === null) {
			quantity = Math.floor(maxTripLength / timePerLap);
		}
		const duration = quantity * timePerLap;

		if (duration > maxTripLength) {
			return msg.channel.send(
				`${msg.author.minionName} can't go on trips longer than ${formatDuration(
					maxTripLength
				)}, try a lower quantity. The highest amount of ${course.name} laps you can do is ${Math.floor(
					maxTripLength / timePerLap
				)}.`
			);
		}

		let response = `${msg.author.minionName} is now doing ${quantity}x ${
			course.name
		} laps, it'll take around ${formatDuration(duration)} to finish. ${challengeStr}`.trim();

		let alchResult = null;
		if (!challengeMode) {
			alchResult = alching(msg.author, duration, true);
			if (alchResult !== null && course.name === 'Ape Atoll Agility Course') {
				if (!msg.author.owns(alchResult.bankToRemove)) {
					return msg.channel.send(`You don't own ${alchResult.bankToRemove}.`);
				}
				itemsToRemove.add(alchResult.bankToRemove.bank);
				response += `\n\nYour minion is alching ${alchResult.maxCasts}x ${alchResult.itemToAlch.name} while training. Removed ${alchResult.bankToRemove} from your bank.`;
				await updateBankSetting(
					this.client,
					ClientSettings.EconomyStats.MagicCostBank,
					alchResult.bankToRemove
				);
			}
		} else {
			response +=
				' You focus as hard as possible to complete the Gielinor Challenge and for that, you will not be alching items for this trip.';
		}

		await msg.author.removeItemsFromBank(itemsToRemove);

		await addSubTaskToActivityTask<AgilityActivityTaskOptions>({
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
					  },
			ticketID: ticket ? ticket[0].id : undefined
		});

		return msg.channel.send(response);
	}
}
