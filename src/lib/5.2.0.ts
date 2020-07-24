/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { Pool } from 'pg';
import { mergeDefault } from '@klasa/utils';
import { join } from 'path';
import { outputJSON, readJSON } from 'fs-nextra';

export type AnyObject = Record<PropertyKey, unknown> | {};

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
	tags?: readonly [string, string][];
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

export const ClientSettingsSchema = /* sql */ `
	CREATE TABLE IF NOT EXISTS "clientStorage" (
		"id"                           VARCHAR(19)                              NOT NULL,
		"commandStats"                 JSON          DEFAULT '{}'::JSON         NOT NULL,
		"totalCommandsUsed"            INTEGER       DEFAULT 0                  NOT NULL,
		"prices"                       JSON          DEFAULT '{}'::JSON         NOT NULL,
		"pollQuestions"                JSON          DEFAULT '{}'::JSON         NOT NULL,
		"petRecords"                   JSON          DEFAULT '{}'::JSON         NOT NULL,
		"economyStats.dicingBank"      INTEGER       DEFAULT 0                  NOT NULL,
		"economyStats.duelTaxBank"     INTEGER       DEFAULT 0                  NOT NULL,
		"economyStats.dailiesAmount"   INTEGER       DEFAULT 0                  NOT NULL,
		"economyStats.itemSellTaxBank" INTEGER       DEFAULT 0                  NOT NULL,
		"userBlacklist"                VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"guildBlacklist"               VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"schedules"                    JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		PRIMARY KEY("id")
	);
`;

export interface RawUserSettings {
	id: string;
	totalCommandsUsed: number;
	GP: string;
	RSN: string | null;
	pets: object;
	badges: readonly number[];
	lastDailyTimestamp: string;
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
		"id"                   VARCHAR(19)                              NOT NULL,
		"totalCommandsUsed"    INTEGER      DEFAULT 0                   NOT NULL,
		"GP"                   BIGINT       DEFAULT 0                   NOT NULL,
		"RSN"                  VARCHAR(15),
		"pets"                 JSON         DEFAULT '{}'::JSON          NOT NULL,
		"badges"               SMALLINT[]   DEFAULT ARRAY[]::SMALLINT[] NOT NULL,
		"bitfield"             SMALLINT[]   DEFAULT ARRAY[]::SMALLINT[] NOT NULL,
		"lastDailyTimestamp"   BIGINT       DEFAULT 0                   NOT NULL,
		"bank"                 JSON         DEFAULT '{}'::JSON          NOT NULL,
		"collectionLogBank"    JSON         DEFAULT '{}'::JSON          NOT NULL,
		"monsterScores"        JSON         DEFAULT '{}'::JSON          NOT NULL,
		"clueScores"           JSON         DEFAULT '{}'::JSON          NOT NULL,
		"minion.name"          VARCHAR(100),
		"minion.hasBought"     BOOLEAN      DEFAULT FALSE               NOT NULL,
		"minion.dailyDuration" INTEGER      DEFAULT 0                   NOT NULL,
		"stats.deaths"         INTEGER      DEFAULT 0                   NOT NULL,
		"stats.diceWins"       INTEGER      DEFAULT 0                   NOT NULL,
		"stats.diceLosses"     INTEGER      DEFAULT 0                   NOT NULL,
		"stats.duelWins"       INTEGER      DEFAULT 0                   NOT NULL,
		"stats.duelLosses"     INTEGER      DEFAULT 0                   NOT NULL,
		"skills.mining"        INTEGER      DEFAULT 0                   NOT NULL,
		PRIMARY KEY("id")
	);
`;

export interface RawGuildSettings {
	id: string;
	prefix: string;
	language: string;
	disableNaturalPrefix: boolean;
	disabledCommands: readonly string[];
	tags: readonly [string, string][];
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

export const GuildSettingsSchema = /* sql */ `
	CREATE TABLE IF NOT EXISTS guilds (
		"id"                   VARCHAR(19)                              NOT NULL,
		"prefix"               VARCHAR(10)   DEFAULT '+'                NOT NULL,
		"language"             VARCHAR(5)    DEFAULT 'en-US'            NOT NULL,
		"disableNaturalPrefix" BOOLEAN       DEFAULT FALSE              NOT NULL,
		"disabledCommands"     VARCHAR(30)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"tags"                 JSON[]        DEFAULT ARRAY[]::JSON[]    NOT NULL,
		"totalCommandsUsed"    INTEGER       DEFAULT 0                  NOT NULL,
		"streamers"            VARCHAR(50)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"staffOnlyChannels"    VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR[] NOT NULL,
		"jmodComments"         VARCHAR(19),
		"hcimdeaths"           VARCHAR(19),
		"joyReactions"         VARCHAR(19),
		"petchannel"           VARCHAR(19),
		"streamertweets"       VARCHAR(19),
		"tweetchannel"         VARCHAR(19),
		"twitchnotifs"         VARCHAR(19),
		"levelUpMessages"      VARCHAR(19),
		PRIMARY KEY("id"),
		CHECK("prefix" <> ''),
		CHECK(ARRAY_LENGTH("streamers", 1) <= 200)
	);
`;

const options = {
	database: 'klasa',

	// if your reading this, these passwords are fake dont worry
	// password: 'kl23gkl2nduio21jbj32',
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
	await ensureTables(pgsql);
	await uploadAll(pgsql);
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

async function ensureTables(pgsql: Pool) {
	await pgsql.query(`
		BEGIN;
		${ClientSettingsSchema}
		${GuildSettingsSchema}
		${UserSettingsSchema}
		COMMIT;
 	`);
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

const rootData = join(__dirname, '..', '..', '..', 'database', 'data');

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
			'economyStats.dicingBank': Math.floor(entry.economyStats?.dicingBank || 0),
			'economyStats.duelTaxBank': Math.floor(entry.economyStats?.duelTaxBank || 0),
			'economyStats.dailiesAmount': Math.floor(entry.economyStats?.dailiesAmount || 0),
			'economyStats.itemSellTaxBank': Math.floor(entry.economyStats?.itemSellTaxBank || 0)
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

interface TransformedUserSettings extends Omit<RawUserSettings, 'GP' | 'lastDailyTimestamp'> {
	GP: number;
	lastDailyTimestamp: number;
}

async function migrateUsers() {
	const entries = (await readJSON(join(rootData, 'users.json'))) as User[];
	const transformed: TransformedUserSettings[] = [];

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
