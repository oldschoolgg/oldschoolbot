import { KlasaUser } from 'klasa';

import { SkillsEnum } from '../skilling/types';

export interface ItemBank {
	[key: string]: number;
}

export interface SettingsEntry {
	id: string;
	RSN?: string;
	GP?: number;
	badges?: string[];
	bank?: ItemBank;
	clueScores?: ItemBank;
	monsterScores?: ItemBank;
	collectionLog?: number[];
	collectionLogBank?: ItemBank;
	pets?: number[];
	lastDailyTimestamp?: number;
	bitfield?: number[];
	minion?: {
		name?: string;
		hasBought: boolean;
		ironman: boolean;
	};
}

export interface CachedItemPrice {
	price: number;
	fetchedAt: number;
}

export interface ItemPriceCache {
	[key: string]: CachedItemPrice;
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
	ironmanAllowed: boolean;
	customDenier?(user: KlasaUser): [boolean, string] | [boolean];
}

export type Skills = Partial<
	{
		[key in SkillsEnum]: number;
	}
>;

export type CategoryFlag =
	| 'minion'
	| 'settings'
	| 'patron'
	| 'skilling'
	| 'pvm'
	| 'minigame'
	| 'utility'
	| 'fun'
	| 'simulation';

export interface IDiscordSettings {
	Roles: Record<string, string>;
	Channels: Record<string, string>;
	SupportServer: string;
}
