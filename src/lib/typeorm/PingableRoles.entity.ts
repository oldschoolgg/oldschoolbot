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
import { Activity } from '../constants';
import { ActivityTaskOptions, GroupMonsterActivityTaskOptions } from '../types/minions';
import { isGroupActivity } from '../util';
import { taskNameFromType } from '../util/taskNameFromType';

@Entity({ name: 'activity' })
export class ActivityTable extends BaseEntity {
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

	@Index()
	@Column('boolean', { name: 'group_activity', nullable: false })
	public groupActivity: boolean = false;

	@Column({ type: 'enum', enum: Activity, name: 'type', nullable: false })
	public type!: Activity;

	@PrimaryColumn('varchar', { length: 19, name: 'channel_id', nullable: false })
	public channelID!: string;

	@Column('json', { name: 'data', nullable: false })
	public data!: Omit<ActivityTaskOptions, 'finishDate' | 'id' | 'type' | 'channelID' | 'userID'>;
}
