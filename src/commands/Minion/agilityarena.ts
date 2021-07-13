import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { Activity } from '../../lib/constants';
import { KaramjaDiary, userhasDiaryTier } from '../../lib/diaries';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AgilityArenaActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, itemID, resolveNameBank, stringMatches } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import chatHeadImage from '../../lib/util/chatHeadImage';
import getOSItem from '../../lib/util/getOSItem';

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

export function determineXPFromTickets(qty: number, user: KlasaUser, hasDiary: boolean) {
	let baseXP = ticketQuantities[qty as keyof typeof ticketQuantities] ?? ticketQuantities[1000];
	// The experience reward from the tickets is increased by 5 per ticket for each Agility level above 40.
	baseXP += 5 * (user.skillLevel(SkillsEnum.Agility) - 40);
	let xpToGive = baseXP * qty;
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
		const duration = msg.author.maxTripLength(Activity.AgilityArena);

		if (!msg.author.hasGracefulEquipped()) {
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: 'Ahoy there! You need full Graceful equipped to do the Brimhaven Agility Arena!',
						head: 'izzy'
					})
				]
			});
		}

		const boosts = [];

		const [hasKaramjaElite] = await userhasDiaryTier(msg.author, KaramjaDiary.elite);
		if (hasKaramjaElite) {
			boosts.push('10% extra tickets for Karamja Elite diary');
		}

		await addSubTaskToActivityTask<AgilityArenaActivityTaskOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			duration,
			type: Activity.AgilityArena,
			quantity: 1,
			minigameID: 'AgilityArena'
		});

		let str = `${msg.author.minionName} is now doing the Brimhaven Agility Arena for ${formatDuration(duration)}.`;

		if (boosts.length > 0) {
			str += `\n\n**Boosts:** ${boosts.join(', ')}.`;
		}
		return msg.channel.send(str);
	}

	async buy(msg: KlasaMessage, [input = '', qty = 1]: [string | undefined, number | undefined]) {
		const buyable = buyables.find(
			i => stringMatches(input, i.item.name) || i.aliases.some(alias => stringMatches(alias, input))
		);
		const isNotValid = !buyable && !['recolor', 'xp'].includes(input);
		if (isNotValid) {
			return msg.channel.send(
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
			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: "Are ye serious! You have no tickets, you can't buy anythin!",
						head: 'izzy'
					})
				]
			});
		}

		if (buyable) {
			const cost = qty * buyable.cost;
			if (amountTicketsHas < cost) {
				return msg.channel.send("You don't have enough Agility arena tickets.");
			}
			// Remove tickets and give buyable:
			await msg.author.exchangeItemsFromBank({
				costBank: { [itemID('Agility arena ticket')]: cost },
				lootBank: { [buyable.item.id]: qty },
				collectionLog: true
			});
			return msg.channel.send(
				`Successfully purchased ${qty}x ${buyable.item.name} for ${cost}x Agility arena tickets.`
			);
		}
		if (input === 'xp') {
			if (!(qty in ticketQuantities)) {
				return msg.channel.send(
					`You can only redeem tickets for XP at the following quantities: ${Object.keys(
						ticketQuantities
					).join(', ')}.`
				);
			}
			if (amountTicketsHas < qty) {
				return msg.channel.send("You don't have enough Agility arena tickets.");
			}
			const [hasKaramjaMed] = await userhasDiaryTier(msg.author, KaramjaDiary.medium);
			const xpToGive = determineXPFromTickets(qty, msg.author, hasKaramjaMed);
			let str = `Redeemed ${qty}x Agility arena tickets for ${xpToGive.toLocaleString()} Agility XP. (${(
				xpToGive / qty
			).toFixed(2)} ea)`;
			await Promise.all([
				msg.author.removeItemFromBank(itemID('Agility arena ticket'), qty),
				msg.author.addXP({
					skillName: SkillsEnum.Agility,
					amount: xpToGive
				})
			]);
			if (hasKaramjaMed) {
				str += '\n\nYou received 10% extra XP for the Karamja Medium Diary.';
			}
			return msg.channel.send(str);
		}

		if (input === 'recolor') {
			let cost = 250;
			const costBank = new Bank();
			const lootBank = new Bank();
			if (!bank.has(plainGraceful)) {
				return msg.channel.send({
					files: [
						await chatHeadImage({
							content: "Ye don't have a full set of Graceful in your bank for me to recolor!",
							head: 'izzy'
						})
					]
				});
			}

			if (amountTicketsHas < cost) {
				return msg.channel.send({
					files: [
						await chatHeadImage({
							content: `Ye don't have enough tickets, I charge ${cost} tickets for a recoloring.`,
							head: 'izzy'
						})
					]
				});
			}
			costBank.add('Agility arena ticket', cost);
			costBank.add(plainGraceful);
			lootBank.add(brimhavenGraceful);
			// Remove tickets and graceful and replace with brimhaven graceful
			await msg.author.exchangeItemsFromBank({ costBank, lootBank, collectionLog: true });

			return msg.channel.send({
				files: [
					await chatHeadImage({
						content: "I've recolored ye Graceful set, and taken your tickets!",
						head: 'izzy'
					})
				]
			});
		}
	}
}
