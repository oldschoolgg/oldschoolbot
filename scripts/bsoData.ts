import { determineTameClueResult } from '@/lib/bso/commands/tames.js';
import { leagueTasks } from '@/lib/bso/leagues/leagues.js';
import { divinationEnergies } from '@/lib/bso/skills/divination.js';
import { DisassemblySourceGroups } from '@/lib/bso/skills/invention/groups/index.js';
import { Inventions } from '@/lib/bso/skills/invention/inventions.js';

import { writeFileSync } from 'node:fs';
import { calcPerHour, Time } from '@oldschoolgg/toolkit';
import { Items, itemID } from 'oldschooljs';
import { groupBy, omit } from 'remeda';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { customItems } from '@/lib/customItems/util.js';

function tameCluesData() {
	const rawResults = [];
	for (const tameLevel of [50, 60, 70, 75, 80, 85, 90, 95, 100]) {
		for (const clueTier of ClueTiers) {
			const res = determineTameClueResult({
				tameGrowthLevel: 3,
				clueTier,
				extraTripLength: Time.Hour * 10,
				supportLevel: tameLevel,
				equippedArmor: itemID('Abyssal jibwings (e)'),
				equippedPrimary: itemID('Divine ring')
			});

			rawResults.push({
				...res,
				tameLevel,
				clueTier,
				cluesPerHour: calcPerHour(res.quantity, res.duration),
				kibblePerHour: calcPerHour(res.cost.amount('Extraordinary kibble'), res.duration),
				gmcPerHour: calcPerHour(res.cost.amount('Clue scroll (grandmaster)'), res.duration)
			});
		}
	}

	const grouped = groupBy(rawResults, i => i.clueTier.name);
	const groupedResults = Object.entries(grouped).map(group => {
		const [clueTier, results] = group;
		return { tier: clueTier, sorted: results.sort((a, b) => b.cluesPerHour - a.cluesPerHour) };
	});

	const jsonResults = [];
	for (const { sorted } of groupedResults.sort((a, b) => a.tier.localeCompare(b.tier))) {
		for (const res of sorted) {
			jsonResults.push({
				supportLevel: res.tameLevel,
				clueTier: res.clueTier.name,
				cluesPerHour: res.cluesPerHour,
				kibblePerHour: res.kibblePerHour,
				gmcPerHour: res.gmcPerHour
			});
		}
	}

	writeFileSync('data/bso/tames/clues.json', JSON.stringify(jsonResults, null, 4));
}

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

	writeFileSync(
		'data/bso/custom-items.json',
		JSON.stringify(
			customItems
				.map(id => Items.get(id)!)
				.sort((a, b) => a.name.localeCompare(b.name))
				.map(item => {
					return omit(item, ['wiki_name']);
				}),
			null,
			4
		),
		'utf-8'
	);

	tameCluesData();
}
