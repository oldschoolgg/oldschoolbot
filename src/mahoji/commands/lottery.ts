import { calcWhatPercent } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { Bank } from 'oldschooljs';
import { Item, ItemBank } from 'oldschooljs/dist/meta/types';

import { prisma } from '../../lib/settings/prisma';
import { sorts } from '../../lib/sorts';
import { assert, isSuperUntradeable, toKMB } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiClientSettingsFetch, updateBankSetting } from '../mahojiSettings';

const specialPricesBeforeMultiplying = new Bank()
	.add('Monkey egg', 4_000_000_000)
	.add('Dragon egg', 9_500_000_000)
	.add('Dwarven warhammer', 37_500_000)
	.add('Twisted bow', 7_500_000)
	.add('Ring of luck', 150_000_000)
	.add('Dwarven ore', 75_000_000)
	.add('Dwarven bar', 200_000_000)

	.add('Death rune', 200)
	.add('Elder rune', 70_000)
	.add('Manta ray', 15_000)
	.add('Coal', 2000)
	.add('Raw shark', 6000)
	.add('Rocktail', 40_000)

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
	.add('Clue scroll(grandmaster)', 150_000_000)
	.add('Reward casket(grandmaster)', 140_000_000)
	// Drygores
	.add('Drygore longsword', 1_000_000_000)
	.add('Offhand drygore longsword', 1_000_000_000)
	.add('Drygore mace', 1_000_000_000)
	.add('Offhand drygore mace', 1_000_000_000)
	.add('Drygore rapier', 1_000_000_000)
	.add('Offhand drygore rapier', 1_000_000_000)
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
	.add('Holiday mystery box', 75_000_000)
	.add('Saradomin brew(4)', 70_000)
	.add('Super restore(4)', 30_000)
	.add('Prayer potion(4)', 100_000)
	.add('Heat res. brew', 350_000)
	.add('Heat res. restore', 350_000)
	.add('Hellfire arrow', 30_000)
	.add('Mysterious seed', 5_000_000);

export async function isLotteryActive(): Promise<boolean> {
	const result = await mahojiClientSettingsFetch({ lottery_is_active: true });
	return result.lottery_is_active;
}

const MULTIPLIER = 3;
function getPriceOfItem(item: Item) {
	if (specialPricesBeforeMultiplying.has(item.id)) {
		return Math.floor(specialPricesBeforeMultiplying.amount(item.id) * MULTIPLIER);
	}
	return item.price;
}

const BINGO_TICKET_ITEM = getOSItem('Bank lottery ticket');
assert(BINGO_TICKET_ITEM.id === 5021);

export async function calcTotalTickets() {
	const totalTickets = parseInt(
		(
			await prisma.$queryRawUnsafe<any>(
				`SELECT COALESCE(SUM((bank->>'${BINGO_TICKET_ITEM.id}')::int), 0) AS sum
FROM users
WHERE bank->>'${BINGO_TICKET_ITEM.id}' IS NOT NULL;`
			)
		)[0].sum
	);
	return totalTickets;
}

export async function getLotteryBank() {
	const loot = new Bank((await mahojiClientSettingsFetch({ bank_lottery: true })).bank_lottery as ItemBank);
	return loot;
}

export const lotteryCommand: OSBMahojiCommand = {
	name: 'lottery',
	description: 'Win big!',
	options: [
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
		deposit_items?: { items?: string; filter?: string; search?: string };
	}>) => {
		const active = await isLotteryActive();
		if (!active) return 'There is no lottery currently going on.';
		const user = await mUserFetch(userID);
		if (user.isIronman) return 'Ironmen cannot parttake in the Lottery.';

		if (options.prices) {
			const items = specialPricesBeforeMultiplying.items().sort(sorts.value);
			return items.map(i => `${i[0].name}: ${toKMB(i[1])}`).join('  ,   ');
		}

		if (options.deposit_items) {
			const bankToSell = parseBank({
				inputStr: options.deposit_items.items,
				inputBank: user.bank,
				excludeItems: [...user.user.favoriteItems]
			});
			bankToSell.filter(i => !isSuperUntradeable(i), true);
			if (bankToSell.has('Coins')) {
				return 'To buy bank lottery tickets with Coins, use the buy command.';
			}

			let totalPrice = 0;
			for (const [item, quantity] of bankToSell.items()) {
				totalPrice += getPriceOfItem(item) * quantity;
			}

			if (bankToSell.amount('Bank lottery ticket')) {
				bankToSell.remove('Bank lottery ticket', bankToSell.amount('Bank lottery ticket'));
			}
			if (bankToSell.length === 0) return 'No items were given.';
			if (!user.owns(bankToSell)) return 'You do not own these items.';

			const VALUE_PER_TICKET = 10_000_000;
			const amountOfTickets = Math.floor(totalPrice / VALUE_PER_TICKET);

			if (amountOfTickets < 5) {
				return "Those items aren't worth enough.";
			}

			let perItemTickets = [];
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

			// Pay 500k GP per ticket
			const gpTaxCost = amountOfTickets * 500_000;
			bankToSell.add('Coins', gpTaxCost);

			await handleMahojiConfirmation(
				interaction,
				`${
					user.mention
				}, are you sure you want to add ${bankToSell} to the bank lottery - you'll receive **${amountOfTickets} bank lottery tickets**. ${perItemTickets.join(
					', '
				)}

**WARNING:**
- You have to pay 500k GP per ticket you get from items, alternatively you can \`/buy bank lottery ticket\` to directly buy them with GP.
- This lottery, has only ONE item that will be given out, a Smokey. Everything else (GP/Items) will be deleted as an item/GP sink, and not given to anyone.`
			);

			await user.sync();
			if (!user.owns(bankToSell)) return 'You do not own these items.';
			await user.removeItemsFromBank(bankToSell);
			await user.addItemsToBank({
				items: new Bank().add('Bank lottery ticket').add(amountOfTickets),
				collectionLog: true
			});

			await updateBankSetting('bank_lottery', bankToSell);

			return `You put ${bankToSell} to the bank lottery, and received ${amountOfTickets}x bank lottery tickets.`;
		}

		const totalTickets = await calcTotalTickets();
		const amountOfTicketsOwned = user.bank.amount('Bank lottery ticket');

		return {
			content: `There have been ${totalTickets} purchased, you have ${amountOfTicketsOwned}x tickets, and a ${
				amountOfTicketsOwned === 0 ? 0 : calcWhatPercent(amountOfTicketsOwned, totalTickets).toFixed(4)
			}% chance of winning (will fluctuate based on you/others buying tickets.)

This is a special lottery: the reward is ONE smokey. All other items/GP will be deleted from the game as an item sink.`,
			attachments: [(await makeBankImage({ bank: await getLotteryBank(), title: 'Smokey Lottery' })).file]
		};
	}
};
