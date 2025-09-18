import type { Bank } from './Bank.js';

type ChestSize = 'big' | 'small';
type SeedTier = '1' | '2' | '3' | '4' | '5';

export interface OpenableOpenOptions {
	fishLvl?: number;
	seedTier?: SeedTier;
	chestSize?: ChestSize;
}

export interface OpenableOptions {
	id: number;
	name: string;
	aliases: string[];
	allItems?: number[];
}
/**
 * An entity from OSRS which can be opened (e.g. implings)
 */
export default abstract class Openable {
	/**
	 *  The item ID of the item which is opened.
	 */
	public id: number;
	public name: string;
	public aliases: string[];
	public abstract open(quantity: number, options: OpenableOpenOptions): Bank;
	public allItems: number[];

	constructor(options: OpenableOptions) {
		this.id = options.id;
		this.name = options.name;
		this.aliases = options.aliases ?? [];
		this.allItems = options.allItems ?? [];
	}
}
