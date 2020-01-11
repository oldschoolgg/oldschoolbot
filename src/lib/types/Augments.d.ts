import { Image } from 'canvas';
import { Bank } from '.';

declare module 'klasa' {
	interface KlasaClient {
		public oneCommandAtATimeCache: Set<string>;
	}
	interface Command {
		altProtection?: boolean;
		oneAtTime?: boolean;
	}
	interface Task {
		generateBankImage(bank: Bank, title?: string): Promise<Buffer>;
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
	}
}
