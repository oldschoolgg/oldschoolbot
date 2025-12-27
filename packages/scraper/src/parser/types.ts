export type WikiNode =
	| TemplateNode
	| LinkNode
	| ExternalLinkNode
	| HeadingNode
	| TextNode
	| BoldNode
	| ItalicNode
	| HtmlTagNode
	| TableNode
	| ListNode
	| HorizontalRuleNode;

export interface TemplateNode {
	type: 'template';
	name: string;
	params: TemplateParam[];
}

export interface TemplateParam {
	name: string | null;
	value: WikiNode[];
}

export interface LinkNode {
	type: 'link';
	target: string;
	text: string | null;
	isFile: boolean;
	isCategory: boolean;
}

export interface ExternalLinkNode {
	type: 'externalLink';
	url: string;
	text: string | null;
}

export interface HeadingNode {
	type: 'heading';
	level: number;
	content: WikiNode[];
}

export interface TextNode {
	type: 'text';
	value: string;
}

export interface BoldNode {
	type: 'bold';
	content: WikiNode[];
}

export interface ItalicNode {
	type: 'italic';
	content: WikiNode[];
}

export interface HtmlTagNode {
	type: 'htmlTag';
	tag: string;
	attributes: Record<string, string>;
	content: WikiNode[];
	selfClosing: boolean;
}

export interface TableNode {
	type: 'table';
	attributes: string;
	rows: TableRowNode[];
}

export interface TableRowNode {
	type: 'tableRow';
	cells: TableCellNode[];
	isHeader: boolean;
}

export interface TableCellNode {
	type: 'tableCell';
	content: WikiNode[];
	isHeader: boolean;
}

export interface ListNode {
	type: 'list';
	style: 'ordered' | 'unordered' | 'definition';
	items: ListItemNode[];
}

export interface ListItemNode {
	type: 'listItem';
	content: WikiNode[];
	sublist: ListNode | null;
}

export interface HorizontalRuleNode {
	type: 'horizontalRule';
}

export interface ParseResult {
	nodes: WikiNode[];
}

import { z } from 'zod';

export const ZFullItem = z.strictObject({
	id: z.number(),
	name: z.string(),

	options: z.array(z.string()).default([]),
	league_region: z.array(z.string()).default([]),

	// Numbers
	weight: z.number(),
	value: z.number(),
	respawn: z.number().nullable().default(null),

	// Strings
	type: z.string(),
	destroy: z.string().optional(),
	examine: z.string(),
	worn_options: z.string().optional(),
	aka: z.string().optional(),
	removal: z.string().optional(),
	removal_update: z.string().optional(),
	limit: z.string().optional(),
	release: z.string().optional(),
	update: z.string().optional(),
	bucketname: z.string().optional(),
	version: z.string().optional(),
	buy_limit: z.number().optional(),

	tradeable: z.boolean(),
	tradeable_on_ge: z.boolean(),
	quest_item: z.boolean(),
	members: z.boolean(),
	equipable: z.boolean(),
	stackable: z.boolean(),
	alchable: z.boolean().optional(),
	noteable: z.boolean().optional(),
	placeholder: z.boolean().optional(),
	bankable: z.boolean().optional(),
	stacks_in_bank: z.boolean().optional(),
	edible: z.boolean().optional(),
	exchange: z.boolean().optional(),

	equipment: z.strictObject({
		combat_style: z.string().optional(),
		attack_range: z.union([z.number(), z.literal('staff')]).optional(),
		prayer: z.number(),
		slot: z.string(),
		speed: z.number().optional(),
		attack_crush: z.number(),
		attack_magic: z.number(),
		attack_slash: z.number(),
		attack_stab: z.number(),
		defence_crush: z.number(),
		defence_magic: z.number(),
		defence_range: z.number(),
		defence_slash: z.number(),
		defence_stab: z.number(),
		magic_damage: z.number(),
		ranged_strength: z.number(),
		strength: z.number(),
		type: z.string()
	})
});

export enum InfoboxType {
	ITEM = 'infobox_item',
	BONUSES = 'infobox_bonuses',
	NPC = 'infobox_npc',
	SCENERY = 'infobox_scenery',
	MONSTER = 'infobox_monster',
	SPELL = 'infobox_spell'
}
