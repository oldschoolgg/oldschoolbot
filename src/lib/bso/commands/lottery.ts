import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';
import { Herb } from '@/lib/bso/skills/invention/groups/Herb.js';

import { userMention } from '@oldschoolgg/discord';
import { calcWhatPercent, sumArr } from '@oldschoolgg/toolkit';
import { Bank, type Item, type ItemBank, Items } from 'oldschooljs';

import { filterOption } from '@/discord/presetCommandOptions.js';
import { globalConfig } from '@/lib/constants.js';
import { ores, secondaries, seeds } from '@/lib/data/filterables.js';
import type { RobochimpUser } from '@/lib/roboChimp.js';
import Firemaking from '@/lib/skilling/skills/firemaking.js';
import Runecraft from '@/lib/skilling/skills/runecraft.js';
import { assert } from '@/lib/util/logError.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { parseBank } from '@/lib/util/parseStringBank.js';

const LOTTERY_ACCEPTS_GP = true;
const LOTTERY_ACCEPTS_ITEMS = false;
const LOTTERY_ITEM_VALUE_MULTIPLIER = 3;
const LOTTERY_TICKET_PRICE = 10_000_000;
const LOTTERY_GP_GOES_INTO_POOL = true;
const LOTTERY_ITEMS_GO_INTO_POOL = true;
// Neutral storage row for admin-spawned prize-pool loot. This row is excluded from ticket stats.
export const LOTTERY_BANK_HOLDER_USER_ID = globalConfig.adminUserIDs[0];

const LOTTERY_TICKET_ITEM = Items.getOrThrow('Bank lottery ticket');
assert(LOTTERY_TICKET_ITEM.id === 5021);

const MAX_LOTTERY_TICKETS_PER_DEPOSIT = Math.floor(Number.MAX_SAFE_INTEGER / LOTTERY_TICKET_PRICE);

interface LotteryItemBankTransformerArgs {
	itemBank: Bank;
	user?: MUser | null;
	robochimpUser?: RobochimpUser | null;
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

for (const seed of Items.resolveFullItems(seeds)) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, (seed.price ?? 0) * 3.5);
	}
}

for (const seed of Items.resolveFullItems(secondaries)) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, (seed.price ?? 0) * 3.5);
	}
}

for (const seed of Items.resolveFullItems(ores)) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, (seed.price ?? 0) * 3.5);
	}
}
for (const seed of Runecraft.Runes.map(i => Items.getOrThrow(i.id))) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, (seed.price ?? 0) * 3.5);
	}
}
for (const seed of Firemaking.Burnables.map(i => Items.getOrThrow(i.inputLogs))) {
	if (!specialPricesBeforeMultiplying.has(seed.id)) {
		specialPricesBeforeMultiplying.add(seed.id, (seed.price ?? 0) * 3.5);
	}
}

const toDelete = ['Fire rune', 'Air rune', 'Water rune', 'Earth rune', 'Body rune', 'Mind rune', 'Eye of newt'];
for (const item of toDelete) {
	specialPricesBeforeMultiplying.remove(item, specialPricesBeforeMultiplying.amount(item));
}

const parsedPriceBank = new Bank();
for (const [item, qty] of specialPricesBeforeMultiplying.items()) {
	parsedPriceBank.add(item.id, qty * LOTTERY_ITEM_VALUE_MULTIPLIER);
}

export async function isLotteryActive(): Promise<boolean> {
	const result = await ClientSettings.fetch({ lottery_is_active: true });
	return result.lottery_is_active;
}

function getPriceOfItem(item: Item) {
	if (item.id === LOTTERY_TICKET_ITEM.id) {
		return LOTTERY_TICKET_PRICE;
	}
	if (parsedPriceBank.has(item.id)) {
		return Math.floor(parsedPriceBank.amount(item.id));
	}
	return Math.floor((item.price ?? 0) * LOTTERY_ITEM_VALUE_MULTIPLIER);
}

function calcTicketsOfBank(input: Bank) {
	let totalPrice = 0;
	for (const [item, quantity] of input.items()) {
		totalPrice += getPriceOfItem(item) * quantity;
	}

	const amountOfTickets = Math.floor(totalPrice / LOTTERY_TICKET_PRICE);
	return { amountOfTickets, input };
}

function calcTicketsOfUser(user: MUser | Bank) {
	return calcTicketsOfBank(user instanceof Bank ? user : new Bank(user.user.lottery_input as ItemBank));
}

async function resolveLotteryItemBankTransformerArgs({
	user,
	robochimpUser
}: Pick<LotteryItemBankTransformerArgs, 'user' | 'robochimpUser'>) {
	if (!user && !robochimpUser) {
		throw new Error('Either user or robochimpUser must be provided to transform lottery item input.');
	}
	const resolvedUser = user ?? (await mUserFetch(robochimpUser!.id.toString()));
	const resolvedRobochimpUser = robochimpUser ?? (await Cache.getRoboChimpUser(resolvedUser.id));
	return { user: resolvedUser, robochimpUser: resolvedRobochimpUser };
}

const LOTTERY_ITEM_BANK_TRANSFORMER = async (args: LotteryItemBankTransformerArgs): Promise<Bank> => {
	await resolveLotteryItemBankTransformerArgs(args);
	return args.itemBank.clone();
};

function removeIneligibleLotteryItems(input: Bank) {
	const cleaned = input.clone();
	for (const [item] of cleaned.items()) {
		if (isSuperUntradeable(item.id) || item.id === LOTTERY_TICKET_ITEM.id) {
			cleaned.clear(item);
		}
	}
	return cleaned;
}

function validatePositiveLotteryBank(bank: Bank, label: string) {
	const errors = bank.validate();
	if (errors.length > 0) {
		throw new Error(`Invalid ${label}: ${errors.join(', ')}`);
	}
	for (const [item, quantity] of bank.items()) {
		if (!Number.isFinite(quantity) || quantity < 1) {
			throw new Error(`Invalid ${label}: ${quantity}x ${item.name}`);
		}
	}
}

function calcLotteryBankValue(bank: Bank) {
	let totalPrice = 0;
	for (const [item, quantity] of bank.items()) {
		totalPrice += getPriceOfItem(item) * quantity;
	}
	return totalPrice;
}

function getTicketBank(amountOfTickets: number) {
	return new Bank().add(LOTTERY_TICKET_ITEM.id, amountOfTickets);
}

function getLotteryPrizePoolBank(input: Bank) {
	const prizePool = input.clone();
	if (prizePool.amount(LOTTERY_TICKET_ITEM.id) > 0) {
		prizePool.remove(LOTTERY_TICKET_ITEM.id, prizePool.amount(LOTTERY_TICKET_ITEM.id));
	}
	return prizePool;
}

export async function addToLotteryBank(user: MUser, bankToAdd: Bank) {
	validatePositiveLotteryBank(bankToAdd, 'lottery bank input');
	return user.transactItems({
		filterLoot: false,
		neverUpdateHistory: true,
		otherUpdates: syncedUser => ({
			lottery_input: new Bank(syncedUser.user.lottery_input as ItemBank).add(bankToAdd).toJSON()
		})
	});
}

export async function addToLotteryPrizePool(bankToAdd: Bank) {
	if (!LOTTERY_BANK_HOLDER_USER_ID) {
		throw new Error('LOTTERY_BANK_HOLDER_USER_ID is not configured.');
	}
	return addToLotteryBank(await mUserFetch(LOTTERY_BANK_HOLDER_USER_ID), bankToAdd);
}

async function transactLotteryDeposit({
	user,
	itemsToRemove,
	amountOfTickets,
	lotteryInputToAdd
}: {
	user: MUser;
	itemsToRemove: Bank;
	amountOfTickets: number;
	lotteryInputToAdd: Bank;
}) {
	if (
		!Number.isSafeInteger(amountOfTickets) ||
		amountOfTickets < 1 ||
		amountOfTickets > MAX_LOTTERY_TICKETS_PER_DEPOSIT
	) {
		throw new Error(`Invalid lottery ticket amount: ${amountOfTickets}`);
	}
	validatePositiveLotteryBank(itemsToRemove, 'lottery deposit removal');
	validatePositiveLotteryBank(lotteryInputToAdd, 'lottery input update');

	const ticketsToAdd = getTicketBank(amountOfTickets);
	return user.transactItems({
		itemsToAdd: ticketsToAdd,
		itemsToRemove,
		filterLoot: false,
		neverUpdateHistory: true,
		otherUpdates: syncedUser => ({
			lottery_input: new Bank(syncedUser.user.lottery_input as ItemBank).add(lotteryInputToAdd).toJSON()
		})
	});
}

export async function getLotteryBank() {
	const contributions = (
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
	const users = contributions.filter(i => i.id !== LOTTERY_BANK_HOLDER_USER_ID);
	const totalLoot = new Bank();
	for (const i of contributions) {
		totalLoot.add(getLotteryPrizePoolBank(i.lotteryInput));
	}
	const totalTickets = sumArr(users.map(i => i.tickets));
	return {
		totalLoot,
		users,
		totalTickets
	};
}

export const lotteryCommand = defineCommand({
	name: 'lottery',
	description: 'Win big!',
	options: [
		{
			type: 'Subcommand',
			name: 'buy_tickets',
			description: 'Deposit items into the lottery to receive tickets.',
			options: [
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The number of tickets to buy',
					required: true,
					min_value: 1,
					max_value: MAX_LOTTERY_TICKETS_PER_DEPOSIT
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'deposit_items',
			description: 'Deposit items into the lottery to receive tickets.',
			options: [
				{
					type: 'String',
					name: 'items',
					description: 'The items you want to put in.',
					required: false
				},
				filterOption,
				{
					type: 'String',
					name: 'search',
					description: 'A search query for items in your bank to put in.',
					required: false
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'info',
			description: 'View the lottery loot/stats/info.'
		},
		{
			type: 'Subcommand',
			name: 'prices',
			description: 'View the custom prices.'
		}
	],
	run: async ({ user, options, interaction }) => {
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
		if (user.isIronman) return 'Ironmen cannot partake in the Lottery.';

		if (options.prices) {
			return { files: [await makeBankImage({ bank: parsedPriceBank, title: 'Prices' })] };
		}
		if (options.buy_tickets) {
			if (!LOTTERY_ACCEPTS_GP) return 'The lottery is not currently accepting GP for tickets.';
			const ticketsToBuy = options.buy_tickets.quantity;
			if (
				!Number.isSafeInteger(ticketsToBuy) ||
				ticketsToBuy < 1 ||
				ticketsToBuy > MAX_LOTTERY_TICKETS_PER_DEPOSIT
			) {
				return 'You need to buy at least one ticket.';
			}
			const totalPrice = ticketsToBuy * LOTTERY_TICKET_PRICE;
			const bankToSell = new Bank().add('Coins', totalPrice);

			if (!user.owns(bankToSell)) return 'You do not have enough GP to buy these tickets.';

			await interaction.confirmation(
				`${user.mention}, are you sure you want to add ${bankToSell} to the bank lottery - you'll receive **${ticketsToBuy} bank lottery tickets**.

**WARNING:** ${infoStr}`
			);

			await user.sync();
			if (!user.owns(bankToSell)) return "You don't have enough GP to buy these tickets.";
			await transactLotteryDeposit({
				user,
				itemsToRemove: bankToSell,
				amountOfTickets: ticketsToBuy,
				lotteryInputToAdd: LOTTERY_GP_GOES_INTO_POOL ? bankToSell : getTicketBank(ticketsToBuy)
			});

			return `You put ${bankToSell} to the bank lottery, and received ${ticketsToBuy}x bank lottery tickets.`;
		}
		if (options.deposit_items) {
			if (!LOTTERY_ACCEPTS_ITEMS) return 'The lottery is not currently accepting items for tickets.';
			let bankToSell = parseBank({
				inputStr: options.deposit_items.items,
				inputBank: user.bankWithGP,
				excludeItems: [...user.user.favoriteItems],
				maxSize: 50,
				search: options.deposit_items.search,
				filters: [options.deposit_items.filter],
				user
			});
			bankToSell = removeIneligibleLotteryItems(bankToSell);

			if (bankToSell.length === 0) return 'No items were given.';
			bankToSell = removeIneligibleLotteryItems(
				await LOTTERY_ITEM_BANK_TRANSFORMER({
					user,
					itemBank: bankToSell
				})
			);
			validatePositiveLotteryBank(bankToSell, 'lottery item deposit');
			if (bankToSell.length === 0) return 'No items were given.';
			if (!user.owns(bankToSell)) return 'You do not own these items.';

			const totalPrice = calcLotteryBankValue(bankToSell);
			const ticketsFromItems = Math.floor(totalPrice / LOTTERY_TICKET_PRICE);

			if (!Number.isSafeInteger(ticketsFromItems) || ticketsFromItems > MAX_LOTTERY_TICKETS_PER_DEPOSIT) {
				return 'Those items are worth too much to process in one lottery deposit.';
			}

			if (ticketsFromItems < 1) {
				return "Those items aren't worth enough, your deposit needs to be enough to get you atleast 1 ticket.";
			}

			const perItemTickets = [];
			for (const [item, quantity] of bankToSell
				.items()
				.sort((a, b) => getPriceOfItem(b[0]) * b[1] - getPriceOfItem(a[0]) * a[1])
				.slice(0, 10)) {
				perItemTickets.push(
					`${((quantity * getPriceOfItem(item)) / LOTTERY_TICKET_PRICE).toFixed(1)} tickets for ${quantity} ${
						item.name
					}`
				);
			}

			await interaction.confirmation(
				`${
					user.mention
				}, are you sure you want to add ${bankToSell} to the bank lottery - you'll receive **${ticketsFromItems} bank lottery tickets**. ${perItemTickets.join(
					', '
				)}

**WARNING:** ${infoStr}`
			);

			await user.sync();
			if (!user.owns(bankToSell)) return 'You do not own these items.';
			await transactLotteryDeposit({
				user,
				itemsToRemove: bankToSell,
				amountOfTickets: ticketsFromItems,
				lotteryInputToAdd: LOTTERY_ITEMS_GO_INTO_POOL ? bankToSell : getTicketBank(ticketsFromItems)
			});

			return `You put ${bankToSell} to the bank lottery, and received ${ticketsFromItems}x bank lottery tickets.`;
		}

		const { amountOfTickets: userTickets, input } = calcTicketsOfUser(user);
		const { totalLoot, totalTickets, users } = await getLotteryBank();

		const message = new MessageBuilder()
			.setContent(`There have been ${totalTickets.toLocaleString()} purchased, you have ${userTickets.toLocaleString()}x tickets, and a ${
				userTickets === 0 ? 0 : calcWhatPercent(userTickets, totalTickets).toFixed(4)
			}% chance of winning (will fluctuate based on you/others buying tickets.)

${infoStr}

Top ticket holders: ${users
				.slice(0, 10)
				.map(i => `${userMention(i.id)} has ${i.tickets.toLocaleString()} tickets`)
				.join(',')}`)
			.addFile(await makeBankImage({ bank: totalLoot, title: 'Lottery' }))
			.addFile(await makeBankImage({ bank: input, title: 'Your Lottery Input' }));

		return message;
	}
});
