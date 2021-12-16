import { calcWhatPercent } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addBanks, isSuperUntradeable, itemID } from '../../lib/util';
import { parseBank } from '../../lib/util/parseStringBank';

const specialPrices = new Bank()
	// .add('Clue scroll(beginner)', 50_000)
	// .add('Clue scroll(easy)', 100_000)
	// .add('Clue scroll(medium)', 300_000)
	// .add('Clue scroll(hard)', 700_000)
	// .add('Clue scroll(elite)', 1_000_000)
	// .add('Clue scroll(master)', 5_000_000)
	// .add('Clue scroll(grandmaster)', 50_000_000)
	// .add('Reward casket(beginner)', 500_000)
	// .add('Reward casket(easy)', 1_000_000)
	// .add('Reward casket(medium)', 2_000_000)
	// .add('Reward casket(hard)', 4_500_000)
	// .add('Reward casket(elite)', 10_000_000)
	// .add('Reward casket(master)', 15_000_000)
	// .add('Reward casket(grandmaster)', 50_000_000)
	// .add('Reward casket(grandmaster)', 50_000_000)
	// .add('Reward casket(grandmaster)', 50_000_000)
	// Drygores
	.add('Drygore longsword', 3_000_000_000)
	.add('Offhand drygore longsword', 3_000_000_000)
	.add('Drygore mace', 2_500_000_000)
	.add('Offhand drygore mace', 2_500_000_000)
	.add('Drygore rapier', 1_200_000_000)
	.add('Offhand drygore rapier', 1_400_000_000)
	// Nex
	.add('Torva full helm', 800_000_000)
	.add('Torva platebody', 800_000_000)
	.add('Torva platelegs', 800_000_000)
	.add('Torva boots', 800_000_000)
	.add('Torva gloves', 800_000_000)

	.add('Pernix cowl', 600_000_000)
	.add('Pernix body', 600_000_000)
	.add('Pernix chaps', 600_000_000)
	.add('Pernix boots', 600_000_000)
	.add('Pernix gloves', 600_000_000)

	.add('Virtus mask', 300_000_000)
	.add('Virtus robe top', 300_000_000)
	.add('Virtus robe legs', 300_000_000)
	.add('Virtus boots', 300_000_000)
	.add('Virtus gloves', 300_000_000)
	.add('Virtus wand', 500_000_000)
	.add('Virtus book', 500_000_000)

	// Planks
	.add('Mahogany plank', 1000)
	.add('Teak plank', 400)
	.add('Oak plank', 200)

	// Misc
	.add('Abyssal thread', 50_000_000)
	.add('Magus scroll', 200_000_000)
	.add('Abyssal cape', 2_000_000_000)
	.add('Ent hide', 20_000_000)
	.add('Tradeable mystery box', 13_000_000)
	.add('Untradeable mystery box', 13_000_000)

	.add('Ignecarus dragonclaw', 300_000_000)
	.add('Blood dye', 1_000_000_000)
	.add('Monkey egg', 5_000_000_000)
	.add('Holiday mystery box', 50_000_000)
	.add('Golden shard', 3_000_000_000)
	.add('Festive present', 1_000_000_000)

	// Pets
	.add('Voidling', 700_000_000)
	.add('Plopper', 300_000_000);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[str:...str]',
			usageDelim: ' ',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Sacrifices items from your bank.',
			examples: ['+sacrifice 1 Elysian sigil'],
			aliases: ['lottery']
		});
	}

	async run(msg: KlasaMessage, [str]: [string | undefined]) {
		if (msg.author.isIronman) {
			return msg.channel.send('Ironmen cannot participate in the lottery.');
		}

		if (str === 'chance') {
			const totalTickets = parseInt(
				(
					await this.client.query<any>(
						`SELECT SUM((bank->>'5021')::int)
FROM users
WHERE bank->>'5021' IS NOT NULL;`
					)
				)[0].sum
			);
			const userTickets = msg.author.bank().amount('Bank lottery ticket');
			return msg.channel.send(
				`You have an estimated ${calcWhatPercent(userTickets, totalTickets).toFixed(
					4
				)}% chance of winning the lottery. This can go up or down from you or others buying more tickets.`
			);
		}

		const bankToSell = parseBank({
			inputStr: str,
			inputBank: msg.author.bank(),
			flags: { ...msg.flagArgs },
			excludeItems: [...msg.author.settings.get(UserSettings.FavoriteItems)]
		});
		bankToSell.filter(i => !isSuperUntradeable(i), true);

		function getPrice(item: Item) {
			if (specialPrices.has(item.id)) {
				return specialPrices.amount(item.id);
			}
			return item.price;
		}

		let totalPrice = 0;
		for (const [item, quantity] of bankToSell.items()) {
			totalPrice += getPrice(item) * quantity;
		}

		if (bankToSell.amount('Lottery ticket')) {
			bankToSell.remove('Lottery ticket', bankToSell.amount('Lottery ticket'));
		}
		if (bankToSell.amount('Bank lottery ticket')) {
			bankToSell.remove('Bank lottery ticket', bankToSell.amount('Bank lottery ticket'));
		}
		if (bankToSell.length === 0) return msg.channel.send('No items were given.');
		if (!msg.author.owns(bankToSell)) return msg.channel.send('You do not own these items.');

		const valuePerTicket = 10_000_000;
		const amountOfTickets = Math.floor(totalPrice / valuePerTicket);

		if (amountOfTickets < 5) {
			return msg.channel.send("Those items aren't worth enough.");
		}

		let perItemTickets = [];
		for (const [item, quantity] of bankToSell
			.items()
			.sort((a, b) => getPrice(b[0]) * b[1] - getPrice(a[0]) * a[1])
			.slice(0, 10)) {
			perItemTickets.push(
				`${((quantity * getPrice(item)) / valuePerTicket).toFixed(1)} tickets for ${quantity} ${item.name}`
			);
		}

		// Pay 500k GP per ticket
		const gpTaxCost = amountOfTickets * 500_000;
		bankToSell.add('Coins', gpTaxCost);

		delete msg.flagArgs.cf;
		delete msg.flagArgs.confirm;
		await msg.confirm(
			`${
				msg.author
			}, say \`confirm\` to commit ${bankToSell} to the bank lottery - you'll receive **${amountOfTickets} bank lottery tickets**. ${perItemTickets.join(
				', '
			)}

**WARNING:**
- You have to pay 500k GP per ticket you get from items, alternatively you can \`=buy bank lottery ticket\` to directly buy them with GP.
- This lottery, has only ONE item that will be given out, a Smokey. Everything else (GP/Items) will be deleted as an item/GP sink, and not given to anyone.`
		);

		await msg.author.addItemsToBank({ [itemID('Bank lottery ticket')]: amountOfTickets }, true);
		await msg.author.removeItemsFromBank(bankToSell);

		await this.client.settings.update(
			ClientSettings.BankLottery,
			addBanks([this.client.settings.get(ClientSettings.BankLottery), bankToSell.bank])
		);

		return msg.channel.send(
			`You commited ${bankToSell} to the bank lottery, and received ${amountOfTickets}x bank lottery tickets.`
		);
	}
}
