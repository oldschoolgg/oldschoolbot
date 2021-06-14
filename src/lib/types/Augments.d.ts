import { Image } from 'canvas';
import { FSWatcher } from 'chokidar';
import { MessageEmbed } from 'discord.js';
import { KlasaMessage, KlasaUser, Settings, SettingsUpdateResult } from 'klasa';
import { Bank, Player } from 'oldschooljs';
import PQueue from 'p-queue';
import { CommentStream, SubmissionStream } from 'snoostorm';
import { Connection } from 'typeorm';

import { GetUserBankOptions } from '../../extendables/User/Bank';
import { MinigameKey, MinigameScore } from '../../extendables/User/Minigame';
import { BankImageResult } from '../../tasks/bankImage';
import { Activity as OSBActivity, BitField, PerkTier } from '../constants';
import { GearSetupType, UserFullGearSetup } from '../gear/types';
import { AttackStyles } from '../minions/functions';
import { AddXpParams, KillableMonster } from '../minions/types';
import { CustomGet } from '../settings/types/UserSettings';
import { Creature, SkillsEnum } from '../skilling/types';
import { Gear } from '../structures/Gear';
import { MinigameTable } from '../typeorm/MinigameTable.entity';
import { PoHTable } from '../typeorm/PoHTable.entity';
import { ItemBank, MakePartyOptions, Skills } from '.';

declare module 'klasa' {
	interface KlasaClient {
		orm: Connection;
		oneCommandAtATimeCache: Set<string>;
		secondaryUserBusyCache: Set<string>;
		public cacheItemPrice(itemID: number): Promise<number>;
		public query<T>(query: string, values?: string[]): Promise<T>;
		settings: Settings;
		production: boolean;
		_fileChangeWatcher?: FSWatcher;
		_badgeCache: Map<string, string>;
		_peakIntervalCache: Peak[];
		public wtf(error: Error): void;
		public getActivityOfUser(userID: string): ActivityTable['taskData'] | null;
		commentStream?: CommentStream;
		submissionStream?: SubmissionStream;
		fastifyServer: FastifyInstance;
		minionTicker: NodeJS.Timeout;
		giveawayTicker: NodeJS.Timeout;
		analyticsInterval: NodeJS.Timeout;
		metricsInterval: NodeJS.Timeout;
		minionActivityCache: Map<string, ActivityTable['taskData']>;
	}

	interface Command {
		altProtection?: boolean;
		oneAtTime?: boolean;
		guildOnly?: boolean;
		perkTier?: number;
		ironCantUse?: boolean;
		testingCommand?: boolean;
		bitfieldsRequired?: BitField[];
		restrictedChannels?: string[];
	}

	interface Task {
		generateBankImage(
			bank: ItemBank,
			title?: string,
			showValue?: boolean,
			flags?: { [key: string]: string | number },
			user?: KlasaUser,
			cl?: ItemBank
		): Promise<BankImageResult>;
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
		confirm(this: KlasaMessage, str: string): Promise<void>;
	}

	interface SettingsFolder {
		get<K extends string, S>(key: CustomGet<K, S>): S;
	}
}

declare module 'discord.js' {
	interface Client {
		public query<T>(query: string): Promise<T>;
		public getActivityOfUser(userID: string): ActivityTable['taskData'] | null;
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	interface User {
		addItemsToBank(
			items: ItemBank | Bank,
			collectionLog?: boolean
		): Promise<{ previousCL: ItemBank; itemsAdded: ItemBank }>;
		removeItemsFromBank(
			items: ItemBank | Bank,
			collectionLog?: boolean
		): Promise<SettingsUpdateResult>;
		addItemsToCollectionLog(items: ItemBank): Promise<SettingsUpdateResult>;
		removeItemFromBank(itemID: number, numberToRemove?: number): Promise<SettingsUpdateResult>;
		incrementMonsterScore(
			monsterID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;

		incrementOpenableScore(
			openableID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;

		incrementClueScore(clueID: number, numberToAdd?: number): Promise<SettingsUpdateResult>;
		incrementMinigameScore(this: User, minigame: MinigameKey, amountToAdd = 1): Promise<number>;
		incrementCreatureScore(
			creatureID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;
		hasItem(itemID: number, amount = 1, sync = true): Promise<boolean>;
		numberOfItemInBank(itemID: number, sync = true): Promise<number>;
		log(stringLog: string): void;
		addGP(amount: number): Promise<SettingsUpdateResult>;
		removeGP(amount: number): Promise<SettingsUpdateResult>;
		addQP(amount: number): Promise<SettingsUpdateResult>;
		addXP(params: AddXpParams): Promise<string>;
		skillLevel(skillName: SkillsEnum): number;
		totalLevel(returnXP = false): number;
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
		hasItemEquippedAnywhere(
			_item: number | string | string[] | number[],
			every = false
		): boolean;
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
		getKC(id: number): number;
		/**
		 * Returns how many times they've opened this openable.
		 */
		getOpenableScore(id: number): number;
		/**
		 * Returns a tuple where the first item is formatted KC entry name and second is the KC.
		 * If the search doesn't return anything then returns [null, 0].
		 */
		getKCByName(kcName: string): [string, number] | [null, 0];
		/**
		 * Returns minigame score
		 */
		getMinigameScore(id: MinigameKey): Promise<number>;
		getAllMinigameScores(): Promise<MinigameScore[]>;
		/**
		 * Returns minigame entity
		 */
		getMinigameEntity(): Promise<MinigameTable>;
		/**
		 * Returns Creature score
		 */
		getCreatureScore(creature: Creature): number;
		/**
		 * Gets the CL count for an item.
		 */
		getCL(itemID: number): number;
		rawGear(): UserFullGearSetup;
		equippedPet(): number | null;
		usingPet(name: string): boolean;
		allItemsOwned(): Bank;
		/**
		 * Returns this users update promise queue.
		 */
		getUpdateQueue(): PQueue;
		/**
		 * Queue a function to run on a per-user queue.
		 */
		queueFn(fn: (...args: any[]) => Promise<any>): Promise<void>;
		bank(options?: GetUserBankOptions): Bank;
		getPOH(): Promise<PoHTable>;
		getGear(gearType: GearSetupType): Gear;
		setAttackStyle(newStyles: AttackStyles[]): Promise<void>;
		getAttackStyles(): AttackStyles[];
		owns(bank: ItemBank | Bank | string | number): boolean;
		completion(): {
			percent: number;
			notOwned: number[];
			owned: number[];
		};

		/**
		 * Get item boosts the user has available for the given `KillableMonster`.
		 */
		resolveAvailableItemBoosts(monster: KillableMonster): ItemBank;
		/**
		 * Returns true if the user has full Graceful equipped in any setup.
		 */
		hasGracefulEquipped(): boolean;
		hasSkillReqs(reqs: Skills): [boolean, string | null];
		perkTier: PerkTier;
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
		maxTripLength(activity?: OSBActivity): number;
		rawSkills: Skills;
		bitfield: readonly BitField[];
		combatLevel: number;
	}

	interface TextChannel {
		sendBankImage(options: {
			bank: ItemBank;
			content?: string;
			title?: string;
			background?: number;
			flags?: Record<string, string | number>;
			user?: KlasaUser;
			cl?: ItemBank;
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

	interface NewsChannel {
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
