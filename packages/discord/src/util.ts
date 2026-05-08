import { time } from '@discordjs/formatters';

export function dateFm(_date: Date | number) {
	const date = typeof _date === 'number' ? new Date(_date) : _date;
	return `${time(date, 'T')} (${time(date, 'R')})`;
}

export enum SpecialResponse {
	PaginatedMessageResponse = 0,
	SilentErrorResponse = 1,
	RespondedManually = 2
}
