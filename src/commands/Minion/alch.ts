import { Time } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { Activity } from '../../lib/constants';
import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { AlchingActivityTaskOptions } from '../../lib/types/minions';
import { formatDuration, updateBankSetting } from '../../lib/util';
import addSubTaskToActivityTask from '../../lib/util/addSubTaskToActivityTask';
import { parseStringBank } from '../../lib/util/parseStringBank';
import resolveItems from '../../lib/util/resolveItems';

const unlimitedFireRuneProviders = resolveItems([
	'Staff of fire',
	'Fire battlestaff',
	'Mystic fire staff',
	'Lava battlestaff',
	'Mystic lava staff',
	'Steam battlestaff',
	'Mystic steam staff',
	'Smoke battlestaff',
	'Mystic smoke staff',
	'Tome of fire'
]);

export function calculateAlchItemByTripDuration(params: {
	user: KlasaUser;
	duration: number;
	items?: { item: Item; qty: number }[];
	qtyLimit?: number;
	calculateByRunesOwned?: boolean;
}) {
	let { items, duration, user, qtyLimit, calculateByRunesOwned } = params;
	const userBank = user.bank().clone();

	if (!items) items = [];

	if (items.length === 0) {
		for (const i of user.getUserFavAlchs() as Item[]) {
			// Ignore alchs that are already on the alch items
			if (items.find(a => a.item.id === i.id)) continue;
			items.push({
				item: i,
				qty: qtyLimit
					? qtyLimit < userBank.amount(i.id)
						? qtyLimit
						: userBank.amount(i.id)
					: userBank.amount(i.id)
			});
		}
		if (items.length === 0) return false;
	}

	// Check if user has infinite fire runes
	let infiniteFireRunes = false;
	for (const runeProvider of unlimitedFireRuneProviders) {
		if (user.hasItemEquippedAnywhere(runeProvider)) {
			infiniteFireRunes = true;
			break;
		}
	}

	// 5 tick action
	const timePerAlch = Time.Second * 3;
	let maxCasts = Math.floor(duration / timePerAlch);
	if (qtyLimit && maxCasts > qtyLimit) maxCasts = qtyLimit;

	// If calculateByRunesOwned is true, limit casts to what the user have runes for
	if (calculateByRunesOwned) {
		const maxRuneCasts = userBank.fits(
			new Bank().add('Fire rune', infiniteFireRunes ? 0 : 5).add('Nature rune', 1)
		);
		if (maxCasts > maxRuneCasts) {
			maxCasts = maxRuneCasts;
		}
	}

	const alchBank = new Bank();
	let totalValue = 0;

	let castsLeft = maxCasts;
	for (const i of items) {
		let numberOfCasts = i.qty;
		if (castsLeft < i.qty) numberOfCasts = castsLeft;
		castsLeft -= numberOfCasts;
		alchBank.add(i.item.id, numberOfCasts);
		totalValue += i.item.highalch * numberOfCasts;
		if (castsLeft === 0) break;
	}

	// Calculate number of casts
	const casts = maxCasts - castsLeft;

	// Means nothing is being alched
	if (maxCasts === 0 || maxCasts === castsLeft) return false;

	// Check runes to be used
	const runeBank = new Bank().add('Fire rune', infiniteFireRunes ? 0 : casts * 5).add('Nature rune', casts);

	return {
		casts,
		items: alchBank,
		runes: runeBank,
		duration: casts * timePerAlch,
		value: totalValue
	} as { casts: number; items: Bank; runes: Bank; duration: number; value: number };
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}] [item:...string] [ignoreConfirm:string]',
			usageDelim: ' ',
			oneAtTime: true,
			description: 'Allows you to send your minion to alch items from your bank',
			examples: ['+alch 12 dragon scimitar', '+alch pumpkin'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	@minionNotBusy
	@requiresMinion
	async run(
		msg: KlasaMessage,
		[quantity = undefined, item, ignoreConfirm = undefined]: [number | undefined, string, undefined | true]
	) {
		const userBank = msg.author.bank();

		// Make sure the qty is not used when the first item doesnt have a qty
		const parsedItems = parseStringBank(item);
		if (parsedItems.length > 0 && parsedItems[0][1] === 0 && quantity !== null) {
			parsedItems[0][1] = quantity;
			quantity = undefined;
		}

		// If nothing is defined to alch, it means the user wants to alch favorites.
		// This will be used on the handle trip finish
		let alchFavorites = parsedItems.length === 0;

		// Parse the items the user defined
		let itemsToAlch = parsedItems
			.filter(i => userBank.has(i[0].id) && i[0].highalch && i[0].tradeable)
			.map(i => {
				return {
					item: i[0],
					qty: i[1] && i[1] > 0 && userBank.amount(i[0].id) > i[1] ? i[1] : userBank.amount(i[0].id)
				};
			});

		// Calculate what can be alched
		const result = calculateAlchItemByTripDuration({
			user: msg.author,
			duration: msg.author.maxTripLength(Activity.Alching),
			items: itemsToAlch,
			qtyLimit: quantity
		});

		if (!result)
			return msg.channel.send(
				'You dont have any item to alch. You can leave the items to alch blank to alch your favorites.'
			);

		const consumedItems = result.items.clone().add(result.runes);

		if (!msg.author.owns(consumedItems)) {
			return msg.channel.send(
				`You can't alch ${result.items} because you don't own enough runes. You need ${
					result.runes
				}, but you are missing ${result.runes.clone().remove(msg.author.bank())}.`
			);
		}

		if (!ignoreConfirm) {
			await msg.confirm(
				`Are you sure you want to use **${result.runes}** to alch **${
					result.items
				}** and convert it to <:RSGP:369349580040437770> **${result.value.toLocaleString()}** coins? This will take approximately ${formatDuration(
					result.duration
				)}`
			);
		}

		await msg.author.removeItemsFromBank(consumedItems);
		await updateBankSetting(this.client, ClientSettings.EconomyStats.MagicCostBank, consumedItems);

		await addSubTaskToActivityTask<AlchingActivityTaskOptions>({
			alchedBank: result.items.bank,
			userID: msg.author.id,
			channelID: msg.channel.id,
			favorites: alchFavorites,
			quantity,
			duration: result.duration,
			alchValue: result.value,
			type: Activity.Alching
		});

		msg.author.log(
			`alched Quantity[${quantity}] Items[${result.items
				.items()
				.map(i => `${i[1]}x ${i[0].id}`)
				.join(', ')}] for ${result.value}`
		);

		return msg.channel.send(
			`${msg.author.minionName} is now alching **${result.items}**. It will take around ${formatDuration(
				result.duration
			)} to finish.`
		);
	}
}
