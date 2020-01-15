import { Image } from 'canvas';
import { Bank } from '.';
import { Settings } from 'klasa';

declare module 'klasa' {
	interface KlasaClient {
		public oneCommandAtATimeCache: Set<string>;
		public fetchItemPrice(itemID: number | string): Promise<number>;
		public settings: Settings;
	}
	interface Command {
		altProtection?: boolean;
		oneAtTime?: boolean;
	}
	interface Task {
		generateBankImage(
			bank: Bank,
			title?: string,
			showValue?: boolean,
			flags?: { [key: string]: string | number }
		): Promise<Buffer>;
	}
	interface Command {
		kill(message: KlasaMessage, [quantity, monster]: [number, string]): Promise<any>;
	}
	interface KlasaMessage {
		cmdPrefix: string;
	}
}

declare module 'discord.js' {
	interface User {
		addItemsToBank(items: Bank, collectionLog?: boolean): Promise<SettingsUpdateResult>;
		addArrayOfItemsToCollectionLog(items: number[]): Promise<SettingsUpdateResult>;
		removeItemFromBank(itemID: number, numberToRemove?: number): Promise<SettingsUpdateResult>;
		incrementMonsterScore(
			monsterID: number,
			numberToAdd?: number
		): Promise<SettingsUpdateResult>;
		incrementClueScore(clueID: number, numberToAdd?: number): Promise<SettingsUpdateResult>;
		hasItem(monsterID: number, amount: number): Promise<boolean>;
		log(stringLog: string): void;
		addGP(amount: number): Promise<SettingsUpdateResult>;
		removeGP(amount: number): Promise<SettingsUpdateResult>;
		sanitizedName: string;
	}
}
