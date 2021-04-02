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

@Entity({ name: 'giveaway' })
export class GiveawayTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@PrimaryColumn('varchar', { length: 19, name: 'user_id', nullable: false })
	public userID!: string;

	@Column('timestamp without time zone', { name: 'start_date', nullable: false })
	public startDate!: Date;

	@Column('timestamp without time zone', { name: 'finish_date', nullable: false })
	public finishDate!: Date;

	@Column('integer', { name: 'duration', nullable: false })
	public duration!: number;

	@Index()
	@Column('boolean', { name: 'completed', nullable: false })
	public completed: boolean = false;

	@PrimaryColumn('varchar', { length: 19, name: 'channel_id', nullable: false })
	public channelID!: string;

	@Column('json', { name: 'loot', nullable: false })
	public bank!: ItemBank;

	/**
	 * The users entered into the giveaway.
	 */
	@Column('varchar', { name: 'users', array: true, nullable: false, length: 48 })
	public users!: string[];

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
			// client.oneCommandAtATimeCache.add(this.userID);
			

			if (group.length === 0) {
				return msg.send(`Nobody entered the giveaway :(`);
			}

			if (!msg.author.bank().fits(bank)) {
				return msg.send(`You don't own the items you tried to giveaway!`);
			}

			const winner = randArrItem(group);
			if (winner !== msg.author) {
				await winner.addItemsToBank(bank);
			}

			return msg.send(
				`**Giveaway finished:** ${group.length} users joined, the winner is... ||**${winner}**||
			
They received: ${bank}.`


		} catch (err) {
			console.error(err);
		} finally {
			client.oneCommandAtATimeCache.delete(this.userID);
			const users = isGroupActivity(this.data) ? this.data.users : [this.userID];
			for (const user of users) {
				client.minionActivityCache.delete(user);
			}
		}
	}
}
