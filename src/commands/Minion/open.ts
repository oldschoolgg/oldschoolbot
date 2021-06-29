import { randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Misc, Openables } from 'oldschooljs';
import Items from 'oldschooljs/dist/structures/Items';
import Openable from 'oldschooljs/dist/structures/Openable';

import { COINS_ID, Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import { cluesRares } from '../../lib/data/collectionLog';
import botOpenables from '../../lib/data/openables';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { ClueTier } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { itemNameFromID, roll, stringMatches, updateGPTrackSetting } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';

const itemsToNotifyOf = Object.values(cluesRares)
	.flat(Infinity)
	.concat(ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward))
	.concat([itemID('Bloodhound')]);

const allOpenablesNames = [
	...Openables.map(i => i.name),
	...ClueTiers.map(i => i.name),
	...botOpenables.map(i => i.name)
];
const allOpenables = [...Openables.map(i => i.id), ...ClueTiers.map(i => i.id), ...botOpenables.map(i => i.itemID)];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '[quantity:int] [name:...string]',
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

		return `You have ${available}.`;
	}

	async run(msg: KlasaMessage, [quantity = 1, name]: [number, string | undefined]) {
		if (!name && msg.flagArgs.any === undefined && msg.flagArgs.all === undefined) {
			return msg.send(await this.showAvailable(msg));
		}

		if (msg.flagArgs.any !== undefined) {
			return this.any(msg);
		}
		if (msg.flagArgs.all !== undefined) {
			return this.all(msg);
		}

		await msg.author.settings.sync(true);
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

	async all(msg: KlasaMessage) {
		const userBank = await msg.author.bank();
		let ownedOpenables: { openID: number; amount: number; type: 'clue' | 'osjsOpenable' | 'item' }[] = [];
		const userFavs = msg.author.settings.get(UserSettings.FavoriteItems);

		for (const item of [...new Set(allOpenablesNames)]) {
			const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === item.toLowerCase());
			if (clue && userBank.has(clue.id) && !userFavs.includes(clue.id)) {
				ownedOpenables.push({ openID: clue.id, amount: userBank.amount(clue.id), type: 'clue' });
				continue;
			}
			const osjsOpenable = Openables.find(openable =>
				openable.aliases.concat([openable.name]).some(alias => stringMatches(alias, item))
			);
			if (osjsOpenable && userBank.has(osjsOpenable.id) && !userFavs.includes(osjsOpenable.id)) {
				ownedOpenables.push({
					openID: osjsOpenable.id,
					amount: userBank.amount(osjsOpenable.id),
					type: 'osjsOpenable'
				});
				continue;
			}
			const itemID = Items.get(item)?.id;
			if (itemID && userBank.has(itemID) && !userFavs.includes(itemID)) {
				const itemName = itemNameFromID(itemID);

				if (itemName === undefined) {
					return msg.send(`${itemID} has no name`);
				}
				ownedOpenables.push({ openID: itemID, amount: userBank.amount(itemID), type: 'item' });
				continue;
			}
		}

		const uniqueOpenables = [...new Set(ownedOpenables)];

		if (uniqueOpenables.length === 0) {
			return msg.send("You don't own any openables.");
		}

		let loot = new Bank();
		let openablesUsed = new Bank();
		let cluesOpened = new Map();
		let openablesOpened = new Map();
		let mimicNumber = 0;
		let totalOpens = 0;
		let masterFound = false;

		for (let openable of uniqueOpenables) {
			switch (openable.type) {
				case 'clue': {
					if (masterFound) break;
					const clue = ClueTiers.find(_tier => _tier.id === openable.openID);
					const clueValues = await this.getClueOpenablesValues(msg, openable.amount, clue!);
					if (openable.amount !== clueValues.actualQuantity) {
						masterFound = true;
					}
					cluesOpened.set(clueValues.clueTier.id, clueValues.actualQuantity);
					mimicNumber += clueValues.mimicNumber;
					loot.add(clueValues.loot);
					totalOpens += clueValues.actualQuantity;
					openablesUsed.addItem(openable.openID, clueValues.actualQuantity);
					break;
				}
				case 'osjsOpenable': {
					const osjsOpenable = Openables.find(item => item.id === openable.openID);
					const osjsOpenableValues = await this.getOsjsOpenablesValues(msg, openable.amount, osjsOpenable!);
					openablesOpened.set(openable.openID, openable.amount);
					loot.add(osjsOpenableValues.loot);
					totalOpens += openable.amount;
					openablesUsed.addItem(openable.openID, openable.amount);
					break;
				}
				case 'item': {
					const botOpenable = botOpenables.find(thing => thing.itemID === openable.openID);
					const itemValues = await this.getBotOpenablesValues(openable.amount, botOpenable!.name);
					openablesOpened.set(openable.openID, openable.amount);
					loot.add(itemValues.loot);
					totalOpens += openable.amount;
					openablesUsed.addItem(openable.openID, openable.amount);
					break;
				}
			}
		}

		for (let clueType of cluesOpened) {
			await msg.author.incrementClueScore(clueType[0], clueType[1]);
		}

		if (mimicNumber > 0) {
			await msg.author.incrementMonsterScore(MIMIC_MONSTER_ID, mimicNumber);
		}

		for (let openableType of openablesOpened) {
			await msg.author.incrementOpenableScore(openableType[0], openableType[1]);
		}

		if (typeof loot.bank[COINS_ID] === 'number') {
			await updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot.bank[COINS_ID]);
		}
		if (loot.has("Lil' creator")) {
			this.client.emit(
				Events.ServerNotification,
				`<:lil_creator:798221383951319111> **${msg.author.username}'s** minion, ${
					msg.author.minionName
				}, just received a Lil' creator! They've done ${await msg.author.getMinigameScore(
					'SoulWars'
				)} Soul wars games, and this is their ${formatOrdinal(
					msg.author.getOpenableScore(itemID('Spoils of war')) +
						randInt(1, openablesOpened.get(itemID('Spoils of war')))
				)} Spoils of war crate.`
			);
		}

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);

		await msg.author.removeItemsFromBank(openablesUsed);
		await msg.author.addItemsToBank(loot, true);

		return msg.channel.sendBankImage({
			bank: loot.values(),
			title: `You opened ${totalOpens} openables`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async any(msg: KlasaMessage) {
		const userBank = msg.author.bank();

		for (const item of allOpenablesNames) {
			const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === item.toLowerCase());
			if (clue && userBank.has(clue.id)) {
				return this.clueOpen(msg, userBank.amount(clue.id), clue);
			}
			const osjsOpenable = Openables.find(openable => openable.aliases.some(alias => stringMatches(alias, item)));
			if (osjsOpenable && userBank.has(osjsOpenable.id)) {
				return this.osjsOpenablesOpen(msg, userBank.amount(osjsOpenable.id), osjsOpenable);
			}
			const itemID = Items.get(item)?.id;
			if (itemID && userBank.has(itemID)) {
				const itemName = itemNameFromID(itemID);

				if (itemName === undefined) {
					return msg.send(`${itemID} has no name`);
				}
				return this.botOpenablesOpen(msg, userBank.amount(itemID), itemName);
			}
		}
		return msg.send('You have no openable items.');
	}

	async clueOpen(msg: KlasaMessage, quantity: number, clueTier: ClueTier) {
		if (msg.author.numItemsInBankSync(clueTier.id) < quantity) {
			return msg.send(
				`You don't have enough ${clueTier.name} Caskets to open!\n\n However... ${await this.showAvailable(
					msg
				)}`
			);
		}

		const values = await this.getClueOpenablesValues(msg, quantity, clueTier);

		if (Object.keys(values.loot.bank).length === 0) {
			return msg.send(`${values.opened} and got nothing :(`);
		}

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		if (typeof values.loot.bank[COINS_ID] === 'number') {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, values.loot.bank[COINS_ID]);
		}

		msg.author.incrementClueScore(clueTier.id, values.actualQuantity);
		msg.author.incrementOpenableScore(clueTier.id, values.actualQuantity);

		if (values.mimicNumber > 0) {
			msg.author.incrementMonsterScore(MIMIC_MONSTER_ID, values.mimicNumber);
		}

		await msg.author.addItemsToBank(values.loot, true);
		await msg.author.removeItemFromBank(clueTier.id, values.actualQuantity);

		return msg.channel.sendBankImage({
			bank: values.loot.bank,
			content: `You have completed ${values.nthCasket} ${clueTier.name.toLowerCase()} Treasure Trails.`,
			title: values.opened,
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

				if (newLoot.has(19835)) {
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

		const opened = `You opened ${actualQuantity} ${clueTier.name} Clue Casket${actualQuantity > 1 ? 's' : ''} ${
			mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
		}`;

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

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${actualQuantity} ${clueTier.name} caskets.`
		);

		return { loot, opened, nthCasket, clueTier, mimicNumber, actualQuantity };
	}

	async osjsOpenablesOpen(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		if (msg.author.numItemsInBankSync(osjsOpenable.id) < quantity) {
			return msg.send(
				`You don't have enough ${osjsOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		const values = await this.getOsjsOpenablesValues(msg, quantity, osjsOpenable);

		await msg.author.addItemsToBank(values.loot, true);
		await msg.author.removeItemFromBank(osjsOpenable.id, quantity);
		msg.author.incrementOpenableScore(osjsOpenable.id, quantity);

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		if (typeof values.loot[COINS_ID] === 'number') {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, values.loot[COINS_ID]);
		}

		return msg.channel.sendBankImage({
			bank: values.loot,
			title: `You opened ${quantity} ${osjsOpenable.name}`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async getOsjsOpenablesValues(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		const loot = osjsOpenable.open(quantity, {});

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${osjsOpenable.name}.`
		);

		return { loot };
	}

	async botOpenablesOpen(msg: KlasaMessage, quantity: number, name: string) {
		const botOpenable = botOpenables.find(thing => thing.aliases.some(alias => stringMatches(alias, name)));

		if (!botOpenable) {
			return msg.send(
				`That's not a valid thing you can open. You can open a clue tier (${ClueTiers.map(
					tier => tier.name
				).join(', ')}), or another non-clue thing (${botOpenables
					.map(thing => thing.name)
					.concat(Openables.map(thing => thing.name))
					.join(', ')})`
			);
		}

		if (msg.author.numItemsInBankSync(botOpenable.itemID) < quantity) {
			return msg.send(
				`You don't have enough ${botOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		const values = await this.getBotOpenablesValues(quantity, name);

		const score = msg.author.getOpenableScore(itemID('Spoils of war'));
		if (values.loot.has("Lil' creator")) {
			this.client.emit(
				Events.ServerNotification,
				`<:lil_creator:798221383951319111> **${msg.author.username}'s** minion, ${
					msg.author.minionName
				}, just received a Lil' creator! They've done ${await msg.author.getMinigameScore(
					'SoulWars'
				)} Soul wars games, and this is their ${formatOrdinal(
					score + randInt(1, quantity)
				)} Spoils of war crate.`
			);
		}

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);

		await msg.author.addItemsToBank(values.loot.values(), true);
		await msg.author.removeItemFromBank(botOpenable.itemID, quantity);
		msg.author.incrementOpenableScore(botOpenable.itemID, quantity);
		if (values.loot.amount('Coins') > 0) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, values.loot.amount('Coins'));
		}

		return msg.channel.sendBankImage({
			bank: values.loot.values(),
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
