import { Item } from 'oldschooljs/dist/meta/types';

export const BankSortMethods = ['value', 'alch', 'name'] as const;

export type BankSortMethod = typeof BankSortMethods[number];
type SortFn = (a: [Item, number], b: [Item, number]) => number;
export const sorts: Record<BankSortMethod, SortFn> = {
	value: (a, b) => b[0].price * b[1] - a[0].price * a[1],
	alch: (a, b) => b[0].highalch * b[1] - a[0].highalch * a[1],
	name: (a, b) => a[0].name.localeCompare(b[0].name)
};
