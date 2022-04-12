import { Time } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { Eatable, Eatables } from '../../lib/data/eatables';
import { kibbles } from '../../lib/data/kibble';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { KibbleOptions } from '../../lib/types/minions';
import { formatDuration, itemNameFromID, stringMatches, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';

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
			return msg.channel.send(`No matching kibble found, they are: ${kibbles.map(k => k.item.name).join(', ')}.`);
		}
		if (msg.author.skillLevel(SkillsEnum.Cooking) < kibble.level) {
			return msg.channel.send(`You need level ${kibble.level} Cooking to make kibble.`);
		}
		if (msg.author.skillLevel(SkillsEnum.Herblore) < kibble.level - 20) {
			return msg.channel.send(`You need level ${kibble.level} Herblore to make kibble.`);
		}
		const userBank = msg.author.bank();

		const cost = new Bank();
		const qtyPerComponent = 5 * (kibbles.indexOf(kibble) + 1);
		let totalQtyPerComponent = qtyPerComponent * qty;

		const herbComponent = kibble.herbComponent.find(i => userBank.amount(i.id) >= totalQtyPerComponent);
		if (!herbComponent) {
			return msg.channel.send(
				`You need ${qtyPerComponent} of one of these herbs for ${kibble.item.name}: ${kibble.herbComponent
					.map(i => i.name)
					.join(', ')}.`
			);
		}
		cost.add(herbComponent.id, totalQtyPerComponent);

		let herbsNeeded = Math.ceil(totalQtyPerComponent / 2);
		const cropComponent = kibble.cropComponent.find(i => userBank.amount(i.id) >= herbsNeeded);
		if (!cropComponent) {
			return msg.channel.send(
				`You need ${herbsNeeded} of one of these crops for ${kibble.item.name}: ${kibble.cropComponent
					.map(i => i.name)
					.join(', ')}.`
			);
		}
		cost.add(cropComponent.id, herbsNeeded);

		let healAmountNeeded = qtyPerComponent * kibble.minimumFishHeal;
		const calcFish = (fish: Eatable) =>
			Math.ceil(
				(healAmountNeeded * qty) /
					(typeof fish.healAmount === 'number' ? fish.healAmount : fish.healAmount(msg.author))
			);
		let suitableFish = Eatables.filter(i => i.raw && i.healAmount >= kibble.minimumFishHeal).sort(
			(a, b) =>
				(typeof a.healAmount === 'number' ? a.healAmount : a.healAmount(msg.author)) -
				(typeof b.healAmount === 'number' ? b.healAmount : b.healAmount(msg.author))
		);

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

		let timePer = Time.Second * 2;
		if (msg.author.usingPet('Remy')) {
			timePer = Math.floor(timePer / 2);
		}
		let duration = timePer * qty;
		let maxTripLength = msg.author.maxTripLength('KibbleMaking');
		if (duration > msg.author.maxTripLength('KibbleMaking')) {
			return msg.channel.send(
				`The maximum amount of ${kibble.item.name} you can create in ${formatDuration(
					msg.author.maxTripLength('KibbleMaking')
				)} is ${Math.floor(maxTripLength / timePer)}.`
			);
		}

		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You don't own ${cost}.`);
		}

		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.KibbleCost, cost);

		await addSubTaskToActivityTask<KibbleOptions>({
			userID: msg.author.id,
			channelID: msg.channel.id,
			quantity: qty,
			duration,
			type: 'KibbleMaking',
			kibbleType: kibble.type
		});

		let message = `${msg.author.minionName} is now creating ${qty}x ${
			kibble.item.name
		}, it will take ${formatDuration(duration)}. Removed ${cost} from your bank.`;
		if (msg.author.usingPet('Remy')) {
			message += '\n**Boosts:** 2x boost for Remy';
		}
		return msg.channel.send(message);
	}
}
