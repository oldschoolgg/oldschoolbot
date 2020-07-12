import { KlasaMessage, CommandStore } from 'klasa';
import { MessageAttachment } from 'discord.js';
import { Misc } from 'oldschooljs';
import { rand } from '../../util'
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
import LootTable from 'oldschooljs/dist/structures/LootTable';
import {
	LowSeedTable,
	MediumSeedTable,
	HighSeedTable,
} from '../../lib/simulation/seedPack';

const itemsToNotifyOf = Object.values(cluesRares)
	.flat(Infinity)
	.concat(
		ClueTiers.filter(i => Boolean(i.milestoneReward)).map(i => i.milestoneReward!.itemReward)
	)
	.concat(
		[itemID('Bloodhound')]
	);

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
			)})`;
		}

		const numItemsHas = await msg.author.numberOfItemInBank(openable.itemID);
		if (!numItemsHas) {
			throw `You don't have any to open!`;
		}
		
		if (!msg.author.hasOpenableRequirements(openable)) {
			throw `You don't have the requirements to open that!`;
		}
		
		var currentTable = openable.table;
		if (openable.bonuses) { 
			var i=0;
			for (i; i < openable.bonuses.length; i++) {
				var currentBonus = openable.bonuses[i] as BonusOpenables;	
				if (currentBonus.skill == "fishing") {
					var userLevel = msg.author.skillLevel(SkillsEnum.Fishing) as number;
				} else if (currentBonus.skill == "cooking"){
					var userLevel = msg.author.skillLevel(SkillsEnum.Cooking) as number;
				} else { 
					throw `Error Locating Skill To Compare To`;
				}
				if (typeof currentBonus.req == "number") {
					if (userLevel >= currentBonus.req) {
						currentTable.add(currentBonus.item,currentBonus.qty,currentBonus.weight);
						await msg.author.log(`Added ${currentBonus.item} to the Loot Table`);
					}
				} else {
					if (userLevel >= currentBonus.req[0] && userLevel <= currentBonus.req[1]) {
						currentTable.add(currentBonus.item,currentBonus.qty,currentBonus.weight);
						await msg.author.log(`Added ${currentBonus.item} to the Loot Table`);
					}
				}
			}
		}

		/* Seed pack */
		if (openable.name == 'Seed pack') {
			var tier = msg.author.skillLevel(SkillsEnum.Fishing) as number;
			if (tier > 0 && tier < 6) {
				/* Roll amount variables */
				var high = 0
				var medium = 0
				var low = 0
				
				switch (tier) {
					case (tier=1): {
						high = 0
						medium = rand(1,3)
						low = 6 - medium
						break;
					}    
					case (tier=2): {
						var highroll = rand(1,11)
						if (highroll == 1) {
							high = 1
						}
						else {
							high = 0
						}
						medium = rand(2,3)
						low = 7 - medium - high
						break;
					}        
					case (tier=3): {
						high = rand(0,1)
						medium = rand(2,4)
						low = 8 - medium - high
						break;
					}
					case (tier=4): { 
						high = rand(1,2)
						medium = rand(3,5)
						low = 9 - medium - high
						break;
					}
					case (tier=5): {
						high = rand(1,3)
						medium = rand(4,6)
						low = 10 - medium - high
						break;
					}
				}
				/* Low seed roll */
				currentTable.every(LowSeedTable, low);
				/* Medium seed roll */
				currentTable.every(MediumSeedTable, medium);
				/* High seed roll */
				currentTable.every(HighSeedTable, high);
			}
		}
		
		/* Temp opens all keys */
		var testTable = new LootTable();
		testTable.every(currentTable,numItemsHas);
		
		const loot = await bankFromLootTableOutput(testTable.roll());
		
		await msg.author.removeItemFromBank(openable.itemID, numItemsHas);
		
		await msg.author.addItemsToBank(loot, true);
		
		return msg.send(
			`${openable.emoji} You opened ${numItemsHas} ${openable.name} and received: ${
				Object.keys(loot).length > 0
					? await createReadableItemListFromBank(this.client, loot)
					: 'Nothing! Sad'
			}.`
		);
	}
}
