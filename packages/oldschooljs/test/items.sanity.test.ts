import { expect, test } from 'vitest';

import { Items } from '../src';

test('Items Sanity Test', async () => {
	const item27624 = Items.get(27_624)!;
	expect(item27624.id).toEqual(27_624);
	expect(item27624.name).toEqual('Ancient sceptre');
	expect(item27624.members).toEqual(true);
	expect(item27624.tradeable).toBeUndefined();
	expect(item27624.equipable).toEqual(true);
	expect(item27624.stackable).toBeUndefined();
	expect(item27624.noteable).toBeUndefined();
	expect(item27624.cost).toEqual(211_000);
	// expect(item27624.lowalch).toBeUndefined();
	// expect(item27624.highalch).toBeUndefined();
	expect(item27624.buy_limit).toBeUndefined();

	const item27626 = Items.get(27_626)!;
	expect(item27626.id).toEqual(27_626);
	expect(item27626.name).toEqual('Ancient sceptre (l)');
	expect(item27626.members).toEqual(true);
	expect(item27626.tradeable).toBeUndefined();
	expect(item27626.equipable).toEqual(true);
	expect(item27626.stackable).toBeUndefined();
	expect(item27626.noteable).toBeUndefined();
	expect(item27626.cost).toEqual(211_000);
	// expect(item27626.lowalch).toBeUndefined();
	// expect(item27626.highalch).toBeUndefined();
	expect(item27626.buy_limit).toBeUndefined();

	const item27612 = Items.get(27_612)!;
	expect(item27612.id).toEqual(27_612);
	expect(item27612.name).toEqual('Venator bow (uncharged)');
	expect(item27612.members).toEqual(true);
	expect(item27612.tradeable).toEqual(true);
	expect(item27612.equipable).toEqual(true);
	expect(item27612.stackable).toBeUndefined();
	expect(item27612.cost).toEqual(750_000);
	expect(item27612.lowalch).toEqual(300_000);
	expect(item27612.highalch).toEqual(450_000);
	expect(item27612.buy_limit).toBeUndefined();

	const item27610 = Items.get(27_610)!;
	expect(item27610.id).toEqual(27_610);
	expect(item27610.name).toEqual('Venator bow');
	expect(item27610.members).toEqual(true);
	expect(item27610.tradeable).toBeUndefined();
	expect(item27610.equipable).toEqual(true);
	expect(item27610.stackable).toBeUndefined();
	expect(item27610.noteable).toBeUndefined();
	expect(item27610.cost).toEqual(750_000);
	expect(item27610.lowalch).toEqual(300_000);
	expect(item27610.highalch).toEqual(450_000);
	expect(item27610.buy_limit).toBeUndefined();

	const itemWebweaverBowU = Items.get(27_652)!;
	expect(itemWebweaverBowU.id).toEqual(27_652);
	expect(itemWebweaverBowU.name).toEqual('Webweaver bow (u)');
	expect(itemWebweaverBowU.members).toEqual(true);
	expect(itemWebweaverBowU.tradeable).toEqual(true);
	expect(itemWebweaverBowU.equipable).toEqual(true);
	expect(itemWebweaverBowU.stackable).toBeUndefined();
	expect(itemWebweaverBowU.noteable).toEqual(true);
	expect(itemWebweaverBowU.cost).toEqual(175_000);
	expect(itemWebweaverBowU.lowalch).toEqual(70_000);
	expect(itemWebweaverBowU.highalch).toEqual(105_000);

	const item27655 = Items.get(27_655)!;
	expect(item27655.id).toEqual(27_655);
	expect(item27655.name).toEqual('Webweaver bow');
	expect(item27655.members).toEqual(true);
	expect(item27655.tradeable).toBeUndefined();
	expect(item27655.equipable).toEqual(true);
	expect(item27655.stackable).toBeUndefined();
	expect(item27655.cost).toEqual(175_000);
	expect(item27655.lowalch).toEqual(70_000);
	expect(item27655.highalch).toEqual(105_000);
	expect(item27655.buy_limit).toBeUndefined();

	const item27657 = Items.get(27_657)!;
	expect(item27657.id).toEqual(27_657);
	expect(item27657.name).toEqual('Ursine chainmace (u)');
	expect(item27657.members).toEqual(true);
	expect(item27657.tradeable).toEqual(true);
	expect(item27657.equipable).toEqual(true);
	expect(item27657.stackable).toBeUndefined();
	expect(item27657.cost).toEqual(175_000);
	expect(item27657.lowalch).toEqual(70_000);
	expect(item27657.highalch).toEqual(105_000);

	const item27660 = Items.get(27_660)!;
	expect(item27660.id).toEqual(27_660);
	expect(item27660.name).toEqual('Ursine chainmace');
	expect(item27660.members).toEqual(true);
	expect(item27660.tradeable).toBeUndefined();
	expect(item27660.equipable).toEqual(true);
	expect(item27660.stackable).toBeUndefined();
	expect(item27660.cost).toEqual(175_000);
	expect(item27660.lowalch).toEqual(70_000);
	expect(item27660.highalch).toEqual(105_000);
	expect(item27660.buy_limit).toBeUndefined();

	const item27662 = Items.get(27_662)!;
	expect(item27662.id).toEqual(27_662);
	expect(item27662.name).toEqual('Accursed sceptre (u)');
	expect(item27662.members).toEqual(true);
	expect(item27662.tradeable).toEqual(true);
	expect(item27662.equipable).toEqual(true);
	expect(item27662.stackable).toBeUndefined();
	expect(item27662.buy_limit).toBeUndefined();

	const item27665 = Items.get(27_665)!;
	expect(item27665.id).toEqual(27_665);
	expect(item27665.name).toEqual('Accursed sceptre');
	expect(item27665.members).toEqual(true);
	expect(item27665.tradeable).toBeUndefined();
	expect(item27665.equipable).toEqual(true);
	expect(item27665.stackable).toBeUndefined();
	expect(item27665.buy_limit).toBeUndefined();
	expect(item27665.equipment!.requirements!.magic).toEqual(70);
}, 30_000);
