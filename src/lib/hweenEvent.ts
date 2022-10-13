import { Time } from '@sapphire/time-utilities';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { calcWhatPercent, randArrItem, roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { spookyEpic, spookyTable } from './bsoOpenables';
import { ActivityTaskOptions } from './types/minions';
import { formatDuration } from './util';
import resolveItems from './util/resolveItems';

export const miniMinigames: { id: number; name: string; items: number[]; emoji: string; extraLoot: LootTable }[] = [
	{
		id: 1,
		name: 'Pumpkin-patch Pumpkin-smash',
		items: resolveItems(['Pumpkin seed', 'Dirty hoe']),
		emoji: '764130154662199347',
		extraLoot: new LootTable().tertiary(111, 'Pumpkinpole')
	},
	{
		id: 2,
		name: 'Ghostly Golfing',
		items: resolveItems(['Boo-balloon']),
		emoji: '👻',
		extraLoot: new LootTable().oneIn(5, 'Bones').tertiary(111, 'Gastly ghost cape')
	},
	{
		id: 3,
		name: 'Manic Magic',
		items: resolveItems(['Twinkly topper', 'Broomstick']),
		emoji: '🪄',
		extraLoot: new LootTable().oneIn(5, 'Tiny lamp').tertiary(111, 'Spooky cat ears')
	},
	{
		id: 4,
		name: 'Apparition Agility',
		items: resolveItems([
			'Spooky graceful hood',
			'Spooky graceful top',
			'Spooky graceful legs',
			'Spooky graceful cape',
			'Spooky graceful boots',
			'Spooky graceful gloves'
		]),
		emoji: '630911040355565568',
		extraLoot: new LootTable().oneIn(2, 'Mark of grace')
	}
];

// 1 in 18.8 people won't get Pet while nolifing. Increase rarity for each add'l Kuro cl
export const KURO_DROPRATE = (amountInCl: number) => Math.ceil(70 * (amountInCl * 1.25 + 1));
export const HALLOWEEN_BOX_DROPRATE = 10;

// Give one event every 60 minutes, or fractional chance equivalent to duration
export const chanceOfHweenEvent = (data: ActivityTaskOptions) =>
	Math.min(100, calcWhatPercent(Math.floor(data.duration / Time.Minute), 60));

export function pickMinigameAndItem(user: MUser) {
	const minigamesNotFinished = miniMinigames.filter(i => i.items.some(i => !user.cl.has(i)));
	// Better chance to get one you havent finished, but still able to get ones you have finished
	const minigame = randArrItem([...minigamesNotFinished, ...minigamesNotFinished, ...miniMinigames]);
	return {
		minigame,
		button: new ButtonBuilder()
			.setLabel(minigame.name)
			.setEmoji(minigame.emoji)
			.setCustomId(`hw-${user.id}-${minigame.id}-${Date.now()}`)
			.setStyle(ButtonStyle.Danger)
	};
}
// const allItems = miniMinigames.map(i => i.items).flat(1);
// const everyyyyyHalloweenItem = resolveItems([...allItems, 'Kuro', 'Spooky box', ...spookyTable.allItems]);
const effectiveTimeToDoOneTrip = Time.Minute * 60 + Time.Minute * 15;
const nolifingTime = 16 * 16 * Time.Hour;

function sim() {
	const allLoot = new Bank();
	let spookyBoxOpens = 0;
	let spookyBoxLoot = new Bank();
	while (spookyEpic.allItems.some(i => !spookyBoxLoot.has(i))) {
		spookyBoxOpens++;
		spookyBoxLoot.add(spookyTable.roll());
	}
	allLoot.add(spookyBoxLoot);

	let petRolls = 0;
	let boxesFromPet = 0;
	while (!allLoot.has('Kuro')) {
		petRolls++;
		if (roll(HALLOWEEN_BOX_DROPRATE)) boxesFromPet++;
		if (roll(KURO_DROPRATE(0))) {
			allLoot.add('Kuro');
		}
	}
	return { spookyBoxOpens, petRolls, boxesFromPet, spookyBoxLoot };
}

export function simulateFinishEvent() {
	let spookyBoxOpens = 0;
	let petRolls = 0;
	let boxesFromPet = 0;
	let sample = 500;
	let spookyBoxLoot = new Bank();
	for (let i = 0; i < sample; i++) {
		const res = sim();
		spookyBoxOpens += res.spookyBoxOpens;
		petRolls += res.petRolls;
		boxesFromPet += res.boxesFromPet;
		spookyBoxLoot.add(res.spookyBoxLoot);
	}
	spookyBoxOpens /= sample;
	petRolls /= sample;
	boxesFromPet /= sample;
	for (const [key, val] of Object.entries(spookyBoxLoot.bank)) {
		spookyBoxLoot.bank[key] = Math.round(val / sample);
	}

	const effectiveTrips = Math.floor(nolifingTime / effectiveTimeToDoOneTrip);
	return {
		msg: `It took ${spookyBoxOpens}x Spooky boxes to get all items from it (Received ${spookyBoxLoot}).

Took ${petRolls}x trips to get Kuro. That's around ${formatDuration(
			petRolls * effectiveTimeToDoOneTrip
		)}, and received ${boxesFromPet}x spooky boxes.\n\n Over the entire event, you fit in ${effectiveTrips} trips and received approximately ${Math.floor(
			effectiveTrips / HALLOWEEN_BOX_DROPRATE
		)}x Spooky boxes`
	};
}
