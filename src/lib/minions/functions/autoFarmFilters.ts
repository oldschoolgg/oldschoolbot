import { Bank } from 'oldschooljs';

import { MUserClass } from '../../MUser';
import { calcNumOfPatches } from '../../skilling/functions/calcsFarming';
import { Plant } from '../../skilling/types';
import { IPatchDataDetailed } from '../farming/types';

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
	const reqItems = new Bank(p.inputItems);
	if (!userBank.has(reqItems.bank)) return false;
	const patchData = patchesDetailed.find(_p => _p.patchName === p.seedType)!;
	if (patchData.ready === true && p.name === patchData.plant?.name) return true;
	return false;
}

export function allFarm(p: Plant, farmingLevel: number, user: MUserClass, userBank: Bank) {
	if (p.level > farmingLevel) return false;
	const [numOfPatches] = calcNumOfPatches(p, user, user.QP);
	if (numOfPatches === 0) return false;
	const reqItems = new Bank(p.inputItems).multiply(numOfPatches);
	if (!userBank.has(reqItems.bank)) return false;
	return true;
}
