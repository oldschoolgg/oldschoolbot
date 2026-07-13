import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

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

function getImageMime(filePath: string): 'image/png' | 'image/jpeg' | 'image/webp' {
	switch (extname(filePath).toLowerCase()) {
		case '.png':
			return 'image/png';
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.webp':
			return 'image/webp';
		default:
			throw new Error(`Unsupported image type: ${filePath}`);
	}
}

export async function imageFileToDataUri(filePath: string): Promise<string> {
	const mime = getImageMime(filePath);
	const image = await readFile(filePath);
	return `data:${mime};base64,${image.toString('base64')}`;
}

export enum SpecialResponse {
	PaginatedMessageResponse = 0,
	SilentErrorResponse = 1,
	RespondedManually = 2
}
