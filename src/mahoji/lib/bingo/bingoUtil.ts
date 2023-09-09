import { Bank } from 'oldschooljs';

import { getItem } from '../../../lib/util/getOSItem';
import { globalBingoTiles } from './globalTiles';

interface CustomReq {
	customReq: (cl: Bank) => boolean;
	allItems: number[];
}
interface OneOf {
	oneOf: number[];
}

interface AllOf {
	allOf: number[];
}

export type UniversalBingoTile = {
	name: string;
} & (OneOf | AllOf | CustomReq);

type GlobalTileID = number;
export type StoredBingoTile = OneOf | AllOf | GlobalTileID;

export type GlobalBingoTile = (OneOf | AllOf | CustomReq) & {
	id: number;
	name: string;
};

export function rowsForSquare(n: number): number {
	return Math.ceil(Math.sqrt(n));
}

export function generateTileName(tile: OneOf | AllOf | UniversalBingoTile | StoredBingoTile) {
	if (typeof tile === 'number') {
		return globalBingoTiles.find(t => t.id === tile)?.name ?? 'Unknown';
	}
	if ('oneOf' in tile) {
		return `Receive one of: ${tile.oneOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	if ('allOf' in tile) {
		return `Receive all of: ${tile.allOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	throw new Error(`Invalid tile: ${JSON.stringify(tile)}`);
}

export function getAllTileItems(tile: UniversalBingoTile) {
	if ('oneOf' in tile) {
		return tile.oneOf;
	}
	if ('allOf' in tile) {
		return tile.allOf;
	}
	if ('customReq' in tile) {
		return tile.allItems;
	}

	return [];
}
