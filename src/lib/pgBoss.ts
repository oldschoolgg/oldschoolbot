import { KlasaClient } from 'klasa';
import { Client } from 'pg';
import PgBoss from 'pg-boss';

import { instantTrips, providerConfig } from '../config';
import { Tasks, Time } from './constants';
import { ActivityTaskOptions } from './types/minions';

interface BusyMinion {
	[key: string]: ActivityTaskOptions;
}

interface PgBossInterface {
	boss: PgBoss;
	busyMinions: BusyMinion;
}

const options = {
	host: 'localhost',
	database: providerConfig?.postgres?.database,
	user: providerConfig?.postgres?.user,
	password: providerConfig?.postgres?.password,
	port: providerConfig?.postgres?.port,
	max: 10,
	retentionDays: 7
};

const boss: PgBossInterface = {
	boss: new PgBoss(options),
	busyMinions: {}
};

export function getPgBoss(): PgBoss {
	return boss.boss;
}

export async function bossStart() {
	getPgBoss().on('error', error => console.error(error));
	await boss.boss.start();
	await refreshCacheWithActiveJobs();
	return getPgBoss();
}

export async function publish(
	client: KlasaClient,
	channel: Tasks,
	data: ActivityTaskOptions,
	activity: any
) {
	if (boss.busyMinions[data.userID]) {
		throw client.users.get(data.userID)?.minionStatus;
	} else {
		boss.busyMinions[data.userID] = data;
	}
	const jobID = await getPgBoss().publish(
		`osbot_${channel}`,
		{ ...data, activity },
		{ startAfter: instantTrips ? 10 : data.duration / Time.Second }
	);
	if (typeof jobID !== 'string') {
		throw `It was not possible to start this trip at this time. Please, try again.`;
	}
}

async function refreshCacheWithActiveJobs() {
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
	for (const row of result.rows) {
		boss.busyMinions[row.data.userID] = row.data;
	}
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
	await getPgBoss().cancel(result.rows[0].id);
	delete boss.busyMinions[task.userID];
	return true;
}

export function freeMinion(userID: string) {
	delete boss.busyMinions[userID];
}

export function minionIsBusy(userID: string) {
	return boss.busyMinions[userID] ?? null;
}
