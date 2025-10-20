import { HalloweenEvent2025 } from '@/lib/bso/halloween.js';

import { MathRNG } from '@oldschoolgg/rng';
import { Emoji, sleep } from '@oldschoolgg/toolkit';
import { DateTime } from 'luxon';
import { Bank, type ItemBank } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { getPOH } from '@/mahoji/lib/abstracted_commands/pohCommand.js';

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
				lte: DateTime.now().minus({ minutes: HalloweenEvent2025.constants.MINUTES_PER_VISIT }).toJSDate()
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

		const trickOrTreater = MathRNG.pick(HalloweenEvent2025.trickOrTreaters);
		if (MathRNG.roll(HalloweenEvent2025.constants.CARD_CHANCE) && !user.cl.has(trickOrTreater.card.id)) {
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
		}
	],
	run: async ({ options, user, interaction }) => {
		const progress = await halloweenProgress(user);

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

		return `**Halloween Event Info**

**Owned Cards:** ${
			HalloweenEvent2025.trickOrTreaters
				.filter(t => user.bank.has(t.card.id))
				.map(t => `${user.bank.amount(t.card.id).toLocaleString()}x ${t.card.name} ${t.emoji}`)
				.join(', ') || 'None'
		}
**Candy In Bank:** ${progress.candyOwned.toLocaleString()}
**Candy in Bowl:** ${progress.hweenData.candy_in_bowl.toLocaleString()}
**Halloween Wallkit:** ${progress.hasHalloweenWallkit ? Emoji.Green : Emoji.RedX}`;
	}
});
