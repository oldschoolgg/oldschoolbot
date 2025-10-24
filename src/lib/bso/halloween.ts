import { BSOItem } from '@/lib/bso/BSOItem.js';
import { BSOEmoji } from '@/lib/bso/bsoEmoji.js';

import { MathRNG } from '@oldschoolgg/rng';
import { Bank, type Item, type ItemBank, Items } from 'oldschooljs';

import type { HalloweenEvent } from '@/prisma/main.js';

const constants = {
	MINUTES_PER_VISIT: 10,
	CARD_TARGET_DAYS: 0.1,
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

const CARD_CHANCE = 15;
const PET_CHANCE = 650;

const trickOrTreaters: {
	id: HalloweenCardID;
	card: Item;
	emoji: string;
	cardDescription: string;
}[] = [
	{
		id: 'witch',
		card: Items.getOrThrow('Witch card'),
		emoji: BSOEmoji.WitchCard,
		cardDescription:
			'An extra 1/5 chance at loot doubling, and custom pets give double their normal loot (peky/obis/brock/wilvus/smokey/doug/harry)'
	},
	{
		id: 'death',
		card: Items.getOrThrow('Death card'),
		emoji: BSOEmoji.DeathCard,
		cardDescription: 'All PvM is 30% faster, and all slayer tasks have 50% more kills assigned.'
	},
	{
		id: 'pumpkinman',
		card: Items.getOrThrow('Pumpkinman card'),
		emoji: BSOEmoji.PumpkinmanCard,
		cardDescription: 'Farming patches grow 50% faster, and give twice the yield.'
	},
	{
		id: 'vampire',
		card: Items.getOrThrow('Vampire card'),
		emoji: BSOEmoji.VampireCard,
		cardDescription: '+10 minutes longer max trip length all trips'
	},
	{
		id: 'ghost',
		card: Items.getOrThrow('Ghost card'),
		emoji: BSOEmoji.GhostCard,
		cardDescription: 'Increased chance of trick-or-treating'
	}
] as const;

export type HalloweenCardID = 'witch' | 'death' | 'pumpkinman' | 'vampire' | 'ghost';

export async function doHalloweenTickOnUser(user: MUser, userEvent: HalloweenEvent) {
	const candyDesired = MathRNG.randInt(1, 3);

	// Doesnt have enough candy
	if (userEvent.candy_in_bowl < candyDesired) {
		await prisma.halloweenEvent.update({
			where: { user_id: userEvent.user_id },
			data: {
				last_trick_or_treat: new Date()
			}
		});
		return;
	}

	const itemsWaitingForPickup = new Bank(userEvent.items_waiting_for_pickup as ItemBank);

	const hasCard = (id: number) => user.cl.has(id) || itemsWaitingForPickup.has(id);

	// No duplicates
	let validTrickOrTreaters = HalloweenEvent2025.trickOrTreaters.filter(_t => !hasCard(_t.card.id));
	if (validTrickOrTreaters.length === 0) validTrickOrTreaters = HalloweenEvent2025.trickOrTreaters;

	const trickOrTreater = MathRNG.pick(validTrickOrTreaters) ?? HalloweenEvent2025.trickOrTreaters[0];
	if (MathRNG.roll(CARD_CHANCE) && !hasCard(trickOrTreater.card.id)) {
		itemsWaitingForPickup.add(trickOrTreater.card.id);
	}

	if (MathRNG.roll(HalloweenEvent2025.constants.PET_CHANCE)) {
		itemsWaitingForPickup.add('Night-Mare');
	}

	await prisma.halloweenEvent.update({
		where: { user_id: userEvent.user_id },
		data: {
			last_trick_or_treat: new Date(),
			items_waiting_for_pickup: itemsWaitingForPickup.toJSON(),
			candy_in_bowl: {
				decrement: candyDesired
			},
			trick_or_treaters_seen: { increment: 1 }
		}
	});
}

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
			candy_in_bowl: {
				gt: 0
			}
		}
	});
	for (const userEvent of usersToUpdate) {
		const user = await mUserFetch(userEvent.user_id);
		await doHalloweenTickOnUser(user, userEvent);
	}
}

export const HalloweenEvent2025 = {
	ALL_CARD_IDS: [
		BSOItem.WITCH_CARD,
		BSOItem.GHOST_CARD,
		BSOItem.VAMPIRE_CARD,
		BSOItem.DEATH_CARD,
		BSOItem.PUMPKINMAN_CARD
	],
	constants: {
		...constants,
		PET_CHANCE
	},
	trickOrTreaters,
	DEATH_SPEED_BOOST: 30,
	GHOST_XP_BOOST: 5,
	CARD_CHANCE
};
