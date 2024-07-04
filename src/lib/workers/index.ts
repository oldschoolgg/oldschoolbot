import { resolve } from 'node:path';

import type { Bank } from 'oldschooljs';
import Piscina from 'piscina';

import { production } from '../../config';
import type { ItemBank } from '../types';

interface CasketWorkerArgs {
	clueTierID: number;
	quantity: number;
}

interface KillWorkerArgs {
	bossName: string;
	quantity: number;
	limit: number;
	onTask: boolean;
	catacombs: boolean;
	lootTableTertiaryChanges: [string, number][];
}

type KillWorkerReturn = Promise<{
	bank?: Bank;
	error?: string;
	title?: string;
	content?: string;
}>;

interface FinishWorkerArgs {
	name: string;
	tertiaries?: boolean;
}

type FinishWorkerReturn = Promise<
	| {
			loot: ItemBank;
			kcBank: ItemBank;
			kc: number;
			cost: ItemBank;
	  }
	| string
>;

const maxThreads = production ? 3 : 1;

const finishWorker = new Piscina({
	filename: resolve(__dirname.replace('src', 'dist'), 'finish.worker.js'),
	maxThreads
});
const killWorker = new Piscina({
	filename: resolve(__dirname.replace('src', 'dist'), 'kill.worker.js'),
	maxThreads
});
const casketWorker = new Piscina({
	filename: resolve(__dirname.replace('src', 'dist'), 'casket.worker.js'),
	maxThreads
});

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[Bank, string]> => casketWorker.run(args),
	kill: (args: KillWorkerArgs): KillWorkerReturn => killWorker.run(args),
	finish: (args: FinishWorkerArgs): FinishWorkerReturn => finishWorker.run(args)
};
