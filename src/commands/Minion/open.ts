import { KlasaMessage, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Misc } from 'oldschooljs';

import { Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import { BotCommand } from '../../lib/BotCommand';
import Openables from '../../lib/openables';
import {
	stringMatches,
	itemNameFromID,
	roll,
	addBanks,
	bankFromLootTableOutput,
	rand
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { cluesRares } from '../../lib/collectionLog';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';
import ClueTiers from '../../lib/minions/data/clueTiers';
import filterBankFromArrayOfItems from '../../lib/util/filterBankFromArrayOfItems';
import { mysteryBox } from '../../lib/simulation/mysteryBox';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';

const itemsToNotifyOf = Object.values(cluesRares)
	.flat(Infinity)
	.concat(
		ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward)
	)
	.concat([itemID('Bloodhound')]);

const allOpenables = [
	...Openables.map(i => i.itemID),
	...ClueTiers.map(i => i.id),
	itemID('Mystery box')
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '[name:string]',
			oneAtTime: true
		});
	}

	async showAvailable(msg: KlasaMessage) {
		const available = filterBankFromArrayOfItems(
			allOpenables,
			msg.author.settings.get(UserSettings.Bank)
		);

		if (Object.keys(available).length === 0) {
			return `You have no openable items.`;
		}

		const itemsAvailable = await createReadableItemListFromBank(this.client, available);
		return `You have ${itemsAvailable}.`;
	}

	async run(msg: KlasaMessage, [tier]: [string | undefined]) {
		if (!tier) {
			return msg.send(await this.showAvailable(msg));
		}

		if (['mystery', 'mbox', 'mystery box'].some(alias => stringMatches(alias, tier))) {
			const hasItem = await msg.author.hasItem(itemID('Mystery box'));
			if (!hasItem) {
				throw `You don't have a ${itemNameFromID(itemID('Mystery box'))} to open!`;
			}

			await msg.author.removeItemFromBank(itemID('Mystery box'));

			const loot = mysteryBox(rand(1, getUsersPerkTier(msg.author)));

			await msg.author.addItemsToBank(loot, true);

			const task = this.client.tasks.get('bankImage')!;

			const image = await task.generateBankImage(
				loot,
				`You opened a Mystery Box and received...`,
				true,
				{ showNewCL: 1 },
				msg.author
			);
			return msg.send(
				`You opened a Mystery Box 👻 and received...`,
				new MessageAttachment(image, 'osbot.png')
			);
		}

		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());
		if (!clueTier) {
			return this.nonClueOpen(msg, tier);
		}

		const hasCasket = await msg.author.hasItem(clueTier.id);
		if (!hasCasket) {
			throw `You don't have any ${
				clueTier.name
			} Caskets to open!\n\n However... ${await this.showAvailable(msg)}`;
		}

		await msg.author.removeItemFromBank(clueTier.id);

		let loot = clueTier.table.open();
		let opened = `You opened one of your ${clueTier.name} Clue Caskets`;

		let hadMimic = false;
		if (clueTier.mimicChance && roll(clueTier.mimicChance)) {
			loot = addBanks([Misc.Mimic.open(clueTier.name as 'master' | 'elite'), loot]);
			opened += ' and defeated the Mimic inside';
			hadMimic = true;
		}

		const nthCasket = (msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0) + 1;

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
		const keys = Object.keys(loot);
		if (keys.some(key => itemsToNotifyOf.includes(parseInt(key)))) {
			const lootStr = await createReadableItemListFromBank(this.client, loot);

			this.client.emit(
				Events.ServerNotification,
				`**${msg.author.username}'s** minion, ${
					msg.author.minionName
				}, just opened their ${formatOrdinal(nthCasket)} ${
					clueTier.name
				} casket and received **${lootStr}**!`
			);
		}

		if (Object.keys(loot).length === 0) {
			return msg.send(`${opened} and got nothing :(`);
		}

		this.client.emit(
			Events.Log,
			`${msg.author.username}[${msg.author.id}] opened a ${clueTier.name} casket.`
		);

		const task = this.client.tasks.get('bankImage')!;

		const image = await task.generateBankImage(
			loot,
			`You opened a ${clueTier.name} clue ${hadMimic ? 'with a mimic ' : ''}and received...`,
			true,
			{ showNewCL: 1 },
			msg.author
		);

		await msg.author.addItemsToBank(loot, true);

		msg.author.incrementClueScore(clueTier.id);
		if (hadMimic) {
			msg.author.incrementMonsterScore(MIMIC_MONSTER_ID);
		}

		return msg.send(
			`You have completed ${nthCasket} ${clueTier.name.toLowerCase()} Treasure Trails.`,
			new MessageAttachment(image, 'osbot.png')
		);
	}

	async nonClueOpen(msg: KlasaMessage, type: string) {
		const openable = Openables.find(thing =>
			thing.aliases.some(alias => stringMatches(alias, type))
		);

		if (!openable) {
			throw `That's not a valid thing you can open. You can open a clue tier (${ClueTiers.map(
				tier => tier.name
			).join(', ')}), or another non-clue thing (${Openables.map(thing => thing.name).join(
				', '
			)})`;
		}

		const hasItem = await msg.author.hasItem(openable.itemID);
		if (!hasItem) {
			throw `You don't have a ${itemNameFromID(openable.itemID)} to open!`;
		}

		await msg.author.removeItemFromBank(openable.itemID);

		const loot = bankFromLootTableOutput(openable.table.roll());

		await msg.author.addItemsToBank(loot, true);

		return msg.send(
			`${openable.emoji} You opened a ${openable.name} and received: ${
				Object.keys(loot).length > 0
					? await createReadableItemListFromBank(this.client, loot)
					: 'Nothing! Sad'
			}.`
		);
	}
}
