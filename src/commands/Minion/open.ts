import { percentChance, randInt } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Misc, Openables as _Openables } from 'oldschooljs';
import { ItemBank } from 'oldschooljs/dist/meta/types';
import Openable from 'oldschooljs/dist/structures/Openable';

import { COINS_ID, Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import botOpenables, { IronmanPMBTable } from '../../lib/data/openables';
import ClueTiers from '../../lib/minions/data/clueTiers';
import { ClueTier } from '../../lib/minions/types';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import {
	addBanks,
	addItemToBank,
	rand,
	roll,
	stringMatches,
	updateGPTrackSetting
} from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';
import resolveItems from '../../lib/util/resolveItems';
import { hasClueHunterEquipped } from './mclue';

const itemsToNotifyOf = resolveItems([
	'Dwarven blessing',
	'First age tiara',
	'First age amulet',
	'First age cape',
	'First age bracelet',
	'First age ring'
]);

const Openables = _Openables.filter(i => i.name !== 'Mystery box');

const allOpenables = [
	...ClueTiers.map(i => i.id),
	...botOpenables.map(i => i.itemID),
	...Openables.map(i => i.id)
];

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
			return `You have no openable items.`;
		}

		return `You have ${available}.`;
	}

	async run(msg: KlasaMessage, [quantity = 1, name]: [number, string | undefined]) {
		if (!name) {
			return msg.send(await this.showAvailable(msg));
		}

		await msg.author.settings.sync(true);
		const clue = ClueTiers.find(_tier => _tier.name.toLowerCase() === name.toLowerCase());
		if (clue) {
			return this.clueOpen(msg, quantity, clue);
		}
		const osjsOpenable = Openables.find(openable =>
			openable.aliases.some(alias => stringMatches(alias, name))
		);
		if (osjsOpenable) {
			return this.osjsOpenablesOpen(msg, quantity, osjsOpenable);
		}

		return this.botOpenablesOpen(msg, quantity, name);
	}

	async clueOpen(msg: KlasaMessage, quantity: number, clueTier: ClueTier) {
		if (msg.author.numItemsInBankSync(clueTier.id) < quantity) {
			return msg.send(
				`You don't have enough ${
					clueTier.name
				} Caskets to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemFromBank(clueTier.id, quantity);

		const hasCHEquipped = hasClueHunterEquipped(msg.author.getGear('skilling'));

		let extraClueRolls = 0;
		let loot: ItemBank = {};
		for (let i = 0; i < quantity; i++) {
			const roll = rand(1, 3);
			extraClueRolls += roll - 1;
			loot = addBanks([clueTier.table.open(roll), loot]);
			if (clueTier.name === 'Master' && percentChance(hasCHEquipped ? 3.5 : 1.5)) {
				loot = addItemToBank(loot, itemID('Clue scroll (grandmaster)'));
			}
		}

		let mimicNumber = 0;
		if (clueTier.mimicChance) {
			for (let i = 0; i < quantity; i++) {
				if (roll(clueTier.mimicChance)) {
					loot = addBanks([Misc.Mimic.open(clueTier.name as 'master' | 'elite'), loot]);
					mimicNumber++;
				}
			}
		}

		const opened = `You opened ${quantity} ${clueTier.name} Clue Casket${
			quantity > 1 ? 's' : ''
		} ${mimicNumber > 0 ? `with ${mimicNumber} mimic${mimicNumber > 1 ? 's' : ''}` : ''}`;

		const nthCasket =
			(msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) + quantity;

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
				`**${msg.author.username}'s** minion, ${
					msg.author.minionName
				}, just opened their ${formatOrdinal(nthCasket)} ${
					clueTier.name
				} casket and received **${announcedLoot}**!`
			);
		}

		if (Object.keys(loot).length === 0) {
			return msg.send(`${opened} and got nothing :(`);
		}

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened ${quantity} ${clueTier.name} caskets.`
		);

		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		await msg.author.addItemsToBank(loot, true);
		if (typeof loot[COINS_ID] === 'number') {
			updateGPTrackSetting(
				this.client,
				ClientSettings.EconomyStats.GPSourceOpen,
				loot[COINS_ID]
			);
		}

		msg.author.incrementClueScore(clueTier.id, quantity);

		msg.author.incrementOpenableScore(clueTier.id, quantity);

		if (mimicNumber > 0) {
			msg.author.incrementMonsterScore(MIMIC_MONSTER_ID, mimicNumber);
		}

		return msg.channel.sendBankImage({
			bank: loot,
			content: `You have completed ${nthCasket} ${clueTier.name.toLowerCase()} Treasure Trails.${
				extraClueRolls > 0
					? ` You also received ${extraClueRolls} extra roll${
							extraClueRolls > 1 ? 's' : ''
					  } from your casket${quantity > 1 ? 's' : ''}!`
					: ``
			}`,
			title: opened,
			flags: {
				showNewCL: 1,
				wide: Object.keys(loot).length > 250 ? 1 : 0,
				...msg.flagArgs
			},
			user: msg.author,
			cl: previousCL
		});
	}

	async osjsOpenablesOpen(msg: KlasaMessage, quantity: number, osjsOpenable: Openable) {
		if (msg.author.numItemsInBankSync(osjsOpenable.id) < quantity) {
			return msg.send(
				`You don't have enough ${
					osjsOpenable.name
				} to open!\n\n However... ${await this.showAvailable(msg)}`
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
			updateGPTrackSetting(
				this.client,
				ClientSettings.EconomyStats.GPSourceOpen,
				loot[COINS_ID]
			);
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
		const botOpenable = botOpenables.find(thing =>
			thing.aliases.some(alias => stringMatches(alias, name))
		);

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
				`You don't have enough ${
					botOpenable.name
				} to open!\n\n However... ${await this.showAvailable(msg)}`
			);
		}

		await msg.author.removeItemFromBank(botOpenable.itemID, quantity);

		const hasSmokey = msg.author.equippedPet() === itemID('Smokey');
		const loot = new Bank();
		let smokeyBonus = 0;
		if (botOpenable.name.toLowerCase().includes('mystery') && hasSmokey) {
			for (let i = 0; i < quantity; i++) {
				if (roll(10)) smokeyBonus++;
			}
		}

		for (let i = 0; i < quantity + smokeyBonus; i++) {
			if (botOpenable.name === 'Pet Mystery box' && msg.author.isIronman) {
				loot.add(IronmanPMBTable.roll());
			} else if (typeof botOpenable.table === 'function') {
				loot.add(botOpenable.table());
			} else {
				loot.add(botOpenable.table.roll());
			}
		}

		if (loot.has("Lil' creator")) {
			this.client.emit(
				Events.ServerNotification,
				`<:lil_creator:798221383951319111> **${msg.author.username}'s** minion, ${
					msg.author.minionName
				}, just received a Lil' creator! They've done ${await msg.author.getMinigameScore(
					'SoulWars'
				)} Soul wars games, and this is their ${formatOrdinal(
					msg.author.getOpenableScore(botOpenable.itemID) + randInt(1, quantity)
				)} Spoils of war crate.`
			);
		}

		msg.author.incrementOpenableScore(botOpenable.itemID, quantity);
		const previousCL = msg.author.settings.get(UserSettings.CollectionLogBank);
		await msg.author.addItemsToBank(loot.values(), true);
		if (loot.amount('Coins') > 0) {
			updateGPTrackSetting(
				this.client,
				ClientSettings.EconomyStats.GPSourceOpen,
				loot.amount('Coins')
			);
		}

		return msg.channel.sendBankImage({
			bank: loot.values(),
			title: `You opened ${quantity} ${botOpenable.name}`,
			flags: {
				showNewCL: 1,
				wide: Object.keys(loot.values()).length > 250 ? 1 : 0,
				...msg.flagArgs
			},
			user: msg.author,
			content: hasSmokey ? `You got ${smokeyBonus}x bonus rolls from Smokey.` : undefined,
			cl: previousCL
		});
	}
}
