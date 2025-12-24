import type { Item } from '@/index.js';

export interface RawItemCollection {
	[index: string]: Item & {
		duplicate: boolean;
		noted: boolean;
		placeholder: boolean;
		linked_id_item: number | null;
	};
}

export async function fetchRawItems(): Promise<RawItemCollection> {
	const allItemsRaw = await fetch(
		'https://raw.githubusercontent.com/0xNeffarion/osrsreboxed-db/37322fed3abb2d58236c59dfc6babb37a27a50ea/docs/items-complete.json'
	).then(res => res.json());

	return allItemsRaw as RawItemCollection;
}
