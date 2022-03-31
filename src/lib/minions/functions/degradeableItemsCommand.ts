import { KlasaMessage } from 'klasa';

import { degradeableItems } from '../../degradeableItems';
import { ClientSettings } from '../../settings/types/ClientSettings';
import { stringMatches } from '../../util';

export async function degradeableItemsCommand(msg: KlasaMessage, input: string | undefined = '') {
	if (typeof input !== 'string') input = '';
	const [name, amount] = input.split(',');
	const item = degradeableItems.find(i => [i.item.name, ...i.aliases].some(n => stringMatches(n, name)));
	const number = parseInt(amount);

	if (!name || !amount || !item || isNaN(number) || number < 1 || number > 10_000) {
		return msg.channel.send(
			`Use \`${msg.cmdPrefix}m charge [${degradeableItems.map(i => i.item.name).join('|')}], [1-10,000]\`
${degradeableItems
	.map(i => {
		const charges = msg.author.settings.get(i.settingsKey) as number;
		return `${i.item.name}: ${charges.toLocaleString()} charges`;
	})
	.join('\n')}`
		);
	}

	const cost = item.chargeInput.cost.clone().multiply(number);
	const amountOfCharges = item.chargeInput.charges * number;

	if (!msg.author.owns(cost)) {
		return msg.channel.send(`You don't own ${cost}.`);
	}

	const needConvert = item.convertOnCharge && item.unchargedItem;
	if (needConvert && !msg.author.hasItemEquippedOrInBank(item.item.id) && !msg.author.owns(item.unchargedItem!.id)) {
		return msg.channel.send(`You don't own a ${item.item.name} or ${item.unchargedItem!.name}.`);
	}

	await msg.confirm(
		`Are you sure you want to use **${cost}** to add ${amountOfCharges.toLocaleString()} charges to your ${
			item.item.name
		}?`
	);

	if (needConvert && !msg.author.hasItemEquippedOrInBank(item.item.id)) {
		if (!msg.author.owns(item.unchargedItem!.id)) {
			return msg.channel.send(`Your ${item.unchargedItem!.name} disappeared and cannot be charged`);
		}
		await msg.author.removeItemsFromBank({ [item.unchargedItem!.id]: 1 });
		await msg.author.addItemsToBank({ items: { [item.item.id]: 1 }, collectionLog: true, filterLoot: false });
	}
	await msg.author.removeItemsFromBank(cost);
	const currentCharges = msg.author.settings.get(item.settingsKey) as number;
	const newCharges = currentCharges + amountOfCharges;
	await msg.author.settings.update(item.settingsKey, newCharges);
	await msg.client.settings!.update(ClientSettings.EconomyStats.DegradedItemsCost, cost);

	return msg.channel.send(`You added **${cost}** to your ${item.item.name}, it now has ${newCharges} charges.`);
}
