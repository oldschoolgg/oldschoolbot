import { GearStat } from '@oldschoolgg/gear';
import { stringMatches, Time } from '@oldschoolgg/toolkit';
import { Bank, deepResolveItems, EMonster, itemID, Monsters, NIGHTMARES_HP, resolveItems } from 'oldschooljs';

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
import { QuestID } from '@/lib/minions/data/quests.js';
import type { KillableMonster } from '@/lib/minions/types.js';

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
		id: Monsters.MoonsofPeril.id,
		name: Monsters.MoonsofPeril.name,
		aliases: Monsters.MoonsofPeril.aliases,
		timeToFinish: Time.Minute * 12,
		table: Monsters.MoonsofPeril,
		wildy: false,

		difficultyRating: 4,
		notifyDrops: resolveItems([]),
		qpRequired: 0,
		requiredQuests: [QuestID.ChildrenOfTheSun],
		equippedItemBoosts: [
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Torva full helm') },
					{ boostPercent: 5, itemID: itemID('Oathplate helm') },
					{ boostPercent: 4, itemID: itemID('Justiciar faceguard') },
					{ boostPercent: 4, itemID: itemID('Serpentine helm') },
					{ boostPercent: 3, itemID: itemID('Neitiznot faceguard') },
					{ boostPercent: 2, itemID: itemID("Dharok's helm") },
					{ boostPercent: 2, itemID: itemID("Guthan's helm") },
					{ boostPercent: 2, itemID: itemID("Torag's helm") },
					{ boostPercent: 2, itemID: itemID("Verac's helm") },
					{ boostPercent: 1, itemID: itemID('Blood moon helm') },
					{ boostPercent: 1, itemID: itemID('Helm of neitiznot') },
					{ boostPercent: 1, itemID: itemID('Berserker helm') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Torva platebody') },
					{ boostPercent: 5, itemID: itemID('Oathplate chest') },
					{ boostPercent: 4, itemID: itemID('Justiciar chestguard') },
					{ boostPercent: 3, itemID: itemID('Bandos chestplate') },
					{ boostPercent: 2, itemID: itemID("Dharok's platebody") },
					{ boostPercent: 2, itemID: itemID("Guthan's platebody") },
					{ boostPercent: 2, itemID: itemID("Torag's platebody") },
					{ boostPercent: 2, itemID: itemID("Verac's brassard") },
					{ boostPercent: 1, itemID: itemID('Fighter torso') },
					{ boostPercent: 1, itemID: itemID("Verac's brassard") },
					{ boostPercent: 1, itemID: itemID('Dragon chainbody') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Torva platelegs') },
					{ boostPercent: 5, itemID: itemID('Oathplate legs') },
					{ boostPercent: 4, itemID: itemID('Justiciar legguards') },
					{ boostPercent: 3, itemID: itemID('Bandos tassets') },
					{ boostPercent: 2, itemID: itemID("Dharok's platelegs") },
					{ boostPercent: 2, itemID: itemID("Guthan's chainskirt") },
					{ boostPercent: 2, itemID: itemID("Torag's platelegs") },
					{ boostPercent: 2, itemID: itemID("Verac's plateskirt") },
					{ boostPercent: 1, itemID: itemID('Dragon platelegs') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Infernal cape') },
					{ boostPercent: 3, itemID: itemID('Fire cape') },
					{ boostPercent: 2, itemID: itemID('Mythical cape') },
					{ boostPercent: 1, itemID: itemID('Obsidian cape') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ferocious gloves') },
					{ boostPercent: 4, itemID: itemID('Barrows gloves') },
					{ boostPercent: 3, itemID: itemID('Dragon gloves') },
					{ boostPercent: 2, itemID: itemID('Rune gloves') },
					{ boostPercent: 1, itemID: itemID('Regen bracelet') },
					{ boostPercent: 1, itemID: itemID('Granite gloves') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Avernic treads (max)') },
					{ boostPercent: 4, itemID: itemID('Avernic treads (pr)(et)') },
					{ boostPercent: 4, itemID: itemID('Avernic treads (pr)(pe)') },
					{ boostPercent: 4, itemID: itemID('Avernic treads (pr)') },
					{ boostPercent: 3, itemID: itemID('Primordial boots') },
					{ boostPercent: 2, itemID: itemID('Echo boots') },
					{ boostPercent: 1, itemID: itemID('Dragon boots') },
					{ boostPercent: 1, itemID: itemID('Guardian boots') },
					{ boostPercent: 1, itemID: itemID('Granite boots') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Amulet of rancour') },
					{ boostPercent: 4, itemID: itemID('Amulet of torture') },
					{ boostPercent: 4, itemID: itemID('Amulet of fury') },
					{ boostPercent: 3, itemID: itemID('Amulet of strength') },
					{ boostPercent: 2, itemID: itemID('Amulet of glory') },
					{ boostPercent: 1, itemID: itemID('Amulet of power') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ultor ring') },
					{ boostPercent: 4, itemID: itemID('Berserker ring (i)') },
					{ boostPercent: 3, itemID: itemID('Ring of suffering (ri)') },
					{ boostPercent: 3, itemID: itemID('Steel ring') },
					{ boostPercent: 2, itemID: itemID('Lightbearer') },
					{ boostPercent: 1, itemID: itemID('Brimstone ring') },
					{ boostPercent: 1, itemID: itemID('Warrior ring (i)') }
				],
				gearSetup: 'melee',
				required: true
			},
			{
				items: [
					{ boostPercent: 2, itemID: itemID("Ghommal's lucky penny") },
					{ boostPercent: 2, itemID: itemID("Rada's blessing 4") },
					{ boostPercent: 1, itemID: itemID('Holy blessing') },
					{ boostPercent: 1, itemID: itemID('Unholy blessing') },
					{ boostPercent: 1, itemID: itemID('Peaceful blessing') },
					{ boostPercent: 1, itemID: itemID('Honourable blessing') },
					{ boostPercent: 1, itemID: itemID('War blessing') },
					{ boostPercent: 1, itemID: itemID('Ancient blessing') },
					{ boostPercent: 1, itemID: itemID("Rada's blessing 3") },
					{ boostPercent: 1, itemID: itemID("Rada's blessing 2") }
				],
				gearSetup: 'melee',
				required: false
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Avernic defender') },
					{ boostPercent: 5, itemID: itemID('Dragonfire shield') },
					{ boostPercent: 4, itemID: itemID('Dragon defender') },
					{ boostPercent: 3, itemID: itemID('Toktz-ket-xil') },
					{ boostPercent: 2, itemID: itemID('Rune defender') },
					{ boostPercent: 2, itemID: itemID('Blessed spirit shield') },
					{ boostPercent: 2, itemID: itemID('Dragon sq shield') },
					{ boostPercent: 2, itemID: itemID('Crystal shield') },
					{ boostPercent: 1, itemID: itemID('Rune kiteshield') }
				],
				gearSetup: 'melee',
				required: false
			}
		],
		itemInBankBoosts: [
			// ECLIPSE MOON
			{
				[itemID('Soulreaper axe')]: 5,
				[itemID('Ghrazi rapier')]: 4,
				[itemID('Blade of saeldor')]: 3,
				[itemID('Noxious halberd')]: 3,
				[itemID('Voidwaker')]: 2,
				[itemID("Osmumten's fang")]: 2,
				[itemID('Zamorakian hasta')]: 2,
				[itemID('Abyssal dagger')]: 2,
				[itemID('Zombie axe')]: 1,
				[itemID('Dragon sword')]: 1,
				[itemID('Arkan blade')]: 1,
				[itemID('Dragon hasta')]: 1,
				[itemID('Abyssal whip')]: 1
			},
			// BLUE MOON
			{
				[itemID('Dual macuahuitl')]: 5,
				[itemID('Glacial temotli')]: 4,
				[itemID("Inquisitor's mace")]: 3,
				[itemID('Soulreaper axe')]: 3,
				[itemID('Ursine chainmace (u)')]: 2,
				[itemID('Zamorakian hasta')]: 2,
				[itemID('Abyssal bludgeon')]: 2,
				[itemID('Sarachnis cudgel')]: 1,
				[itemID('Zombie axe')]: 1,
				[itemID("Torag's hammers")]: 1
			},
			// BLOOD MOON
			{
				[itemID('Soulreaper axe')]: 5,
				[itemID('Noxious halberd')]: 4,
				[itemID('Blade of saeldor')]: 3,
				[itemID('Ghrazi rapier')]: 2,
				[itemID('Abyssal tentacle')]: 2,
				[itemID('Abyssal whip')]: 2,
				[itemID('Sulphur blades')]: 2,
				[itemID('Zombie axe')]: 1,
				[itemID('Zamorakian hasta')]: 1,
				[itemID('Dragon scimitar')]: 1,
				[itemID('Arkan blade')]: 1
			},
			// SPEC WEAPON
			{
				[itemID('Voidwaker')]: 5,
				[itemID('Crystal halberd')]: 5,
				[itemID('Dragon claws')]: 4,
				[itemID('Dragon dagger')]: 2,
				[itemID('Burning claws')]: 2,
				[itemID('Dragon mace')]: 2,
				[itemID('Abyssal dagger')]: 2
			}
		],
		degradeableItemUsage: [
			{
				required: false,
				gearSetup: 'melee',
				items: [
					{
						itemID: itemID('Scythe of vitur'),
						boostPercent: 10
					}
				]
			}
		],
		levelRequirements: {
			attack: 70,
			strength: 70,
			defence: 70,
			prayer: 70,
			herblore: 66,
			cooking: 50,
			fishing: 50,
			hunter: 50
		},
		defaultAttackStyles: ['attack', 'magic', 'ranged'],
		customMonsterHP: 1500,
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

type EffectiveMonster = {
	id: number;
	name: string;
	aliases: string[];
	emoji?: string;
};

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
] satisfies EffectiveMonster[];

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
