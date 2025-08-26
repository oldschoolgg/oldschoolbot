import { useState } from 'preact/compat';
import { groupBy } from 'remeda';

import _creatables from '@data/osb/creatables.json';
import { Accordion, AccordionItem } from './Accordion.js';

const creatables = _creatables.data as {
	name: string;
	required_slayer_unlocks?: number[];
	items_created: Record<string, number>;
	items_required: Record<string, number>;
}[];

const grouped = groupBy(
	creatables.filter(c => ['revert', 'unpack'].every(_s => !c.name.toLowerCase().includes(_s))),
	c => {
		const n = c.name.toLowerCase();
		const itemsRequired = Object.keys(c.items_required);
		const itemsCreated = Object.keys(c.items_created);
		const all = [n, ...itemsRequired, ...itemsCreated].map(i => i.toLowerCase());

		if (
			[
				'sanguine dust',
				'youngllef',
				'little nightmare',
				'midnight',
				"tumeken's guardian",
				'metamorphic dust',
				' heron',
				'tzrek-zuk',
				'rocky',
				'rax',
				'baby mole',
				'giant squirrel',
				'rift guardian'
			].some(i => all.some(j => j.includes(i)))
		) {
			return 'Pets';
		}
		if (['ornament', '(or)', 'sanguine ', 'ornate'].some(i => all.some(j => j.includes(i)))) {
			return 'Ornament Kits';
		}
		if (n.includes(' set')) return 'Packs and Sets';
		if (['dye', 'paint', 'colour kit', 'golden '].some(i => all.some(j => j.includes(i)))) {
			return 'Dyes and Dyed Items';
		}
		if (
			[
				'torva ',
				'godsword',
				'claws',
				'brimstone',
				'guardian',
				'halberd',
				'faceguard',
				'scythe',
				'hasta',
				'chainmace',
				'sword',
				'bludgeon',
				'whip',
				'mace',
				'defender',
				'blade'
			].some(i => all.some(j => j.includes(i)))
		) {
			return 'Melee Gear/Weapons';
		}
		if (n.includes('graceful')) return 'Graceful';
		if (n.includes('crystal')) return 'Crystal Items';
		if (n.includes('book')) return 'Books';
		if (
			[
				'kodai',
				'swampbark',
				'mystic',
				"dagon'hai",
				'bloodbark',
				'ancestral',
				'magus',
				'nightmare',
				'eternal',
				'maledict'
			].some(i => all.some(j => j.includes(i)))
		) {
			return 'Mage Gear';
		}
		if (
			['masori', 'bow', 'armadyl helm', 'armadyl chain', 'armadyl ches', 'pegasian', 'odium', "ava's"].some(i =>
				all.some(j => j.includes(i))
			)
		) {
			return 'Range Gear';
		}
		if (c.required_slayer_unlocks?.length || ['slayer', 'black mask'].some(i => n.includes(i))) return 'Slayer';

		if (
			[
				'zenyte',
				'angler ',
				'kebbit fur',
				'axe',
				'harpoon',
				'pheasant',
				'hunter',
				'larupia',
				'camouflage',
				'compost',
				' pouch'
			].some(i => all.some(j => j.includes(i)))
		) {
			return 'Skilling';
		}

		return 'Miscellaneous';
	}
);

function CreatablesGroup({ items }: { items: typeof creatables }) {
	return (
		<div>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Items Required</th>
						<th>Items Created</th>
					</tr>
				</thead>
				<tbody>
					{items.map(creatable => (
						<tr key={creatable.name}>
							<td>{creatable.name}</td>
							<td>
								{Object.entries(creatable.items_required)
									.map(entr => (entr[1] === 1 ? entr[0] : `${entr[1]}x ${entr[0]}`))
									.join(', ')}{' '}
							</td>
							<td>
								{Object.entries(creatable.items_created)
									.map(entr => (entr[1] === 1 ? entr[0] : `${entr[1]}x ${entr[0]}`))
									.join(', ')}{' '}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function Creatables() {
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
				<CreatablesGroup items={creatables.filter(_c => _c.name.toLowerCase().includes(searchString))} />
			) : (
				<Accordion type="single">
					{Object.entries(grouped)
						.sort((a, b) => a[0].localeCompare(b[0]))
						.map(group => (
							<AccordionItem key={group[0]} title={group[0]} name={group[0]} value={group[0]}>
								<CreatablesGroup items={group[1]} />
							</AccordionItem>
						))}
				</Accordion>
			)}
		</div>
	);
}
