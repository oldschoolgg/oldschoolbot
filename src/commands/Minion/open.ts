import { KlasaMessage, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Events, MIMIC_MONSTER_ID } from '../../lib/constants';
import { BotCommand } from '../../lib/BotCommand';
import Openables from '../../lib/openables';
import {
	stringMatches,
	itemNameFromID,
	roll,
	addBanks,
	bankFromLootTableOutput
} from '../../lib/util';
import createReadableItemListFromBank from '../../lib/util/createReadableItemListFromTuple';
import { cluesRares } from '../../lib/collectionLog';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import itemID from '../../lib/util/itemID';
import ClueTiers from '../../lib/minions/data/clueTiers';

// import LootTable from 'oldschooljs/dist/structures/LootTable';
/* import {
	LowSeedTable,
	MediumSeedTable,
	HighSeedTable,
} from '../../lib/simulation/seedPack';

const itemsToNotifyOf = Object.values(cluesRares)
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
			)}) except for lucky IMP`;
		}

		const numItemsHas = await msg.author.numberOfItemInBank(openable.id);
		if (!numItemsHas) {
			throw `You don't have any to open!`;
		}

		/* Look into putting restrictions here
		if (!msg.author.hasOpenableRequirements(openable)) {
			throw `You don't have the requirements to open that!`;
		}
		*/
		const fishlvl = msg.author.skillLevel(SkillsEnum.Fishing) as number;

		/* temp var tier = 5 until Andre commits farming
		var tier = msg.author.settings.get(UserSettings.FarmingContracts.FarmingContract);
        */
		const tier = 5;
		let loot;
		openable.name.toLowerCase();

		switch (true) {
			case openable.id === Openables.BrimstoneChest.id: {
				loot = Openables.BrimstoneChest.open(fishlvl);
				break;
			}
			case openable.id === Openables.LarransChest.id: {
				if (openable.name.indexOf('big') > -1) {
					loot = Openables.LarransChest.open(fishlvl, 'big', 1);
				} else {
					loot = Openables.LarransChest.open(fishlvl, 'small', 1);
				}
				break;
			}
			case openable.id === Openables.SeedPack.id: {
				loot = Openables.SeedPack.open(tier);
				break;
			}
			default: {
				loot = openable.open(1, openable.name);
				break;
			}
		}

		await msg.author.removeItemFromBank(openable.id, 1);

		await msg.author.addItemsToBank(loot, true);

		return msg.send(
			`You opened ${openable.name} and received: ${
				Object.keys(loot).length > 0
					? await createReadableItemListFromBank(this.client, loot)
					: 'Nothing! Sad'
			}.`
		);
	}
}
