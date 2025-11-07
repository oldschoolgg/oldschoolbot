import _buyables from '@data/osb/buyables.json';
import type { ItemBank } from 'oldschooljs';
import { useState } from 'preact/compat';
import { groupBy } from 'remeda';

import { toTitleCase } from '../docs-util.js';
import { EItem, WebItems } from '../lib/WebItems.js';
import { Accordion, AccordionItem } from './Accordion.js';

type JSONBuyable = {
	name: string;
	item_cost?: Record<string, number>;
	output_items: ItemBank;
	gp_cost?: number;
	qp_required?: number;
	ironman_price?: number;
	skills_needed?: Record<string, number>;
	collection_log_reqs?: Array<string>;
	minigame_score_req?: [string, number];
	max_quantity?: number;
	required_quests?: Array<number>;
};
const buyables = (_buyables as JSONBuyable[]).map(item => {
	if (!item.gp_cost) return item;
	return { ...item, item_cost: { [EItem.COINS]: item.gp_cost, ...(item.item_cost ?? {}) } };
});

const categories = {
	Capes: ['cape', ' shroud', "Xeric's", "Icthlarin's"],
	'Chompy Bird Hats': ['chompy'],
	Cosmetics: [
		'flower crown',
		'pirate',
		'purple',
		'yellow',
		'bomber',
		'Turquoise',
		'blue',
		'cream',
		'pink',
		'red ',
		'green ',
		'grey ',
		'jester',
		'moonclan',
		'Fremennik ',
		'apron',
		'teal'
	],
	'Achievement Diaries': [
		'Morytania legs',
		'Ardougne cloak',
		'Desert amulet',
		'Fremennik sea boots',
		'Kandarin headgear',
		'Karamja gloves',
		'Varrock armour',
		'Western banner',
		'wilderness sword',
		"explorer's ring",
		'Falador shield',
		"rada's blessing"
	],
	Slayer: ['nose peg', 'broad ', 'slayer'],
	Skilling: ['axe', 'pickaxe', 'butterfly', 'fishing', 'raw ', 'Amylase', 'Calcified', 'Cooking'],
	Food: ['beer', 'choc', 'vodka', 'potato', 'Gin'],
	Dorgeshuun: ['dorg', 'bone '],
	Gear: [
		'helm',
		'ring',
		'boots',
		'gloves',
		'platebody',
		'platelegs',
		'kiteshield',
		'scimitar',
		'sword',
		'cowl',
		'hat',
		'robe',
		'shield',
		'spear',
		'ghostly',
		'outfit',
		'staff'
	]
};

const categoriesItemCost = {
	'Random Events': [EItem.FROG_TOKEN],
	Sepulchre: [EItem.HALLOWED_MARK],
	Forestry: [EItem.ANIMAINFUSED_BARK],
	'Castle Wars': [EItem.CASTLE_WARS_TICKET],
	'Guardians of the Rift': [EItem.ABYSSAL_PEARLS],
	"Mairin's Market": [EItem.MERMAIDS_TEAR],
	'Motherlode Mine & Mining Guild': [EItem.GOLDEN_NUGGET, EItem.UNIDENTIFIED_MINERALS],
	'Shooting Stars': [EItem.STARDUST],
	'Trouble Brewing': [EItem.PIECES_OF_EIGHT],
	'Aerial Fishing': [EItem.MOLCH_PEARL]
};

const grouped = groupBy(buyables, b => {
	const n = b.name.toLowerCase();

	if (b.item_cost) {
		for (const [category, keywords] of Object.entries(categoriesItemCost)) {
			if (keywords.some(i => b.item_cost![i])) {
				return category;
			}
		}
	}

	for (const [category, keywords] of Object.entries(categories)) {
		if (keywords.some(i => n.includes(i.toLowerCase()))) {
			return category;
		}
	}

	return 'Miscellaneous';
});

function BuyablesGroup({ items }: { items: JSONBuyable[] }) {
	return (
		<div className={'w-full'}>
			<table className={'w-full'}>
				<thead className={'w-full'}>
					<tr>
						<th className={'min-w-52'}>Name</th>
						<th className={'min-w-52'}>Item Cost</th>
						<th className={'min-w-36'}>Reqs</th>
					</tr>
				</thead>
				<tbody>
					{items.map(buyable => (
						<tr key={buyable.name}>
							<td>{buyable.name}</td>
							<td>{buyable.item_cost ? WebItems.itemBankToNames(buyable.item_cost) : ' '}</td>
							<td>
								{[
									buyable.qp_required ? `${buyable.qp_required} QP` : null,
									buyable.skills_needed
										? Object.entries(buyable.skills_needed)
												.map(ent => `${ent[1]} ${toTitleCase(ent[0])}`)
												.join(', ')
										: null,
									buyable.minigame_score_req
										? `${buyable.minigame_score_req[1]} ${toTitleCase(buyable.minigame_score_req[0])}`
										: null,
									buyable.collection_log_reqs?.length
										? buyable.collection_log_reqs.map(i => WebItems.get(i)!.item!.name).join(', ')
										: null
								]
									.filter(Boolean)
									.join(', ') || ' '}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function Buyables() {
	const [searchString, setSearchString] = useState('');
	return (
		<div>
			<div className="flex flex-col gap-2">
				<label for="search" className="font-bold">
					Search
				</label>
				<input
					id="search"
					name="search"
					value={searchString ?? ''}
					onInput={e => setSearchString(e.currentTarget.value)}
					className="w-52 input"
				/>
			</div>
			{searchString ? (
				<BuyablesGroup
					items={buyables.filter(_c => _c.name.toLowerCase().includes(searchString.toLowerCase()))}
				/>
			) : (
				<Accordion type="single">
					{Object.entries(grouped)
						.sort((a, b) => a[0].localeCompare(b[0]))
						.map(group => (
							<AccordionItem key={group[0]} title={group[0]} name={group[0]} value={group[0]}>
								<BuyablesGroup items={group[1]} />
							</AccordionItem>
						))}
				</Accordion>
			)}
		</div>
	);
}
