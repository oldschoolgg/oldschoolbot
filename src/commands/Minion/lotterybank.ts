import { Time } from '@sapphire/time-utilities';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { BeginnerClueTable } from 'oldschooljs/dist/simulation/clues/Beginner';
import { EasyClueTable } from 'oldschooljs/dist/simulation/clues/Easy';
import { EliteClueTable } from 'oldschooljs/dist/simulation/clues/Elite';
import { HardClueTable } from 'oldschooljs/dist/simulation/clues/Hard';
import { MasterClueTable } from 'oldschooljs/dist/simulation/clues/Master';
import { MediumClueTable } from 'oldschooljs/dist/simulation/clues/Medium';

import { production } from '../../config';
import { Events } from '../../lib/constants';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { GrandmasterClueTable } from '../../lib/simulation/grandmasterClue';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addBanks, formatDuration, isSuperUntradeable, itemID } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

const options = {
	max: 1,
	time: 10_000,
	errors: ['time']
};

const lotteryItems = [
	{
		item: getOSItem('Clue scroll(beginner)'),
		value: 1_000_000
	},
	{
		item: getOSItem('Clue scroll(easy)'),
		value: 2_500_000
	},
	{
		item: getOSItem('Clue scroll(medium)'),
		value: 5_000_000
	},
	{
		item: getOSItem('Clue scroll(hard)'),
		value: 10_000_000
	},
	{
		item: getOSItem('Clue scroll(elite)'),
		value: 25_000_000
	},
	{
		item: getOSItem('Clue scroll(master)'),
		value: 35_000_000
	},
	{
		item: getOSItem('Clue scroll(grandmaster)'),
		value: 110_000_000
	},
	// Caskets
	{
		item: getOSItem('Reward casket(beginner)'),
		value: 1_500_000
	},
	{
		item: getOSItem('Reward casket(easy)'),
		value: 3_500_000
	},
	{
		item: getOSItem('Reward casket(medium)'),
		value: 8_000_000
	},
	{
		item: getOSItem('Reward casket(hard)'),
		value: 15_000_000
	},
	{
		item: getOSItem('Reward casket(elite)'),
		value: 30_000_000
	},
	{
		item: getOSItem('Reward casket(master)'),
		value: 45_000_000
	},
	{
		item: getOSItem('Reward casket(grandmaster)'),
		value: 150_000_000
	}
];

const days = [
	{
		number: 1,
		name: 'Beginner Clues, Caskets and Rewards',
		items: [...BeginnerClueTable.allItems, itemID('Clue scroll(beginner)'), itemID('Reward casket(beginner)')]
	},
	{
		number: 2,
		name: 'Easy Clues, Caskets and Rewards',
		items: [...EasyClueTable.allItems, itemID('Clue scroll(easy)'), itemID('Reward casket(easy)')]
	},
	{
		number: 3,
		name: 'Medium Clues, Caskets and Rewards',
		items: [...MediumClueTable.allItems, itemID('Clue scroll(medium)'), itemID('Reward casket(medium)')]
	},
	{
		number: 4,
		name: 'Hard Clues, Caskets and Rewards',
		items: [...HardClueTable.allItems, itemID('Clue scroll(hard)'), itemID('Reward casket(hard)')]
	},
	{
		number: 5,
		name: 'Elite Clues, Caskets and Rewards',
		items: [...EliteClueTable.allItems, itemID('Clue scroll(elite)'), itemID('Reward casket(elite)')]
	},
	{
		number: 6,
		name: 'Master Clues, Caskets and Rewards',
		items: [...MasterClueTable.allItems, itemID('Clue scroll(master)'), itemID('Reward casket(master)')]
	},
	{
		number: 7,
		name: 'Grandmaster Clues, Caskets and Rewards',
		items: [
			...GrandmasterClueTable.allItems,
			itemID('Clue scroll(grandmaster)'),
			itemID('Reward casket(grandmaster)')
		]
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[items:...TradeableBank]',
			usageDelim: ' ',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Sacrifices items from your bank.',
			examples: ['+sacrifice 1 Elysian sigil'],
			aliases: ['lottery']
		});
	}

	async run(msg: KlasaMessage, [bankArg]: [[Bank, number] | undefined]) {
		if (msg.author.isIronman) {
			return msg.channel.send('Ironmen cannot participate in the lottery.');
		}

		const start = 1_631_646_000_000;
		let now = Date.now();
		if (!production && msg.flagArgs.day) {
			const num = parseInt(msg.flagArgs.day);
			const day = days[num - 1];
			if (!day) return msg.channel.send('bruv');
			now = start + day.number * Time.Day - Time.Hour * 12;
		}
		if (now < start) {
			return msg.channel.send(
				`The clue lottery hasn't started yet, it starts in: ${formatDuration(start - now)}.`
			);
		}
		const day = days.find(d => {
			const dayFinish = start + d.number * Time.Day;
			const dayStart = dayFinish - Time.Day;
			return now > dayStart && now < dayFinish;
		});
		if (!day) {
			return msg.channel.send('The clue lottery has finished! (or this is bugged)');
		}

		if (msg.flagArgs.prices) {
			return msg.channel.send(`Special Item Prices:

${lotteryItems
	.sort((a, b) => a.value - b.value)
	.map(i => `**${i.item.name}**: ${i.value.toLocaleString()} GP`)
	.join('\n')}`);
		}

		if (!bankArg) {
			return msg.channel.sendBankImage({
				bank: this.client.settings.get(ClientSettings.BankLottery),
				title: `Day ${day.number} - Clue Lottery`,
				content:
					`It's day ${day.number}, today is: ${day.name}! Note: clues and caskets have special prices,` +
					` do \`${msg.cmdPrefix}lottery --prices\` to see a list.`
			});
		}

		const [initBankToSell] = bankArg;
		const favs = msg.author.settings.get(UserSettings.FavoriteItems);
		const bankToSell = initBankToSell.filter(i => {
			return !favs.includes(i.id) && !isSuperUntradeable(i) && day.items.includes(i.id);
		});

		if (bankToSell.amount('Lottery ticket')) {
			bankToSell.remove('Lottery ticket', bankToSell.amount('Lottery ticket'));
		}
		if (bankToSell.amount('Bank lottery ticket')) {
			bankToSell.remove('Bank lottery ticket', bankToSell.amount('Bank lottery ticket'));
		}
		if (bankToSell.length === 0) return msg.channel.send("You didn't specify valid items to put into the lottery.");
		let totalPrice = 0;
		for (const [item, qty] of bankToSell.items()) {
			const clueOrCasket = lotteryItems.find(c => c.item.id === item.id);
			if (clueOrCasket) {
				totalPrice += clueOrCasket.value * qty;
			} else {
				totalPrice += (item.price < 1_000_000 ? item.price * 3 : item.price) * qty;
			}
		}
		let amountOfTickets = Math.floor(totalPrice / 10_000_000);

		if (amountOfTickets < 1) {
			return msg.channel.send(
				`Those items aren't worth enough,\`${bankToSell}\` is worth only ${totalPrice.toLocaleString()}.`
			);
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				`${msg.author}, say \`confirm\` to commit ${bankToSell} to the bank lottery - you'll receive **${amountOfTickets} bank lottery tickets**.`
			);

			try {
				await msg.channel.awaitMessages({
					...options,
					filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
				});
			} catch (err) {
				return sellMsg.edit('Cancelling bank lottery sacrifice.');
			}
		}

		if (totalPrice > 1_000_000_000) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author.username} just committed this to the bank lottery: ${bankToSell}`
			);
		}

		await msg.author.addItemsToBank({ [itemID('Bank lottery ticket')]: amountOfTickets }, true);
		await msg.author.removeItemsFromBank(bankToSell.bank);

		await this.client.settings.update(
			ClientSettings.BankLottery,
			addBanks([this.client.settings.get(ClientSettings.BankLottery), bankToSell.bank])
		);

		return msg.channel.send(
			`You commited ${bankToSell} to the bank lottery, and received ${amountOfTickets}x bank lottery tickets.`
		);
	}
}
