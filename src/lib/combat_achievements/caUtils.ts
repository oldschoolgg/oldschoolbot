import type { ActivityTaskData, MonsterActivityTaskOptions } from '../types/minions';

export function isCertainMonsterTrip(monsterID: number) {
	return (data: ActivityTaskData) =>
		data.type === 'MonsterKilling' && (data as MonsterActivityTaskOptions).monsterID === monsterID;
}
