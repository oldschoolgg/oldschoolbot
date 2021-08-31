import { giveaway } from '@prisma/client';
import { TextChannel } from 'discord.js';
import { noOp, randArrItem } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Events } from '../lib/constants';
import { prisma } from '../lib/settings/prisma';
import { GiveawayTable } from '../lib/typeorm/GiveawayTable.entity';

export default class extends Task {
	async runGiveaway(giveaway: giveaway) {
		if (giveaway.completed) {
			throw new Error('Tried to complete an already completed giveaway.');
		}

		try {
			await getConnection()
				.createQueryBuilder()
				.update(GiveawayTable)
				.set({ completed: true })
				.where('id = :id', { id: giveaway.id })
				.execute();

			const channel = this.client.channels.cache.get(giveaway.channel_id) as TextChannel | undefined;
			const message = await channel?.messages.fetch(giveaway.message_id).catch(noOp);

			const reactions = message ? message.reactions.cache.get(giveaway.reaction_id) : undefined;
			const users: KlasaUser[] = (reactions?.users.cache.array() || []).filter(
				u => !u.isIronman && !u.bot && u.id !== giveaway.user_id
			);

			const creator = await this.client.fetchUser(giveaway.user_id);

			if (users.length === 0 || !channel || !message) {
				console.error('Giveaway failed');
				await creator.addItemsToBank(giveaway.loot);
				creator
					.send(`Your giveaway failed to finish, you were refunded the items: ${giveaway.loot}.`)
					.catch(noOp);

				if (message && channel) {
					channel.send('Nobody entered the giveaway :(');
				}
				return;
			}

			const winner = randArrItem(users);
			await winner.addItemsToBank(giveaway.loot);

			const osBank = new Bank(giveaway.loot);
			this.client.emit(
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

	async init() {
		if (this.client.giveawayTicker) {
			clearTimeout(this.client.giveawayTicker);
		}
		const ticker = async () => {
			try {
				const result = await prisma.giveaway.findMany({
					where: {
						completed: false,
						finish_date: {
							lt: new Date()
						}
					}
				});

				await Promise.all(result.map(t => t.complete()));
			} catch (err) {
				console.error(err);
			} finally {
				this.client.giveawayTicker = setTimeout(ticker, 5000);
			}
		};
		ticker();
	}

	async run() {}
}
