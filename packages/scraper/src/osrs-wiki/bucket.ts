import type { WikiClient } from './api.js';
import type { IBucketItem, IBucketItemRaw } from './types.js';

const ITEM_BUCKET_FIELDS = [
	'item_id',
	'item_name',
	'page_name',
	'is_members_only',
	'high_alchemy_value',
	'league_region',
	'release_date',
	'value',
	'weight',
	'buy_limit',
	'examine'
] as const;
type ItemBucketField = (typeof ITEM_BUCKET_FIELDS)[number];

export class ItemBucket {
	constructor(private readonly wiki: WikiClient) {}

	async fetchById(
		itemId: number | number[],
		fields: readonly ItemBucketField[] = ITEM_BUCKET_FIELDS
	): Promise<IBucketItem[]> {
		const select = fields && fields.length ? `.select(${fields.map(f => `'${f}'`).join(',')})` : '';
		const itemIds = Array.isArray(itemId) ? itemId : [itemId];
		const query = `bucket('infobox_item')${select}.where(bucket.Or({${itemIds.map(_id => `{'item_id','${_id}'}`).join(', ')}})).run()`;
		const data: any = await this.wiki.request({
			action: 'bucket',
			query
		});
		if (!data.bucket || data.bucket.length === 0) {
			return [];
		}
		const results = data.bucket.map((rawItem: IBucketItemRaw) => ({
			pageName: rawItem.page_name,
			releaseDate: rawItem.release_date,
			examine: rawItem.examine,
			itemId: rawItem.item_id.map(idStr => Number(idStr)),
			isMembersOnly: 'is_members_only' in rawItem ? rawItem.is_members_only : false,
			weight: rawItem.weight,
			itemName: rawItem.item_name,
			highAlchemyValue: rawItem.high_alchemy_value,
			value: rawItem.value,
			buyLimit: rawItem.buy_limit
		}));
		return results;
	}
}
