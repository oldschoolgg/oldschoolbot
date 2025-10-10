import { stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, deepResolveItems, EMonster, itemID, Monsters, NIGHTMARES_HP, resolveItems } from 'oldschooljs';
import { GearStat } from 'oldschooljs/gear';

import { bossKillables } from '@/lib/minions/data/killableMonsters/bosses/index.js';
import { camdozaalMonsters } from '@/lib/minions/data/killableMonsters/camdozaalMonsters.js';
import { chaeldarMonsters } from '@/lib/minions/data/killableMonsters/chaeldarMonsters.js';
import { creatureCreationCreatures } from '@/lib/minions/data/killableMonsters/creatureCreation.js';
import { konarMonsters } from '@/lib/minions/data/killableMonsters/konarMonsters.js';
import { krystiliaMonsters } from '@/lib/minions/data/killableMonsters/krystiliaMonsters.js';
import { lowKillableMonsters } from '@/lib/minions/data/killableMonsters/low.js';
import { mazchnaMonsters } from '@/lib/minions/data/killableMonsters/mazchnaMonsters.js';
import { nieveMonsters } from '@/lib/minions/data/killableMonsters/nieveMonsters.js';
import { reanimatedMonsters } from '@/lib/minions/data/killableMonsters/reanimated.js';
import { revenantMonsters } from '@/lib/minions/data/killableMonsters/revs.js';
import { turaelMonsters } from '@/lib/minions/data/killableMonsters/turaelMonsters.js';
import { vannakaMonsters } from '@/lib/minions/data/killableMonsters/vannakaMonsters.js';
import type { KillableMonster } from '@/lib/minions/types.js';

// Use a negative sentinel so the synthetic Dagannoth Kings (tribrid) entry doesn't
// collide with any future OldSchoolJS monster IDs.
export const DagannothKingsTribridID = -30_001;

const killableMonsters: KillableMonster[] = [
	...bossKillables,
	...chaeldarMonsters,
	...konarMonsters,
	...krystiliaMonsters,
	...camdozaalMonsters,
	...mazchnaMonsters,
	...nieveMonsters,
	...turaelMonsters,
	...vannakaMonsters,
	...lowKillableMonsters,
	...revenantMonsters,
	...creatureCreationCreatures,
	...reanimatedMonsters,
	{
		id: Monsters.Barrows.id,
		name: Monsters.Barrows.name,
		aliases: Monsters.Barrows.aliases,
		timeToFinish: Time.Minute * 4.15,
		table: Monsters.Barrows,
		emoji: '<:Dharoks_helm:403038864199122947>',
		wildy: false,

		difficultyRating: 4,
		itemsRequired: resolveItems([]),
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		itemInBankBoosts: [
			{ [itemID('Barrows gloves')]: 2 },
			{
				[itemID("Iban's staff")]: 5,
				[itemID('Warped sceptre (uncharged)')]: 6,
				[itemID('Harmonised nightmare staff')]: 7,
				[itemID("Tumeken's shadow")]: 10
			},
			{ [itemID('Strange old lockpick')]: 7 }
		],
		levelRequirements: {
			prayer: 43
		},
		pohBoosts: {
			pool: {
				'Rejuvenation pool': 10,
				'Fancy rejuvenation pool': 10,
				'Ornate rejuvenation pool': 10
			}
		},
		defaultAttackStyles: ['attack', 'magic', 'ranged'],
		customMonsterHP: 600,
		combatXpMultiplier: 1.09
	},
	{
		id: Monsters.DagannothPrime.id,
		name: Monsters.DagannothPrime.name,
		aliases: Monsters.DagannothPrime.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothPrime,
		emoji: '<:Pet_dagannoth_prime:324127376877289474>',
		wildy: false,

		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth prime']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Armadyl chestplate')]: 2,
				[itemID('Masori body (f)')]: 4
			},
			{
				[itemID('Armadyl chainskirt')]: 2,
				[itemID('Masori chaps (f)')]: 4
			},
			{
				[itemID('Twisted bow')]: 6
			}
		],
		levelRequirements: {
			prayer: 43
		},
		combatXpMultiplier: 1.3,
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackMagic]
	},
	{
		id: Monsters.DagannothRex.id,
		name: Monsters.DagannothRex.name,
		aliases: Monsters.DagannothRex.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothRex,
		emoji: '<:Pet_dagannoth_rex:324127377091330049>',
		wildy: false,

		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Torva platebody', 'Bandos chestplate', "Torag's platebody"],
			['Torva platelegs', 'Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth rex']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID("Iban's staff")]: 3,
				[itemID('Warped sceptre (uncharged)')]: 4,
				[itemID('Harmonised nightmare staff')]: 5
			},
			{
				[itemID('Occult necklace')]: 5
			}
		],
		levelRequirements: {
			prayer: 43
		},
		combatXpMultiplier: 1.3,
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackSlash]
	},
	{
		id: Monsters.DagannothSupreme.id,
		name: Monsters.DagannothSupreme.name,
		aliases: Monsters.DagannothSupreme.aliases,
		timeToFinish: Time.Minute * 1.9,
		table: Monsters.DagannothSupreme,
		emoji: '<:Pet_dagannoth_supreme:324127377066164245>',
		wildy: false,

		difficultyRating: 5,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Bandos chestplate', "Torag's platebody", 'Torva platebody'],
			['Bandos tassets', "Torag's platelegs", 'Torva platelegs']
		]),
		notifyDrops: resolveItems(['Pet dagannoth supreme']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Bandos chestplate')]: 2,
				[itemID('Torva platebody')]: 2
			},
			{
				[itemID('Bandos tassets')]: 2,
				[itemID('Torva platelegs')]: 2
			},
			{
				[itemID('Saradomin godsword')]: 4,
				[itemID('Dragon claws')]: 6
			}
		],
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 100,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackRanged]
	},
	{
		id: DagannothKingsTribridID,
		name: 'Dagannoth Kings (tribrid)',
		aliases: ['dagannoth kings (tribrid)', 'dagannoth kings tribrid', 'dagnnoth kings (tribrid)', 'dks tribrid'],
		timeToFinish: Time.Minute * 1.9 * 3 * 0.95, // 3x the time but 5% faster for tribrid
		table: {
			kill(quantity: number, options) {
				const loot = new Bank();
				for (let i = 0; i < quantity; i++) {
					loot.add(Monsters.DagannothSupreme.kill(1, options));
					loot.add(Monsters.DagannothRex.kill(1, options));
					loot.add(Monsters.DagannothPrime.kill(1, options));
				}
				return loot;
			}
		},
		emoji: '<:Dagannoth:324127377305976852>',
		wildy: false,

		difficultyRating: 6,
		itemsRequired: deepResolveItems([
			"Guthan's platebody",
			"Guthan's chainskirt",
			"Guthan's helm",
			"Guthan's warspear",
			['Armadyl chestplate', "Karil's leathertop"],
			['Armadyl chainskirt', "Karil's leatherskirt"],
			['Torva platebody', 'Bandos chestplate', "Torag's platebody"],
			['Torva platelegs', 'Bandos tassets', "Torag's platelegs"]
		]),
		notifyDrops: resolveItems(['Pet dagannoth supreme', 'Pet dagannoth rex', 'Pet dagannoth prime']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Armadyl chestplate')]: 2 / 3,
				[itemID('Masori body (f)')]: 4 / 3
			},
			{
				[itemID('Armadyl chainskirt')]: 2 / 3,
				[itemID('Masori chaps (f)')]: 4 / 3
			},
			{
				[itemID('Twisted bow')]: 6 / 3
			},
			{
				[itemID("Iban's staff")]: 3 / 3,
				[itemID('Warped sceptre (uncharged)')]: 4 / 3,
				[itemID('Harmonised nightmare staff')]: 5 / 3
			},
			{
				[itemID('Occult necklace')]: 5 / 3
			},
			{
				[itemID('Bandos chestplate')]: 2 / 3,
				[itemID('Torva platebody')]: 2 / 3
			},
			{
				[itemID('Bandos tassets')]: 2 / 3,
				[itemID('Torva platelegs')]: 2 / 3
			},
			{
				[itemID('Saradomin godsword')]: 4 / 3,
				[itemID('Dragon claws')]: 6 / 3
			}
		],
		levelRequirements: {
			prayer: 43
		},
		healAmountNeeded: 300,
		attackStylesUsed: [GearStat.AttackSlash, GearStat.AttackMagic, GearStat.AttackRanged],
		defaultAttackStyles: ['attack', 'magic', 'ranged'],
		customMonsterHP: 765,
		combatXpMultiplier: 1.2 // 1.3x for Rex and Supreme, 1x for Prime, averaged out
	},
	{
		id: Monsters.Man.id,
		name: Monsters.Man.name,
		aliases: Monsters.Man.aliases,
		timeToFinish: Time.Second * 4.7,
		table: Monsters.Man,
		emoji: '🧍‍♂️',
		wildy: false,
		difficultyRating: 0,
		qpRequired: 0,
		defaultAttackStyles: ['attack']
	},
	{
		id: Monsters.Guard.id,
		name: Monsters.Guard.name,
		aliases: Monsters.Guard.aliases,
		timeToFinish: Time.Second * 7.4,
		table: Monsters.Guard,
		wildy: false,
		difficultyRating: 0,
		qpRequired: 0,
		canCannon: true,
		cannonMulti: true
	},
	{
		id: Monsters.Woman.id,
		name: Monsters.Woman.name,
		aliases: Monsters.Woman.aliases,
		timeToFinish: Time.Second * 4.69,
		table: Monsters.Woman,
		emoji: '🧍‍♀️',
		wildy: false,
		difficultyRating: 0,
		qpRequired: 0
	},
	{
		id: Monsters.Sarachnis.id,
		name: Monsters.Sarachnis.name,
		aliases: Monsters.Sarachnis.aliases,
		timeToFinish: Time.Minute * 1.63,
		table: Monsters.Sarachnis,
		emoji: '<:Sraracha:608231007803670529>',
		wildy: false,
		difficultyRating: 5,
		notifyDrops: resolveItems(['Sraracha', 'Jar of eyes']),
		qpRequired: 0,
		itemInBankBoosts: [
			{
				[itemID('Dragon claws')]: 5
			},
			{
				[itemID('Abyssal bludgeon')]: 8,
				[itemID("Inquisitor's mace")]: 12,
				[itemID('Scythe of vitur')]: 15
			},
			{
				[itemID('Masori body (f)')]: 4,
				[itemID("Karil's leathertop")]: 3
			},
			{
				[itemID('Masori chaps (f)')]: 3,
				[itemID("Karil's leatherskirt")]: 2
			},
			// Transformation ring
			{
				[itemID('Aranea boots')]: 10,
				[itemID('Ring of stone')]: 10
			}
		],
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems(['Sraracha', 'Jar of eyes', 'Giant egg sac(full)', 'Sarachnis cudgel']),
		healAmountNeeded: 9 * 20,
		attackStyleToUse: GearStat.AttackCrush,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackRanged],
		minimumGearRequirements: {
			melee: {
				[GearStat.DefenceRanged]: 57 + 120,
				[GearStat.DefenceStab]: 47 + 26,
				[GearStat.AttackCrush]: 65
			}
		}
	},
	{
		id: Monsters.PriffRabbit.id,
		name: Monsters.PriffRabbit.name,
		aliases: Monsters.PriffRabbit.aliases,
		timeToFinish: Time.Hour,
		table: Monsters.PriffRabbit,
		emoji: '',
		wildy: false,

		difficultyRating: 10,
		qpRequired: 205,
		levelRequirements: {
			prayer: 43
		},
		uniques: resolveItems(['Crystal grail']),
		healAmountNeeded: 400 * 20,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackStab, GearStat.AttackRanged],
		minimumGearRequirements: {
			range: {
				[GearStat.AttackRanged]: 20 + 33 + 10 + 94 + 8
			}
		},
		itemCost: { itemCost: new Bank().add('Stamina potion(4)', 5).add('Ruby dragon bolts (e)', 100), qtyPerKill: 1 }
	},
	{
		id: Monsters.DerangedArchaeologist.id,
		name: Monsters.DerangedArchaeologist.name,
		aliases: Monsters.DerangedArchaeologist.aliases,
		timeToFinish: Time.Minute,
		table: Monsters.DerangedArchaeologist,
		emoji: '',
		wildy: false,

		difficultyRating: 5,
		qpRequired: 50,
		itemInBankBoosts: [{ [itemID('Occult necklace')]: 10 }],
		defaultAttackStyles: ['magic'],
		healAmountNeeded: 4 * 20,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackRanged, GearStat.AttackMagic]
	}
];

export const NightmareMonster: KillableMonster = {
	id: 9415,
	name: 'The Nightmare',
	aliases: ['nightmare', 'the nightmare'],
	timeToFinish: Time.Minute * 20,
	table: Monsters.GeneralGraardor,
	emoji: '<:Little_nightmare:758149284952014928>',
	wildy: false,
	difficultyRating: 7,
	notifyDrops: resolveItems([
		'Little nightmare',
		'Jar of dreams',
		'Nightmare staff',
		"Inquisitor's great helm",
		"Inquisitor's hauberk",
		"Inquisitor's plateskirt",
		"Inquisitor's mace",
		'Eldritch orb',
		'Harmonised orb',
		'Volatile orb',
		'Parasitic egg'
	]),
	qpRequired: 10,
	groupKillable: true,
	respawnTime: Time.Minute * 0.5,
	levelRequirements: {
		prayer: 43
	},
	uniques: resolveItems([
		'Little nightmare',
		'Jar of dreams',
		'Nightmare staff',
		"Inquisitor's great helm",
		"Inquisitor's hauberk",
		"Inquisitor's plateskirt",
		"Inquisitor's mace",
		'Eldritch orb',
		'Harmonised orb',
		'Volatile orb'
	]),
	healAmountNeeded: 40 * 20,
	attackStyleToUse: GearStat.AttackCrush,
	attackStylesUsed: [GearStat.AttackSlash],
	minimumGearRequirements: {
		melee: {
			[GearStat.DefenceSlash]: 100,
			[GearStat.AttackCrush]: 80
		}
	},
	customMonsterHP: NIGHTMARES_HP
};

export default killableMonsters;

export const effectiveMonsters = [
	...killableMonsters,
	NightmareMonster,
	{
		name: 'Zalcano',
		aliases: ['zalcano'],
		id: EMonster.ZALCANO,
		emoji: '<:Smolcano:604670895113633802>'
	},
	{ name: 'TzTok-Jad', aliases: ['jad'], id: 3127, emoji: '<:Tzrekjad:324127379188613121>' },
	{ name: 'Mimic', aliases: ['mimic'], id: 23_184, emoji: '<:Tangleroot:324127378978635778>' },
	{ name: 'Hespori', aliases: ['hespori'], id: 8583, emoji: '<:Casket:365003978678730772>' },
	{
		name: "Phosani's Nightmare",
		aliases: ['phosani', 'phosanis nightmare'],
		id: EMonster.PHOSANI_NIGHTMARE
	},
	{
		name: 'Nex',
		aliases: ['nex'],
		id: EMonster.NEX
	}
];

export const allKillableMonsterIDs = new Set(effectiveMonsters.map(m => m.id));

export const wikiMonsters = killableMonsters
	.filter(m => m.equippedItemBoosts || m.itemInBankBoosts || m.itemCost || m.requiredQuests)
	.filter(m => ['Revenant', 'Reanim'].every(b => !m.name.includes(b)))
	.sort((a, b) => a.name.localeCompare(b.name));

const otherMonsters = [
	{
		id: -1,
		name: 'Tempoross',
		aliases: ['temp', 'tempoross'],
		link: '/skills/fishing/tempoross/'
	},
	...["Phosani's Nightmare", 'Mass Nightmare', 'Solo Nightmare'].map(s => ({
		id: -1,
		name: s,
		aliases: [s.toLowerCase()],
		link: `/bosses/the-nightmare/${stringMatches(s.split(' ')[0], "Phosani's") ? '#phosanis-nightmare' : ''}`
	})),
	{
		name: 'Nex',
		aliases: ['nex'],
		id: EMonster.NEX,
		link: '/bosses/nex/'
	},
	{
		name: 'Zalcano',
		aliases: ['zalcano'],
		id: EMonster.ZALCANO,
		emoji: '<:Smolcano:604670895113633802>',
		link: '/miscellaneous/zalcano/'
	},
	{
		name: 'Wintertodt',
		aliases: ['wt', 'wintertodt', 'todt'],
		id: -1,
		emoji: '<:Phoenix:324127378223792129>',
		link: '/activities/wintertodt/'
	},
	{
		name: 'Colosseum',
		aliases: ['colo', 'colosseum'],
		id: -1,
		link: '/bosses/colosseum/'
	}
];

export const autocompleteMonsters = [...killableMonsters, ...otherMonsters];
