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
	leader: MUser;
	message: string;
	ironmanAllowed: boolean;
	usersAllowed?: string[];
	customDenier?(user: MUser): Promise<[false] | [true, string]>;
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
