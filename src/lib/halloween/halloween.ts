import { percentChance, roll, sumArr, Time } from 'e';
import { Bank } from 'oldschooljs';

import { MaledictMortimerBackupTable, MaledictMortimerOutfitTable } from '../simulation/maledictMortimer';
import { ActivityTaskData } from '../types/minions';
import { clAdjustedDroprate, randomVariation } from '../util';
import getOSItem from '../util/getOSItem';
import resolveItems from '../util/resolveItems';

export const maledictOutfit = resolveItems([
	'Maledict hat',
	'Maledict top',
	'Maledict legs',
	'Maledict boots',
	'Maledict cape',
	'Maledict ring',
	'Maledict gloves'
]);

// price increases by 50% for each you buy
export const halloweenShop = [
	{
		item: getOSItem("Fool's ace"),
		description:
			'Tricks another player into thinking they got a unique from Mortimer (consumed on use). If the user actually does get a unique, the trick is saved for their next kill.',
		costHours: 1
	},
	{
		item: getOSItem('Bag of tricks'),
		description: "If you don't get a unique from Mortimer, you instead get rolled other rewards.",
		costHours: 5
	},
	{
		item: getOSItem('Cosmic dice'),
		description:
			"Rerolls your unique drop from Mortimer up to 3 extra times, until you get something you haven't got yet, making you less likely to get duplicate items.",
		costHours: 10
	},
	{
		item: getOSItem("Pandora's box"),
		description:
			'Increases Splooky fwizzle collection by 20%, turns all duplicate drops from Mortimer into extra 120x Splooky fwizzle.',
		costHours: 10
	},
	{
		item: getOSItem('Bat bat'),
		description: 'A Bat bat that bats bats.',
		costHours: 5
	},
	{
		item: getOSItem('Soul shield'),
		description: 'Protects your splooky from being fwizzled.',
		costHours: 5
	},
	{
		item: getOSItem('Spooky sheet'),
		description: 'Hides you from the spiritual world, making you 80% more ghostly.',
		costHours: 10
	},
	{
		item: getOSItem('Evil partyhat'),
		description: 'Makes you 35% more evil.',
		costHours: 90
	},
	{
		item: getOSItem('Purple halloween mask'),
		description: 'Makes you 30% more evil.',
		costHours: 90
	},
	{
		item: getOSItem('Spooky aura'),
		description: 'An ethereal aura of spookiness. Makes you 20% more spooky.',
		costHours: 50
	}
].map(i => {
	return { ...i, cost: Math.round(i.costHours * 60) };
});

function rollCurrency(user: MUser, duration: number, messages: string[]) {
	const loot = new Bank();
	const minutes = Math.floor(duration / Time.Minute);
	if (minutes < 1) return loot;

	let amount = Math.ceil(randomVariation(minutes, 5));
	if (user.owns("Pandora's box")) {
		amount = Math.ceil(amount * 1.2);
		messages.push("20% extra Halloween currency from your Pandora's box");
	}

	loot.add('Splooky fwizzle', amount);
	messages.push(`Received ${loot}.`);
	return loot;
}

export const halloweenTripEffect = {
	name: 'Halloween',
	fn: async ({ data, users, messages }: { data: ActivityTaskData; users: MUser[]; messages: string[] }) => {
		if (data.duration < Time.Minute) return;
		for (const user of users) {
			const loot = rollCurrency(user, data.duration, users.length === 1 ? messages : []);
			await user.addItemsToBank({
				collectionLog: true,
				items: loot
			});
		}
	}
};

console.log(`${sumArr(halloweenShop.map(i => i.costHours))} hours for all hween shop items`);

export function determineMortimerLoot(user: MUser) {
	const loot = new Bank();
	let uniqueLootItem = MaledictMortimerOutfitTable.roll().items()[0][0];

	let rerolls = 2;
	if (user.owns('Cosmic dice')) rerolls += 3;

	for (let i = 0; i < rerolls; i++) {
		if (user.cl.has(uniqueLootItem.id)) {
			[[uniqueLootItem]] = MaledictMortimerOutfitTable.roll().items();
		}
	}

	if (percentChance(50)) {
		loot.add(uniqueLootItem);
	} else if (user.owns('Bag of tricks')) {
		loot.add(MaledictMortimerBackupTable.roll());
	}

	const petDroprate = clAdjustedDroprate(user, 'Mini mortimer', 15, 2.5);
	if (roll(petDroprate)) {
		loot.add('Mini mortimer');
	}
	const covenantDroprate = clAdjustedDroprate(user, 'Covenant of grimace', 25, 2);
	if (roll(covenantDroprate)) {
		loot.add('Covenant of grimace');
	}

	const codexDroprate = clAdjustedDroprate(user, 'Maledict codex', 8, 2.5);
	if (roll(codexDroprate)) {
		loot.add('Maledict codex');
	}

	if (user.owns("Pandora's box")) {
		for (const item of resolveItems([
			'Maledict amulet',
			'Maledict codex',
			'Covenant of grimace',
			'Mini mortimer',
			...MaledictMortimerOutfitTable.allItems
		])) {
			if (loot.has(item) && user.cl.has(item)) {
				loot.remove(item);
				loot.add('Splooky fwizzle', 120);
			}
		}
	}

	return loot;
}

// async function determineFinish() {
// 	let finishes = [];
// 	const allMortimerItems = resolveItems([
// 		'Maledict amulet',
// 		'Maledict codex',
// 		'Maledict hat',
// 		'Maledict top',
// 		'Maledict legs',
// 		'Maledict boots',
// 		'Maledict cape',
// 		'Maledict ring',
// 		'Maledict gloves',
// 		'Miss chief'
// 	]);
// 	const user = await mUserFetch('157797566833098752');
// 	await user.update({
// 		collectionLogBank: {}
// 	});
// 	await user.addItemsToBank({ items: new Bank().add('Bag of tricks').add('Cosmic dice') });
// 	const totalBank = new Bank();
// 	for (let i = 0; i < 20; i++) {
// 		const loot = new Bank();
// 		let kills = 0;
// 		while (!loot.has(allMortimerItems)) {
// 			loot.add(determineMortimerLoot(user));
// 			kills++;
// 		}

// 		finishes.push(kills);
// 		totalBank.add(loot);
// 	}

// 	console.log(finishes);
// 	console.log(
// 		`Average finish in ${sumArr(finishes) / finishes.length} KC, average loot: ${averageBank(totalBank, 20)}`
// 	);
// }
// determineFinish();
