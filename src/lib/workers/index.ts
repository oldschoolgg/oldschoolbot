import { resolve } from 'path';
import Piscina from 'piscina';

import { ItemBank } from '../types';

export interface CasketWorkerArgs {
	clueTierID: number;
	quantity: number;
}

export const piscinaPool = new Piscina();

export const Workers = {
	casketOpen: (args: CasketWorkerArgs): Promise<[ItemBank, string]> =>
		piscinaPool.runTask(args, resolve(__dirname, 'casket.worker.js'))
};
