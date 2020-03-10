import Monster from 'oldschooljs/dist/structures/Monster';
import { BeginnerCasket } from 'oldschooljs/dist/simulation/clues/Beginner';
import { MediumCasket } from 'oldschooljs/dist/simulation/clues/Medium';
import { EasyCasket } from 'oldschooljs/dist/simulation/clues/Easy';
import { HardCasket } from 'oldschooljs/dist/simulation/clues/Hard';
import { EliteCasket } from 'oldschooljs/dist/simulation/clues/Elite';
import { MasterCasket } from 'oldschooljs/dist/simulation/clues/Master';

export interface Bank {
	[key: number]: number;
}

export interface StringKeyedBank {
	[key: string]: number;
}

export interface SettingsEntry {
	id: string;
	RSN?: string;
	GP?: number;
	autoupdate?: boolean;
	badges?: string[];
	bank?: Bank;
	clueScores?: Bank;
	monsterScores?: Bank;
	collectionLog?: number[];
	collectionLogBank?: Bank;
	pets?: number[];
	lastDailyTimestamp?: number;
	bitfield?: number[];
	totalCommandsUsed?: number;
	minion?: {
		name?: string;
		hasBought: boolean;
	};
}

export interface Pet {
	id: number;
	emoji: string;
	chance: number;
	name: string;
	type: string;
	altNames: string[];
	bossKeys?: string[];
	finish?(): number;
	formatFinish(num: number): string;
}

export interface KillWorkerOptions {
	bossName: string;
	quantity: number;
	limit: number;
}

export interface KillableMonster extends Monster {
	table: Monster;
	timeToFinish: number;
	emoji: string;
	wildy: boolean;
	canBeKilled: boolean;
}

export const enum SkillsEnum {
	Mining = 'mining',
	Smithing = 'smithing'
}

export interface CachedItemPrice {
	price: number;
	fetchedAt: number;
}

export interface ItemPriceCache {
	[key: string]: CachedItemPrice;
}

export interface OSRSPoll {
	title: string;
	description: string;
	questions: PollQuestion[];
}

export interface PollQuestion {
	question: string;
	votes: PollVotes;
}

export interface PollVotes {
	Yes: string;
	No: string;
	'Skip question': string;
}

export interface PetRecords {
	highest: Bank;
	lowest: Bank;
}

export interface JMod {
	redditUsername: string;
	formattedName: string;
}

export type AnyObject = Record<PropertyKey, unknown> | {};

export interface PrivateConfig {
	token: string;
	postgresConfig: {
		database: string;
		user: string;
		password: string;
		port: number;
	};

	twitchClientID: string;
	redditApp: {
		userAgent: string;
		clientId: string;
		clientSecret: string;
		username: string;
		password: string;
	};
	twitterApp: {
		consumer_key: string;
		consumer_secret: string;
		access_token_key: string;
		access_token_secret: string;
	};
	mongoDB: {
		dbUrl: string;
		dbName: string;
	};
	patreon: {
		campaignID: number;
		token: string;
	};
}

export interface ClueTier {
	name: string;
	table: BeginnerCasket | EasyCasket | MediumCasket | HardCasket | EliteCasket | MasterCasket;
	id: number;
	scrollID: number;
	timeToFinish: number;
}

export type ItemTuple = [number, number, number];

export interface Patron {
	patreonID: string;
	discordID?: string;
	entitledTiers: string[];
	lastChargeDate: string;
	lastChargeStatus: string;
	lifeTimeSupportCents: number;
	patronStatus: string;
	pledgeRelationshipStart: string;
}

export interface Ore {
	level: number;
	xp: number;
	id: number;
	name: string;
	respawnTime: number;
	petChance?: number;
	nuggets?: boolean;
	minerals?: number;
}

export interface Bar {
	level: number;
	xp: number;
	id: number;
	name: string;
	inputOres: Bank;
	/**
	 * Chance that the ore will fail to smelt (i.e iron), out of 100
	 */
	chanceOfFail: number;
}
