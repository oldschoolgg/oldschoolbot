import { isObject } from '@oldschoolgg/toolkit';
import type { JsonValue } from '@prisma/client/runtime/client';

import type {
	ActivityTaskData,
	GroupMonsterActivityTaskOptions,
	NexTaskOptions,
	RaidsOptions,
	TheatreOfBloodTaskOptions
} from '@/lib/types/minions.js';
import type { DatabaseStoredActivityData } from '@/lib/util/addSubTaskToActivityTask.js';

type AcceptableInput = ActivityTaskData | DatabaseStoredActivityData | JsonValue;

export function isRaidsActivity(data: AcceptableInput): data is RaidsOptions {
	return data !== null && isObject(data) && 'challengeMode' in data;
}

export function isTOBOrTOAActivity(data: AcceptableInput): data is TheatreOfBloodTaskOptions {
	return data !== null && isObject(data) && 'wipedRoom' in data;
}

export function isNexActivity(data: AcceptableInput): data is NexTaskOptions {
	return data !== null && isObject(data) && 'wipedKill' in data && 'userDetails' in data && 'leader' in data;
}

export function isGroupActivity(data: AcceptableInput): data is GroupMonsterActivityTaskOptions {
	return data !== null && isObject(data) && 'users' in data;
}
