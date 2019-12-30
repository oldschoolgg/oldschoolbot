import { Image } from 'canvas';

declare module 'klasa' {
	interface Command {
		altProtection?: boolean;
	}
	interface Task {
		generateBankImage?(any): Promise<Buffer>;
	}
}
