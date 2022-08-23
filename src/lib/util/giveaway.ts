import { Snowflake, TextChannel } from 'discord.js';
import { noOp, randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Events } from '../constants';
import { prisma } from '../settings/prisma';
import { logError } from './logError';
import { Giveaway } from '.prisma/client';

async function refundGiveaway(creator: KlasaUser, loot: Bank) {
	await transactItems({
		userID: creator.id,
		itemsToAdd: loot
	});
	creator.send(`Your giveaway failed to finish, you were refunded the items: ${loot}.`).catch(noOp);
}

export async function handleGiveawayCompletion(giveaway: Giveaway) {
	if (giveaway.completed) {
		throw new Error('Tried to complete an already completed giveaway.');
	}

	const loot = new Bank(giveaway.loot as ItemBank);

	try {
		await prisma.giveaway.updateMany({
			where: {
				id: giveaway.id
			},
			data: {
				completed: true
			}
		});

		const creator = await globalClient.fetchUser(giveaway.user_id);
		const channel = globalClient.channels.cache.get(giveaway.channel_id as Snowflake) as TextChannel | undefined;
		if (!channel?.messages) {
			await refundGiveaway(creator, loot);
			return;
		}
		const message = await channel?.messages.fetch(giveaway.message_id as Snowflake).catch(noOp);

		const reactions = message ? message.reactions.cache.get(giveaway.reaction_id) : undefined;
		const users: KlasaUser[] = !reactions
			? []
			: Array.from(
					(await reactions.users.fetch())!
						.filter(u => !u.isIronman && !u.bot && u.id !== giveaway.user_id)
						.values()
			  );

		if (users.length === 0 || !channel || !message) {
			logError('Giveaway failed');
			await refundGiveaway(creator, loot);

			if (message && channel) {
				channel.send('Nobody entered the giveaway :(');
			}
			return;
		}

		const winner = randArrItem(users);
		await transactItems({ userID: winner.id, itemsToAdd: loot });
		await prisma.economyTransaction.create({
			data: {
				guild_id: undefined,
				sender: BigInt(creator.id),
				recipient: BigInt(winner.id),
				items_sent: loot.bank,
				items_received: undefined,
				type: 'giveaway'
			}
		});

		globalClient.emit(
			Events.EconomyLog,
			`${winner.username}[${winner.id}] won ${loot} in a giveaway of ${users.length} made by ${creator.username}[${creator.id}].`
		);

		const str = `<@${giveaway.user_id}> **Giveaway finished:** ${users.length} users joined, the winner is... ||**${winner}**||
			
They received these items: ${loot}`;

		const resultMsg = await channel.send(str);
		message.edit(
			`**Giveaway finished:** https://discord.com/channels/${resultMsg.guild!.id}/${resultMsg.channel.id}/${
				resultMsg.id
			}`
		);
	} catch (err) {
		logError(err);
	}
}
