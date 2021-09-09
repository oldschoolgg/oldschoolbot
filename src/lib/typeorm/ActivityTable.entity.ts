import { BaseEntity, Column, Entity, getConnection, Index, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

import { client } from '../..';
import { Activity } from '../constants';
import { minionActivityCache } from '../settings/settings';
import { ActivityTaskData, ActivityTaskOptions, GroupMonsterActivityTaskOptions } from '../types/minions';
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

	@Column('bigint', { name: 'duration', nullable: false })
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
	public data!: Omit<ActivityTaskOptions, 'finishDate' | 'id' | 'type' | 'channelID' | 'userID' | 'duration'>;

	public get taskData(): ActivityTaskData {
		return {
			...this.data,
			type: this.type,
			userID: this.userID,
			channelID: this.channelID,
			duration: this.duration,
			finishDate: this.finishDate.getTime(),
			id: this.id
		};
	}

	public getUsers(): string[] {
		if (this.groupActivity) {
			return (this.data as GroupMonsterActivityTaskOptions).users;
		}
		return [this.userID];
	}

	public activitySync() {
		const users = isGroupActivity(this.data) ? this.data.users : [this.userID];

		for (const user of users) {
			minionActivityCache.set(user, this.taskData);
		}
	}

	public freeUsers() {
		const users = isGroupActivity(this.data) ? this.data.users : [this.userID];
		for (const user of users) {
			minionActivityCache.delete(user);
		}
	}

	public async complete() {
		if (this.completed) {
			this.freeUsers();
			throw new Error('Tried to complete an already completed task.');
		}

		const taskName = taskNameFromType(this.type);
		const task = client.tasks.get(taskName);

		if (!task) {
			this.freeUsers();
			throw new Error('Missing task');
		}

		client.oneCommandAtATimeCache.add(this.userID);
		try {
			await getConnection()
				.createQueryBuilder()
				.update(ActivityTable)
				.set({ completed: true })
				.where('id = :id', { id: this.id })
				.execute();
			await task.run(this.taskData);
		} catch (err) {
			console.error(err);
		} finally {
			client.oneCommandAtATimeCache.delete(this.userID);
			this.freeUsers();
		}
	}
}
