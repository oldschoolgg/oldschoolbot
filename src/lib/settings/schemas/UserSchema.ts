import { Client, SchemaFolder } from 'klasa';

import { BlowpipeData } from '../../minions/types';
import { SkillsEnum } from '../../skilling/types';
import { baseUserKourendFavour } from './../../minions/data/kourendFavour';

const defaultBlowpipe: BlowpipeData = {
	scales: 0,
	dartID: null,
	dartQuantity: 0
};

Client.defaultUserSchema
	.add('GP', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('QP', 'integer', { default: 0 })
	.add('RSN', 'string', { default: null })
	.add('pets', 'any', { default: {} })
	.add('badges', 'integer', { array: true, default: [] })
	.add('bitfield', 'integer', { array: true, default: [] })
	.add('favoriteItems', 'integer', { array: true, default: [] })
	.add('favorite_alchables', 'integer', { array: true, default: [] })
	.add('favorite_food', 'integer', { array: true, default: [] })
	.add('lastDailyTimestamp', 'integer', { default: 1 })
	.add('lastGivenBoxx', 'integer', { default: 1, maximum: Number.MAX_SAFE_INTEGER })
	.add('lastSpawnLamp', 'integer', { default: 1, maximum: Number.MAX_SAFE_INTEGER })
	.add('lastTearsOfGuthixTimestamp', 'integer', { default: 1 })
	.add('sacrificedValue', 'integer', { default: 0, minimum: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('bank', 'any', { default: {} })
	.add('collectionLogBank', 'any', { default: {} })
	.add('creatureScores', 'any', { default: {} })
	.add('monsterScores', 'any', { default: {} })
	.add('lapsScores', 'any', { default: {} })
	.add('bankBackground', 'integer', { default: 1 })
	.add('sacrificedBank', 'any', { default: {} })
	.add('honour_level', 'integer', { default: 1 })
	.add('honour_points', 'integer', { default: 0 })
	.add('high_gambles', 'integer', { default: 0 })
	.add('carpenter_points', 'integer', { default: 0 })
	.add('zeal_tokens', 'integer', { default: 0 })
	.add('openable_scores', 'any', { default: {} })
	.add('attack_style', 'string', { array: true, default: [] })
	.add('dungeoneering_tokens', 'integer', { default: 0 })
	.add('total_cox_points', 'integer', { default: 0 })
	.add('total_item_contracts', 'integer', { default: 0 })
	.add('item_contract_streak', 'integer', { default: 0 })
	.add('last_item_contract_date', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('current_item_contract', 'integer', { default: null })
	.add('item_contract_bank', 'any', { default: {} })
	.add('ourania_tokens', 'integer', { default: 0 })
	.add('combat_options', 'integer', { array: true, default: [] })
	.add('farming_patch_reminders', 'boolean', { default: true })
	.add('pest_control_points', 'integer', { default: 0 })
	.add('inferno_attempts', 'integer', { default: 0 })
	.add('emerged_inferno_attempts', 'integer', { default: 0 })
	.add('infernal_cape_sacrifices', 'integer', { default: 0 })
	.add('tob_attempts', 'integer', { default: 0 })
	.add('tob_hard_attempts', 'integer', { default: 0 })
	.add('volcanic_mine_points', 'integer', { default: 0 })
	.add('kourend_favour', 'any', { default: { ...baseUserKourendFavour } })
	.add('blowpipe', 'any', { default: { ...defaultBlowpipe } })
	.add('ironman_alts', 'string', { array: true, default: [] })
	.add('main_account', 'string', { default: null })
	.add('premium_balance_tier', 'integer', { default: null })
	.add('premium_balance_expiry_date', 'integer', { default: null, maximum: Number.MAX_SAFE_INTEGER })
	.add('tentacle_charges', 'integer', { default: 10_000 })
	.add('sang_charges', 'integer', { default: 0 })
	.add('void_staff_charges', 'integer', { default: 0 })
	.add('temp_cl', 'any', { default: {} })
	.add('volcanic_mine_points', 'integer', { default: 0 })
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
			.add('chewed_offered', 'integer', { default: 0 })
	)

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
			.add(SkillsEnum.Dungeoneering, 'integer', {
				default: 0,
				maximum: Number.MAX_SAFE_INTEGER
			})
			.add(SkillsEnum.Invention, 'integer', {
				default: 0,
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
			.add('wildy', 'any', { default: null })
			.add('fashion', 'any', { default: null })
			.add('other', 'any', { default: null })
	)
	.add('nursery', 'any', { default: null })
	.add('selected_tame', 'any', { default: null })
	.add('gp_luckypick', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_dice', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_slots', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('monkeys_fought', 'string', { array: true, default: [] })
	.add('tob_cost', 'any', { default: {} })
	.add('tob_loot', 'any', { default: {} })
	.add('lms_points', 'integer', { default: 0 })

	.add('gp_luckypick', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_dice', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })

	.add('bank_sort_method', 'string', { default: null })
	.add('bank_sort_weightings', 'any', { default: {} });
