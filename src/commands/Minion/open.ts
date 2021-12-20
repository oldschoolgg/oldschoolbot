import { randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Misc, Openables } from 'oldschooljs';
import Items from 'oldschooljs/dist/structures/Items';
import Openable from 'oldschooljs/dist/structures/Openable';

import { COINS_ID, Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import { cluesRaresCL } from '../../lib/data/CollectionsExport';
import botOpenables from '../../lib/data/openables';
import { emojiMap } from '../../lib/itemEmojiMap';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { ClueTier } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, roll, stringMatches, updateGPTrackSetting } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';

const itemsToNotifyOf = cluesRaresCL
	.concat(ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward))
	.concat([itemID('Bloodhound')]);

const allOpenablesNames = [
	...Openables.map(i => i.name),
	...ClueTiers.map(i => i.name),
	...botOpenables.map(i => i.name)
];

export const allOpenables = [
	...Openables.map(i => i.id),
	...ClueTiers.map(i => i.id),
	...botOpenables.map(i => i.itemID)
];

interface clueOpenValues {
	loot: Bank;
	openedString: string;
	nthCasket: number;
	clueTier: ClueTier;
	mimicNumber: number;
	actualQuantity: number;
}

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '[quantity:int{1,1000000}] [name:...string]',
			usageDelim: ' ',
			oneAtTime: true,
			categoryFlags: ['minion'],
			description: 'Opens openable items, like clue caskets, mystery boxes and crystal keys.',
			examples: ['+open easy', '+open crystal key']
		});
	}

	async showAvailable(msg: KlasaMessage) {
		const available = msg.author.bank().filter(i => allOpenables.includes(i.id));

		if (available.length === 0) {
			return 'You have no openable items.';
		}

		let results = [];
		for (const [item, qty] of available.items()) {
			let emoji = emojiMap.get(item.id) ?? '';
			results.push(`${emoji}${qty}x ${item.name}`);
		}

		return `You have ${results.join(', ')}.`;
	}

	async run(msg: KlasaMessage, [quantity, name]: [number, string | undefined]) {
		await msg.author.settings.sync(true);
		if (!name && msg.flagArgs.any === undefined) {
			return msg.channel.send(await this.showAvailable(msg));
		}

		if (!quantity) {
			quantity = 1;
		}

		if (msg.flagArgs.master && msg.author.bank().has(19_835)) {
			return msg.channel.send('You already have a master clue!');
		}

		if (msg.flagArgs.all !== undefined && name !== undefined) {
			return this.openAll(msg, name);
		}

		if (msg.flagArgs.any !== undefined) {
			return this.any(msg);
		}

		const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === name!.toLowerCase());
		if (clue) {
			return this.clueOpen(msg, quantity, clue);
		}

		const osjsOpenable = Openables.find(openable => openable.aliases.some(alias => stringMatches(alias, name!)));
		if (osjsOpenable) {
			return this.osjsOpenablesOpen(msg, quantity, osjsOpenable);
		}

		return this.botOpenablesOpen(msg, quantity, name!);
	}

	async any(msg: KlasaMessage) {
		const userBank = msg.author.bank();
		for (const item of allOpenablesNames) {
			let itemID = Items.get(item)?.id;
			if (itemID && userBank.has(itemID)) {
				return this.openAll(msg, item);
			}
		}
		return msg.channel.send('You have no openable items.');
	}

	async openAll(msg: KlasaMessage, item: string) {
		const userBank = msg.author.bank();
		const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === item.toLowerCase());
		if (clue) {
			return this.clueOpen(msg, userBank.amount(clue.id), clue);
		}
		const osjsOpenable = Openables.find(openable => openable.aliases.some(alias => stringMatches(alias, item)));
		if (osjsOpenable) {
			return this.osjsOpenablesOpen(msg, userBank.amount(osjsOpenable.id), osjsOpenable);
		}
		const itemID = Items.get(item)?.id;
		if (itemID && userBank.has(itemID)) {
			const itemName = itemNameFromID(itemID);

			if (itemName === undefined) {
				return msg.channel.send(`${itemID} has no name`);
			}
			return this.botOpenablesOpen(msg, userBank.amount(itemID), itemName);
		}
		return msg.channel.send('You have no openable items.');
	}

	async clueOpen(msg: KlasaMessage, quantity: number, clueTier: ClueTier) {
		const clueCount = msg.author.bank().amount(clueTier.id);
		if (msg.flagArgs.master && clueCount > 0) quantity = clueCount;
		if (clueCount < quantity || quantity === 0) {
			return msg.channel.send(
				`You don't have enough ${clueTier.name} Caskets to open!\n\nHowever... ${await this.showAvailable(msg)}`
			);
		}

		const value = (await this.getClueOpenablesValues(msg, quantity, clueTier)) as clueOpenValues;

		if (Object.keys(value.loot.bank).length === 0) {
			return msg.channel.send(`${value.openedString} and got nothing :(`);
		}

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		if (typeof value.loot.bank[COINS_ID] === 'number') {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, value.loot.bank[COINS_ID]);
		}

		msg.author.incrementClueScore(clueTier.id, value.actualQuantity);
		msg.author.incrementOpenableScore(clueTier.id, value.actualQuantity);

		if (value.mimicNumber > 0) {
			msg.author.incrementMonsterScore(MIMIC_MONSTER_ID, value.mimicNumber);
		}

		await msg.author.addItemsToBank(value.loot, true);
		await msg.author.removeItemsFromBank(new Bank().add(clueTier.id, value.actualQuantity));

		return msg.channel.sendBankImage({
			bank: value.loot.bank,
			content: `You have completed ${value.nthCasket} ${clueTier.name.toLowerCase()} Treasure Trails.`,
			title: value.openedString,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async getClueOpenablesValues(msg: KlasaMessage, quantity: number, clueTier: ClueTier) {
		let loot = new Bank();
		let actualQuantity = quantity;

		if (msg.flagArgs.master !== undefined) {
			for (let i = 0; i < quantity; i++) {
				const newLoot = new Bank().add(clueTier.table.open());
				loot.add(newLoot);

				// Master scroll ID
				if (newLoot.has(19_835)) {
					actualQuantity = i + 1;
					break;
				}
			}
		} else {
			loot.add(clueTier.table.open(quantity));
		}

		let mimicNumber = 0;
		if (clueTier.mimicChance) {
			for (let i = 0; i < actualQuantity; i++) {
				if (roll(clueTier.mimicChance)) {
					loot.add(Misc.Mimic.open(clueTier.name as 'master' | 'elite'));
					mimicNumber++;
				}
			}
		}

		const openedString = `You opened ${actualQuantity} ${clueTier.name} Clue Casket${
			actualQuantity > 1 ? 's' : ''
		} ${mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''}`;

		const nthCasket = (msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) + actualQuantity;

		// If this tier has a milestone reward, and their new score meets the req, and
		// they don't own it already, add it to the loot.
		if (
			clueTier.milestoneReward &&
			nthCasket >= clueTier.milestoneReward.scoreNeeded &&
			(await msg.author.numOfItemsOwned(clueTier.milestoneReward.itemReward)) === 0
		) {
			loot.addItem(clueTier.milestoneReward.itemReward);
		}

		// Here we check if the loot has any ultra-rares (3rd age, gilded, bloodhound),
		// and send a notification if they got one.
		const announcedLoot = loot.filter(i => itemsToNotifyOf.includes(i.id));
		if (announcedLoot.length > 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${msg.author.username}'s** minion, ${msg.author.minionName}, just opened their ${formatOrdinal(
					nthCasket
				)} ${clueTier.name} casket and received **${announcedLoot}**!`
			);
		}

		if (Object.keys(loot).length === 0) {
			return msg.channel.send(`${openedString} and got nothing :(`);
		}
		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${actualQuantity} ${clueTier.name} caskets.`
		);

		const value: clueOpenValues = { loot, openedString, nthCasket, clueTier, mimicNumber, actualQuantity };

		return value;
	}

	async osjsOpenablesOpen(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		const openableCount = msg.author.bank().amount(osjsOpenable.id);
		if (openableCount < quantity || quantity === 0) {
			return msg.channel.send(
				`You don't have enough ${osjsOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemsFromBank(new Bank().add(osjsOpenable.id, quantity));

		const value = await this.getOsjsOpenablesValues(msg, quantity, osjsOpenable);
		const score = msg.author.getOpenableScore(osjsOpenable.id) + quantity;
		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${osjsOpenable.name}.`
		);

		msg.author.incrementOpenableScore(osjsOpenable.id, quantity);
		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		await msg.author.addItemsToBank(value.loot, true);
		if (typeof value.loot.bank[COINS_ID] === 'number') {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, value.loot.bank[COINS_ID]);
		}

		return msg.channel.sendBankImage({
			bank: value.loot.bank,
			content: `You have opened the ${osjsOpenable.name.toLowerCase()} ${score.toLocaleString()} times.`,
			title: `You opened ${quantity} ${osjsOpenable.name}`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async getOsjsOpenablesValues(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		let loot = new Bank();
		loot.add(osjsOpenable.open(quantity, {}));
		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${osjsOpenable.name}.`
		);

		return { loot };
	}

	async botOpenablesOpen(msg: KlasaMessage, quantity: number, name: string) {
		const botOpenable = botOpenables.find(thing => thing.aliases.some(alias => stringMatches(alias, name)));

		if (!botOpenable) {
			return msg.channel.send(
				`That's not a valid thing you can open. You can open a clue tier (${ClueTiers.map(
					tier => tier.name
				).join(', ')}), or another non-clue thing (${botOpenables
					.map(thing => thing.name)
					.concat(Openables.map(thing => thing.name))
					.join(', ')})`
			);
		}
		const botCount = msg.author.bank().amount(botOpenable.itemID);
		if (botCount < quantity || quantity === 0) {
			return msg.channel.send(
				`You don't have enough ${botOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}
		await msg.author.removeItemsFromBank(new Bank().add(botOpenable.itemID, quantity));
		const value = await this.getBotOpenablesValues(quantity, name);

		const score = msg.author.getOpenableScore(botOpenable.itemID);
		const nthOpenable = formatOrdinal(score + randInt(1, quantity));

		if (value.loot.has("Lil' creator")) {
			this.client.emit(
				Events.ServerNotification,
				`<:lil_creator:798221383951319111> **${msg.author.username}'s** minion, ${
					msg.author.minionName
				}, just received a Lil' creator! They've done ${await msg.author.getMinigameScore(
					'soul_wars'
				)} Soul wars games, and this is their ${nthOpenable} Spoils of war crate.`
			);
		}

		if (botOpenable.itemID === itemID('Bag full of gems') && value.loot.has('Uncut onyx')) {
			this.client.emit(
				Events.ServerNotification,
				`${msg.author} just received an Uncut Onyx from their ${nthOpenable} Bag full of gems!`
			);
		}

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);

		await msg.author.addItemsToBank(value.loot.values(), true, false);

		msg.author.incrementOpenableScore(botOpenable.itemID, quantity);
		if (value.loot.amount('Coins') > 0) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, value.loot.amount('Coins'));
		}

		return msg.channel.sendBankImage({
			bank: value.loot.values(),
			content: `You have opened the ${botOpenable.name.toLowerCase()} ${(
				score + quantity
			).toLocaleString()} times.`,
			title: `You opened ${quantity} ${botOpenable.name}`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async getBotOpenablesValues(quantity: number, name: string) {
		const botOpenable = botOpenables.find(thing => thing.aliases.some(alias => stringMatches(alias, name)));
		return { loot: botOpenable!.table.roll(quantity) };
	}
}
