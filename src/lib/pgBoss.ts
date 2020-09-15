import { instantTrips, providerConfig } from '../config';
import PgBoss from 'pg-boss';
import { Tasks, Time } from './constants';
import { Client } from 'pg';
import { KlasaClient } from 'klasa';
import { ClientSettings } from './settings/types/ClientSettings';
import { ActivityTaskOptions } from './types/minions';
import { PgBossJobs } from './types';

let boss: PgBoss;

const options = {
	host: 'localhost',
	database: providerConfig?.postgres?.database,
	user: providerConfig?.postgres?.user,
	password: providerConfig?.postgres?.password,
	port: providerConfig?.postgres?.port,
	max: 10,
	retentionDays: 7
};

export async function getPgBoss() {
	if (!boss) {
		boss = await new PgBoss(options);
		boss.on('error', error => console.error(error));
		await boss.start();
	}
	return boss;
}

export async function publish(
	client: KlasaClient,
	channel: Tasks,
	data: ActivityTaskOptions,
	activity: any
): Promise<boolean> {
	const boss = await getPgBoss();
	const jobID = await boss.publish(
		`osbot_${channel}`,
		{ ...data, activity },
		{ startAfter: instantTrips ? 10 : data.duration / Time.Second }
	);
	if (typeof jobID !== 'string') {
		throw `It was not possible to start this trip at this time. Please, try again.`;
	}
	// sync to make sure we are getting the most recent jobs
	await client.settings.sync(true);
	const currentJobs = Object.create(client.settings.get(ClientSettings.PgBossJobs));
	currentJobs[jobID] = { userID: data.userID, task: data };
	await client.settings.update(ClientSettings.PgBossJobs, currentJobs);
	// sync again to make the bot to know that there is a new task
	await client.settings.sync(true);
	return true;
}

export async function refreshCacheWithActiveJobs(
	client: KlasaClient
): Promise<{ qty: number; data: any[] }> {
	const _client = new Client({
		user: providerConfig?.postgres?.user,
		password: providerConfig?.postgres?.password,
		database: providerConfig?.postgres?.database,
		port: providerConfig?.postgres?.port,
		host: 'localhost'
	});
	await _client.connect();
	const result = await _client.query(
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
	await _client.end();
	const currentJobs: PgBossJobs = {};
	for (const row of result.rows) {
		currentJobs[row.id] = { userID: row.data.userID, task: row.data };
	}
	await client.settings.update(ClientSettings.PgBossJobs, currentJobs);
	await client.settings.sync(true);
	return { qty: result.rowCount, data: result.rows };
}

export async function removeJob(client: KlasaClient, task: ActivityTaskOptions) {
	const _client = new Client({
		user: providerConfig?.postgres?.user,
		password: providerConfig?.postgres?.password,
		database: providerConfig?.postgres?.database,
		port: providerConfig?.postgres?.port,
		host: 'localhost'
	});
	await _client.connect();
	const result = await _client.query(
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
	await _client.end();
	const boss = await getPgBoss();
	boss.cancel(result.rows[0].id);
	await client.settings.sync(true);
	const currentJobs: PgBossJobs = Object.create(
		await client.settings.get(ClientSettings.PgBossJobs)
	);
	delete currentJobs[result.rows[0].id];
	await client.settings.update(ClientSettings.PgBossJobs, currentJobs);
	await client.settings.sync(true);
	return true;
}
