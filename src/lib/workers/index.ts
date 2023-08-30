import { resolve } from 'node:path';

import { Bank } from 'oldschooljs';
import Piscina from 'piscina';

import { production } from '../../config';
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
	lootTableTertiaryChanges: [string, number][];
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

const maxThreads = production ? 3 : 1;

export const finishWorker = new Piscina({ filename: resolve(__dirname, 'finish.worker.js'), maxThreads });
export const killWorker = new Piscina({ filename: resolve(__dirname, 'kill.worker.js'), maxThreads });
export const casketWorker = new Piscina({ filename: resolve(__dirname, 'casket.worker.js'), maxThreads });

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> => casketWorker.run(args),
	kill: (args: KillWorkerArgs): Promise<KillWorkerReturn> => killWorker.run(args),
	finish: (args: FinishWorkerArgs): Promise<FinishWorkerReturn> => finishWorker.run(args)
};
