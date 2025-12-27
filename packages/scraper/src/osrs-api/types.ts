import { z } from 'zod';

const OSRSApiPriceSchema = z.union([z.string(), z.number()]);

export const ZCatalogueItemSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string(),
	current: z.object({
		trend: z.string(),
		price: OSRSApiPriceSchema
	}),
	today: z.object({
		trend: z.string(),
		price: OSRSApiPriceSchema
	}),
	members: z.union([z.literal('true'), z.literal('false')])
});

export const ZCatalogueItemsResponseSchema = z.object({
	total: z.number(),
	items: z.array(ZCatalogueItemSchema)
});

export type ICatalogueItem = z.infer<typeof ZCatalogueItemSchema>;
export type ICatalogueItemsResponse = z.infer<typeof ZCatalogueItemsResponseSchema>;
