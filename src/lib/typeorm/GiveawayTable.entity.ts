import { TextChannel } from 'discord.js';
import { noOp, randArrItem } from 'e';
import { KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import {
	BaseEntity,
	Column,
	Entity,
	getConnection,
	Index,
	PrimaryColumn,
	PrimaryGeneratedColumn
} from 'typeorm';

import { client } from '../..';
import { Events } from '../constants';

@Entity({ name: 'giveaway' })
export class GiveawayTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: number;

	@PrimaryColumn('varchar', { length: 19, name: 'user_id', nullable: false })
	public userID!: string;

	@Column('timestamp without time zone', {
		name: 'start_date',
		nullable: false
	})
	public startDate!: Date;

	@Column('timestamp without time zone', {
		name: 'finish_date',
		nullable: false
	})
	public finishDate!: Date;

	@Column('integer', { name: 'duration', nullable: false })
	public duration!: number;

	@Index()
	@Column('boolean', { name: 'completed', nullable: false })
	public completed: boolean = false;

	@PrimaryColumn('varchar', {
		length: 19,
		name: 'channel_id',
		nullable: false
	})
	public channelID!: string;

	@Column('json', { name: 'loot', nullable: false })
	public bank!: ItemBank;

	/**
	 * The message from the bot containing the giveaway reactions.
	 */
	@PrimaryColumn('varchar', {
		length: 19,
		name: 'message_id',
		nullable: false
	})
	public messageID!: string;

	/**
	 * The reaction used for the giveaway
	 */
	@PrimaryColumn('varchar', {
		length: 19,
		name: 'reaction_id',
		nullable: false
	})
	public reactionID!: string;

	public async complete() {
		if (this.completed) {
			throw new Error(`Tried to complete an already completed giveaway.`);
		}

		try {
			await getConnection()
				.createQueryBuilder()
				.update(GiveawayTable)
				.set({ completed: true })
				.where('id = :id', { id: this.id })
				.execute();

			const channel = client.channels.cache.get(this.channelID) as TextChannel | undefined;
			const message = await channel?.messages.fetch(this.messageID).catch(noOp);

			const reactions = message ? message.reactions.cache.get(this.reactionID) : undefined;
			const users: KlasaUser[] = (reactions?.users.cache.array() || []).filter(
				u => !u.isIronman && !u.bot && u.id !== this.userID
			);

			const creator = await client.users.fetch(this.userID);

			if (users.length === 0 || !channel || !message) {
				console.error('Giveaway failed');
				await creator.addItemsToBank(this.bank);
				creator
					.send(
						`Your giveaway failed to finish, you were refunded the items: ${this.bank}.`
					)
					.catch(noOp);

				if (message && channel) {
					channel.send(`Nobody entered the giveaway :(`);
				}
				return;
			}

			const winner = randArrItem(users);
			await winner.addItemsToBank(this.bank);

			const osBank = new Bank(this.bank);
			client.emit(
				Events.EconomyLog,
				`${winner.username}[${winner.id}] won ${osBank} in a giveaway of ${users.length} made by ${creator.username}[${creator.id}].`
			);

			const str = `<@${this.userID}> **Giveaway finished:** ${users.length} users joined, the winner is... ||**${winner}**||
			
They received these items: ${osBank}`;

			const resultMsg = await channel.send(str);
			message.edit(
				`**Giveaway finished:** https://discord.com/channels/${resultMsg.guild!.id}/${
					resultMsg.channel.id
				}/${resultMsg.id}`
			);
		} catch (err) {
			console.error(err);
		}
	}
}
