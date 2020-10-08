import { objectValues, Time } from 'e';
import { KlasaClient } from 'klasa';
import { Pool, QueryResult } from 'pg';
import PgBoss from 'pg-boss';

import { providerConfig } from '../../config';
import { Events } from '../constants';
import { GroupMonsterActivityTaskOptions } from '../minions/types';
import { ActivityTaskOptions } from '../types/minions';
import { removeDuplicatesFromArray } from '../util';
import { taskNameFromType } from '../util/taskNameFromType';

export enum Listeners {
	MonsterKillingEvent = 'monsterKillingEvent',
	ClueEvent = 'clueEvent',
	SkillingEvent = 'skillingEvent',
	MinigameEvent = 'minigameEvent'
}

export default class {
	options = {
		host: 'localhost',
		database: providerConfig?.postgres?.database,
		user: providerConfig?.postgres?.user,
		password: providerConfig?.postgres?.password,
		port: providerConfig?.postgres?.port,
		max: 10,
		retentionDays: 7
	};

	/**
	 * PgBoss object. Controls the job insertions, removals and executions
	 * @private
	 */
	private pgBoss: PgBoss;
	private readonly client: KlasaClient;
	/**
	 * Manual PgSQL connection to allow for task removals and cache refresh on bot start
	 * @private
	 */
	private readonly pgDatabase: Pool;
	/**
	 * Controls where the minions are busy or not.
	 * @see freeMinion
	 * @see lockMinion
	 * @private
	 */
	private busyMinions: {
		[key: string]: ActivityTaskOptions;
	};

	constructor(options: PgBoss.ConstructorOptions, client: KlasaClient) {
		this.pgBoss = new PgBoss(this.options);
		this.client = client;
		this.busyMinions = {};
		this.pgDatabase = new Pool({
			user: this.options.user,
			password: this.options.password,
			database: this.options.database,
			port: this.options.port,
			host: this.options.host
		});
	}

	/**
	 * Initiate the PgBoss, connects to the database and start the PgBoss event listeners
	 * @see bossStart
	 * @see startEventListener
	 */
	async init() {
		await this.bossStart();
		return this;
	}

	/**
	 * Returns the pgBoss object
	 */
	getPgBoss() {
		return this.pgBoss;
	}

	/**
	 * Returns if the minion is busy or not
	 * @param userID
	 */
	minionIsBusy(userID: string) {
		return this.busyMinions[userID] ?? null;
	}

	/**
	 * Adds a new job for the user/users
	 * @param client
	 * @param channel
	 * @param data The job to be added. All users in the job (userID for single jobs or users for
	 * group jobs) will have their busy status set.
	 */
	async addJob(client: KlasaClient, channel: Listeners, data: ActivityTaskOptions) {
		this.lockMinion(data);
		const jobID: string | null = await this.pgBoss.publish(`osbot_${channel}`, data, {
			startAfter: data.duration / Time.Second
		});
		if (!jobID) {
			await this.freeMinion(data);
			throw `It was not possible to start this trip at this time. Please, try again later.`;
		}
	}

	/**
	 * Remove the activity from the event listener and free all the minions from it
	 * @param task
	 */
	async removeJob(task: ActivityTaskOptions) {
		const result = await this.query(
			`
		select
			pgboss.job.id
		from
			pgboss.job
		where
			pgboss.job.name like 'osbot_%' and
			pgboss.job.data->>'userID' = $1::text and
			pgboss.job.data->>'id' = $2::text;
		`,
			[task.userID, task.id]
		);
		await this.pgBoss.cancel(result.rows[0].id);
		await this.freeMinion(task);
	}

	/**
	 * Return the current number of jobs running
	 * @param listener
	 */
	async getRunningJobs(): Promise<Record<Listeners, number>> {
		const checkListeners: Listeners[] = Object.values(Listeners);
		const query = `
			select
				pgboss.job.name as job,
				count(*) as qty
			from
				pgboss.job
			where
				pgboss.job.name = any ($1)
				and pgboss.job.state not in ('completed', 'expired', 'cancelled', 'failed')
			group by
				pgboss.job.name
			order by
				qty, job;
		`;
		const queryResult = await this.query(query, [checkListeners.map(l => `osbot_${l}`)]);
		const toReturn: Partial<Record<Listeners, number>> = {};
		for (const listener of checkListeners) {
			toReturn[listener] = Number(
				queryResult.rows.find(r => r.job === `osbot_${listener}`)?.qty ?? 0
			);
		}
		return toReturn as Record<Listeners, number>;
	}

	/**
	 * Runs query on the DB
	 * @param query
	 * @param params
	 * @private
	 */
	private async query(query: string, params: any[] = []): Promise<QueryResult> {
		const client = await this.pgDatabase.connect();
		const toReturn = await client.query(query, params);
		client.release();
		return toReturn;
	}

	/**
	 * Starts the pgBoss, refresh the local cache with all the users already on trips and call for the start of the
	 * event listeners
	 * @see startEventListener
	 * @see refreshCacheWithActiveJobs
	 * @private
	 */
	private async bossStart() {
		this.pgBoss = await this.pgBoss.start();
		this.pgBoss.on('error', error => console.error(error));
		await this.refreshCacheWithActiveJobs();
		await this.startEventListener();
		this.client.console.log(
			`Loaded ${objectValues(await this.getRunningJobs()).length} events for PgBoss`
		);
		return this.pgBoss;
	}

	/**
	 * Refresh the local cache with all the users already on a trip. This is needed to maintain the minion status cached
	 * and to be accessed outside an async function
	 * @private
	 */
	private async refreshCacheWithActiveJobs() {
		const result = await this.query(
			`
			select
				id, name, state, data
			from
				pgboss.job
			where
				pgboss.job.name like 'osbot_%' and
				pgboss.job.state not in ('completed', 'expired', 'cancelled', 'failed');
		`
		);
		this.busyMinions = {};
		for (const row of result.rows) {
			this.busyMinions[row.data.userID] = row.data;
		}
	}

	/**
	 * Initiate all the events (queues) for the PgBoss.
	 * @private
	 */
	private async startEventListener() {
		for (const event of Object.values(Listeners)) {
			await this.pgBoss.subscribe(`osbot_${event}`, async job => {
				try {
					// Get the job being executed
					const jobData = job.data as ActivityTaskOptions;
					// Get the users in this job and free them
					await this.freeMinion(jobData);
					// Execute the job
					if (this.client.tasks) {
						const task = this.client.tasks.get(taskNameFromType(jobData.type));
						if (task) {
							await (task.run(jobData) as Promise<any>).catch(console.error);
						} else {
							throw 'Error';
						}
					} else {
						throw 'Error';
					}
				} catch (e) {
					this.client.emit(Events.Error, `Impossible to execute the task ${job.id}!`);
				} finally {
					job.done();
				}
			});
		}
	}

	/**
	 * Remove the minionIsBusy from all the minion in the job
	 * @param job
	 * @private
	 */
	private async freeMinion(job: ActivityTaskOptions) {
		for (const user of this.getUsersFromJob(job)) {
			if (!this.busyMinions[user]) {
				// This is a backup routine. If the call to remove the user is null, it means something really bad happened
				// with the content of the busyMinions and so, we restart the variable with all active jobs on the pgBoss.
				await this.refreshCacheWithActiveJobs();
			}
			delete this.busyMinions[user];
		}
	}

	/**
	 * Set the minionIsBusy = true for all minions in the task
	 * @param job
	 * @private
	 */
	private lockMinion(job: ActivityTaskOptions) {
		for (const user of this.getUsersFromJob(job)) {
			this.busyMinions[user] = job;
		}
	}

	/**
	 * Return all the users in the job
	 * @param job
	 * @private
	 */
	private getUsersFromJob(job: ActivityTaskOptions): string[] {
		let users: string[] = [];
		if ((job as GroupMonsterActivityTaskOptions).users) {
			users.push(
				...removeDuplicatesFromArray([
					...(job as GroupMonsterActivityTaskOptions).users,
					job.userID
				])
			);
		} else {
			users = [job.userID];
		}
		return users;
	}
}
