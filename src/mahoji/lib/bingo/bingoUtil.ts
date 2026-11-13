import { Bank, type ItemBank, Items } from 'oldschooljs';

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

export interface BingoTileMetadata {
	key?: string;
	name?: string;
	description?: string;
	iconItemID?: number;
}

export type StoredCustomBingoTile = {
	custom: { type: 'item_quantity'; itemIDs: number[]; quantity: number } | { type: 'item_sets'; sets: number[][][] };
};

export type UniversalBingoTile = BingoTileMetadata & {
	name: string;
} & (OneOf | AllOf | BankTile | CustomReq);

export type StoredBingoTile = BingoTileMetadata & (OneOf | AllOf | BankTile | StoredCustomBingoTile);

export function rowsForSquare(n: number): number {
	return Math.ceil(Math.sqrt(n));
}

export function generateTileName(tile: OneOf | AllOf | BankTile | UniversalBingoTile | StoredBingoTile) {
	if ('name' in tile && tile.name) return tile.name;
	if ('oneOf' in tile) {
		return `Receive one of: ${tile.oneOf.map(id => Items.getOrThrow(id)?.name).join(', ')}`;
	}
	if ('allOf' in tile) {
		return `Receive all of: ${tile.allOf.map(id => Items.getOrThrow(id)?.name).join(', ')}`;
	}
	if ('bank' in tile) {
		return `Receive these items: ${new Bank(tile.bank)}`;
	}
	if ('custom' in tile) return 'Custom bingo tile';
	throw new Error(`Invalid tile: ${JSON.stringify(tile)}`);
}

export function resolveBingoTile(tile: StoredBingoTile): UniversalBingoTile {
	if ('custom' in tile) {
		const rule = tile.custom;
		return {
			...tile,
			name: generateTileName(tile),
			allItems: rule.type === 'item_quantity' ? rule.itemIDs : rule.sets.flat(2),
			customReq: cl =>
				rule.type === 'item_quantity'
					? rule.itemIDs.reduce((sum, id) => sum + cl.amount(id), 0) >= rule.quantity
					: rule.sets.some(set => set.every(group => group.some(id => cl.has(id))))
		};
	}
	return { ...tile, name: generateTileName(tile) };
}

export function bingoTileQuantity(tile: UniversalBingoTile, cl: Bank): { current: number; target: number } | null {
	if ('bank' in tile) {
		const entries = Object.entries(tile.bank);
		if (entries.length === 1) {
			const [id, target] = entries[0];
			if (target > 1) return { current: cl.amount(Number(id)), target };
		}
	}
	if ('custom' in tile) {
		const rule = (tile as StoredCustomBingoTile).custom;
		if (rule.type === 'item_quantity')
			return { current: rule.itemIDs.reduce((sum, id) => sum + cl.amount(id), 0), target: rule.quantity };
	}
	return null;
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
