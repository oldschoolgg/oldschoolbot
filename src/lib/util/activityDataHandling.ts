import { Activity } from '@prisma/client';

import { ActivityTaskOptions } from '../types/minions';

export type StoredActivityData = Omit<
	ActivityTaskOptions,
	'finishDate' | 'id' | 'type' | 'channelID' | 'userID' | 'duration'
> | null;
// {"plantsName":"Watermelon","patchType":{"lastPlanted":"Watermelon","patchPlanted":true,"plantTime":1637420596135,"lastQuantity":15,"lastUpgradeType":"ultracompost","lastPayment":true},"getPatchType":"farmingPatches.allotment","quantity":15,"upgradeType":"ultracompost","payment":true,"planting":true,"currentDate":1637426089757,"autoFarmed":true}
enum CompressionMap {
	'monsterID' = 'mi',
	'quantity' = 'qty',
	'burstOrBarrage' = 'bob',
	'cannonMulti' = 'cmu',
	'usingCannon' = 'uc',
	'plantsName' = 'pn',
	''
}

let sqlStr = `BEGIN;

UPDATE activity SET data = null WHERE data::text = '{}';
`;
for (const [oldVal, newVal] of Object.entries(CompressionMap)) {
	sqlStr += `UPDATE activity SET data = (data::jsonb - '${oldVal}' || jsonb_build_object('${newVal}', data->>'${oldVal}'))::json WHERE data::jsonb ? '${oldVal}';\n`;
}
sqlStr += '\nCOMMIT;\n';
console.log(sqlStr);

export function retrieveActivityData(activity: Activity) {
	if (activity.data === null) return {};
}

export function createActivityData(
	_data: Readonly<Omit<ActivityTaskOptions, 'finishDate' | 'id'>>
): StoredActivityData {
	const data: Partial<ActivityTaskOptions> = { ..._data };
	delete data.type;
	delete data.userID;
	delete data.id;
	delete data.channelID;
	delete data.duration;
	if (Object.keys(data).length === 0) return null;
	return data;
}
