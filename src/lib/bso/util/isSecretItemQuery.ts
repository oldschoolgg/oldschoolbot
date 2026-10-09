import type { Item } from 'oldschooljs';

export function isSecretItemIDQuery(item: Item | null | undefined, query: string | number | undefined): boolean {
	return item?.customItemData?.isSecret === true && Number(query) === item.id;
}
