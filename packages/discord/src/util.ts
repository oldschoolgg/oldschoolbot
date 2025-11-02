import { time } from '@discordjs/formatters';

export function dateFm(date: Date) {
	return `${time(date, 'T')} (${time(date, 'R')})`;
}
