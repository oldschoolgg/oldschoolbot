import { FSWatcher } from 'chokidar';
import { MessageOptions, MessagePayload } from 'discord.js';
import { KlasaMessage, KlasaUser, Settings, SettingsUpdateResult } from 'klasa';
import { Bank } from 'oldschooljs';
import { Image } from 'skia-canvas/lib';

import { GetUserBankOptions } from '../../extendables/User/Bank';
import { BitField, PerkTier } from '../constants';
import { GearSetupType, UserFullGearSetup } from '../gear/types';
import { AttackStyles } from '../minions/functions';
import { AddXpParams, KillableMonster } from '../minions/types';
import { MinigameName } from '../settings/minigames';
import { CustomGet } from '../settings/types/UserSettings';
import { Creature, SkillsEnum } from '../skilling/types';
import { Gear } from '../structures/Gear';
import { ItemBank, Skills } from '.';

declare module 'klasa' {
	interface KlasaClient {
		oneCommandAtATimeCache: Set<string>;
		secondaryUserBusyCache: Set<string>;
		settings: Settings;
		production: boolean;
		_fileChangeWatcher?: FSWatcher;
		_badgeCache: Map<string, string>;
		_peakIntervalCache: Peak[];
		fastifyServer: FastifyInstance;
		minionTicker: NodeJS.Timeout;
		dailyReminderTicker: NodeJS.Timeout;
		giveawayTicker: NodeJS.Timeout;
		analyticsInterval: NodeJS.Timeout;
		metricsInterval: NodeJS.Timeout;
		options: KlasaClientOptions;
		fetchUser(id: string | bigint): Promise<KlasaUser>;
	}

	interface Command {
		altProtection?: boolean;
		guildOnly?: boolean;
		perkTier?: number;
		ironCantUse?: boolean;
		testingCommand?: boolean;
		bitfieldsRequired?: BitField[];
	}

	interface Task {
		getItemImage(itemID: number, quantity: number): Promise<Image>;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
	}
}

declare module 'discord.js/node_modules/discord-api-types/v8' {
	type Snowflake = string;
}
export type KlasaSend = (input: string | MessagePayload | MessageOptions) => Promise<KlasaMessage>;

declare module 'discord.js' {
	interface TextBasedChannel {
		send: KlasaSend;
	}
	interface TextChannel {
		send: KlasaSend;
	}
	interface DMChannel {
		send: KlasaSend;
	}
	interface ThreadChannel {
		send: KlasaSend;
	}
	interface NewsChannel {
		send: KlasaSend;
	}
	interface PartialTextBasedChannelFields {
		send: KlasaSend;
		readonly attachable: boolean;
		readonly embedable: boolean;
		readonly postable: boolean;
		readonly readable: boolean;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface User {
		addItemsToBank(options: {
			items: ItemBank | Bank;
			collectionLog?: boolean;
			filterLoot?: boolean;
			dontAddToTempCL?: boolean;
		}): ReturnType<typeof transactItems>;
		removeItemsFromBank(items: ItemBank | Bank, collectionLog?: boolean): ReturnType<typeof transactItems>;
		addItemsToCollectionLog(options: { items: Bank; dontAddToTempCL?: boolean }): Promise<SettingsUpdateResult>;
		incrementCreatureScore(creatureID: number, numberToAdd?: number): Promise<SettingsUpdateResult>;
		log(stringLog: string): void;
		addXP(params: AddXpParams): Promise<string>;
		skillLevel(skillName: SkillsEnum): number;
		totalLevel(returnXP = false): number;
		toggleBusy(busy: boolean): void;
		/**
		 * Returns true if the user has this item equipped in any of their setups.
		 * @param itemID The item ID.
		 */
		hasItemEquippedAnywhere(_item: number | string | string[] | number[], every = false): boolean;
		/**
		 * Checks whether they have the given item in their bank OR equipped.
		 * @param item
		 */
		hasItemEquippedOrInBank(item: number | string): boolean;
		/**
		 * Returns a tuple where the first item is true/false if they have the requirements,
		 * the second item is a string containing the reason they don't have the requirements.
		 */
		hasMonsterRequirements(monster: KillableMonster): [false, string] | [true];
		/**
		 * Returns a tuple where the first item is formatted KC entry name and second is the KC.
		 * If the search doesn't return anything then returns [null, 0].
		 */
		getKCByName(kcName: string): [string, number] | [null, 0];
		/**
		 * Returns minigame score
		 */
		getMinigameScore(id: MinigameName): Promise<number>;
		rawGear(): UserFullGearSetup;
		cl(): Bank;
		bank(options?: GetUserBankOptions): Bank;
		getUserFavAlchs(duration: number): Item[];
		getGear(gearType: GearSetupType): Gear;
		setAttackStyle(newStyles: AttackStyles[]): Promise<void>;
		/**
		 * Get item boosts the user has available for the given `KillableMonster`.
		 */
		resolveAvailableItemBoosts(monster: KillableMonster): ItemBank;
		perkTier: PerkTier;
		sanitizedName: string;
		badges: string;
		/**
		 * If they are currently locked into a economy command, or
		 * locked from being targeted in an economy command by another (duel, sellto, etc)
		 */
		isBusy: boolean;
		minionIsBusy: boolean;
		minionStatus: string;
		minionName: string;
		hasMinion: boolean;
		isIronman: boolean;
		bitfield: readonly BitField[];
	}
}
