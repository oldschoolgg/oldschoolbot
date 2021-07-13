import { randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Misc, Openables } from 'oldschooljs';
import Openable from 'oldschooljs/dist/structures/Openable';

import { COINS_ID, Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import { CluesRaresCl } from '../../lib/data/CollectionsExport';
import botOpenables from '../../lib/data/openables';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { ClueTier } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { addBanks, roll, stringMatches, updateGPTrackSetting } from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';

const itemsToNotifyOf = CluesRaresCl.concat(
	ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward)
).concat([itemID('Bloodhound')]);

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
		if (!name) {
			return msg.channel.send(await this.showAvailable(msg));
		}

		await msg.author.settings.sync(true);
		const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === name.toLowerCase());
		if (clue) {
			return this.clueOpen(msg, quantity, clue);
		}

		const osjsOpenable = Openables.find(openable => openable.aliases.some(alias => stringMatches(alias, name)));
		if (osjsOpenable) {
			return this.osjsOpenablesOpen(msg, quantity, osjsOpenable);
		}

		return this.botOpenablesOpen(msg, quantity, name);
	}

	async clueOpen(msg: KlasaMessage, quantity: number, clueTier: ClueTier) {
		if (msg.author.numItemsInBankSync(clueTier.id) < quantity) {
			return msg.channel.send(
				`You don't have enough ${clueTier.name} Caskets to open!\n\n However... ${await this.showAvailable(
					msg
				)}`
			);
		}

		await msg.author.removeItemFromBank(clueTier.id, quantity);

		let loot = clueTier.table.open(quantity);

		let mimicNumber = 0;
		if (clueTier.mimicChance) {
			for (let i = 0; i < quantity; i++) {
				if (roll(clueTier.mimicChance)) {
					loot = addBanks([Misc.Mimic.open(clueTier.name as 'master' | 'elite'), loot]);
					mimicNumber++;
				}
			}
		}

		const opened = `You opened ${quantity} ${clueTier.name} Clue Casket${quantity > 1 ? 's' : ''} ${
			mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''
		}`;

		const nthCasket = (msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) + quantity;

		// If this tier has a milestone reward, and their new score meets the req, and
		// they don't own it already, add it to the loot.
		if (
			clueTier.milestoneReward &&
			nthCasket >= clueTier.milestoneReward.scoreNeeded &&
			(await msg.author.numOfItemsOwned(clueTier.milestoneReward.itemReward)) === 0
		) {
			loot[clueTier.milestoneReward.itemReward] = 1;
		}

		// Here we check if the loot has any ultra-rares (3rd age, gilded, bloodhound),
		// and send a notification if they got one.
		const announcedLoot = new Bank(loot).filter(i => itemsToNotifyOf.includes(i.id));
		if (announcedLoot.length > 0) {
			this.client.emit(
				Events.ServerNotification,
				`**${msg.author.username}'s** minion, ${msg.author.minionName}, just opened their ${formatOrdinal(
					nthCasket
				)} ${clueTier.name} casket and received **${announcedLoot}**!`
			);
		}

		if (Object.keys(loot).length === 0) {
			return msg.channel.send(`${opened} and got nothing :(`);
		}

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${clueTier.name} caskets.`
		);

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		await msg.author.addItemsToBank(loot, true);
		if (typeof loot[COINS_ID] === 'number') {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot[COINS_ID]);
		}

		msg.author.incrementClueScore(clueTier.id, quantity);

		msg.author.incrementOpenableScore(clueTier.id, quantity);

		if (mimicNumber > 0) {
			msg.author.incrementMonsterScore(MIMIC_MONSTER_ID, mimicNumber);
		}

		return msg.channel.sendBankImage({
			bank: loot,
			content: `You have completed ${nthCasket} ${clueTier.name.toLowerCase()} Treasure Trails.`,
			title: opened,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}

	async osjsOpenablesOpen(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		if (msg.author.numItemsInBankSync(osjsOpenable.id) < quantity) {
			return msg.channel.send(
				`You don't have enough ${osjsOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemFromBank(osjsOpenable.id, quantity);

		const loot = osjsOpenable.open(quantity, {});

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${osjsOpenable.name}.`
		);

		msg.author.incrementOpenableScore(osjsOpenable.id, quantity);
		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		await msg.author.addItemsToBank(loot, true);
		if (typeof loot[COINS_ID] === 'number') {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot[COINS_ID]);
		}

		return msg.channel.sendBankImage({
			bank: loot,
			title: `You opened ${quantity} ${osjsOpenable.name}`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
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

		if (msg.author.numItemsInBankSync(botOpenable.itemID) < quantity) {
			return msg.channel.send(
				`You don't have enough ${botOpenable.name} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemFromBank(botOpenable.itemID, quantity);

		const score = msg.author.getOpenableScore(itemID('Spoils of war'));

		const loot = botOpenable.table.roll(quantity);

		if (loot.has("Lil' creator")) {
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

		msg.author.incrementOpenableScore(botOpenable.itemID, quantity);
		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		await msg.author.addItemsToBank(loot.values(), true);
		if (loot.amount('Coins') > 0) {
			updateGPTrackSetting(this.client, ClientSettings.EconomyStats.GPSourceOpen, loot.amount('Coins'));
		}

		return msg.channel.sendBankImage({
			bank: loot.values(),
			title: `You opened ${quantity} ${botOpenable.name}`,
			flags: { showNewCL: 1, ...msg.flagArgs },
			user: msg.author,
			cl: previousCL
		});
	}
}
