import { TextChannel } from 'discord.js';
import { noOp, randArrItem } from 'e';
import { KlasaClient, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';

import { Events } from '../constants';
import { prisma } from '../settings/prisma';
import { Giveaway } from '.prisma/client';

export async function handleGiveawayCompletion(client: KlasaClient, giveaway: Giveaway) {
	if (giveaway.completed) {
		throw new Error('Tried to complete an already completed giveaway.');
	}

	const loot: ItemBank = giveaway.loot as ItemBank;

	try {
		await prisma.giveaway.updateMany({
			where: {
				id: giveaway.id
			},
			data: {
				completed: true
			}
		});

		const channel = client.channels.cache.get(giveaway.channel_id) as TextChannel | undefined;
		const message = await channel?.messages.fetch(giveaway.message_id).catch(noOp);

		const reactions = message ? message.reactions.cache.get(giveaway.reaction_id) : undefined;
		const users: KlasaUser[] = !reactions
			? []
			: (await reactions.users.fetch())!
					.array()!
					.filter(u => !u.isIronman && !u.bot && u.id !== giveaway.user_id);
		const creator = await client.fetchUser(giveaway.user_id);

		if (users.length === 0 || !channel || !message) {
			console.error('Giveaway failed');
			await creator.addItemsToBank(loot);
			creator.send(`Your giveaway failed to finish, you were refunded the items: ${new Bank(loot)}.`).catch(noOp);

			if (message && channel) {
				channel.send('Nobody entered the giveaway :(');
			}
			return;
		}

		const winner = randArrItem(users);
		await winner.addItemsToBank(loot);

		const osBank = new Bank(loot);
		client.emit(
			Events.EconomyLog,
			`${winner.username}[${winner.id}] won ${osBank} in a giveaway of ${users.length} made by ${creator.username}[${creator.id}].`
		);

		const str = `<@${giveaway.user_id}> **Giveaway finished:** ${users.length} users joined, the winner is... ||**${winner}**||
			
They received these items: ${osBank}`;

		const resultMsg = await channel.send(str);
		message.edit(
			`**Giveaway finished:** https://discord.com/channels/${resultMsg.guild!.id}/${resultMsg.channel.id}/${
				resultMsg.id
			}`
		);
	} catch (err) {
		console.error(err);
	}
}
