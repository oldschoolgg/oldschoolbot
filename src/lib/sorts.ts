import type { Item } from 'oldschooljs';
import { marketPriceOrBotPrice } from './marketPrices';

export const BankSortMethods = ['value', 'alch', 'name', 'quantity', 'market'] as const;

export type BankSortMethod = (typeof BankSortMethods)[number];
type SortFn = (a: [Item, number], b: [Item, number]) => number;
export const sorts: Record<BankSortMethod, SortFn> = {
	value: (a, b) => b[0].price * b[1] - a[0].price * a[1],
	market: (a, b) => marketPriceOrBotPrice(b[0].id) * b[1] - marketPriceOrBotPrice(a[0].id) * a[1],
	alch: (a, b) => (b[0].highalch ?? 0) * b[1] - (a[0].highalch ?? 0) * a[1],
	name: (a, b) => a[0].name.localeCompare(b[0].name),
	quantity: (a, b) => b[1] - a[1]
};
