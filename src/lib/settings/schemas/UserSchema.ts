import { Client, SchemaFolder } from 'klasa';

import { FarmingPatchTypes } from '../../minions/farming/types';
import { SkillsEnum } from '../../skilling/types';

Client.defaultUserSchema
	.add('GP', 'integer', { default: 0 })
	.add('QP', 'integer', { default: 0 })
	.add('RSN', 'string', { default: null })
	.add('pets', 'any', { default: {} })
	.add('badges', 'integer', { array: true, default: [] })
	.add('bitfield', 'integer', { array: true, default: [] })
	.add('favoriteItems', 'integer', { array: true, default: [] })
	.add('lastDailyTimestamp', 'integer', { default: 1 })
	.add('sacrificedValue', 'integer', { default: 0, minimum: 0 })
	.add('bank', 'any', { default: {} })
	.add('collectionLogBank', 'any', { default: {} })
	.add('creatureScores', 'any', { default: {} })
	.add('clueScores', 'any', { default: {} })
	.add('monsterScores', 'any', { default: {} })
	.add('lapsScores', 'any', { default: {} })
	.add('bankBackground', 'integer', { default: 1 })
	.add('sacrificedBank', 'any', { default: {} })
	.add('honour_level', 'integer', { default: 1 })
	.add('honour_points', 'integer', { default: 0 })
	.add('high_gambles', 'integer', { default: 0 })
	.add('patreon_id', 'string', { default: null })
	.add('github_id', 'integer', { default: null })
	.add('carpenter_points', 'integer', { default: 0 })
	.add('zeal_tokens', 'integer', { default: 0 })
	.add('openable_scores', 'any', { default: {} })
	.add('attack_style', 'string', { array: true, default: [] })
	.add('total_cox_points', 'integer', { default: 0 })
	.add('combat_options', 'integer', { array: true, default: [] })

	.add('slayer', folder =>
		folder
			.add('points', 'integer', { default: 0 })
			.add('task_streak', 'integer', { default: 0 })
			.add('remember_master', 'string', { default: null })
			.add('unlocks', 'integer', { array: true, default: [] })
			.add('blocked_ids', 'integer', { array: true, default: [] })
			.add('autoslay_options', 'integer', { array: true, default: [] })
			.add('superior_count', 'integer', { default: 0 })
			.add('last_task', 'integer', { default: 0 })
			.add('unsired_offered', 'integer', { default: 0 })
	)

	.add('favorite_alchables', 'integer', { array: true, default: [] })
	.add('bank_bg_hex', 'string', { default: null })
	.add('minion', folder =>
		folder
			.add('name', 'string')
			.add('hasBought', 'boolean', { default: false })
			.add('ironman', 'boolean', { default: false })
			.add('icon', 'string', { default: null })
			.add('equippedPet', 'integer', { default: null })
			.add('farmingContract', 'any', { default: null })
			.add('defaultCompostToUse', 'string', { default: 'compost' })
			.add('defaultPay', 'boolean', { default: false })
			.add('birdhouseTraps', 'any', { default: null })
	)
	.add('stats', (folder: SchemaFolder) =>
		folder
			.add('deaths', 'integer', { default: 0 })
			.add('diceWins', 'integer', { default: 0 })
			.add('diceLosses', 'integer', { default: 0 })
			.add('duelLosses', 'integer', { default: 0 })
			.add('duelWins', 'integer', { default: 0 })
			.add('fightCavesAttempts', 'integer', { default: 0 })
			.add('fireCapesSacrificed', 'integer', { default: 0 })
			.add('titheFarmsCompleted', 'integer', { default: 0 })
			.add('titheFarmPoints', 'integer', { default: 0 })
	)
	.add('skills', (folder: SchemaFolder) =>
		folder
			.add(SkillsEnum.Agility, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Cooking, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Fishing, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Mining, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Smithing, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Woodcutting, 'integer', {
				default: 0,
				maximum: Number.MAX_SAFE_INTEGER
			})
			.add(SkillsEnum.Firemaking, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Runecraft, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Crafting, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Prayer, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Fletching, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Thieving, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Farming, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Herblore, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Hunter, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Construction, 'integer', {
				default: 0,
				maximum: Number.MAX_SAFE_INTEGER
			})
			.add(SkillsEnum.Magic, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Ranged, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Attack, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Strength, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Defence, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Slayer, 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
			.add(SkillsEnum.Hitpoints, 'integer', {
				default: 1154,
				maximum: Number.MAX_SAFE_INTEGER
			})
	)
	.add('gear', (folder: SchemaFolder) =>
		folder
			.add('melee', 'any', { default: null })
			.add('mage', 'any', { default: null })
			.add('range', 'any', { default: null })
			.add('misc', 'any', { default: null })
			.add('skilling', 'any', { default: null })
	)
	.add('farmingPatches', (folder: SchemaFolder) =>
		folder
			.add(FarmingPatchTypes.Herb, 'any', { default: null })
			.add(FarmingPatchTypes.FruitTree, 'any', { default: null })
			.add(FarmingPatchTypes.Tree, 'any', { default: null })
			.add(FarmingPatchTypes.Allotment, 'any', { default: null })
			.add(FarmingPatchTypes.Hops, 'any', { default: null })
			.add(FarmingPatchTypes.Cactus, 'any', { default: null })
			.add(FarmingPatchTypes.Bush, 'any', { default: null })
			.add(FarmingPatchTypes.Spirit, 'any', { default: null })
			.add(FarmingPatchTypes.Hardwood, 'any', { default: null })
			.add(FarmingPatchTypes.Seaweed, 'any', { default: null })
			.add(FarmingPatchTypes.Vine, 'any', { default: null })
			.add(FarmingPatchTypes.Calquat, 'any', { default: null })
			.add(FarmingPatchTypes.Redwood, 'any', { default: null })
			.add(FarmingPatchTypes.Crystal, 'any', { default: null })
			.add(FarmingPatchTypes.Celastrus, 'any', { default: null })
			.add(FarmingPatchTypes.Hespori, 'any', { default: null })
			.add(FarmingPatchTypes.Flower, 'any', { default: null })
			.add(FarmingPatchTypes.Mushroom, 'any', { default: null })
			.add(FarmingPatchTypes.Belladonna, 'any', { default: null })
	);
