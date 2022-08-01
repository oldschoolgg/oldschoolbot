import { tame_growth, User } from '@prisma/client';
import { randArrItem, reduceNumByPercent } from 'e';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { Events } from '../../lib/constants';
import { prisma } from '../../lib/settings/prisma';
import { ClientSettings } from '../../lib/settings/types/ClientSettings';
import { SkillsEnum } from '../../lib/skilling/types';
import { Nursery, Species, tameSpecies } from '../../lib/tames';
import { formatDuration, gaussianRandom, roll, updateBankSetting } from '../../lib/util';
import { getItem } from '../../lib/util/getOSItem';
import { hasItemsEquippedOrInBank } from '../../lib/util/minionUtils';
import { OSBMahojiCommand } from '../lib/util';
import { handleMahojiConfirmation, mahojiUserSettingsUpdate, mahojiUsersSettingsFetch } from '../mahojiSettings';

export async function generateNewTame(user: KlasaUser | User, species: Species) {
	let shinyChance = hasItemsEquippedOrInBank(user, ['Ring of luck'])
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

async function view(user: KlasaUser, mahojiUser: User) {
	const nursery = mahojiUser.nursery as Nursery;
	if (!nursery) {
		return "You don't have a nursery built yet! You can build one using `/nursery build`";
	}

	const { egg } = nursery;
	if (!egg) {
		return 'You have no egg in your nursery.';
	}

	const specie = tameSpecies.find(i => i.id === egg.species)!;

	let diff = Date.now() - egg.insertedAt;
	let constructionMaster = user.hasItemEquippedOrInBank('Construction master cape');
	let masterString = constructionMaster
		? '\n\nYour minion has constructed a very high quality nursery that hatches eggs twice as fast.'
		: '';
	if (constructionMaster) {
		diff += specie.hatchTime / 2;
	}
	const timeRemaining = Math.max(0, specie.hatchTime - diff);
	if (diff >= specie.hatchTime || !production) {
		const newNursery: NonNullable<Nursery> = {
			egg: null,
			eggsHatched: nursery.eggsHatched + 1,
			hasFuel: false
		};
		await mahojiUserSettingsUpdate(user.id, {
			nursery: newNursery
		});
		const newUserTame = await generateNewTame(user, specie);

		if (newUserTame.species_variant === specie.shinyVariant) {
			globalClient.emit(Events.ServerNotification, `**${user}** just hatched a shiny ${specie.name}!`);
		}

		return `Your ${specie.name} Egg has hatched! You now have a ${specie.name} Baby.`;
	}

	return `Your nursery has a ${specie.name} Egg in it, it has ${formatDuration(
		timeRemaining
	)} until it hatches. You put it in ${formatDuration(diff)} ago.${masterString}`;
}

async function fuelCommand(interaction: SlashCommandInteraction, user: KlasaUser, mahojiUser: User) {
	const nursery = mahojiUser.nursery as Nursery;
	if (!nursery) {
		return "You don't have a nursery.";
	}
	if (nursery.hasFuel) {
		return 'Your nursery already has fuel.';
	}
	const cost = new Bank().add('Elder logs', 2500).add('Coal', 10_000);
	if (!user.owns(cost)) {
		return `You need ${cost} to fuel your nursery.`;
	}

	await handleMahojiConfirmation(
		interaction,
		`Are you sure you want to use ${cost} to fuel your nursery? You need to provide fuel once per egg.`
	);
	await user.removeItemsFromBank(cost);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, cost);
	const newNursery: NonNullable<Nursery> = {
		...nursery,
		hasFuel: true
	};
	await mahojiUserSettingsUpdate(user.id, {
		nursery: newNursery
	});
	return `You fueled your nursery, it's now ready to keep an egg warm! Removed ${cost} from your bank.`;
}

async function buildCommand(user: KlasaUser, mahojiUser: User) {
	const nursery = mahojiUser;
	if (nursery) {
		return 'You already have a nursery built.';
	}
	if (user.skillLevel(SkillsEnum.Construction) < 105) {
		return 'You need level 105 Construction to build a nursery.';
	}
	const cost = new Bank().add('Elder plank', 200).add('Marble block', 10).add('Feather', 500);
	if (!user.owns(cost)) {
		return `You need ${cost} to build a nursery.`;
	}
	await user.removeItemsFromBank(cost);
	updateBankSetting(globalClient, ClientSettings.EconomyStats.ConstructCostBank, cost);
	const newNursery: Nursery = {
		egg: null,
		eggsHatched: 0,
		hasFuel: false
	};
	await mahojiUserSettingsUpdate(user.id, {
		nursery: newNursery
	});
	let constructionMaster = user.hasItemEquippedOrInBank('Construction master cape');
	return `You built a nursery! Removed ${cost} from your bank.${
		constructionMaster
			? '\n\nYour minion has constructed a very high quality nursery that hatches eggs twice as fast.'
			: ''
	}`;
}

async function addCommand(interaction: SlashCommandInteraction, user: KlasaUser, mahojiUser: User, itemName: string) {
	const nursery = mahojiUser.nursery as Nursery | null;
	if (!nursery) {
		return "You don't have a nursery built yet, so you can't add an egg to it.";
	}

	if (nursery.egg) {
		return 'Your nursery is already holding an egg.';
	}

	if (!nursery.hasFuel) {
		return 'Your nursery has no fuel for a fire to keep the egg warm, add fuel for the egg using `/nursery fuel`.';
	}
	const item = getItem(itemName);
	if (!item) return "That's not a valid item.";

	const bank = user.bank();
	const specie = tameSpecies.find(s => s.egg === item && bank.has(s.egg.id));
	if (!specie) {
		return "That's not an valid egg, or you don't own it.";
	}

	await handleMahojiConfirmation(interaction, `Are you sure you want to add '${item.name}' to your nursery?`);

	await user.removeItemsFromBank(new Bank().add(specie.egg.id));

	const newNursery: Nursery = {
		egg: {
			insertedAt: Date.now(),
			species: specie.id
		},
		eggsHatched: nursery.eggsHatched,
		hasFuel: false
	};
	await mahojiUserSettingsUpdate(user.id, {
		nursery: newNursery
	});

	return `You put a ${specie.name} Egg in your nursery.`;
}

export const nurseryCommand: OSBMahojiCommand = {
	name: 'nursery',
	description: 'Manage your tame nursery.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'build',
			description: "Build your nursery, if you don't have one."
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'fuel',
			description: 'Add fuel to your nursery.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add_egg',
			description: 'Add an egg to your nursery.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'item',
					description: 'The egg you want to add to your nursery.',
					choices: tameSpecies.map(i => i.egg).map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'check',
			description: 'Check your nursery, and to see if your egg has hatched.'
		}
	],
	run: async ({
		userID,
		options,
		interaction
	}: CommandRunOptions<{ build?: {}; fuel?: {}; add_egg?: { item: string }; check?: {} }>) => {
		const user = await globalClient.fetchUser(userID);
		const mahojiUser = await mahojiUsersSettingsFetch(userID);
		if (options.build) return buildCommand(user, mahojiUser);
		if (options.fuel) return fuelCommand(interaction, user, mahojiUser);
		if (options.add_egg) return addCommand(interaction, user, mahojiUser, options.add_egg.item);
		return view(user, mahojiUser);
	}
};
