import { Prisma, UserEvent, UserEventType, xp_gains_skill_enum } from '@prisma/client';

import { MAX_LEVEL, MAX_TOTAL_LEVEL } from '../constants';
import { allCollectionLogsFlat } from '../data/Collections';
import { prisma } from '../settings/prisma';
import { dateFm } from './smallUtils';

export function userEventsToMap(_events: UserEvent[] | null) {
	if (_events === null) return new Map<string, number>();
	const events = _events.sort((a, b) => a.date.getTime() - b.date.getTime());
	const map = new Map<string, number>();
	for (const event of events) {
		map.set(event.user_id, event.date.getTime());
	}
	return map;
}

export async function insertUserEvent({
	userID,
	type,
	skill,
	collectionLogName,
	date
}: {
	userID: string;
	type: UserEventType;
	skill?: xp_gains_skill_enum;
	collectionLogName?: string;
	date?: Date;
}) {
	const data: Prisma.UserEventUncheckedCreateInput = {
		user_id: userID,
		type,
		skill,
		collection_log_name: collectionLogName?.toLowerCase(),
		date
	};
	if (
		(([UserEventType.MaxTotalLevel, UserEventType.MaxTotalXP] as UserEventType[]).includes(type) &&
			skill !== undefined) ||
		(([UserEventType.MaxXP, UserEventType.MaxLevel] as UserEventType[]).includes(type) && skill === undefined) ||
		(type === UserEventType.CLCompletion && !collectionLogName) ||
		(collectionLogName &&
			!allCollectionLogsFlat.some(cl => cl.name.toLowerCase() === collectionLogName.toLowerCase()))
	) {
		throw new Error(`Invalid user event: ${JSON.stringify(data)}`);
	}

	await prisma.userEvent.create({ data });
}

export function userEventToStr(event: UserEvent) {
	switch (event.type) {
		case 'CLCompletion': {
			return `Completed the ${event.collection_log_name} collection log at ${dateFm(event.date)}.`;
		}
		case 'MaxLevel': {
			return `Reached level ${MAX_LEVEL} ${event.skill} at ${dateFm(event.date)}.`;
		}
		case 'MaxTotalLevel': {
			return `Reached the maximum total level of ${MAX_TOTAL_LEVEL} at ${dateFm(event.date)}.`;
		}
		case 'MaxTotalXP': {
			return `Reached the maximum total xp at ${dateFm(event.date)}.`;
		}
		case 'MaxXP': {
			return `Reached the maximum ${event.skill} xp at ${dateFm(event.date)}.`;
		}
	}
}
