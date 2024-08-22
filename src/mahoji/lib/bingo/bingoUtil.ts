import { Bank } from 'oldschooljs';

import type { ItemBank } from '../../../lib/types';
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

interface BankTile {
	bank: ItemBank;
}

export type UniversalBingoTile = {
	id?: number;
	name: string;
} & (OneOf | AllOf | BankTile | CustomReq);

interface StoredGlobalTile {
	global: number;
}

export type StoredBingoTile = OneOf | AllOf | BankTile | StoredGlobalTile;

export type GlobalBingoTile = (OneOf | AllOf | BankTile | CustomReq) & {
	id: number;
	name: string;
};

export function isGlobalTile(data: any): data is StoredGlobalTile {
	return 'global' in data;
}

export function rowsForSquare(n: number): number {
	return Math.ceil(Math.sqrt(n));
}

export function generateTileName(
	tile: OneOf | AllOf | BankTile | UniversalBingoTile | StoredBingoTile | GlobalBingoTile
) {
	if ('global' in tile) {
		return globalBingoTiles.find(t => t.id === tile.global)?.name ?? 'Unknown';
	}
	if ('id' in tile) {
		return globalBingoTiles.find(t => t.id === tile.id)?.name ?? 'Unknown';
	}
	if ('oneOf' in tile) {
		return `Receive one of: ${tile.oneOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	if ('allOf' in tile) {
		return `Receive all of: ${tile.allOf.map(id => getItem(id)?.name).join(', ')}`;
	}
	if ('bank' in tile) {
		return `Receive all of: ${new Bank(tile.bank)}`;
	}
	throw new Error(`Invalid tile: ${JSON.stringify(tile)}`);
}

export function getAllTileItems(tile: UniversalBingoTile): number[] {
	if ('oneOf' in tile) {
		return tile.oneOf;
	}
	if ('allOf' in tile) {
		return tile.allOf;
	}
	if ('customReq' in tile) {
		return tile.allItems;
	}
	if ('bank' in tile) {
		return new Bank(tile.bank).items().map(i => i[0].id);
	}

	return [];
}
