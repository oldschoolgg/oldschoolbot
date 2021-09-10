import {
	BaseEntity,
	Column,
	Entity,
	getConnection,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm';

import { runTameTask, TameTaskOptions, TameType } from '../tames';
import { TamesTable } from './TamesTable.entity';

@Entity({ name: 'tame_activity' })
export class TameActivityTable extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	public id!: string;

	@Column('varchar', { length: 19, name: 'user_id', nullable: false })
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

	@Column({ type: 'varchar', name: 'type', nullable: false })
	public type!: TameType;

	@Column('varchar', { length: 19, name: 'channel_id', nullable: false })
	public channelID!: string;

	@Column('json', { name: 'data', nullable: false })
	public data!: TameTaskOptions;

	@ManyToOne(() => TamesTable, tame => tame.activities, { nullable: false })
	@JoinColumn({ name: 'tame_id' })
	public tame!: TamesTable;

	public async complete() {
		if (this.completed) {
			throw new Error('Tried to complete an already completed task.');
		}

		try {
			await getConnection()
				.createQueryBuilder()
				.update(TameActivityTable)
				.set({ completed: true })
				.where('id = :id', { id: this.id })
				.execute();
			await runTameTask(this);
		} catch (err) {
			console.error(err);
		}
	}
}
