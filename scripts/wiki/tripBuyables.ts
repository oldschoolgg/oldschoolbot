// Trip buyables markdown generation script
import { Table } from '@oldschoolgg/toolkit';
import { Items } from 'oldschooljs';

import '../../src/lib/safeglobals.js';

import { tripBuyables } from '../../src/lib/data/buyables/tripBuyables.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

export function renderTripBuyables() {
	const table = new Table();
	table.addHeader('Item', 'GP Cost', 'Qty/Hr', 'Shop Qty', 'Price Change');
	for (const tb of tripBuyables) {
		const itemName = Items.get(tb.item)!.name;
		const name = tb.displayName ?? itemName;
		const pack = tb.quantity ? ` (${tb.quantity})` : '';
		const display = `[[${itemName}?raw]] ${name}${pack}`;
		table.addRow(
			display,
			tb.gpCost?.toLocaleString() ?? '',
			tb.quantityPerHour?.toLocaleString() ?? '',
			tb.shopQuantity ? tb.shopQuantity.toLocaleString() : '',
			tb.changePer ? tb.changePer.toString() : ''
		);
	}
	handleMarkdownEmbed('tripbuyables', 'osb/Buyables/trip-buyables.md', table.toString());
}

function main() {
	renderTripBuyables();
}

main();
