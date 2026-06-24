import { time } from '@discordjs/formatters';

const DISCORD_EPOCH_MS = 1420070400000;
const DISCORD_TIMESTAMP_SHIFT = 22n;

export function dateFm(_date: Date | number) {
	const date = typeof _date === 'number' ? new Date(_date) : _date;
	return `${time(date, 'T')} (${time(date, 'R')})`;
}

export function idToUnixTs(id: string): number {
	return idToTs(id) + DISCORD_EPOCH_MS;
}
export function idToTs(id: string): number {
	return Number(BigInt(id) >> DISCORD_TIMESTAMP_SHIFT);
}

export enum SpecialResponse {
	PaginatedMessageResponse = 0,
	SilentErrorResponse = 1,
	RespondedManually = 2
}
