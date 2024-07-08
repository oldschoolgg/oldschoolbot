import { resolve } from 'node:path';

import type { Bank } from 'oldschooljs';
import Piscina from 'piscina';

import { production } from '../../config';
import type { ItemBank } from '../types';

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
	tertiaries?: boolean;
}

export type FinishWorkerReturn = Promise<
	| {
			loot: ItemBank;
			kcBank: ItemBank;
			kc: number;
			cost: ItemBank;
	  }
	| string
>;

const maxThreads = production ? 3 : 1;

const dirName = __dirname.replace('src/lib', 'dist/lib');

const finishWorkerPath = resolve(dirName, 'lib', 'workers', 'finish.worker.js');
const killWorkerPath = resolve(dirName, 'lib', 'workers', 'kill.worker.js');
const casketWorkerPath = resolve(dirName, 'lib', 'workers', 'casket.worker.js');

const finishWorker = new Piscina({
	filename: finishWorkerPath,
	maxThreads,
	workerData: { fullpath: finishWorkerPath }
});
const killWorker = new Piscina({
	filename: killWorkerPath,
	maxThreads,
	workerData: { fullpath: killWorkerPath }
});
const casketWorker = new Piscina({
	filename: casketWorkerPath,
	maxThreads,
	workerData: { fullpath: casketWorkerPath }
});

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> => casketWorker.run(args),
	kill: (args: KillWorkerArgs): KillWorkerReturn => killWorker.run(args),
	finish: (args: FinishWorkerArgs): FinishWorkerReturn => finishWorker.run(args)
};
