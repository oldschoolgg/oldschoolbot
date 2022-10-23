import { Bank } from 'oldschooljs';
import { resolve } from 'path';
import Piscina from 'piscina';

import { ItemBank } from '../types';

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

export interface FinishWorkerArgs {
	name: string;
}

export type FinishWorkerReturn =
	| {
			loot: ItemBank;
			kcBank: ItemBank;
			kc: number;
	  }
	| string;

export const finishWorker = new Piscina({ filename: resolve(__dirname, 'finish.worker.js') });
export const killWorker = new Piscina({ filename: resolve(__dirname, 'kill.worker.js') });
export const casketWorker = new Piscina({ filename: resolve(__dirname, 'casket.worker.js') });

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> => casketWorker.run(args),
	kill: (args: KillWorkerArgs): Promise<KillWorkerReturn> => killWorker.run(args),
	finish: (args: FinishWorkerArgs): Promise<FinishWorkerReturn> => finishWorker.run(args)
};
