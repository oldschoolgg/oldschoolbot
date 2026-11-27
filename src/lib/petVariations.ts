import { Bank, itemID } from 'oldschooljs';

import { BitField } from '@/lib/constants.js';
import { fetchUserStats } from '@/lib/util/fetchUserStats.js';

export type PetMetamorphs = {
	random?:
		| { petId: number; chance: 1 | number }[]
		| ((user: MUser, currentPetId: number) => number[] | Promise<number[]>);
	cost?: { petId: number; costOption: number | Bank[] }[];
	requirement?: (user: MUser, petId: number) => boolean;
};

export function petCostBanks(cost: number | Bank[]): Bank[] {
	return typeof cost === 'number' ? [new Bank().add(cost)] : cost;
}

export const toaMetamorphUnlockableMap = [
	{ pet: itemID("Tumeken's guardian"), unlockable: null },
	{ pet: itemID("Elidinis' guardian"), unlockable: null },
	{ pet: itemID('Zebo'), unlockable: itemID('Remnant of Zebak') },
	{ pet: itemID('Kephriti'), unlockable: itemID('Remnant of Kephri') },
	{ pet: itemID('Babi'), unlockable: itemID('Remnant of Ba-Ba') },
	{ pet: itemID('Akkhito'), unlockable: itemID('Remnant of Akkha') },
	{ pet: itemID("Tumeken's damaged guardian"), unlockable: itemID('Ancient remnant') },
	{ pet: itemID("Elidinis' damaged guardian"), unlockable: itemID('Ancient remnant') }
] as const;

export const toaGuardianPetIds = toaMetamorphUnlockableMap.map(entry => entry.pet);

export type PetVariation = {
	base: number;
	randomForms?: readonly number[];
	metamorphs: PetMetamorphs[];
	costNotice?: string;
};

export const allPetVariations: PetVariation[] = [
	{
		base: itemID('Beaver'),
		metamorphs: [
			{
				requirement: user => user.bitfield.includes(BitField.FUNKY_SHAPED_LOG_USED),
				cost: [
					{ petId: itemID('Beaver'), costOption: [new Bank().add('Logs').freeze()] },
					...[
						'oak',
						'willow',
						'teak',
						'jatoba',
						'maple',
						'mahogany',
						'arctic pine',
						'yew',
						'camphor',
						'magic',
						'ironwood',
						'redwood',
						'rosewood'
					].map(variant => ({
						petId: itemID(`Beaver (${variant})`),
						costOption: itemID(`${variant} logs`)
					}))
				]
			}
		]
	},
	{
		base: itemID('Rock golem'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Rock golem'), costOption: itemID('Rock') },
					{
						petId: itemID('Rock golem (granite)'),
						costOption: ['Granite (500g)', 'Granite (2kg)', 'Granite (5kg)'].map(item =>
							new Bank().add(item)
						)
					},
					{ petId: itemID('Rock golem (tin)'), costOption: itemID('Tin ore') },
					{ petId: itemID('Rock golem (copper)'), costOption: itemID('Copper ore') },
					{ petId: itemID('Rock golem (iron)'), costOption: itemID('Iron ore') },
					{ petId: itemID('Rock golem (silver)'), costOption: itemID('Silver ore') },
					{ petId: itemID('Rock golem (coal)'), costOption: itemID('Coal') },
					{ petId: itemID('Rock golem (gold)'), costOption: itemID('Gold ore') },
					{ petId: itemID('Rock golem (mithril)'), costOption: itemID('Mithril ore') },
					{ petId: itemID('Rock golem (adamant)'), costOption: itemID('Adamantite ore') },
					{ petId: itemID('Rock golem (runite)'), costOption: itemID('Runite ore') },
					{ petId: itemID('Rock golem (lovakite)'), costOption: itemID('Lovakite ore') },
					{ petId: itemID('Rock golem (daeyalt)'), costOption: itemID('Daeyalt ore') },
					{ petId: itemID('Rock golem (blurite)'), costOption: itemID('Blurite ore') },
					{ petId: itemID('Rock golem (amethyst)'), costOption: itemID('Amethyst') },
					{ petId: itemID('Rock golem (elemental)'), costOption: itemID('Elemental ore') },
					{ petId: itemID('Rock golem (lead)'), costOption: itemID('Lead ore') },
					{ petId: itemID('Rock golem (nickel)'), costOption: itemID('Nickel ore') },
					{ petId: itemID('Rock golem (rubium)'), costOption: itemID('Rubium splinters') }
				]
			}
		]
	},
	{
		base: itemID('Tangleroot'),
		metamorphs: [
			{
				random: ['Herb', 'Crystal', 'Dragonfruit', 'Redwood', 'White lily'].map(kind => ({
					petId: itemID(`Tangleroot (${kind.toLowerCase()})`),
					chance: 1 as const
				}))
			}
		]
	},
	{
		base: itemID('Phoenix'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Phoenix'), costOption: itemID('Red firelighter') },
					...['Blue', 'Green', 'Purple', 'White'].map(color => ({
						petId: itemID(`Phoenix (${color.toLowerCase()})`),
						costOption: itemID(`${color} firelighter`)
					}))
				]
			}
		]
	},
	{
		base: itemID('Rocky'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Rocky'), costOption: [new Bank().add(itemID('White berries'))] },
					{ petId: itemID('Red'), costOption: [new Bank().add(itemID('Redberries'))] },
					{ petId: itemID('Ziggy'), costOption: [new Bank().add(itemID('Poison ivy berries'))] }
				]
			}
		]
	},
	{
		base: itemID('Baby chinchompa'),
		metamorphs: [
			{
				random: [
					{ petId: itemID('Baby chinchompa (red)'), chance: 1 },
					{ petId: itemID('Baby chinchompa (black)'), chance: 1 },
					{ petId: itemID('Baby chinchompa (gold)'), chance: 10_000 }
				]
			}
		]
	},
	{
		base: itemID('Noon'),
		metamorphs: [{ cost: [{ petId: itemID('Midnight'), costOption: [new Bank().add(itemID('Noon'))] }] }]
	},
	{
		base: itemID('Kalphite princess'),
		metamorphs: [
			{
				random: [
					{ petId: itemID('Kalphite princess'), chance: 1 },
					{ petId: itemID('Kalphite Princess (flying)'), chance: 1 }
				]
			}
		]
	},
	{
		base: itemID('Pet smoke devil'),
		metamorphs: [
			{
				cost: [
					{
						petId: itemID('Pet smoke devil (smoke)'),
						costOption: [new Bank().add(itemID('Pet smoke devil'))]
					}
				]
			}
		]
	},
	{
		base: itemID('Pet snakeling'),
		metamorphs: [
			{
				random: [itemID('Pet snakeling (mutated)'), itemID('Pet snakeling (tanzanite)')].map(petId => ({
					petId,
					chance: 1 as const
				}))
			}
		]
	},
	{
		base: itemID('Venenatis spiderling'),
		metamorphs: [
			{
				cost: [{ petId: itemID('Venenatis spiderling (orphan)'), costOption: itemID('Venenatis spiderling') }]
			}
		]
	},
	{
		base: itemID('Callisto cub'),
		metamorphs: [{ cost: [{ petId: itemID('Callisto cub (orphan)'), costOption: itemID('Callisto cub') }] }]
	},
	{
		base: itemID("Vet'ion jr."),
		metamorphs: [
			{
				cost: [
					{ petId: itemID("Vet'ion jr. (skeletal)"), costOption: itemID("Vet'ion jr.") },
					{ petId: itemID("Vet'ion jr. (reanimated)"), costOption: itemID("Vet'ion jr.") }
				]
			}
		]
	},
	{
		base: itemID('Ikkle hydra'),
		metamorphs: [
			{
				cost: ['serpentine', 'icy', 'magna'].map(variant => ({
					petId: itemID(`Ikkle hydra (${variant})`),
					costOption: [new Bank().add(itemID('Ikkle hydra'))]
				}))
			}
		]
	},
	{
		base: itemID("Lil' creator"),
		metamorphs: [
			{ cost: [{ petId: itemID("Lil' destructor"), costOption: [new Bank().add(itemID("Lil' creator"))] }] }
		]
	},
	{
		base: itemID('Pet dark core'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Pet corporeal critter'), costOption: [new Bank().add(itemID('Pet dark core'))] }
				]
			}
		]
	},
	{
		base: itemID('Jal-nib-rek'),
		metamorphs: [{ cost: [{ petId: itemID('Tzrek-zuk'), costOption: [new Bank().add(itemID('Jal-nib-rek'))] }] }]
	},
	{
		base: itemID('Baby mole'),
		metamorphs: [{ cost: [{ petId: itemID('Baby mole-rat'), costOption: [new Bank().add(itemID('Mole claw'))] }] }]
	},
	{
		base: itemID('Little nightmare'),
		metamorphs: [
			{ cost: [{ petId: itemID('Little parasite'), costOption: [new Bank().add(itemID('Parasitic egg'))] }] }
		]
	},
	{
		base: itemID('Heron'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Great blue heron'), costOption: [new Bank().add(itemID('Spirit flakes'), 3000)] }
				]
			}
		]
	},
	{
		base: itemID('Olmlet'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Puppadile'), costOption: [new Bank().add(itemID('Metamorphic dust'))] },
					{ petId: itemID('Tektiny'), costOption: [new Bank().add(itemID('Metamorphic dust'))] },
					{ petId: itemID('Vanguard'), costOption: [new Bank().add(itemID('Metamorphic dust'))] },
					{ petId: itemID('Vasa minirio'), costOption: [new Bank().add(itemID('Metamorphic dust'))] },
					{ petId: itemID('Vespina'), costOption: [new Bank().add(itemID('Metamorphic dust'))] }
				]
			}
		]
	},
	{
		base: itemID("Lil' zik"),
		metamorphs: [
			{
				cost: [
					...["Lil' Maiden", "Lil' Bloat", "Lil' Nylo", "Lil' Sot", "Lil' Xarp"].map(name => ({
						petId: itemID(name),
						costOption: [new Bank().add(itemID('Sanguine dust'))]
					}))
				]
			}
		]
	},
	{
		base: itemID("Tumeken's guardian"),
		randomForms: toaGuardianPetIds,
		metamorphs: [
			{
				random: async (user, currentPetId) => {
					const unlocked = (await fetchUserStats(user.id)).unlocked_toa_pets;
					const eligible = [
						itemID("Tumeken's guardian"),
						...unlocked.filter(id => toaGuardianPetIds.includes(id))
					];
					return eligible.filter(id => id !== currentPetId);
				},
				cost: [
					{
						petId: itemID("Tumeken's damaged guardian"),
						costOption: [new Bank().add(itemID('Ancient remnant'))]
					},
					{
						petId: itemID("Elidinis' damaged guardian"),
						costOption: [new Bank().add(itemID('Ancient remnant'))]
					}
				]
			}
		]
	},
	{
		base: itemID('Rift guardian'),
		costNotice:
			"This is a temporary cost while we're considering how best to handle Rift guardian metamorph mechanics.",
		metamorphs: [
			{
				cost: [
					'Air',
					'Mind',
					'Water',
					'Earth',
					'Fire',
					'Body',
					'Cosmic',
					'Chaos',
					'Nature',
					'Law',
					'Death',
					'Soul',
					'Astral',
					'Blood',
					'Wrath'
				].map(rune => ({
					petId: itemID(`Rift guardian (${rune.toLowerCase()})`),
					costOption: [new Bank().add(`${rune} rune`, 10_000).add('Coins', 1_000_000).freeze()]
				}))
			}
		]
	},
	{
		base: itemID('Giant squirrel'),
		metamorphs: [
			{
				cost: [
					{ petId: itemID('Dark squirrel'), costOption: [new Bank().add(itemID('Dark acorn'))] },
					{ petId: itemID('Bone squirrel'), costOption: [new Bank().add(itemID('Calcified acorn'))] }
				]
			}
		]
	},
	{ base: itemID('Youngllef'), metamorphs: [{ random: [{ petId: itemID('Corrupted youngllef'), chance: 1 }] }] }
];

export const petIdsFromVariations = allPetVariations.flatMap(variation => [
	variation.base,
	...variation.metamorphs.flatMap(morph => [
		...(Array.isArray(morph.random) ? morph.random.map(pet => pet.petId) : []),
		...(morph.cost ?? []).map(pet => pet.petId)
	])
]);

export function getPetVariation(petId: number) {
	return allPetVariations.find(
		variation =>
			variation.base === petId ||
			variation.randomForms?.includes(petId) ||
			variation.metamorphs.some(
				morph =>
					(Array.isArray(morph.random) && morph.random.some(pet => pet.petId === petId)) ||
					morph.cost?.some(pet => pet.petId === petId)
			)
	);
}

export async function petMetamorphRandom(
	currentPetId: number,
	rng: RNGProvider,
	user?: MUser,
	randomRolls = 1
): Promise<number | false> {
	const variation = getPetVariation(currentPetId);
	if (!variation) return false;
	const isBase = currentPetId === variation.base;
	const availableMorphs = variation.metamorphs.filter(
		entry => !entry.requirement || (user && entry.requirement(user, currentPetId))
	);
	const random = availableMorphs.find(({ random }) =>
		Array.isArray(random)
			? random.some(pet => pet.petId === currentPetId)
			: typeof random === 'function' && (isBase || variation.randomForms?.includes(currentPetId))
	)?.random;
	if (typeof random === 'function') {
		if (!user) return false;
		const entries = (await random(user, currentPetId)).filter(petId => petId !== currentPetId);
		return entries.length > 0 ? rng.pick(entries) : false;
	}
	const entries =
		random ?? (isBase ? availableMorphs.flatMap(entry => (Array.isArray(entry.random) ? entry.random : [])) : []);
	const weightedEntries = entries.filter(pet => pet.petId !== currentPetId);
	const commonEntries = weightedEntries.filter(pet => pet.chance === 1);
	if (commonEntries.length === 0) return false;
	const rareEntries = weightedEntries.filter(pet => pet.chance > 1);
	for (let roll = 0; roll < randomRolls; roll++) {
		for (const pet of rareEntries) {
			if (rng.roll(pet.chance)) return pet.petId;
		}
	}
	return rng.pick(commonEntries).petId;
}

export function beaverPetRecolorsUnlocked(user: MUser): boolean {
	return user.bitfield.includes(BitField.FUNKY_SHAPED_LOG_USED);
}
