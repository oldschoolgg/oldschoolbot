import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';
import { Activity } from '../../lib/constants';

import { Eatable, Eatables } from '../../lib/data/eatables';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import {  KibbleOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import getOSItem from '../../lib/util/getOSItem';

export interface Kibble {
	item: Item;
	type: 'simple' | 'delicious' | 'extraordinary';
	minimumFishHeal: number;
	cropComponent: Item[];
	herbComponent: Item[];
	xp: number;
}

export const kibbles: Kibble[] = [
	{
		item: getOSItem('Simple kibble'),
		type: 'simple',
		minimumFishHeal: 1,
		cropComponent: ['Cabbage', 'Potato'].map(getOSItem),
		herbComponent: ['Marrentill', 'Tarromin'].map(getOSItem),
		xp: 600
	},
	{
		item: getOSItem('Delicious kibble'),
		type: 'delicious',
		minimumFishHeal: 19,
		cropComponent: ['Strawberry', 'Papaya fruit'].map(getOSItem),
		herbComponent: ['Cadantine', 'Kwuarm'].map(getOSItem),
		xp: 900
	},
	{
		item: getOSItem('Extraordinary kibble'),
		type: 'extraordinary',
		minimumFishHeal: 26,
		cropComponent: ['Orange', 'Pineapple'].map(getOSItem),
		herbComponent: ['Torstol', 'Dwarf weed'].map(getOSItem),
		xp: 1100
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '<qty:int{1,100000}> [str:...str]',
			usageDelim: ' '
		});
	}

	async run(msg: KlasaMessage, [qty, str = '']: [number, string]) {
		const kibble = kibbles.find(e => [e.item.name, e.type].some(s => stringMatches(s, str)));
		if (!kibble) {
			return msg.channel.send('No matching kibble found.');
		}
		if (msg.author.skillLevel(SkillsEnum.Cooking) < 120) {
			return msg.channel.send(`You need level 120 Cooking to make kibble.`)
		}
		const userBank = msg.author.bank();

		const cost = new Bank();
		const qtyPerComponent = 5 * (kibbles.indexOf(kibble) + 1);
		let totalQtyPerComponent = qtyPerComponent * qty;

		const herbComponent = kibble.herbComponent.find(i => userBank.amount(i.id) >= totalQtyPerComponent);
		if (!herbComponent) {
			return msg.channel.send(
				`You need ${qtyPerComponent} of one of these herbs for ${kibble.item.name}: ${kibble.herbComponent.map(i => i.name).join(
					', '
				)}.`
			);
		}
		cost.add(herbComponent.id, totalQtyPerComponent);

		let herbsNeeded = Math.ceil(totalQtyPerComponent / 2)
		const cropComponent = kibble.cropComponent.find(i => userBank.amount(i.id) >= herbsNeeded);
		if (!cropComponent) {
			return msg.channel.send(
				`You need ${herbsNeeded} of one of these crops for ${kibble.item.name}: ${kibble.cropComponent.map(i => i.name).join(
					', '
				)}.`
			);
		}
		cost.add(cropComponent.id, herbsNeeded);

		let healAmountNeeded = qtyPerComponent * kibble.minimumFishHeal;
		const calcFish = (fish: Eatable) => Math.ceil((healAmountNeeded * qty) / fish.healAmount);
		let suitableFish = Eatables.filter(i => i.raw && i.healAmount >= kibble.minimumFishHeal).sort((a, b) => a.healAmount - b.healAmount);

		const rawFishComponent = suitableFish.find(i => userBank.amount(i.raw!) >= calcFish(i));
		if (!rawFishComponent) {
			return msg.channel.send(
				`You don't have enough raw fish, you can use these raw fish for ${kibble.item.name}: ${suitableFish
					.map(i => itemNameFromID(i.raw!))
					.join(', ')}.`
			);
		}
		let fishNeeded = calcFish(rawFishComponent);
		cost.add(rawFishComponent.raw!, fishNeeded);

		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You don't own ${cost}.`);
		}

		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.KibbleCost, cost);

		let timePer = (Time.Second * 2);
		const duration = timePer * qty;
		let maxTripLength = msg.author.maxTripLength(Activity.KibbleMaking)
		if (duration > msg.author.maxTripLength(Activity.KibbleMaking)) {
			return msg.channel.send(`The maximum amount of ${kibble.item.name} you can craft in ${formatDuration(msg.author.maxTripLength(Activity.KibbleMaking))} is ${Math.floor(maxTripLength / timePer)}.`)
		}

		await addSubTaskToActivityTask<KibbleOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: qty,
			duration,
			type: Activity.KibbleMaking,
			kibbleType: kibble.type,
		});

		return msg.channel.send(`${msg.author.minionName} is now cooking ${qty}x ${kibble.item.name}, it will take ${formatDuration(duration)}. Removed ${cost} from your bank.`);
	}
}
