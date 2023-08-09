import type { ActivityTaskOptions, MonsterActivityTaskOptions } from '../types/minions';

export function isCertainMonsterTrip(monsterID: number) {
	return (data: ActivityTaskOptions) =>
		data.type === 'MonsterKilling' && (data as MonsterActivityTaskOptions).monsterID === monsterID;
}
