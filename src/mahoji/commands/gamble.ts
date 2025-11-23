import { isSuperUntradeable } from '@/lib/bso/bsoUtil.js';

import { randArrItem } from '@oldschoolgg/rng';
import { Bank } from 'oldschooljs';

import { choicesOf } from '@/discord/index.js';
import { BitField } from '@/lib/constants.js';
import { capeGambleCommand, capeGambleStatsCommand } from '@/mahoji/lib/abstracted_commands/capegamble.js';
import { diceCommand } from '@/mahoji/lib/abstracted_commands/diceCommand.js';
import { duelCommand } from '@/mahoji/lib/abstracted_commands/duelCommand.js';
import { hotColdCommand } from '@/mahoji/lib/abstracted_commands/hotColdCommand.js';
import { luckyPickCommand } from '@/mahoji/lib/abstracted_commands/luckyPickCommand.js';
import { slotsCommand } from '@/mahoji/lib/abstracted_commands/slotsCommand.js';

export const gambleCommand = defineCommand({
	name: 'gamble',
	description: 'Partake in various gambling activities.',
	options: [
		/**
		 *
		 * Cape
		 *
		 */
		{
			type: 'Subcommand',
			name: 'item',
			description: 'Allows you to gamble fire/infernal capes/quivers for a chance at the pets.',
			options: [
				{
					type: 'String',
					name: 'item',
					description: 'The item you wish to gamble.',
					required: false,
					choices: choicesOf(['fire', 'infernal', 'quiver'])
				},
				{
					type: 'Boolean',
					name: 'autoconfirm',
					description: "Don't ask confirmation message",
					required: false
				}
			]
		},
		/**
		 *
		 * Dice
		 *
		 */
		{
			type: 'Subcommand',
			name: 'dice',
			description: 'Allows you to simulate dice rolls, or dice your bot GP.',
			options: [
				{
					type: 'String',
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: false
				}
			]
		},
		/**
		 *
		 * Duel
		 *
		 */
		{
			type: 'Subcommand',
			name: 'duel',
			description: 'Simulates dueling another player, or allows you to duel another player for their bot GP.',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user you want to duel.',
					required: true
				},
				{
					type: 'String',
					name: 'amount',
					description: 'The GP you want to duel for.',
					required: false
				}
			]
		},
		/**
		 *
		 * Lucky Pick
		 *
		 */
		{
			type: 'Subcommand',
			name: 'lucky_pick',
			description: 'Allows you play lucky pick and risk your GP.',
			options: [
				{
					type: 'String',
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: true
				}
			]
		},
		/**
		 *
		 * Slots
		 *
		 */
		{
			type: 'Subcommand',
			name: 'slots',
			description: 'Allows you play slots and risk your GP to win big.',
			options: [
				{
					type: 'String',
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: false
				}
			]
		},
		/**
		 *
		 * Hot Cold
		 *
		 */
		{
			type: 'Subcommand',
			name: 'hot_cold',
			description: 'Allows you play Hot Cold and risk your GP to win big.',
			options: [
				{
					type: 'String',
					name: 'choice',
					description: 'The flower type you want to guess.',
					required: false,
					choices: choicesOf(['hot', 'cold'])
				},
				{
					type: 'String',
					name: 'amount',
					description: 'Amount you wish to gamble.',
					required: false
				}
			]
		},
		/**
		 *
		 * Give Random Item
		 *
		 */
		{
			type: 'Subcommand',
			name: 'give_random_item',
			description: 'Give a random item from your bank to someone.',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user to give a random item too.',
					required: true
				}
			]
		}
	],
	run: async ({ options, interaction, guildId, user, rng }) => {
		if (options.item) {
			if (options.item.item) {
				return capeGambleCommand(user, options.item.item, interaction, options.item.autoconfirm);
			}
			return capeGambleStatsCommand(user);
		}

		if (options.duel) {
			const targetUser = await mUserFetch(options.duel.user.user.id);
			// Block duels when one user has the BitField set, but only when wagering an amount
			if (options.duel.amount && [user, targetUser].some(u => u.bitfield.includes(BitField.SelfGamblingLocked))) {
				return 'One of you has gambling disabled and cannot participate in this duel!';
			}
			return duelCommand(user, interaction, targetUser, options.duel.user, options.duel.amount);
		}

		if (options.dice) {
			if (user.bitfield.includes(BitField.SelfGamblingLocked) && options.dice.amount) {
				return 'You have gambling disabled and cannot gamble!';
			}
			return diceCommand(rng, user, interaction, options.dice.amount);
		}

		// Block GP Gambling from users with the BitField set:
		if (user.bitfield.includes(BitField.SelfGamblingLocked)) {
			return 'You have gambling disabled and cannot gamble!';
		}

		if (options.lucky_pick) {
			return luckyPickCommand(user, options.lucky_pick.amount, interaction);
		}

		if (options.slots) {
			return slotsCommand(interaction, user, options.slots.amount);
		}

		if (options.hot_cold) {
			return hotColdCommand(interaction, user, options.hot_cold.choice, options.hot_cold.amount);
		}

		if (options.give_random_item) {
			const senderUser = user;
			const recipientuser = await mUserFetch(options.give_random_item.user.user.id);
			if (recipientuser.id === senderUser.id) {
				return "You can't do it with yourself.";
			}

			if (senderUser.isIronman || recipientuser.isIronman) {
				return 'One of you is an ironman.';
			}
			await interaction.confirmation(
				`Are you sure you want to give a random stack of items from your bank to ${recipientuser.usernameOrMention}? Untradeable and favorited items are not included.`
			);

			await senderUser.sync();
			const bank = senderUser.bank
				.items()
				.filter(i => !isSuperUntradeable(i[0].id))
				.filter(i => !user.user.favoriteItems.includes(i[0].id));
			const entry = randArrItem(bank);
			if (!entry) return 'You have no items you can give away!';
			const [item, qty] = entry;
			const loot = new Bank().add(item.id, qty);

			await senderUser.transactItems({ itemsToRemove: loot });
			await recipientuser.transactItems({
				itemsToAdd: loot,
				collectionLog: false,
				filterLoot: false
			});
			await prisma.economyTransaction.create({
				data: {
					guild_id: guildId ? BigInt(guildId) : undefined,
					sender: BigInt(senderUser.id),
					recipient: BigInt(recipientuser.id),
					items_sent: loot.toJSON(),
					items_received: undefined,
					type: 'gri'
				}
			});
			const debug = new Bank();
			for (const t of bank) debug.add(t[0].id);

			return `You gave ${qty.toLocaleString()}x ${item.name} to ${recipientuser.usernameOrMention}.`;
		}

		return 'Invalid command.';
	}
});
