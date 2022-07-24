import { Bank } from 'oldschooljs';
import { resolve } from 'path';
import Piscina from 'piscina';

export interface CasketWorkerArgs {
	clueTierID: number;
	quantity: number;
}

export interface KillWorkerArgs {
	bossName: string;
	quantity: number;
	limit: number;
	onTask: boolean;
	catacombs: boolean;
}

export interface KillWorkerReturn {
	bank?: Bank;
	error?: string;
	title?: string;
	content?: string;
}

export const piscinaPool = new Piscina();

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> =>
		piscinaPool.runTask(args, resolve(__dirname, 'casket.worker.js')),
	kill: (args: KillWorkerArgs): Promise<KillWorkerReturn> =>
		piscinaPool.runTask(args, resolve(__dirname, 'kill.worker.js'))
};
