import type { activity_type_enum } from '@prisma/client';

import { ActivityGroup } from '../constants';

export function taskGroupFromActivity(type: activity_type_enum): ActivityGroup {
	switch (type) {
		case 'ClueCompletion':
			return ActivityGroup.Clue;
		case 'GroupMonsterKilling':
		case 'MonsterKilling':
			return ActivityGroup.Monster;
		case 'Fishing':
		case 'Agility':
		case 'Burying':
		case 'Offering':
		case 'Cooking':
		case 'Firemaking':
		case 'Mining':
		case 'Questing':
		case 'Runecraft':
		case 'Smelting':
		case 'Smithing':
		case 'Woodcutting':
		case 'Fletching':
		case 'Crafting':
		case 'Alching':
		case 'Sawmill':
		case 'Pickpocket':
		case 'Farming':
		case 'Herblore':
		case 'Hunter':
		case 'Birdhouse':
		case 'Construction':
		case 'Enchanting':
		case 'Casting':
		case 'GloryCharging':
		case 'WealthCharging':
		case 'Collecting':
		case 'BlastFurnace':
			return ActivityGroup.Skilling;
		case 'FightCaves':
		case 'Wintertodt':
		case 'Tempoross':
		case 'Nightmare':
		case 'AnimatedArmour':
		case 'Cyclops':
		case 'Sepulchre':
		case 'Plunder':
		case 'Zalcano':
		case 'FishingTrawler':
		case 'TitheFarm':
		case 'BarbarianAssault':
		case 'AgilityArena':
		case 'ChampionsChallenge':
		case 'MyNotes':
		case 'MahoganyHomes':
		case 'AerialFishing':
		case 'SoulWars':
		case 'GnomeRestaurant':
		case 'RoguesDenMaze':
		case 'Gauntlet':
		case 'CastleWars':
		case 'MageArena':
		case 'Raids':
		case 'MageTrainingArena':
		case 'MageArena2':
		case 'BigChompyBirdHunting':
		case 'TearsOfGuthix':
			return ActivityGroup.Minigame;
		default: {
			return ActivityGroup.Skilling;
		}
	}
}
