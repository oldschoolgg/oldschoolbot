import { Table } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import '../base.js';

import { tripBuyables } from '../../src/lib/data/buyables/tripBuyables.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

function renderTripBuyables() {
	const table = new Table();
	table.addHeader('Item', 'Command', 'GP Cost', 'Qty/Hr', 'Shop Qty', 'Price Change');
	for (const tb of tripBuyables) {
		const itemName = Items.get(tb.item)!.name;
		const name = tb.displayName ?? itemName;
		const pack = tb.quantity ? ` (${tb.quantity})` : '';
		const display = `[[${itemName}?raw]] ${name}${pack}`;
		const commandTarget = tb.displayName ?? itemName;
		const command = `[[/buy name\\:${commandTarget}]]`;
		table.addRow(
			display,
			command,
			tb.gpCost?.toLocaleString() ?? '',
			tb.quantityPerHour?.toLocaleString() ?? '',
			tb.shopQuantity ? tb.shopQuantity.toLocaleString() : '',
			tb.changePer ? tb.changePer.toString() : ''
		);
	}
	handleMarkdownEmbed('tripbuyables', 'osb/Buyables/trip-buyables.mdx', table.toString());
}

renderTripBuyables();
