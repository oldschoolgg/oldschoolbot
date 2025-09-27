import { divinationEnergies } from '@/lib/bso/divination.js';
import { leagueTasks } from '@/lib/bso/leagues/leagues.js';
import { DisassemblySourceGroups } from '@/lib/bso/skills/invention/groups/index.js';
import { Inventions } from '@/lib/bso/skills/invention/inventions.js';

import { customItems } from '@/lib/customItems/util.js';
import '../src/lib/safeglobals.js';

import { writeFileSync } from 'node:fs';
import { Items } from 'oldschooljs';
import { omit } from 'remeda';

export function renderBsoItemsFile() {
	writeFileSync(
		'data/bso/bso_items.json',
		JSON.stringify(
			customItems.reduce(
				(acc, id) => {
					acc[id] = Items.itemNameFromId(id)!;
					return acc;
				},
				{} as Record<number, string>
			),
			null,
			4
		),
		'utf-8'
	);

	writeFileSync(
		'data/bso/disassembly.json',
		JSON.stringify(
			DisassemblySourceGroups.map(i => ({
				...omit(i, ['items']),
				items: i.items.map(i => ({
					item: Array.isArray(i.item)
						? i.item.map(i => i.name).sort((a, b) => a.localeCompare(b))
						: i.item.name,
					lvl: i.lvl,
					outputMultiplier: i.outputMultiplier,
					flags: i.flags !== undefined ? Array.from(i.flags) : undefined
				}))
			})).sort((a, b) => a.name.localeCompare(b.name)),
			null,
			4
		),
		'utf-8'
	);

	writeFileSync(
		'data/bso/inventions.json',
		JSON.stringify(
			[...Inventions]
				.sort((a, b) => a.item.name.localeCompare(b.item.name))
				.map(i => ({
					...omit(i, ['item', 'materialTypeBank', 'extraDescription']),
					item: i.item.name,
					extraDescription: i.extraDescription?.() ?? null,
					itemCost: i.itemCost?.toJSON() ?? null,
					materialTypeBank: i.materialTypeBank.bank ?? null
				})),
			null,
			4
		),
		'utf-8'
	);

	writeFileSync(
		'data/bso/divination-energy.json',
		JSON.stringify(
			[...divinationEnergies]
				.map(i => ({
					...omit(i as any, ['clueTable']),
					item: i.item.id,
					boon: i.boon?.id,
					item_name: i.item.name,
					boon_name: i.boon?.name ?? null
				}))
				.sort((a, b) => a.item_name.localeCompare(b.item_name)),
			null,
			4
		),
		'utf-8'
	);

	writeFileSync(
		'data/bso/leagues-tasks.json',
		JSON.stringify(
			leagueTasks
				.sort((a, b) => a.name.localeCompare(b.name))
				.map(_g => ({ ..._g, tasks: _g.tasks.sort((a, b) => a.name.localeCompare(b.name)) })),
			null,
			4
		),
		'utf-8'
	);
}

renderBsoItemsFile();
