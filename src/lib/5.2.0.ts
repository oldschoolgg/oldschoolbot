import { Pool } from 'pg';
import { mergeDefault } from '@klasa/utils';
import { join } from 'path';
import { readJSON, outputJSON } from 'fs-nextra';

export type AnyObject = Record<keyof any, unknown> | {};

// -----------------------------

interface ClientStorage {
	id: string;
	commandStats?: object;
	totalCommandsUsed?: number;
	prices?: object;
	pollQuestions?: object;
	petRecords?: object;
	economyStats?: {
		dicingBank?: number;
		duelTaxBank?: number;
		dailiesAmount?: number;
		itemSellTaxBank?: number;
	};
	userBlacklist?: readonly string[];
	guildBlacklist?: readonly string[];
	schedules?: readonly object[];
}

interface Guild {
	id: string;
	prefix?: string;
	language?: string;
	disableNaturalPrefix?: boolean;
	disabledCommands?: readonly string[];
	tags?: readonly object[];
	totalCommandsUsed?: number;
	streamers?: readonly string[];
	staffOnlyChannels?: readonly string[];
	jmodComments?: string | null;
	hcimdeaths?: string | null;
	joyReactions?: string | null;
	petchannel?: string | null;
	streamertweets?: string | null;
	tweetchannel?: string | null;
	twitchnotifs?: string | null;
	levelUpMessages?: string | null;
}

interface User {
	id: string;
	totalCommandsUsed?: number;
	GP?: number;
	RSN?: string;
	pets?: object;
	badges?: readonly number[];
	lastDailyTimestamp?: number;
	bank?: object;
	collectionLogBank?: object;
	monsterScores?: object;
	clueScores?: object;
	minion?: {
		name?: string | null;
		hasBought?: boolean;
		dailyDuration?: number;
	};
	stats?: {
		deaths?: number;
		diceWins?: number;
		diceLosses?: number;
		duelWins?: number;
		duelLosses?: number;
	};
	skills?: {
		mining?: number;
	};
}

// -------------------

export interface RawClientSettings {
	id: string;
	commandStats: object;
	totalCommandsUsed: number;
	prices: object;
	pollQuestions: object;
	petRecords: object;
	'economyStats.dicingBank': number;
	'economyStats.duelTaxBank': number;
	'economyStats.dailiesAmount': number;
	'economyStats.itemSellTaxBank': number;
	userBlacklist: readonly string[];
	guildBlacklist: readonly string[];
	schedules: readonly object[];
}

export interface RawUserSettings {
	id: string;
	totalCommandsUsed: number;
	GP: number;
	RSN: string | null;
	pets: object;
	badges: readonly number[];
	lastDailyTimestamp: number;
	bank: object;
	collectionLogBank: object;
	monsterScores: object;
	clueScores: object;
	'minion.name': string | null;
	'minion.hasBought': boolean;
	'minion.dailyDuration': number;
	'stats.deaths': number;
	'stats.diceWins': number;
	'stats.diceLosses': number;
	'stats.duelWins': number;
	'stats.duelLosses': number;
	'skills.mining': number;
}

export const UserSettingsSchema = /* sql */ `
	CREATE TABLE IF NOT EXISTS users (
		"id"               VARCHAR(19)                               NOT NULL,
		"command_uses"     INTEGER       DEFAULT 0                   NOT NULL,
		"banner_list"      VARCHAR(6)[]  DEFAULT '{}'::VARCHAR(6)[]  NOT NULL,
		"badge_set"        VARCHAR(6)[]  DEFAULT '{}'::VARCHAR(6)[]  NOT NULL,
		"badge_list"       VARCHAR(6)[]  DEFAULT '{}'::VARCHAR(6)[]  NOT NULL,
		"color"            INTEGER       DEFAULT 0                   NOT NULL,
		"marry"            VARCHAR(19)[] DEFAULT '{}'::VARCHAR(19)[] NOT NULL,
		"money"            BIGINT        DEFAULT 0                   NOT NULL,
		"vault"            BIGINT        DEFAULT 0                   NOT NULL,
		"point_count"      INTEGER       DEFAULT 0                   NOT NULL,
		"reputation_count" INTEGER       DEFAULT 0                   NOT NULL,
		"theme_level"      VARCHAR(6)    DEFAULT '1001'              NOT NULL,
		"theme_profile"    VARCHAR(6)    DEFAULT '0001'              NOT NULL,
		"dark_theme"       BOOLEAN       DEFAULT FALSE               NOT NULL,
		"moderation_dm"    BOOLEAN       DEFAULT TRUE                NOT NULL,
		"next_daily"       BIGINT,
		"next_reputation"  BIGINT,
	);
`;

export interface RawGuildSettings {
	id: string;
	prefix: string;
	language: string;
	disableNaturalPrefix: boolean;
	disabledCommands: readonly string[];
	tags: readonly object[];
	totalCommandsUsed: number;
	streamers: readonly string[];
	staffOnlyChannels: readonly string[];
	jmodComments: string | null;
	hcimdeaths: string | null;
	joyReactions: string | null;
	petchannel: string | null;
	streamertweets: string | null;
	tweetchannel: string | null;
	twitchnotifs: string | null;
	levelUpMessages: string | null;
}

const options = {
	database: 'klasa',
	//password: 'kl23gkl2nduio21jbj32',
	password: '123',
	user: 'postgres'
};

async function main() {
	await migrateAll();

	const connection = mergeDefault(
		{
			host: 'localhost',
			port: 5433,
			database: 'klasa',
			options: {
				max: 20,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 2000
			}
		},
		options
	);
	const pgsql = new Pool({
		...connection.options,
		host: connection.host,
		port: connection.port,
		user: connection.user,
		password: connection.password,
		database: connection.database
	});

	// eslint-disable-next-line @typescript-eslint/unbound-method
	pgsql.on('error', console.error);
	const dbconnection = await pgsql.connect();
	await uploadAll(pgsql);
	dbconnection.release();
	await pgsql.end();
}

async function migrateAll() {
	console.time('Migrating migrateClientStorage');
	await migrateClientStorage();
	console.timeEnd('Migrating migrateClientStorage');

	console.time('Migrating migrateGuilds');
	await migrateGuilds();
	console.timeEnd('Migrating migrateGuilds');
	console.time('Migrating migrateUsers');
	await migrateUsers();
	console.timeEnd('Migrating migrateUsers');
}

async function uploadAll(pgsql: Pool) {
	console.time('Uploading clientStorage');
	await upload(pgsql, 'clientStorage', 'clientStorage').catch(error =>
		console.error('clientStorage', error)
	);
	console.timeEnd('Uploading clientStorage');

	console.time('Uploading guilds');
	await upload(pgsql, 'guilds', 'guilds').catch(error => console.error('guilds', error));
	console.timeEnd('Uploading guilds');

	console.time('Uploading users');
	await upload(pgsql, 'users', 'users').catch(error => console.error('users', error));
	console.timeEnd('Uploading users');
}

const rootData = join(__dirname, '..', '..', 'database', 'data');

async function migrateClientStorage() {
	const entries = (await readJSON(join(rootData, 'clientStorage.json'))) as ClientStorage[];
	const transformed: RawClientSettings[] = [];

	for (const entry of entries) {
		transformed.push({
			id: entry.id,
			totalCommandsUsed: entry.totalCommandsUsed || 0,
			guildBlacklist: entry.guildBlacklist || [],
			userBlacklist: entry.userBlacklist || [],
			schedules: (entry.schedules || []).map(schedule =>
				// @ts-ignore 2339
				typeof schedule.time === 'number'
					? schedule
					: // @ts-ignore 2339
					  // @ts-ignore 2339
					  { ...schedule, time: schedule.time.epoch_time * 1000 }
			),
			commandStats: entry.commandStats || {},
			prices: entry.prices || {},
			pollQuestions: entry.pollQuestions || {},
			petRecords: entry.petRecords || {},
			'economyStats.dicingBank': entry.economyStats?.dicingBank || 0,
			'economyStats.duelTaxBank': entry.economyStats?.duelTaxBank || 0,
			'economyStats.dailiesAmount': entry.economyStats?.dailiesAmount || 0,
			'economyStats.itemSellTaxBank': entry.economyStats?.itemSellTaxBank || 0
		});
	}

	await outputJSON(join(rootData, 'clientStorage.new.json'), transformed);
}

async function migrateGuilds() {
	const entries = (await readJSON(join(rootData, 'guilds.json'))) as Guild[];
	const transformed: RawGuildSettings[] = [];

	for (const entry of entries) {
		transformed.push({
			id: entry.id,
			disableNaturalPrefix: entry.disableNaturalPrefix || false,
			disabledCommands: entry.disabledCommands || [],
			language: entry.language || 'en-US',
			prefix: entry.prefix || 's!',
			tags: entry.tags || [],
			totalCommandsUsed: entry.totalCommandsUsed || 0,
			streamers: entry.streamers || [],
			staffOnlyChannels: entry.staffOnlyChannels || [],
			jmodComments: entry.jmodComments || null,
			hcimdeaths: entry.hcimdeaths || null,
			joyReactions: entry.joyReactions || null,
			petchannel: entry.petchannel || null,
			streamertweets: entry.streamertweets || null,
			tweetchannel: entry.tweetchannel || null,
			twitchnotifs: entry.twitchnotifs || null,
			levelUpMessages: entry.levelUpMessages || null
		});
	}

	await outputJSON(join(rootData, 'guilds.new.json'), transformed);
}

async function migrateUsers() {
	const entries = (await readJSON(join(rootData, 'users.json'))) as User[];
	const transformed: RawUserSettings[] = [];

	for (const entry of entries) {
		transformed.push({
			id: entry.id,
			totalCommandsUsed: entry.totalCommandsUsed || 0,
			GP: entry.GP || 0,
			RSN: entry.RSN || null,
			pets: entry.pets || {},
			badges: entry.badges || [],
			lastDailyTimestamp: entry.lastDailyTimestamp || 0,
			bank: entry.bank || {},
			collectionLogBank: entry.collectionLogBank || {},
			monsterScores: entry.monsterScores || {},
			clueScores: entry.clueScores || {},
			//	point_count: Math.max(Math.round(entry.points || 0), 0),
			'minion.name': entry.minion?.name || null,
			'minion.hasBought': entry.minion?.hasBought || false,
			'minion.dailyDuration': entry.minion?.dailyDuration || 0,
			'stats.deaths': entry.stats?.deaths || 0,
			'stats.diceWins': entry.stats?.diceWins || 0,
			'stats.diceLosses': entry.stats?.diceLosses || 0,
			'stats.duelWins': entry.stats?.duelWins || 0,
			'stats.duelLosses': entry.stats?.duelLosses || 0,
			'skills.mining': entry.skills?.mining || 0
		});
	}

	await outputJSON(join(rootData, 'users.new.json'), transformed);
}

async function upload(pgsql: Pool, name: string, databaseName: string) {
	const data = (await readJSON(join(rootData, `${name}.new.json`))) as AnyObject[];
	if (data.length === 0) return;

	const stringifiedData = JSON.stringify(data).replace(/'/g, "''");
	await pgsql.query(`
 		INSERT INTO "${databaseName}"
 		SELECT * FROM json_populate_recordset(NULL::"${databaseName}", '${stringifiedData}')
 		ON CONFLICT DO NOTHING;
 	`);
}

// eslint-disable-next-line @typescript-eslint/unbound-method
main().catch(console.error);
