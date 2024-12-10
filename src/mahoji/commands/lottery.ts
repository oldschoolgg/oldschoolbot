import { userMention } from '@discordjs/builders';
import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { calcWhatPercent, sumArr } from 'e';
import { Bank } from 'oldschooljs';
import type { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { mahojiUserSettingsUpdate } from '../../lib/MUser';
import { ores, secondaries, seedsFilter } from '../../lib/data/filterables';
import { Herb } from '../../lib/invention/groups/Herb';

import Firemaking from '../../lib/skilling/skills/firemaking';
import Runecraft from '../../lib/skilling/skills/runecraft';
import { assert, isSuperUntradeable } from '../../lib/util';
import { mahojiClientSettingsFetch } from '../../lib/util/clientSettings';
import getOSItem from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

async function addToLotteryBank(userID: string, bankToAdd: Bank) {
	const currentUserSettings = await mahojiUsersSettingsFetch(userID, {
		lottery_input: true
	});
	const current = currentUserSettings.lottery_input as ItemBank;
	const newBank = new Bank(current).add(bankToAdd);

	const res = await mahojiUserSettingsUpdate(userID, {
		lottery_input: newBank.toJSON()
	});
	return res;
}

const specialPricesBeforeMultiplying = new Bank()
	.add('Monkey egg', 4_000_000_000)
	.add('Dragon egg', 9_500_000_000)
	.add('Dwarven warhammer', 37_000_500_000)
	.add('Twisted bow', 7_500_000_000)
	.add('Ring of luck', 150_000_000)
	.add('Dwarven ore', 75_000_000)
	.add('Dwarven bar', 200_000_000)
	.add('Volcanic shards', 300_000_000)

	.add('Death rune', 200)
	.add('Elder rune', 70_000)
	.add('Manta ray', 15_000)
	.add('Coal', 2000)
	.add('Raw shark', 6000)
	.add('Magic logs', 1000)
	.add('Yew logs', 300)
	.add('Rocktail', 40_000)
	.add('Runite ore', 15_000)
	.add('Adamantite ore', 12_000)
	.add('Mithril ore', 10_000)
	.add('Gold ore', 5000)
	.add('Pure essence', 1700)
	.add('Daeyalt essence', 22_000)
	.add('Amethyst', 15_000)
	.add('Uncut diamond', 15_000)
	.add('Uncut dragonstone', 25_000)
	.add('Uncut sapphire', 5000)
	.add('Uncut emerald', 7000)
	.add('Uncut ruby', 10_000)
	.add('Elder logs', 40_000)
	.add('Elder plank', 60_000)
	.add('Raw tuna', 1000)
	.add('Raw lobster', 1500)
	.add('Raw swordfish', 2000)
	.add('Raw rocktail', 35_000)

	.add('Torstol', 25_000)
	.add('Grimy torstol', 25_000)
	.add('Torstol potion (unf)', 25_000)

	.add('Toadflax', 50_000)
	.add('Grimy toadflax', 50_000)
	.add('Toadflax potion (unf)', 50_000)

	.add('Lantadyme', 50_000)
	.add('Grimy lantadyme', 50_000)
	.add('Lantadyme potion (unf)', 50_000)

	.add('Clue scroll(beginner)', 50_000)
	.add('Clue scroll(easy)', 250_000)
	.add('Clue scroll(medium)', 500_000)
	.add('Clue scroll(hard)', 300_000)
	.add('Clue scroll(elite)', 3_500_000)
	.add('Clue scroll(master)', 6_000_000)
	.add('Reward casket(beginner)', 50_000)
	.add('Reward casket(easy)', 100_000)
	.add('Reward casket(medium)', 200_000)
	.add('Reward casket(hard)', 500_000)
	.add('Reward casket(elite)', 4_000_000)
	.add('Reward casket(master)', 9_000_000)
	.add('Clue scroll(grandmaster)', 250_000_000)
	.add('Reward casket(grandmaster)', 140_000_000)
	// Drygores
	.add('Drygore longsword', 1_230_000_000)
	.add('Offhand drygore longsword', 1_230_000_000)
	.add('Drygore mace', 1_230_000_000)
	.add('Offhand drygore mace', 1_230_000_000)
	.add('Drygore rapier', 1_230_000_000)
	.add('Offhand drygore rapier', 1_230_000_000)
	// Nex
	.add('Torva full helm', 800_000_000)
	.add('Torva platebody', 400_000_000)
	.add('Torva platelegs', 400_000_000)
	.add('Torva boots', 200_000_000)
	.add('Torva gloves', 200_000_000)

	.add('Pernix cowl', 800_000_000)
	.add('Pernix body', 400_000_000)
	.add('Pernix chaps', 400_000_000)
	.add('Pernix boots', 200_000_000)
	.add('Pernix gloves', 200_000_000)

	.add('Virtus mask', 800_000_000)
	.add('Virtus robe top', 400_000_000)
	.add('Virtus robe legs', 400_000_000)
	.add('Virtus boots', 200_000_000)
	.add('Virtus gloves', 200_000_000)
	.add('Virtus wand', 500_000_000)
	.add('Virtus book', 500_000_000)

	// Planks
	.add('Mahogany plank', 15_000)
	.add('Teak plank', 5000)
	.add('Oak plank', 2000)

	// Misc
	.add('Abyssal thread', 50_000_000)
	.add('Magus scroll', 150_000_000)
	.add('Abyssal cape', 750_000_000)
	.add('Dwarven blessing', 250_000_000)
	.add('Ent hide', 20_000_000)
	.add('Tradeable mystery box', 7_500_000)
	.add('Untradeable mystery box', 5_500_000)

	.add('Ignecarus dragonclaw', 50_000_000)
	.add('Blood dye', 1_500_000_000)
	.add('Ice dye', 1_500_000_000)
	.add('Shadow dye', 1_500_000_000)
	.add('Third age dye', 3_000_000_000)
	.add('Holiday mystery box', 75_000_000)
	.add('Saradomin brew(4)', 70_000)
	.add('Super restore(4)', 30_000)
	.add('Prayer potion(4)', 100_000)
	.add('Heat res. brew', 350_000)
	.add('Heat res. restore', 350_000)
	.add('Hellfire arrow', 30_000)
	.add('Mysterious seed', 5_000_000);

for (const herb of Herb.items.flatMap(i => i.item)) {
	if (!specialPricesBeforeMultiplying.has(herb.id)) {
		specialPricesBeforeMultiplying.add(herb.id, 10_000);
	}
}

for (const seed of seedsFilter.map(getOSItem)) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, seed.price * 3.5);
	}
}

for (const seed of secondaries.map(getOSItem)) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, seed.price * 3.5);
	}
}

for (const seed of ores.map(getOSItem)) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, seed.price * 3.5);
	}
}
for (const seed of Runecraft.Runes.map(i => getOSItem(i.id))) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, seed.price * 3.5);
	}
}
for (const seed of Firemaking.Burnables.map(i => getOSItem(i.inputLogs))) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, seed.price * 3.5);
	}
}

const toDelete = ['Fire rune', 'Air rune', 'Water rune', 'Earth rune', 'Body rune', 'Mind rune', 'Eye of newt'];
for (const item of toDelete) {
	specialPricesBeforeMultiplying.remove(item, specialPricesBeforeMultiplying.amount(item));
}
const MULTIPLIER = 3;

const parsedPriceBank = new Bank();
for (const [item, qty] of specialPricesBeforeMultiplying.items()) {
	parsedPriceBank.add(item.id, qty * MULTIPLIER);
}

export async function isLotteryActive(): Promise<boolean> {
	const result = await mahojiClientSettingsFetch({ lottery_is_active: true });
	return result.lottery_is_active;
}

function getPriceOfItem(item: Item) {
	if (parsedPriceBank.has(item.id)) {
		return Math.floor(parsedPriceBank.amount(item.id));
	}
	return item.price;
}

const LOTTERY_TICKET_ITEM = getOSItem('Bank lottery ticket');
assert(LOTTERY_TICKET_ITEM.id === 5021);
const VALUE_PER_TICKET = 10_000_000;

function calcTicketsOfUser(user: MUser | Bank) {
	const input = user instanceof Bank ? user : new Bank(user.user.lottery_input as ItemBank);

	let totalPrice = 0;
	for (const [item, quantity] of input.items()) {
		totalPrice += getPriceOfItem(item) * quantity;
	}

	const amountOfTickets = Math.floor(totalPrice / VALUE_PER_TICKET);
	return { amountOfTickets, input };
}

export async function getLotteryBank() {
	const res = (
		await prisma.$queryRawUnsafe<{ lottery_input: ItemBank; id: string }[]>(
			"SELECT id, lottery_input FROM users WHERE lottery_input::text != '{}'::text;"
		)
	)
		.map(u => ({
			id: u.id,
			lotteryInput: new Bank(u.lottery_input)
		}))
		.map(u => ({
			...u,
			tickets: calcTicketsOfUser(u.lotteryInput).amountOfTickets
		}))
		.sort((a, b) => b.tickets - a.tickets);
	const totalLoot = new Bank();
	for (const i of res) {
		totalLoot.add(i.lotteryInput);
	}
	const totalTickets = sumArr(res.map(i => i.tickets));
	return {
		totalLoot,
		users: res,
		totalTickets
	};
}

export const lotteryCommand: OSBMahojiCommand = {
	name: 'lottery',
	description: 'Win big!',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'buy_tickets',
			description: 'Deposit items into the lottery to receive tickets.',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'quantity',
					description: 'The number of tickets to buy',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'deposit_items',
			description: 'Deposit items into the lottery to receive tickets.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'The items you want to put in.',
					required: false
				},
				filterOption,
				{
					type: ApplicationCommandOptionType.String,
					name: 'search',
					description: 'A search query for items in your bank to put in.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'info',
			description: 'View the lottery loot/stats/info.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'prices',
			description: 'View the custom prices.'
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{
		info?: {};
		prices?: {};
		buy_tickets?: { quantity: number };
		deposit_items?: { items?: string; filter?: string; search?: string };
	}>) => {
		const infoStr = `
1. This is a regular Lottery (no special event or DC items)
2. There'll be 4 spins, each winner winning 1/4th of the loot.
3. You can win more than once.
4. 5% of the items will be deleted (item-sunk), based on a random unbiased roll, and the GP.
5. The Lottery will run for a month roughly, possibly longer.
6. Items/GP put into the Lottery are non-refundable and cannot be taken out.
7. It's possible that we change the custom prices of items (make them worth more/less), if you already put those items in, your ticket count will automatically update to reflect the new price.`;
		const active = await isLotteryActive();
		if (!active) return 'There is no lottery currently going on.';
		const user = await mUserFetch(userID);
		if (user.isIronman) return 'Ironmen cannot partake in the Lottery.';

		if (options.prices) {
			return { files: [(await makeBankImage({ bank: parsedPriceBank, title: 'Prices' })).file] };
		}
		if (options.buy_tickets) {
			const amountOfTickets = options.buy_tickets.quantity;
			if (amountOfTickets < 1) {
				return 'You need to buy at least one ticket.';
			}
			const totalPrice = amountOfTickets * VALUE_PER_TICKET;
			const bankToSell = new Bank().add('Coins', totalPrice);

			if (!user.owns(bankToSell)) return 'You do not have enough GP to buy these tickets.';

			await handleMahojiConfirmation(
				interaction,
				`${user.mention}, are you sure you want to add ${bankToSell} to the bank lottery - you'll receive **${amountOfTickets} bank lottery tickets**.

**WARNING:** ${infoStr}`
			);

			await user.sync();
			if (!user.owns(bankToSell)) return "You don't have enough GP to buy these tickets.";
			await user.removeItemsFromBank(bankToSell);

			await addToLotteryBank(user.id, bankToSell);

			return `You put ${bankToSell} to the bank lottery, and received ${amountOfTickets}x bank lottery tickets.`;
		}
		if (options.deposit_items) {
			const bankToSell = parseBank({
				inputStr: options.deposit_items.items,
				inputBank: user.bankWithGP,
				excludeItems: [...user.user.favoriteItems],
				maxSize: 50,
				search: options.deposit_items.search,
				filters: [options.deposit_items.filter],
				user
			});
			for (const [item] of bankToSell.items()) {
				if (isSuperUntradeable(item.id)) {
					bankToSell.clear(item);
				}
			}

			if (bankToSell.items().some(i => isSuperUntradeable(i[0].id))) {
				return 'You cannot put in super untradeable items.';
			}

			if (bankToSell.amount('Bank lottery ticket')) {
				bankToSell.remove('Bank lottery ticket', bankToSell.amount('Bank lottery ticket'));
			}

			let totalPrice = 0;
			for (const [item, quantity] of bankToSell.items()) {
				totalPrice += getPriceOfItem(item) * quantity;
			}

			if (bankToSell.length === 0) return 'No items were given.';
			if (!user.owns(bankToSell)) return 'You do not own these items.';

			const amountOfTickets = Math.floor(totalPrice / VALUE_PER_TICKET);

			if (amountOfTickets < 1) {
				return "Those items aren't worth enough, your deposit needs to be enough to get you atleast 1 ticket.";
			}

			const perItemTickets = [];
			for (const [item, quantity] of bankToSell
				.items()
				.sort((a, b) => getPriceOfItem(b[0]) * b[1] - getPriceOfItem(a[0]) * a[1])
				.slice(0, 10)) {
				perItemTickets.push(
					`${((quantity * getPriceOfItem(item)) / VALUE_PER_TICKET).toFixed(1)} tickets for ${quantity} ${
						item.name
					}`
				);
			}

			await handleMahojiConfirmation(
				interaction,
				`${
					user.mention
				}, are you sure you want to add ${bankToSell} to the bank lottery - you'll receive **${amountOfTickets} bank lottery tickets**. ${perItemTickets.join(
					', '
				)}

**WARNING:** ${infoStr}`
			);

			await user.sync();
			if (!user.owns(bankToSell)) return 'You do not own these items.';
			await user.removeItemsFromBank(bankToSell);

			await addToLotteryBank(user.id, bankToSell);

			return `You put ${bankToSell} to the bank lottery, and received ${amountOfTickets}x bank lottery tickets.`;
		}

		const { amountOfTickets, input } = calcTicketsOfUser(user);
		const { totalLoot, totalTickets, users } = await getLotteryBank();

		return {
			content: `There have been ${totalTickets.toLocaleString()} purchased, you have ${amountOfTickets.toLocaleString()}x tickets, and a ${
				amountOfTickets === 0 ? 0 : calcWhatPercent(amountOfTickets, totalTickets).toFixed(4)
			}% chance of winning (will fluctuate based on you/others buying tickets.)

${infoStr}

Top ticket holders: ${users
				.slice(0, 10)
				.map(i => `${userMention(i.id)} has ${i.tickets.toLocaleString()} tickets`)
				.join(',')}`,
			files: [
				(await makeBankImage({ bank: totalLoot, title: 'Lottery' })).file,
				(await makeBankImage({ bank: input, title: 'Your Lottery Input' })).file
			],
			allowedMentions: {
				users: []
			}
		};
	}
};
