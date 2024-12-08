import { Time, roll } from 'e';
import { Bank, Monsters } from 'oldschooljs';

import { deepResolveItems, resolveItems } from 'oldschooljs/dist/util/util';
import { dukeSucellusCL, theLeviathanCL, theWhispererCL, vardorvisCL } from '../../../../data/CollectionsExport';
import { GearStat } from '../../../../gear/types';
import { SkillsEnum } from '../../../../skilling/types';
import { getOSItem } from '../../../../util/getOSItem';
import itemID from '../../../../util/itemID';
import type { KillableMonster, KillableMonsterEffect } from '../../../types';
import { QuestID } from '../../quests';

const awakenedDeathProps = {
	hardness: 0.9,
	steepness: 0.1,
	lowestDeathChance: 50,
	highestDeathChance: 95
};

function makeTabletEffect(itemName: string): KillableMonster['effect'] {
	const item = getOSItem(itemName);
	return ({ quantity, gearBank }: Parameters<KillableMonsterEffect>['0']): ReturnType<KillableMonsterEffect> => {
		if (gearBank.bank.has(item)) return;
		let gotTab = false;
		for (let i = 0; i < quantity; i++) {
			if (roll(25)) {
				gotTab = true;
				break;
			}
		}
		if (!gotTab) return;
		return {
			messages: [`You got a ${item.name}!`],
			loot: new Bank().add(item)
		};
	};
}

export const desertTreasureKillableBosses: KillableMonster[] = [
	{
		id: Monsters.DukeSucellus.id,
		name: Monsters.DukeSucellus.name,
		aliases: Monsters.DukeSucellus.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.DukeSucellus,
		notifyDrops: resolveItems(['Virtus robe top', 'Baron', 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID('Avernic defender') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Ferocious gloves') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Primordial boots') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva full helm') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platebody') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platelegs') }],
				gearSetup: 'melee'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Bellator ring') },
					{ boostPercent: 5, itemID: itemID('Ultor ring') }
				],
				gearSetup: 'melee'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: dukeSucellusCL,
		itemsRequired: deepResolveItems([
			['Torva platebody', 'Bandos chestplate'],
			['Torva platelegs', 'Bandos tassets']
		]),
		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		effect: makeTabletEffect('Frozen tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		degradeableItemUsage: [
			{
				required: false,
				gearSetup: 'melee',
				items: [
					{
						itemID: itemID('Scythe of vitur'),
						boostPercent: 15
					}
				]
			}
		],
		deathProps: {
			hardness: 0.6,
			steepness: 0.99
		}
	},
	{
		id: Monsters.AwakenedDukeSucellus.id,
		name: Monsters.AwakenedDukeSucellus.name,
		aliases: Monsters.AwakenedDukeSucellus.aliases,
		timeToFinish: Time.Minute * 15.5,
		table: Monsters.AwakenedDukeSucellus,
		notifyDrops: resolveItems(['Virtus robe top', 'Baron', 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID('Ferocious gloves') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Primordial boots') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva full helm') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platebody') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platelegs') }],
				gearSetup: 'melee'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Bellator ring') },
					{ boostPercent: 5, itemID: itemID('Ultor ring') }
				],
				gearSetup: 'melee'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: dukeSucellusCL,
		itemsRequired: deepResolveItems([
			['Torva platebody', 'Bandos chestplate'],
			['Torva platelegs', 'Bandos tassets']
		]),
		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20 * 2.5,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		effect: makeTabletEffect('Frozen tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		degradeableItemUsage: [
			{
				required: true,
				gearSetup: 'melee',
				items: [
					{
						itemID: itemID('Scythe of vitur'),
						boostPercent: 15
					}
				]
			}
		],
		itemCost: {
			itemCost: new Bank().add("Awakener's orb"),
			qtyPerKill: 1
		},
		deathProps: awakenedDeathProps
	},
	{
		id: Monsters.TheLeviathan.id,
		name: Monsters.TheLeviathan.name,
		aliases: Monsters.TheLeviathan.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.TheLeviathan,
		notifyDrops: resolveItems(['Virtus robe top', "Lil'viathan", 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID('Twisted buckler') }],
				gearSetup: 'range'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Zaryte vambraces') }],
				gearSetup: 'range'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Pegasian boots') }],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Masori mask (f)') },
					{ boostPercent: 4, itemID: itemID('Masori mask') }
				],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Masori body (f)') },
					{ boostPercent: 4, itemID: itemID('Masori body') }
				],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Masori chaps (f)') },
					{ boostPercent: 4, itemID: itemID('Masori chaps') }
				],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Lightbearer') },
					{ boostPercent: 5, itemID: itemID('Venator ring') }
				],
				gearSetup: 'range'
			},
			{
				items: [{ boostPercent: 5, itemID: itemID('Zaryte crossbow') }],
				gearSetup: 'range'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: theLeviathanCL,
		itemsRequired: deepResolveItems([
			['Masori body', 'Armadyl chestplate'],
			['Masori chaps', 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Ranged],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20 * 2.5,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged],
		effect: makeTabletEffect('Scarred tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		deathProps: {
			hardness: 0.6,
			steepness: 0.99
		}
	},
	{
		id: Monsters.AwakenedTheLeviathan.id,
		name: Monsters.AwakenedTheLeviathan.name,
		aliases: Monsters.AwakenedTheLeviathan.aliases,
		timeToFinish: Time.Minute * 15.5,
		table: Monsters.AwakenedTheLeviathan,
		notifyDrops: resolveItems(['Virtus robe top', "Lil'viathan", 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID('Twisted buckler') }],
				gearSetup: 'range'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Zaryte vambraces') }],
				gearSetup: 'range'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Pegasian boots') }],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Masori mask (f)') },
					{ boostPercent: 4, itemID: itemID('Masori mask') }
				],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Masori body (f)') },
					{ boostPercent: 4, itemID: itemID('Masori body') }
				],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Masori chaps (f)') },
					{ boostPercent: 4, itemID: itemID('Masori chaps') }
				],
				gearSetup: 'range'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Lightbearer') },
					{ boostPercent: 5, itemID: itemID('Venator ring') }
				],
				gearSetup: 'range'
			},
			{
				items: [{ boostPercent: 5, itemID: itemID('Zaryte crossbow') }],
				gearSetup: 'range'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: theLeviathanCL,
		itemsRequired: deepResolveItems([
			['Masori body', 'Armadyl chestplate'],
			['Masori chaps', 'Armadyl chainskirt']
		]),
		defaultAttackStyles: [SkillsEnum.Ranged],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20,
		attackStyleToUse: GearStat.AttackRanged,
		attackStylesUsed: [GearStat.AttackRanged],
		effect: makeTabletEffect('Scarred tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		itemCost: {
			itemCost: new Bank().add("Awakener's orb"),
			qtyPerKill: 1
		},
		deathProps: awakenedDeathProps
	},
	{
		id: Monsters.TheWhisperer.id,
		name: Monsters.TheWhisperer.name,
		aliases: Monsters.TheWhisperer.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.TheWhisperer,
		notifyDrops: resolveItems(['Virtus robe top', 'Wisp', 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID("Elidinis' ward (f)") }],
				gearSetup: 'mage'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Tormented bracelet') }],
				gearSetup: 'mage'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Eternal boots') }],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ancestral hat') },
					{ boostPercent: 3, itemID: itemID('Virtus mask') }
				],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ancestral robe top') },
					{ boostPercent: 3, itemID: itemID('Virtus robe top') }
				],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ancestral robe bottom') },
					{ boostPercent: 3, itemID: itemID('Virtus robe bottom') }
				],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Magus ring') },
					{ boostPercent: 5, itemID: itemID('Lightbearer') }
				],
				gearSetup: 'mage'
			},
			{
				items: [{ boostPercent: 5, itemID: itemID("Tumeken's shadow") }],
				gearSetup: 'mage'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: theWhispererCL,
		itemsRequired: deepResolveItems([
			['Ancestral robe top', 'Virtus robe top', "Ahrim's robetop"],
			['Ancestral robe bottom', 'Virtus robe bottom', "Ahrim's robeskirt"]
		]),
		defaultAttackStyles: [SkillsEnum.Magic],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 55 * 20,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackMagic],
		effect: makeTabletEffect('Sirenic tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		degradeableItemUsage: [
			{
				required: true,
				gearSetup: 'mage',
				items: [
					{
						itemID: itemID("Tumeken's shadow"),
						boostPercent: 15
					},
					{
						itemID: itemID('Sanguinesti staff'),
						boostPercent: 7
					}
				]
			},
			{
				required: false,
				gearSetup: 'range',
				items: [
					{
						itemID: itemID('Venator bow'),
						boostPercent: 5
					}
				]
			}
		],
		deathProps: {
			hardness: 0.6,
			steepness: 0.99
		}
	},
	{
		id: Monsters.AwakenedTheWhisperer.id,
		name: Monsters.AwakenedTheWhisperer.name,
		aliases: Monsters.AwakenedTheWhisperer.aliases,
		timeToFinish: Time.Minute * 15.5,
		table: Monsters.AwakenedTheWhisperer,
		notifyDrops: resolveItems(['Virtus robe top', 'Wisp', 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID("Elidinis' ward (f)") }],
				gearSetup: 'mage'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Tormented bracelet') }],
				gearSetup: 'mage'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Eternal boots') }],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ancestral hat') },
					{ boostPercent: 3, itemID: itemID('Virtus mask') }
				],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ancestral robe top') },
					{ boostPercent: 3, itemID: itemID('Virtus robe top') }
				],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Ancestral robe bottom') },
					{ boostPercent: 3, itemID: itemID('Virtus robe bottom') }
				],
				gearSetup: 'mage'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Magus ring') },
					{ boostPercent: 5, itemID: itemID('Lightbearer') }
				],
				gearSetup: 'mage'
			},
			{
				items: [{ boostPercent: 5, itemID: itemID("Tumeken's shadow") }],
				gearSetup: 'mage'
			}
		],
		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70,
			magic: 85
		},
		uniques: theWhispererCL,
		itemsRequired: deepResolveItems([
			['Ancestral robe top', 'Virtus robe top', "Ahrim's robetop"],
			['Ancestral robe bottom', 'Virtus robe bottom', "Ahrim's robeskirt"]
		]),
		defaultAttackStyles: [SkillsEnum.Magic],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20 * 2.5,
		attackStyleToUse: GearStat.AttackMagic,
		attackStylesUsed: [GearStat.AttackMagic],
		effect: makeTabletEffect('Sirenic tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		degradeableItemUsage: [
			{
				required: true,
				gearSetup: 'mage',
				items: [
					{
						itemID: itemID("Tumeken's shadow"),
						boostPercent: 15
					},
					{
						itemID: itemID('Sanguinesti staff'),
						boostPercent: 7
					}
				]
			},
			{
				required: false,
				gearSetup: 'range',
				items: [
					{
						itemID: itemID('Venator bow'),
						boostPercent: 5
					}
				]
			}
		],
		itemCost: {
			itemCost: new Bank().add("Awakener's orb"),
			qtyPerKill: 1
		},
		deathProps: awakenedDeathProps
	},
	{
		id: Monsters.Vardorvis.id,
		name: Monsters.Vardorvis.name,
		aliases: Monsters.Vardorvis.aliases,
		timeToFinish: Time.Minute * 5.1,
		table: Monsters.Vardorvis,
		notifyDrops: resolveItems(['Virtus robe top', 'Butch', 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID('Avernic defender') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Ferocious gloves') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Primordial boots') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva full helm') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platebody') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platelegs') }],
				gearSetup: 'melee'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Bellator ring') },
					{ boostPercent: 5, itemID: itemID('Ultor ring') }
				],
				gearSetup: 'melee'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: vardorvisCL,
		itemsRequired: deepResolveItems([
			['Torva platebody', 'Bandos chestplate'],
			['Torva platelegs', 'Bandos tassets']
		]),
		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		effect: makeTabletEffect('Strangled tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		degradeableItemUsage: [
			{
				required: false,
				gearSetup: 'melee',
				items: [
					{
						itemID: itemID('Scythe of vitur'),
						boostPercent: 15
					}
				]
			}
		],
		deathProps: {
			hardness: 0.6,
			steepness: 0.99
		}
	},
	{
		id: Monsters.AwakenedVardorvis.id,
		name: Monsters.AwakenedVardorvis.name,
		aliases: Monsters.AwakenedVardorvis.aliases,
		timeToFinish: Time.Minute * 15.5,
		table: Monsters.AwakenedVardorvis,
		notifyDrops: resolveItems(['Virtus robe top', 'Butch', 'Virtus robe bottom', 'Virtus mask']),
		qpRequired: 100,
		equippedItemBoosts: [
			{
				items: [{ boostPercent: 3, itemID: itemID('Ferocious gloves') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Primordial boots') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva full helm') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platebody') }],
				gearSetup: 'melee'
			},
			{
				items: [{ boostPercent: 3, itemID: itemID('Torva platelegs') }],
				gearSetup: 'melee'
			},
			{
				items: [
					{ boostPercent: 5, itemID: itemID('Bellator ring') },
					{ boostPercent: 5, itemID: itemID('Ultor ring') }
				],
				gearSetup: 'melee'
			}
		],

		respawnTime: Time.Minute * 1.5,
		levelRequirements: {
			prayer: 43,
			hitpoints: 70
		},
		uniques: vardorvisCL,
		itemsRequired: deepResolveItems([
			['Torva platebody', 'Bandos chestplate'],
			['Torva platelegs', 'Bandos tassets']
		]),
		defaultAttackStyles: [SkillsEnum.Attack],
		combatXpMultiplier: 1.135,
		healAmountNeeded: 45 * 20 * 2.5,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackSlash],
		effect: makeTabletEffect('Strangled tablet'),
		requiredQuests: [QuestID.DesertTreasureII],
		degradeableItemUsage: [
			{
				required: true,
				gearSetup: 'melee',
				items: [
					{
						itemID: itemID('Scythe of vitur'),
						boostPercent: 15
					}
				]
			}
		],
		itemCost: {
			itemCost: new Bank().add("Awakener's orb"),
			qtyPerKill: 1
		},
		deathProps: awakenedDeathProps
	}
];
