import { MessageAttachment } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';
import { Activity, Tasks } from '../../lib/constants';
import { hasGracefulEquipped } from '../../lib/gear/functions/hasGracefulEquipped';
import chatHeadImage from '../../lib/image/chatHeadImage';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { AgilityArenaActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, resolveNameBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';
import { skillsMeetRequirements } from '../../lib/util/skillsMeetRequirements';

const buyables = [
	{
		item: getOSItem('Toadflax'),
		cost: 3,
		aliases: []
	},
	{
		item: getOSItem('Snapdragon'),
		cost: 10,
		aliases: []
	},
	{
		item: getOSItem("Pirate's hook"),
		cost: 800,
		aliases: ['pirates']
	}
];

export async function izzyChat(str: string) {
	const image = await chatHeadImage({ content: str, name: "Cap'n Izzy No-Beard", head: 'izzy' });
	return new MessageAttachment(image);
}

export function hasKaramjaEliteDiary(user: KlasaUser): boolean {
	return skillsMeetRequirements(user.rawSkills, {
		farming: 72,
		runecraft: 91,
		agility: 53,
		cooking: 53,
		mining: 52,
		smithing: 40,
		thieving: 50,
		woodcutting: 50,
		fishing: 65
	});
}

export function hasKaramjaMedDiary(user: KlasaUser): boolean {
	return skillsMeetRequirements(user.rawSkills, {
		agility: 12,
		cooking: 16,
		fishing: 65,
		farming: 27,
		mining: 40,
		woodcutting: 50
	});
}

const ticketQuantities = {
	1: 240,
	10: 248,
	25: 260,
	100: 280,
	1000: 320
};

const plainGraceful = resolveNameBank({
	'Graceful hood': 1,
	'Graceful top': 1,
	'Graceful legs': 1,
	'Graceful gloves': 1,
	'Graceful boots': 1,
	'Graceful cape': 1
});

const brimhavenGraceful = resolveNameBank({
	'Brimhaven graceful hood': 1,
	'Brimhaven graceful top': 1,
	'Brimhaven graceful legs': 1,
	'Brimhaven graceful gloves': 1,
	'Brimhaven graceful boots': 1,
	'Brimhaven graceful cape': 1
});

export function determineXPFromTickets(qty: number, user: KlasaUser) {
	let baseXP = ticketQuantities[qty as keyof typeof ticketQuantities] ?? ticketQuantities[1000];
	// The experience reward from the tickets is increased by 5 per ticket for each Agility level above 40.
	baseXP += 5 * (user.skillLevel(SkillsEnum.Agility) - 40);
	let xpToGive = baseXP * qty;
	const hasDiary = hasKaramjaMedDiary(user);
	if (hasDiary) xpToGive *= 1.1;
	return xpToGive;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '[buy] [name:string] [quantity:int{1}]',
			usageDelim: ' ',
			description: 'Sends your minion to complete the Brimhaven Agility Arena.',
			examples: ['+agilityarena'],
			categoryFlags: ['minion', 'skilling'],
			subcommands: true,
			aliases: ['aa']
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {
		const duration = msg.author.maxTripLength;

		if (!hasGracefulEquipped(msg.author.settings.get(UserSettings.Gear.Skilling))) {
			return msg.send(
				await izzyChat(
					`Ahoy there! You need full Graceful equipped to do the Brimhaven Agility Arena!`
				)
			);
		}

		const boosts = [];

		if (hasKaramjaEliteDiary(msg.author)) {
			boosts.push(`10% extra tickets for Karamja Elite diary`);
		}

		await addSubTaskToActivityTask<AgilityArenaActivityTaskOptions>(
			this.client,
			Tasks.MinigameTicker,
			{
				userID: msg.author.id,
				channelID: msg.channel.id,
				duration,
				type: Activity.AgilityArena,
				quantity: 1,
				minigameID: MinigameIDsEnum.AgilityArena
			}
		);

		return msg.send(
			`${msg.author.minionName} is now doing the Brimhaven Agility Arena for ${formatDuration(
				duration
			)}.`
		);
	}

	async buy(msg: KlasaMessage, [input = '', qty = 1]: [string | undefined, number | undefined]) {
		const buyable = buyables.find(
			i =>
				stringMatches(input, i.item.name) ||
				i.aliases.some(alias => stringMatches(alias, input))
		);
		const isNotValid = !buyable && !['recolor', 'xp'].includes(input);
		if (isNotValid) {
			return msg.send(
				`Here are the items you can buy from the Brimhaven Agility Arena Ticket Exchange: \n\n${buyables
					.map(i => `**${i.item.name}:** ${i.cost} tickets`)
					.join('\n')}.

Alternatively, you can convert tickets to XP (+10% XP for Karamja Medium Diary) using \`${
					msg.cmdPrefix
				}agilityarena buy xp 5\`, or recolor a set of plain Graceful using \`${
					msg.cmdPrefix
				}agilityarena buy recolor\`.`
			);
		}

		await msg.author.settings.sync(true);
		const bank = new Bank(msg.author.settings.get(UserSettings.Bank));
		const amountTicketsHas = bank.amount('Agility arena ticket');
		if (amountTicketsHas === 0) {
			return msg.send(
				await izzyChat(`Are ye serious! You have no tickets, you can't buy anythin!`)
			);
		}

		if (buyable) {
			const cost = qty * buyable.cost;
			if (amountTicketsHas < cost) {
				return msg.send(`You don't have enough Agility arena tickets.`);
			}
			await msg.author.removeItemFromBank(itemID('Agility arena ticket'), qty);
			await msg.author.addItemsToBank({ [buyable.item.id]: qty }, true);
			return msg.send(
				`Successfully purchased ${qty}x ${buyable.item.name} for ${cost}x Agility arena tickets.`
			);
		}
		if (input === 'xp') {
			if (!(qty in ticketQuantities)) {
				return msg.send(
					`You can only redeem tickets for XP at the following quantities: ${Object.values(
						ticketQuantities
					).join(', ')}.`
				);
			}
			if (amountTicketsHas < qty) {
				return msg.send(`You don't have enough Agility arena tickets.`);
			}
			const xpToGive = determineXPFromTickets(qty, msg.author);
			let str = `Redeemed ${qty}x Agility arena tickets for ${xpToGive.toLocaleString()} Agility XP. (${
				xpToGive / qty
			} ea)`;
			if (hasKaramjaMedDiary(msg.author)) {
				str += `\n\nYou received 10% extra XP for the Karamja Medium Diary.`;
			}
			return msg.send(str);
		}

		if (input === 'recolor') {
			if (!bank.has(plainGraceful)) {
				return msg.send(
					await izzyChat(
						`Ye don't have a full set of Graceful in your bank for me to recolor!`
					)
				);
			}

			if (amountTicketsHas < 250) {
				return msg.send(
					await izzyChat(
						`Ye don't have enough tickets, I charge 250 tickets for a recoloring.`
					)
				);
			}
			await msg.author.removeItemFromBank(itemID('Agility arena ticket'), 250);
			bank.remove('Agility arena ticket', 250);
			bank.remove(plainGraceful);
			bank.add(brimhavenGraceful);
			await msg.author.settings.update(UserSettings.Bank, bank.bank);
			await msg.author.addItemsToCollectionLog({
				...brimhavenGraceful,
				[itemID('Agility arena ticket')]: 250
			});
			return msg.send(
				await izzyChat(`I've recolored ye Graceful set, and taken your tickets!`)
			);
		}
	}
}
