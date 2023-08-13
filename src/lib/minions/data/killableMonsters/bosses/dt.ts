import { Time } from 'e';
import { Monsters } from 'oldschooljs';

import { QuestID } from '../../../../../mahoji/lib/abstracted_commands/questCommand';
import { dukeSucellusCL } from '../../../../data/CollectionsExport';
import { GearStat } from '../../../../gear/types';
import { SkillsEnum } from '../../../../skilling/types';
import itemID from '../../../../util/itemID';
import resolveItems, { deepResolveItems } from '../../../../util/resolveItems';
import { KillableMonster } from '../../../types';

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
		groupKillable: true,
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
		healAmountNeeded: 20 * 20,
		attackStyleToUse: GearStat.AttackSlash,
		attackStylesUsed: [GearStat.AttackMagic],
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
		]
	}
];
