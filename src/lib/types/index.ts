import { KlasaUser } from 'klasa';
import { SkillsEnum } from '../skilling/types';

export interface Bank {
	[key: number]: number;
}

export interface StringKeyedBank {
	[key: string]: number;
}

export interface ItemBank {
	[key: number]: number;
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
		ironman: boolean;
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

export type PostgresConfig = null | {
	database: string;
	user: string;
	password: string;
	port: number;
};

export type ProviderConfig = null | {
	default: string;
	postgres?: PostgresConfig;
};

export type RedditAppConfig = null | {
	userAgent: string;
	clientId: string;
	clientSecret: string;
	username: string;
	password: string;
};

export type TwitterAppConfig = null | {
	consumer_key: string;
	consumer_secret: string;
	access_token: string;
	access_token_key?: string;
	access_token_secret: string;
};

export type MongoDBConfig = null | {
	dbUrl: string;
	dbName: string;
};

export type PatreonConfig = null | {
	campaignID: number;
	token: string;
};

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

export type ResolvableItem = number | string;
export type ArrayItemsResolvable = (ResolvableItem | ResolvableItem[])[];
export type ArrayItemsResolved = (number | number[])[];

export interface MakePartyOptions {
	maxSize: number;
	minSize: number;
	leader: KlasaUser;
	message: string;
	usersAllowed?: string[];
	party?: boolean;
}

export type Skills = Partial<
	{
		[key in SkillsEnum]: number;
	}
>;
