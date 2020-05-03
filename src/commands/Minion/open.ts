import { KlasaMessage, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Misc } from 'oldschooljs';

import { Events } from '../../lib/constants';
import { BotCommand } from '../../lib/BotCommand';
import Openables from '../../lib/openables';
import { stringMatches, itemNameFromID, addBankToBank, roll } from '../../lib/util';
import bankFromLootTableOutput from '../../lib/util/bankFromLootTableOutput';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { cluesRares } from '../../lib/collectionLog';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';
import ClueTiers from '../../lib/minions/data/clueTiers';

const itemsToNotifyOf: number[] = Object.values(cluesRares)
	.flat(Infinity)
	.concat(
		ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward)
	)
	.concat([itemID('Bloodhound')]);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			aliases: ['clue'],
			usage: '<ClueTier:string>',
			oneAtTime: true
		});
	}

	async run(msg: KlasaMessage, [tier]: [string]) {
		const clueTier = ClueTiers.find(_tier => _tier.name.toLowerCase() === tier.toLowerCase());
		if (!clueTier) {
			return this.nonClueOpen(msg, tier);
		}

		const hasCasket = await msg.author.hasItem(clueTier.id);
		if (!hasCasket) {
			throw `You don't have any ${clueTier.name} Caskets to open!`;
		}

		await msg.author.removeItemFromBank(clueTier.id);

		let loot = clueTier.table.open();
		let opened = `You opened one of your ${clueTier.name} Clue Caskets`;

		let hadMimic = false;
		if (clueTier.mimicChance && roll(clueTier.mimicChance)) {
			loot = addBankToBank(Misc.Mimic.open(clueTier.name as 'master' | 'elite'), loot);
			opened += ' and defeated the Mimic inside';
			hadMimic = true;
		}

		const nthCasket = msg.author.settings.get(UserSettings.ClueScores)[clueTier.id] ?? 0 + 1;

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

		await msg.author.addItemsToBank(loot, true);

		const task = this.client.tasks.get('bankImage')!;

		const image = await task.generateBankImage(
			loot,
			`You opened a ${clueTier.name} clue ${hadMimic ? 'with a mimic ' : ''}and received...`
		);

		msg.author.incrementClueScore(clueTier.id);
		const MIMIC_ID = 23184;
		if (hadMimic) {
			msg.author.incrementMonsterScore(MIMIC_ID);
		}

		return msg.send(new MessageAttachment(image, 'osbot.png'));
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
