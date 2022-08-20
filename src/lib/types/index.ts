import { KlasaUser } from 'klasa';

import { SkillsEnum } from '../skilling/types';

export interface ItemBank {
	[key: string]: number;
}

export interface CachedItemPrice {
	price: number;
	fetchedAt: number;
}

export interface ItemPriceCache {
	[key: string]: CachedItemPrice;
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

export type PatreonConfig = null | {
	campaignID: number;
	token: string;
};

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
	usersAllowed?: string[];
	party?: boolean;
	customDenier?(user: KlasaUser): Promise<[false] | [true, string]>;
}

export type Skills = Partial<{
	[key in SkillsEnum]: number;
}>;

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
	Emojis: Record<string, string>;
	SupportServer: string;
	BotID: string;
}
