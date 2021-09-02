import { randArrItem, roll } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { requiresMinion } from '../../lib/minions/decorators';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Nursery, Species, tameSpecies } from '../../lib/tames';
import { TameGrowthStage, TamesTable } from '../../lib/typeorm/TamesTable.entity';
import { formatDuration, gaussianRandom, stringMatches, updateBankSetting } from '../../lib/util';

export async function generateNewTame(user: KlasaUser, species: Species) {
	const tame = new TamesTable();
	tame.userID = user.id;
	tame.speciesID = species.id;
	tame.growthStage = TameGrowthStage.Baby;
	tame.currentGrowthPercent = 0;

	tame.variant = randArrItem(species.variants);
	if (species.shinyVariant && roll(100)) tame.variant = species.shinyVariant;
	let isShiny = tame.variant === species.shinyVariant;

	const [minCmbt, maxCmbt] = species.combatLevelRange;
	tame.maxCombatLevel = isShiny ? maxCmbt : gaussianRandom(minCmbt, maxCmbt);

	const [minArt, maxArt] = species.artisanLevelRange;
	tame.maxArtisanLevel = isShiny ? maxArt : gaussianRandom(minArt, maxArt);

	const [minSup, maxSup] = species.supportLevelRange;
	tame.maxSupportLevel = isShiny ? maxSup : gaussianRandom(minSup, maxSup);

	const [minGath, maxGath] = species.gathererLevelRange;
	tame.maxGathererLevel = isShiny ? maxGath : gaussianRandom(minGath, maxGath);

	tame.totalLoot = {};
	tame.fedItems = {};

	await tame.save();
	return tame;
}

export default class POHCommand extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion'],
			description: 'Allows you to access and build in your POH.',
			examples: ['+poh build demonic throne', '+poh', '+poh items', '+poh destroy demonic throne'],
			subcommands: true,
			usage: '[build|add|fuel] [input:...str]',
			usageDelim: ' '
		});
	}

	@requiresMinion
	async run(msg: KlasaMessage) {
		const nursery = msg.author.settings.get(UserSettings.Nursery);
		if (!nursery) {
			return msg.channel.send(
				`You don't have a nursery built yet! You can build one using \`${msg.cmdPrefix}nursery build\``
			);
		}

		const { egg } = nursery;
		if (!egg) {
			return msg.channel.send('You have no egg in your nursery.');
		}

		const specie = tameSpecies.find(i => i.id === egg.species)!;

		const diff = Date.now() - egg.insertedAt;
		const timeRemaining = Math.max(0, specie.hatchTime - diff);
		if (diff >= specie.hatchTime) {
			const newNursery: Nursery = {
				egg: null,
				eggsHatched: nursery.eggsHatched + 1,
				hasFuel: false
			};
			await msg.author.settings.update(UserSettings.Nursery, newNursery);
			await generateNewTame(msg.author, specie);
			return msg.channel.send(`Your ${specie.name} Egg has hatched! You now have a ${specie.name} Baby.`);
		}

		return msg.channel.send(
			`Your nursery has a ${specie.name} Egg in it, it has ${formatDuration(
				timeRemaining
			)} until it hatches. You put it in ${formatDuration(diff)} ago.`
		);
	}

	async fuel(msg: KlasaMessage) {
		const nursery = msg.author.settings.get(UserSettings.Nursery);
		if (!nursery) {
			return msg.channel.send("You don't have a nursery.");
		}
		if (nursery.hasFuel) {
			return msg.channel.send('Your nursery already has fuel.');
		}
		const cost = new Bank().add('Elder logs', 2500).add('Coal', 10_000);
		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You need ${cost} to fuel your nursery.`);
		}
		await msg.confirm(
			`Are you sure you want to use ${cost} to fuel your nursery? You need to provide fuel once per egg.`
		);
		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.ConstructCostBank, cost);
		const newNursery: Nursery = {
			...nursery,
			hasFuel: true
		};
		await msg.author.settings.update(UserSettings.Nursery, newNursery);
		return msg.channel.send(
			`You fueled your nursery, it's now ready to keep an egg warm! Removed ${cost} from your bank.`
		);
	}

	async build(msg: KlasaMessage) {
		const nursery = msg.author.settings.get(UserSettings.Nursery);
		if (nursery) {
			return msg.channel.send('You already have a nursery built.');
		}
		if (msg.author.skillLevel(SkillsEnum.Construction) < 105) {
			return msg.channel.send('You need level 105 Construction to build a nursery.');
		}
		const cost = new Bank().add('Elder plank', 200).add('Marble block', 10).add('Feather', 500);
		if (!msg.author.owns(cost)) {
			return msg.channel.send(`You need ${cost} to build a nursery.`);
		}
		await msg.author.removeItemsFromBank(cost);
		updateBankSetting(this.client, ClientSettings.EconomyStats.ConstructCostBank, cost);
		const newNursery: Nursery = {
			egg: null,
			eggsHatched: 0,
			hasFuel: false
		};
		await msg.author.settings.update(UserSettings.Nursery, newNursery);
		return msg.channel.send(`You built a nursery! Removed ${cost} from your bank.`);
	}

	@requiresMinion
	async add(msg: KlasaMessage, [input = '']: [string]) {
		const nursery = msg.author.settings.get(UserSettings.Nursery);
		if (!nursery) {
			return msg.channel.send("You don't have a nursery built yet, so you can't add an egg to it.");
		}

		if (nursery.egg) {
			return msg.channel.send('Your nursery is already holding an egg.');
		}

		if (!nursery.hasFuel) {
			return msg.channel.send(
				`Your nursery has no fuel for a fire to keep the egg warm, add fuel for the egg using \`${msg.cmdPrefix}nursery fuel\`.`
			);
		}

		const bank = msg.author.bank();
		const specie = tameSpecies.find(s => stringMatches(input, s.egg.name) && bank.has(s.egg.id));
		if (!specie) {
			return msg.channel.send("That's not an valid egg, or you don't own it.");
		}

		if (!msg.flagArgs.confirm && !msg.flagArgs.cf) {
			const sellMsg = await msg.channel.send(
				'Are you sure you want to add the egg to your nursery? Say `confirm` to confirm.'
			);

			// Confirm the seller wants to sell
			try {
				await msg.channel.awaitMessages({
					max: 1,
					time: 20_000,
					errors: ['time'],
					filter: _msg => _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm'
				});
			} catch (err) {
				return sellMsg.edit('Cancelled..');
			}
		}

		await msg.author.removeItemFromBank(specie.egg.id);

		const newNursery: Nursery = {
			egg: {
				insertedAt: Date.now(),
				species: specie.id
			},
			eggsHatched: nursery.eggsHatched,
			hasFuel: false
		};
		await msg.author.settings.update(UserSettings.Nursery, newNursery);

		return msg.channel.send(`You put a ${specie.name} Egg in your nursery.`);
	}
}
