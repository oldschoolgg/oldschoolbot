export type MoidItem = {
	id: number;
	name: string;
	examine: string;
	exchange: boolean;
	members: boolean;
	stackable: boolean;
	value: number;
	noted_id?: number;
	placeholder_id?: number;
	inventory_model: number;
	weight: number;
	category: number;
	act_inv: Array<string>;
	act_world: Array<string>;
	config_name: string;
	params?: Record<StringifiedInteger, string | number>;
	color_find?: Array<number>;
	color_replace?: Array<number>;
	count_co?: Array<number>;
	count_obj?: Array<number>;
	texture_find?: Array<number>;
	texture_replace?: Array<number>;
};

export type StringifiedInteger = `${bigint}`;

export interface MoidSourceItem {
	id: number;
	name: string;
	examine?: string;
	exchange: boolean;
	members: boolean;
	stackable: number;
	value: number;
	notedId: number;
	placeholderId: number;
	inventoryModel: number;
	weight: number;
	category: number;
	actInv: string[];
	actWorld: string[];
	configName: string;
	colorFind?: number[];
	colorReplace?: number[];
	params?: any;
	countCo?: number[];
	countObj?: number[];
	textureFind?: number[];
	textureReplace?: number[];
}

export interface GESourceItem {
	examine: string;
	id: number;
	members: boolean;
	lowalch?: number;
	limit?: number;
	value: number;
	highalch?: number;
	icon: string;
	name: string;
}

import { z } from 'zod';

export const ZWikiBucketItem = z.object({
	page_name: z.string(),
	release_date: z.string().optional(),
	examine: z.string(),
	item_id: z.array(z.string()),
	is_members_only: z.boolean().optional(),
	weight: z.number(),
	item_name: z.string(),
	high_alchemy_value: z.number().optional(),
	value: z.number().optional(),
	buy_limit: z.number().optional()
});
export type IWikiBucketItem = z.infer<typeof ZWikiBucketItem>;
