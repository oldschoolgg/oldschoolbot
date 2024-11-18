import path, { resolve } from 'node:path';

import Piscina from 'piscina';

import type { ItemBank } from '../types';
import type { MonsterSlayerMaster } from '../util';

export interface CasketWorkerArgs {
	clueTierID: number;
	quantity: number;
}

export interface KillWorkerArgs {
	bossName: string;
	quantity: number;
	limit: number;
	onTask: boolean;
	catacombs?: boolean;
	slayerMaster?: MonsterSlayerMaster;
	lootTableTertiaryChanges: [string, number][];
}

export type KillWorkerReturn = Promise<{
	bank?: ItemBank;
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

const maxThreads = 1;

let dirName = __dirname.replace(path.join('src', 'lib'), path.join('dist', 'lib'));
if (dirName.endsWith('dist')) {
	dirName = resolve(dirName, 'lib', 'workers');
}

const finishWorkerPath = resolve(dirName, 'finish.worker.js');
const killWorkerPath = resolve(dirName, 'kill.worker.js');
const casketWorkerPath = resolve(dirName, 'casket.worker.js');

const finishWorker = new Piscina({
	filename: finishWorkerPath,
	maxThreads
});
const killWorker = new Piscina({
	filename: killWorkerPath,
	maxThreads
});
const casketWorker = new Piscina({
	filename: casketWorkerPath,
	maxThreads
});

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[ItemBank, string]> => casketWorker.run(args),
	kill: (args: KillWorkerArgs): KillWorkerReturn => killWorker.run(args),
	finish: (args: FinishWorkerArgs): FinishWorkerReturn => finishWorker.run(args)
};
