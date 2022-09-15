import { Bank } from 'oldschooljs';

import { ClueTiers } from './clueTiers';

export function getClueScoresFromOpenables(openableScores: Bank, mutate = false) {
	return openableScores.filter(item => Boolean(ClueTiers.find(ct => ct.id === item.id)), mutate);
}
