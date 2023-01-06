import { resolve } from 'node:path';
import { Bank } from 'oldschooljs';
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

export type KillWorkerReturn = Promise<{
	bank?: Bank;
	error?: string;
	title?: string;
	content?: string;
}>;

export interface FinishWorkerArgs {
	name: string;
}

export type FinishWorkerReturn = Promise<
	| {
			loot: ItemBank;
			kcBank: ItemBank;
			kc: number;
	  }
	| string
>;

export const finishWorker = new Piscina({ filename: resolve(__dirname, 'finish.worker.js') });
export const killWorker = new Piscina({ filename: resolve(__dirname, 'kill.worker.js') });
export const casketWorker = new Piscina({ filename: resolve(__dirname, 'casket.worker.js') });

const a: any = {};

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> => a.run(args),
	kill: (args: KillWorkerArgs): Promise<KillWorkerReturn> => a.run(args),
	finish: (args: FinishWorkerArgs): Promise<FinishWorkerReturn> => finishWorker.run(args)
};
