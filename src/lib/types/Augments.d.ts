import { Image } from 'canvas';
import { FSWatcher } from 'chokidar';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, KlasaUser, Settings, SettingsUpdateResult } from 'klasa';
import { Db } from 'mongodb';
import { Bank, Player } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import Monster from 'oldschooljs/dist/structures/Monster';
import { Limit } from 'p-limit';
import PQueue from 'p-queue';
import PgBoss from 'pg-boss';
import { CommentStream, SubmissionStream } from 'snoostorm';
import { Connection } from 'typeorm';

import { BitField } from '../constants';
import { GearSetupTypes, GearStats, UserFullGearSetup } from '../gear/types';
import { MinigameIDsEnum } from '../minions/data/minigames';
import { KillableMonster } from '../minions/types';
import { CustomGet } from '../settings/types/UserSettings';
import { SkillsEnum } from '../skilling/types';
import { ItemBank, MakePartyOptions, Skills } from '.';

declare module 'klasa' {
	interface KlasaClient {
		public boss: PgBoss;
		public orm: Connection;
		public oneCommandAtATimeCache: Set<string>;
		public secondaryUserBusyCache: Set<string>;
		public queuePromise: Limit;
		public fetchItemPrice(itemID: number | string): Promise<number>;
		public query<T>(query: string): Promise<T>;
		public settings: Settings;
		public production: boolean;
		public _fileChangeWatcher?: FSWatcher;
		public _badgeCache: Map<string, string>;
		public wtf(error: Error): void;
		osggDB?: Db;
		commentStream?: CommentStream;
		submissionStream?: SubmissionStream;
	}

	interface Command {
		altProtection?: boolean;
		oneAtTime?: boolean;
		guildOnly?: boolean;
		perkTier?: number;
		ironCantUse?: boolean;
		testingCommand?: boolean;
		bitfieldsRequired?: BitField[];
	}

	interface Task {
		generateBankImage(
			bank: ItemBank,
			title?: string,
			showValue?: boolean,
			flags?: { [key: string]: string | number },
			user?: KlasaUser
		): Promise<Buffer>;
		generateCollectionLogImage(
			collectionLog: ItemBank,
			title: string = '',
			type: any
		): Promise<Buffer>;
		getItemImage(itemID: number, quantity: number): Promise<Image>;
	}
	interface Command {
		kill(message: KlasaMessage, [quantity, monster]: [number | string, string]): Promise<any>;
		getStatsEmbed(
			username: string,
			color: number,
			player: Player,
			key = 'level',
			showExtra = true
		): MessageEmbed;
	}
	interface KlasaMessage {
		cmdPrefix: string;

		makePartyAwaiter(options: MakePartyOptions): Promise<KlasaUser[]>;
		removeAllReactions(): void;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
	}
}

declare module 'discord.js' {
	interface Client {
		public fetchItemPrice(itemID: number | string): Promise<number>;
		public query<T>(query: string): Promise<T>;
	}
	interface User {
		addItemsToBank(items: ItemBank, collectionLog?: boolean): Promise<SettingsUpdateResult>;
		addItemsToCollectionLog(items: ItemBank): Promise<SettingsUpdateResult>;
		removeItemFromBank(itemID: number, numberToRemove?: number): Promise<SettingsUpdateResult>;
		incrementMonsterScore(
			monsterID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;

		incrementClueScore(clueID: number, numberToAdd?: number): Promise<SettingsUpdateResult>;
		incrementMinigameScore(
			minigameID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;
		hasItem(itemID: number, amount = 1, sync = true): Promise<boolean>;
		numberOfItemInBank(itemID: number, sync = true): Promise<number>;
		log(stringLog: string): void;
		addGP(amount: number): Promise<SettingsUpdateResult>;
		removeGP(amount: number): Promise<SettingsUpdateResult>;
		addQP(amount: number): Promise<SettingsUpdateResult>;
		addXP(skillName: SkillsEnum, amount: number): Promise<SettingsUpdateResult>;
		skillLevel(skillName: SkillsEnum): number;
		totalLevel(returnXP = false): number;
		incrementMinionDailyDuration(duration: number): Promise<SettingsUpdateResult>;
		toggleBusy(busy: boolean): void;
		/**
		 * Returns how many of an item a user owns, checking their bank and all equipped gear.
		 * @param itemID The item ID.
		 */
		numOfItemsOwned(itemID: number): number;
		/**
		 * Returns true if the user has this item equipped in any of their setups.
		 * @param itemID The item ID.
		 */
		hasItemEquippedAnywhere(itemID: number): boolean;
		/**
		 * Checks whether they have the given item in their bank OR equipped.
		 * @param item
		 */
		hasItemEquippedOrInBank(item: number | string): boolean;
		/**
		 * Returns how many of the item the user has in their bank.
		 * @param itemID The item ID.
		 * @param mapping If similar items must be checked
		 */
		numItemsInBankSync(itemID: number, mapping = false): number;
		/**
		 * Returns a tuple where the first item is true/false if they have the requirements,
		 * the second item is a string containing the reason they don't have the requirements.
		 */
		hasMonsterRequirements(monster: KillableMonster): [false, string] | [true];
		/**
		 * Returns the KC the user has for this monster.
		 */
		getKC(monster: Monster): number;
		/**
		 * Returns minigame score
		 */
		getMinigameScore(id: MinigameIDsEnum): number;
		/**
		 * Gets the CL count for an item.
		 */
		getCL(itemID: number): number;
		/**
		 *
		 */
		equippedWeapon(setupType: GearSetupTypes): Item | null;
		rawGear(): UserFullGearSetup;
		allItemsOwned(): ItemBank;
		setupStats(setup: GearSetupTypes): GearStats;
		/**
		 * Returns this users update promise queue.
		 */
		getUpdateQueue(): PQueue;
		/**
		 * Queue a function to run on a per-user queue.
		 */
		queueFn(fn: (...args: any[]) => Promise<any>): Promise<void>;
		bank(): Bank;
		/**
		 * Returns this users Collection Log bank.
		 */
		collectionLog: ItemBank;
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
		maxTripLength: number;
		rawSkills: Skills;
	}

	interface TextChannel {
		sendBankImage(options: {
			bank: ItemBank;
			content?: string;
			title?: string;
			background?: number;
			flags?: Record<string, string | number>;
			user?: KlasaUser;
		}): Promise<KlasaMessage>;
		__triviaQuestionsDone: any;
	}

	interface DMChannel {
		sendBankImage(options: {
			bank: ItemBank;
			content?: string;
			title?: string;
			background?: number;
			flags?: Record<string, string | number>;
			user?: KlasaUser;
		}): Promise<KlasaMessage>;
		__triviaQuestionsDone: any;
	}
}
