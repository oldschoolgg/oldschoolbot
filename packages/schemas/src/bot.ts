import z from 'zod';

import { ZStringInteger } from './shared.js';

export const ZBankSortMethod = z.enum(['value', 'alch', 'name', 'quantity']);
export type IBankSortMethod = z.infer<typeof ZBankSortMethod>;

export const ZCompostType = z.enum(['compost', 'supercompost', 'ultracompost']);
export type ICompostType = z.infer<typeof ZCompostType>;

export const ZAutoFarmFilter = z.enum(['AllFarm', 'Replant']);
export type IAutoFarmFilter = z.infer<typeof ZAutoFarmFilter>;

export const ZBankSortWeightings = z.record(ZStringInteger, z.int().min(0));
export type IBankSortWeightings = z.infer<typeof ZBankSortWeightings>;

export const ZItemIdArray = z.array(z.number().int().positive());
export type IItemIdArray = z.infer<typeof ZItemIdArray>;

export enum ECombatOption {
	NullOption = 0,
	AlwaysCannon = 1,
	AlwaysIceBurst = 2,
	AlwaysIceBarrage = 3
}
export const ZCombatOption = z.enum(ECombatOption);

export const ZCombatOptions = z
	.array(ZCombatOption)
	.refine(a => new Set(a).size === a.length, 'No duplicates allowed.');
export type ICombatOptions = z.infer<typeof ZCombatOptions>;

export * from './bot/attack-styles.js';
