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
}

export const piscinaPool = new Piscina();

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> =>
		piscinaPool.runTask(args, resolve(__dirname, 'casket.worker.js')),
	kill: (args: KillWorkerArgs): Promise<Bank | string> =>
		piscinaPool.runTask(args, resolve(__dirname, 'kill.worker.js'))
};
