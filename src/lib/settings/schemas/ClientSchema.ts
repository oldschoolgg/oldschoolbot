import { Client } from 'klasa';

Client.defaultClientSchema
	.add('commandStats', 'any', { default: {} })
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('prices', 'any', { default: {} })
	.add('bank_lottery', 'any', { default: {} })
	.add('sold_items_bank', 'any', { default: {} })
	.add('herblore_cost_bank', 'any', { default: {} })
	.add('construction_cost_bank', 'any', { default: {} })
	.add('farming_cost_bank', 'any', { default: {} })
	.add('farming_loot_bank', 'any', { default: {} })
	.add('buy_cost_bank', 'any', { default: {} })
	.add('magic_cost_bank', 'any', { default: {} })
	.add('gnome_res_cost', 'any', { default: {} })
	.add('gnome_res_loot', 'any', { default: {} })
	.add('rogues_den_cost', 'any', { default: {} })
	.add('gauntlet_loot', 'any', { default: {} })
	.add('cox_cost', 'any', { default: {} })
	.add('cox_loot', 'any', { default: {} })
	.add('collecting_cost', 'any', { default: {} })
	.add('collecting_loot', 'any', { default: {} })
	.add('mta_cost', 'any', { default: {} })
	.add('bf_cost', 'any', { default: {} })
	.add('item_contract_cost', 'any', { default: {} })
	.add('item_contract_loot', 'any', { default: {} })
	.add('kg_cost', 'any', { default: {} })
	.add('kg_loot', 'any', { default: {} })
	.add('nex_cost', 'any', { default: {} })
	.add('nex_loot', 'any', { default: {} })
	.add('kk_cost', 'any', { default: {} })
	.add('kk_loot', 'any', { default: {} })
	.add('vasa_cost', 'any', { default: {} })
	.add('vasa_loot', 'any', { default: {} })
	.add('ods_cost', 'any', { default: {} })
	.add('ods_loot', 'any', { default: {} })
	.add('mage_arena_cost', 'any', { default: {} })
	.add('hunter_cost', 'any', { default: {} })
	.add('hunter_loot', 'any', { default: {} })
	.add('economyStats', folder =>
		folder
			.add('dicingBank', 'number', { default: 0 })
			.add('duelTaxBank', 'number', { default: 0 })
			.add('dailiesAmount', 'number', { default: 0 })
			.add('itemSellTaxBank', 'number', { default: 0 })
			.add('bankBgCostBank', 'any', { default: {} })
			.add('sacrificedBank', 'any', { default: {} })
			.add('wintertodtCost', 'any', { default: {} })
			.add('wintertodtLoot', 'any', { default: {} })
			.add('fightCavesCost', 'any', { default: {} })
			.add('PVMCost', 'any', { default: {} })
			.add('thievingCost', 'any', { default: {} })
	)

	.add('gp_sell', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_pvm', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_alch', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_pickpocket', 'integer', {
		default: 0,
		maximum: Number.MAX_SAFE_INTEGER
	})
	.add('gp_dice', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_open', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_pet', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER })
	.add('gp_daily', 'integer', {
		default: 0,
		maximum: Number.MAX_SAFE_INTEGER
	})
	.add('gp_ic', 'integer', { default: 0, maximum: Number.MAX_SAFE_INTEGER });
