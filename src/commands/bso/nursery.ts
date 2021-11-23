import { randArrItem, reduceNumByPercent, roll } from 'e';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { Events } from '../../lib/constants';
import { requiresMinion } from '../../lib/minions/decorators';
import { prisma } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { BotCommand } from '../../lib/structures/BotCommand';
import { Nursery, Species, tameSpecies } from '../../lib/tames';
import { formatDuration, gaussianRandom, stringMatches, updateBankSetting } from '../../lib/util';
import { tame_growth } from '.prisma/client';

export async function generateNewTame(user: KlasaUser, species: Species) {
	let shinyChance = user.hasItemEquippedAnywhere('Ring of luck')
		? Math.floor(reduceNumByPercent(species.shinyChance, 3))
		: species.shinyChance;

	const [minCmbt, maxCmbt] = species.combatLevelRange;

	const [minArt, maxArt] = species.artisanLevelRange;

	const [minSup, maxSup] = species.supportLevelRange;

	const [minGath, maxGath] = species.gathererLevelRange;

	const tame = await prisma.tame.create({
		data: {
			user_id: user.id,
			species_id: species.id,
			growth_stage: tame_growth.baby,
			growth_percent: 0,
			species_variant:
				species.shinyVariant && roll(shinyChance) ? species.shinyVariant : randArrItem(species.variants),
			max_total_loot: {},
			fed_items: {},
			max_support_level: gaussianRandom(minSup, maxSup, 2),
			max_gatherer_level: gaussianRandom(minGath, maxGath, 2),
			max_artisan_level: gaussianRandom(minArt, maxArt, 2),
			max_combat_level: gaussianRandom(minCmbt, maxCmbt, 2)
		}
	});

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

		let diff = Date.now() - egg.insertedAt;
		let constructionMaster = msg.author.hasItemEquippedOrInBank('Construction master cape');
		let masterString = constructionMaster
			? '\n\nYour minion has constructed a very high quality nursery that hatches eggs twice as fast.'
			: '';
		if (constructionMaster) {
			diff += specie.hatchTime / 2;
		}
		const timeRemaining = Math.max(0, specie.hatchTime - diff);
		if (diff >= specie.hatchTime || !production) {
			const newNursery: Nursery = {
				egg: null,
				eggsHatched: nursery.eggsHatched + 1,
				hasFuel: false
			};
			await msg.author.settings.update(UserSettings.Nursery, newNursery);
			const newUserTame = await generateNewTame(msg.author, specie);

			if (newUserTame.species_variant === specie.shinyVariant) {
				this.client.emit(
					Events.ServerNotification,
					`**${msg.author.username}** just hatched a shiny ${specie.name}!`
				);
			}

			return msg.channel.send(`Your ${specie.name} Egg has hatched! You now have a ${specie.name} Baby.`);
		}

		return msg.channel.send(
			`Your nursery has a ${specie.name} Egg in it, it has ${formatDuration(
				timeRemaining
			)} until it hatches. You put it in ${formatDuration(diff)} ago.${masterString}`
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
		let constructionMaster = msg.author.hasItemEquippedOrInBank('Construction master cape');
		return msg.channel.send(
			`You built a nursery! Removed ${cost} from your bank.${
				constructionMaster
					? '\n\nYour minion has constructed a very high quality nursery that hatches eggs twice as fast.'
					: ''
			}`
		);
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

		await msg.author.removeItemsFromBank(new Bank().add(specie.egg.id));

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
