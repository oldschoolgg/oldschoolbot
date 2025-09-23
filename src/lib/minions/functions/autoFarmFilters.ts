import { Bank } from 'oldschooljs';

import type { MUserClass } from '@/lib/MUser.js';
import type { IPatchDataDetailed } from '@/lib/minions/farming/types.js';
import { calcNumOfPatches } from '@/lib/skilling/functions/calcsFarming';
import type { Plant } from '@/lib/skilling/types.js';

export function replant(
	p: Plant,
	farmingLevel: number,
	user: MUserClass,
	userBank: Bank,
	patchesDetailed: IPatchDataDetailed[]
) {
	if (p.level > farmingLevel) return false;
	const [numOfPatches] = calcNumOfPatches(p, user, user.QP);
	if (numOfPatches === 0) return false;
	const reqItems = new Bank(p.inputItems).multiply(numOfPatches);
	if (!userBank.has(reqItems)) return false;
	const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
	if (patchData.ready === true && p.name === patchData.plant?.name) return true;
	return false;
}

export function allFarm(p: Plant, farmingLevel: number, user: MUserClass, userBank: Bank) {
	if (p.level > farmingLevel) return false;
	const [numOfPatches] = calcNumOfPatches(p, user, user.QP);
	if (numOfPatches === 0) return false;
	const reqItems = p.inputItems.clone().multiply(numOfPatches);
	if (!userBank.has(reqItems)) return false;
	return true;
}
