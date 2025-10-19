import { MathRNG } from '@oldschoolgg/rng';
import { Emoji, sleep } from '@oldschoolgg/toolkit';
import { DateTime } from 'luxon';
import { Bank, type ItemBank, Items } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { choicesOf } from '@/lib/discord/index.js';
import { getPOH } from '@/mahoji/lib/abstracted_commands/pohCommand.js';

const HALLOWEEN_CONSTANTS = {
	MINUTES_PER_VISIT: 10,
	CARD_TARGET_DAYS: 1.5,
	PET_TARGET_DAYS: 4,
	HALLOWEEN_PETS: Items.resolveItems([
		'Mumpkin',
		'Polterpup',
		'Mini mortimer',
		'Casper',
		'Kuro',
		'Mini Pumpkinhead',
		'Gregoyle'
	])
};
const minutesInDays = (d: number) => d * 24 * 60;
const denomForTarget = (days: number) => Math.round(minutesInDays(days) / HALLOWEEN_CONSTANTS.MINUTES_PER_VISIT);

const CARD_CHANCE = denomForTarget(HALLOWEEN_CONSTANTS.CARD_TARGET_DAYS);
const PET_CHANCE = denomForTarget(HALLOWEEN_CONSTANTS.PET_TARGET_DAYS);

function expectedDays(denom: number) {
	const minutes = denom * HALLOWEEN_CONSTANTS.MINUTES_PER_VISIT;
	return minutes / (24 * 60);
}

console.log(`Card odds: 1 in ${CARD_CHANCE}, expected ≈ ${expectedDays(CARD_CHANCE).toFixed(2)} days`);
console.log(`Pet odds:  1 in ${PET_CHANCE}, expected ≈ ${expectedDays(PET_CHANCE).toFixed(2)} days`);

const trickOrTreaters = [
	{
		id: 'witch',
		card: Items.getOrThrow('Witch card'),
		emoji: '<:witchCard:1429518236302442676>',
		perk: {
			description:
				'20% increased chance of loot doubling, and custom pets give double their normal loot (peky/obis/brock/wilvus/smokey/doug/harry)'
		}
	},
	{
		id: 'death',
		card: Items.getOrThrow('Death card'),
		emoji: '<:deathCard:1429518243554525318>',
		perk: {
			description: 'All PvM is 10% faster'
		}
	},
	{
		id: 'pumpkinman',
		card: Items.getOrThrow('Pumpkinman card'),
		emoji: '<:pumpkinCard:1429518241910493195>',
		perk: {
			description: 'Farming patches grow 30% faster.'
		}
	},
	{
		id: 'vampire',
		card: Items.getOrThrow('Vampire card'),
		emoji: '<:vampireCard:1429518240278904872>',
		perk: {
			description: '10% longer max trip length on any/all trips'
		}
	},
	{
		id: 'ghost',
		card: Items.getOrThrow('Ghost card'),
		emoji: '<:ghostCard:1429518238169170112>',
		perk: {
			description: 'Increased chance of trick-or-treating'
		}
	}
];
const CANDY_PER_MINUTE = 1;
const CANDY_MIN_PER_VISIT = 1;
const CANDY_MAX_PER_VISIT = 3;
const EXPECTED_CANDY_PER_VISIT = (CANDY_MIN_PER_VISIT + CANDY_MAX_PER_VISIT) / 2;

type Totals = { visits: number; waitMin: number; candyMin: number; totalMin: number };
const breakdown = (denom: number): Totals => {
	const visits = denom;
	const waitMin = visits * HALLOWEEN_CONSTANTS.MINUTES_PER_VISIT;
	const candyNeeded = visits * EXPECTED_CANDY_PER_VISIT;
	const candyMin = candyNeeded / CANDY_PER_MINUTE;
	return { visits, waitMin, candyMin, totalMin: waitMin + candyMin };
};
const h = (m: number) => (m / 60).toFixed(2);

const cardTotals = breakdown(CARD_CHANCE);
const petTotals = breakdown(PET_CHANCE);

console.log(
	`[Card] visits=${cardTotals.visits} wait=${h(cardTotals.waitMin)}h candy=${h(cardTotals.candyMin)}h total=${h(
		cardTotals.totalMin
	)}h`
);
console.log(
	`[Pet ] visits=${petTotals.visits} wait=${h(petTotals.waitMin)}h candy=${h(petTotals.candyMin)}h total=${h(
		petTotals.totalMin
	)}h`
);

export async function halloweenTicker() {
	const pohsWithCandyBowls = await prisma.playerOwnedHouse.findMany({
		where: {
			garden_decoration: 9315
		},
		select: {
			user_id: true
		}
	});
	const usersToUpdate = await prisma.halloweenEvent.findMany({
		where: {
			user_id: {
				in: pohsWithCandyBowls.map(p => p.user_id)
			},
			last_trick_or_treat: {
				lte: DateTime.now().minus({ minutes: HALLOWEEN_CONSTANTS.MINUTES_PER_VISIT }).toJSDate()
			},
			candy_in_bowl: {
				gt: 0
			}
		}
	});
	for (const userEvent of usersToUpdate) {
		const user = await mUserFetch(userEvent.user_id);
		const candyDesired = MathRNG.randInt(1, 3);

		if (userEvent.candy_in_bowl < candyDesired) {
			await prisma.halloweenEvent.update({
				where: { user_id: userEvent.user_id },
				data: {
					last_trick_or_treat: new Date()
				}
			});
			continue;
		}

		const itemsWaitingForPickup = new Bank(userEvent.items_waiting_for_pickup as ItemBank);

		const trickOrTreater = MathRNG.pick(trickOrTreaters);
		if (MathRNG.roll(CARD_CHANCE) && !user.cl.has(trickOrTreater.card.id)) {
			itemsWaitingForPickup.add(trickOrTreater.card.id);
		}

		if (MathRNG.roll(PET_CHANCE)) {
			itemsWaitingForPickup.add('Night-Mare');
		}

		await prisma.halloweenEvent.update({
			where: { user_id: userEvent.user_id },
			data: {
				last_trick_or_treat: new Date(),
				items_waiting_for_pickup: itemsWaitingForPickup.toJSON(),
				candy_in_bowl: {
					decrement: 1
				}
			}
		});
	}
}

async function halloweenProgress(user: MUser) {
	const hasHalloweenWallkit = user.bitfield.includes(BitField.HasHalloweenWallkit);
	const poh = await getPOH(user.id);
	const hasCandyBowl = poh.garden_decoration === 9315;
	const candyOwned = user.bank.amount('Halloween candy');
	const hweenData = await prisma.halloweenEvent.upsert({
		where: { user_id: user.id },
		create: {
			user_id: user.id
		},
		update: {}
	});
	return {
		hasHalloweenWallkit,
		hasCandyBowl,
		candyOwned,
		hweenData
	};
}

export const halloweenCommand = defineCommand({
	name: 'halloween',
	description: 'The 2025 Halloween Event',
	attributes: {
		requiresMinion: true
	},
	options: [
		{
			type: 'Subcommand',
			name: 'info',
			description: 'View stats and info on your Item Contracts.'
		},
		{
			type: 'Subcommand',
			name: 'fill_candy_bowl',
			description: 'Fill your PoH Candy bowl.'
		},
		{
			type: 'Subcommand',
			name: 'collect_items',
			description: 'Collect items left for you to pick up.'
		},
		{
			type: 'Subcommand',
			name: 'equip_card',
			description: 'Equip a Halloween event card.',
			options: [
				{
					type: 'String',
					name: 'card',
					description: 'The card you want to equip.',
					required: true,
					choices: choicesOf(trickOrTreaters.map(i => i.card.name))
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'unequip_card',
			description: 'Unequip your Halloween event card.'
		}
	],
	run: async ({ options, user, interaction }) => {
		const progress = await halloweenProgress(user);

		if (options.equip_card) {
			const cardItem = trickOrTreaters.find(t => t.card.name === options.equip_card!.card);
			if (!cardItem) return "That's not a valid trick-or-treater card.";
			if (!user.bank.has(cardItem.card.id)) {
				return `You don't have a ${cardItem.card.name} to equip.`;
			}
			if (user.user.equipped_card_item_id !== null && user.user.equipped_card_item_id === cardItem.card.id) {
				return `You already have the ${cardItem.card.name} equipped.`;
			}
			const refundLoot = new Bank();
			if (user.user.equipped_card_item_id) {
				const currentlyEquipped = trickOrTreaters.find(t => t.card.id === user.user.equipped_card_item_id);
				if (currentlyEquipped) {
					refundLoot.add(currentlyEquipped.card.id);
				}
			}
			await user.transactItems({ itemsToAdd: refundLoot, itemsToRemove: new Bank().add(cardItem.card.id) });
			await user.update({
				equipped_card_item_id: cardItem.card.id
			});
			return `You equipped the ${cardItem.card.name}, it grants you this power: ${cardItem.perk.description}.${refundLoot.length > 0 ? ` You unequipped your previous card and received: ${refundLoot}.` : ''}`;
		}

		if (options.unequip_card) {
			if (user.user.equipped_card_item_id === null) {
				return "You don't have a trick-or-treater card equipped.";
			}
			const currentlyEquipped = trickOrTreaters.find(t => t.card.id === user.user.equipped_card_item_id);
			if (!currentlyEquipped) {
				return "You don't have a valid trick-or-treater card equipped.";
			}

			await user.update({
				equipped_card_item_id: null
			});
			await user.transactItems({
				itemsToAdd: new Bank().add(currentlyEquipped.card.id)
			});
			return `You unequipped your ${currentlyEquipped.card.name}.`;
		}

		if (options.collect_items) {
			if (user.minionIsBusy) {
				return `${user.minionName} is currently busy and can't pick up the items.`;
			}
			const itemsWaitingForPickup = new Bank(progress.hweenData.items_waiting_for_pickup as ItemBank);
			await interaction.defer();
			await interaction.reply('Checking for items...');
			await sleep(1500);
			if (itemsWaitingForPickup.length === 0) {
				return "You don't have any items waiting to be picked up!";
			}
			const newEventData = await prisma.halloweenEvent.update({
				where: { user_id: user.id },
				data: {
					items_waiting_for_pickup: new Bank().toJSON()
				}
			});
			await user.transactItems({ itemsToAdd: itemsWaitingForPickup, collectionLog: true });
			return `You have picked up the following items left for you:\n\n${itemsWaitingForPickup.toString()}.

You have ${newEventData.candy_in_bowl} Halloween candy left in your Candy Bowl.
`;
		}

		if (options.fill_candy_bowl) {
			if (!progress.hasCandyBowl) {
				return "You don't have a Candy Bowl in your PoH garden! You need to build one first.";
			}
			if (progress.candyOwned === 0) {
				return "You don't have any Halloween candy to deposit!";
			}
			await user.removeItemsFromBank(new Bank().add('Halloween candy', progress.candyOwned));
			const halloweenEvent = await prisma.halloweenEvent.upsert({
				where: { user_id: user.id },
				create: {
					user_id: user.id,
					candy_in_bowl: progress.candyOwned,
					total_candy_deposited: progress.candyOwned
				},
				update: {
					candy_in_bowl: {
						increment: progress.candyOwned
					},
					total_candy_deposited: {
						increment: progress.candyOwned
					}
				}
			});
			return `You have deposited ${progress.candyOwned} Halloween candy into your Candy Bowl! It now contains a total of ${halloweenEvent.candy_in_bowl} candy.`;
		}

		const equippedCard = user.user.equipped_card_item_id
			? trickOrTreaters.find(t => t.card.id === user.user.equipped_card_item_id)
			: undefined;

		return `**Halloween Event Info**

**Equipped Card:** ${equippedCard ? `${equippedCard.emoji} ${equippedCard.card.name} (${equippedCard.perk.description})` : 'None'}
**Owned Cards:** ${
			trickOrTreaters
				.filter(t => user.bank.has(t.card.id))
				.map(t => `${user.bank.amount(t.card.id).toLocaleString()}x ${t.card.name} ${t.emoji}`)
				.join(', ') || 'None'
		}
**Candy In Bank:** ${progress.candyOwned.toLocaleString()}
**Candy in Bowl:** ${progress.hweenData.candy_in_bowl.toLocaleString()}
**Halloween Wallkit:** ${progress.hasHalloweenWallkit ? Emoji.Green : Emoji.RedX}`;
	}
});
