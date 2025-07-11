import { EItem } from 'oldschooljs';
import type { Buyable } from './buyables';

export interface TripBuyable extends Omit<Buyable, 'name' | 'outputItems'> {
	item: EItem;
	quantity?: number;
	displayName?: string;
}

export const tripBuyables: TripBuyable[] = [
	{ item: EItem.PINEAPPLE, gpCost: 5, quantityPerHour: 3500, shopQuantity: 15, changePer: 2 },
	{ item: EItem.BANANA, gpCost: 5, quantityPerHour: 3500, shopQuantity: 15, changePer: 2 },
	{ item: EItem.ORANGE, gpCost: 5, quantityPerHour: 3250, shopQuantity: 10, changePer: 2 },
	{ item: EItem.BUCKET_OF_SAND, gpCost: 5, quantityPerHour: 3250, shopQuantity: 10, changePer: 2 },
	{ item: EItem.SODA_ASH, gpCost: 5, quantityPerHour: 3250, shopQuantity: 10, changePer: 2 },
	{ item: EItem.ARROW_SHAFT, gpCost: 1, quantityPerHour: 400_000, shopQuantity: 1000, changePer: 1 },
	{ item: EItem.COPPER_ORE, gpCost: 4, quantityPerHour: 11000 },
	{ item: EItem.TIN_ORE, gpCost: 4, quantityPerHour: 11000 },
	{ item: EItem.IRON_ORE, gpCost: 25, quantityPerHour: 11000 },
	{ item: EItem.MITHRIL_ORE, gpCost: 243, quantityPerHour: 11000 },
	{ item: EItem.SILVER_ORE, gpCost: 112, quantityPerHour: 11000 },
	{ item: EItem.GOLD_ORE, gpCost: 225, quantityPerHour: 11000 },
	{ item: EItem.COAL, gpCost: 67, quantityPerHour: 11000 },
	{ item: EItem.BLOOD_RUNE, gpCost: 400, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{ item: EItem.LAW_RUNE, gpCost: 240, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{ item: EItem.SOUL_RUNE, gpCost: 300, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{ item: EItem.ASTRAL_RUNE, gpCost: 50, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{ item: EItem.DEATH_RUNE, gpCost: 180, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{ item: EItem.NATURE_RUNE, gpCost: 180, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{ item: EItem.CHAOS_RUNE, gpCost: 90, quantityPerHour: 15000, shopQuantity: 250, changePer: 0.1 },
	{
		item: EItem.CHAOS_RUNE,
		gpCost: 9950,
		quantityPerHour: 1500,
		shopQuantity: 35,
		changePer: 0.1,
		quantity: 100,
		displayName: 'Chaos rune (pack)'
	}
];
