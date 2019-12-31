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
}
