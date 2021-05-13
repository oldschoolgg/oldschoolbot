import { Item } from 'oldschooljs/dist/meta/types';

export const BankSortMethods = ['value', 'alch', 'name'] as const;

export type BankSortMethod = typeof BankSortMethods[number];
type SortFn = (a: [Item, number], b: [Item, number]) => number;
export const sorts: Record<BankSortMethod, SortFn> = {
	value: (a, b) => b[0].price - a[0].price,
	alch: (a, b) => b[0].highalch - a[0].highalch,
	name: (a, b) => a[0].name.localeCompare(b[0].name)
};
