import { instantTrips, providerConfig } from '../config';
import PgBoss from 'pg-boss';
import { Time } from './constants';
import { KlasaClient } from 'klasa';

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

export async function publish(channel: string, data: any, duration = 0, activity: any) {
	const boss = await getPgBoss();
	return boss.publish(
		`osbot_${channel}`,
		{ data, activity },
		{ startAfter: instantTrips ? 0 : duration / Time.Second }
	);
}

export async function query(client: KlasaClient): Promise<any[]> {
	return client.query(
		`select id, name, state, data from pgboss.job where pgboss.job.name like 'osbot_%' and pgboss.job.state <> 'completed';`
	);
}
