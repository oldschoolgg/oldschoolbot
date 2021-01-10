import { Client } from 'klasa';

Client.defaultClientSchema
	.add('commandStats', 'any', { default: {} })
	.add('totalCommandsUsed', 'integer', { default: 0 })
	.add('prices', 'any', { default: {} })
	.add('pollQuestions', 'any', { default: {} })
	.add('bank_lottery', 'any', { default: {} })
	.add('sold_items_bank', 'any', { default: {} })
	.add('herblore_cost_bank', 'any', { default: {} })
	.add('construction_cost_bank', 'any', { default: {} })
	.add('farming_cost_bank', 'any', { default: {} })
	.add('farming_loot_bank', 'any', { default: {} })
	.add('buy_cost_bank', 'any', { default: {} })
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
	);
