import { Image } from 'canvas';
import { Bank } from '.';

declare module 'klasa' {
	interface Command {
		altProtection?: boolean;
	}
	interface Task {
		generateBankImage(bank: Bank, title?: string): Promise<Buffer>;
	}
	interface KlasaClient {
		killWorkerThread(quantity: number, bossName: string): Promise<any>;
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
