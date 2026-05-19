import { MTame } from '@/lib/bso/structures/MTame.js';
import { type Nursery, type Species, TameSpeciesID, tameSpecies } from '@/lib/bso/tames/tames.js';

import { Events, formatDuration, gaussianRandom, reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { MathRNG, percentChance, randArrItem, roll } from 'node-rng';
import { Bank, Items, toKMB } from 'oldschooljs';

import { tame_growth } from '@/prisma/main.js';
import { globalConfig } from '@/lib/constants.js';

function makeTameNickname(species: Species) {
	switch (species.id) {
		case TameSpeciesID.Igne: {
			const prefixs = ['Flame', 'Fierce', 'Crimson', 'Fiery', 'Ancient', 'Scorched', 'Infernal'];
			const suffixs = ['Fang', 'Heart', 'Tail', 'Claw', 'Tooth', 'Wing'];
			return `${randArrItem(prefixs)} ${randArrItem(suffixs)}`;
		}
		case TameSpeciesID.Monkey: {
			const prefixs = ['Curious', 'Swift', 'Clever', 'Cheeky', 'Hairy'];
			const suffixs = ['Tail', 'Foot', 'Heart', 'Monkey', 'Paw'];
			return `${randArrItem(prefixs)} ${randArrItem(suffixs)}`;
		}
		case TameSpeciesID.Eagle: {
			const prefixs = ['Great', 'Noble', 'Sky', 'Soaring', 'Storm'];
			const suffixs = ['Claw', 'Wing', 'Feather', 'Talon', 'Beak'];
			return `${randArrItem(prefixs)} ${randArrItem(suffixs)}`;
		}
	}
}

export async function generateNewTame(user: MUser, species: Species) {
	const shinyChance = user.hasEquippedOrInBank(['Ring of luck'])
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
			max_support_level: gaussianRandom(MathRNG, minSup, maxSup, 2),
			max_gatherer_level: gaussianRandom(MathRNG, minGath, maxGath, 2),
			max_artisan_level: gaussianRandom(MathRNG, minArt, maxArt, 2),
			max_combat_level: gaussianRandom(MathRNG, minCmbt, maxCmbt, 2),
			nickname: makeTameNickname(species)
		}
	});

	return tame;
}

const breedingDuration = Time.Day * 7;
const breedingCooldown = Time.Day * 30;
const minimumBreedingCooldownCost = 1_000_000_000;
const maximumBreedingCooldownCost = 100_000_000_000;

function getBreedingCooldownCost(cooldownUntil: number) {
	const remaining = Math.max(0, cooldownUntil - Date.now());
	const remainingFraction = Math.min(1, remaining / breedingCooldown);
	return Math.ceil(
		minimumBreedingCooldownCost * (maximumBreedingCooldownCost / minimumBreedingCooldownCost) ** remainingFraction
	);
}

function makeHybridTameNickname(speciesIDs: TameSpeciesID[]) {
	return `${speciesIDs.map(id => tameSpecies.find(species => species.id === id)!.name).join('-')} Hybrid`;
}

async function createHybridTame(
	user: MUser,
	parentIDs: [number, number],
	parentSpeciesIDs: TameSpeciesID[]
): Promise<
	| { error: string }
	| {
			newTame: Awaited<ReturnType<typeof prisma.tame.create>>;
			isShiny: boolean;
			deaths: MTame[];
			speciesName: string;
	  }
> {
	const parents = await prisma.tame.findMany({
		where: {
			user_id: user.id,
			id: {
				in: parentIDs
			}
		}
	});
	if (parents.length !== 2) {
		return { error: 'One of the parent tames could not be found, so the breeding failed.' };
	}

	const wrappedParents = parents.map(parent => new MTame(parent));
	const primarySpecies = tameSpecies.find(species => species.id === parentSpeciesIDs[0])!;
	const parentSpecies = parentSpeciesIDs.map(id => tameSpecies.find(species => species.id === id)!);
	const shinyParents = wrappedParents.filter(parent => parent.isShiny).length;
	const shinyChance =
		shinyParents === 2
			? 1
			: shinyParents === 1
				? Math.max(1, Math.floor(primarySpecies.shinyChance / 2))
				: primarySpecies.shinyChance;
	const isShiny = shinyParents === 2 || roll(shinyChance);
	const parentFedItems = wrappedParents.reduce((bank, parent) => bank.add(parent.fedItems), new Bank());
	const parentLoot = wrappedParents.reduce((bank, parent) => bank.add(parent.totalLoot), new Bank());
	const parentCost = wrappedParents.reduce((bank, parent) => bank.add(parent.totalCost), new Bank());

	const newTame = await prisma.tame.create({
		data: {
			user_id: user.id,
			species_id: primarySpecies.id,
			parent_species_ids: parentSpeciesIDs,
			growth_stage: tame_growth.baby,
			growth_percent: 0,
			species_variant: isShiny ? primarySpecies.shinyVariant : randArrItem(primarySpecies.variants),
			max_total_loot: parentLoot.toJSON(),
			fed_items: parentFedItems.toJSON(),
			total_cost: parentCost.toJSON(),
			max_support_level: Math.max(...wrappedParents.map(parent => parent.maxSupportLevel)),
			max_gatherer_level: Math.max(...wrappedParents.map(parent => parent.maxGathererLevel)),
			max_artisan_level: Math.max(...wrappedParents.map(parent => parent.maxArtisanLevel)),
			max_combat_level: Math.max(...wrappedParents.map(parent => parent.maxCombatLevel)),
			nickname: makeHybridTameNickname(parentSpeciesIDs)
		}
	});

	const deadParent = percentChance(75) ? randArrItem(wrappedParents) : null;
	const deaths = deadParent ? [deadParent] : [];
	for (const parent of deaths) {
		await prisma.tameActivity.updateMany({
			where: {
				tame_id: parent.id
			},
			data: {
				tame_id: newTame.id
			}
		});
		await prisma.tame.delete({
			where: {
				id: parent.id
			}
		});
	}

	if (deaths.some(parent => parent.id === user.user.selected_tame)) {
		await user.update({
			selected_tame: newTame.id
		});
	}

	return {
		newTame,
		isShiny,
		deaths,
		speciesName: parentSpecies.map(species => species.name).join('/')
	};
}

async function view(user: MUser) {
	const nursery = user.user.nursery as Nursery;
	if (!nursery) {
		return "You don't have a nursery built yet! You can build one using `/nursery build`";
	}

	const { egg } = nursery;
	if (nursery.breeding) {
		const timeRemaining = Math.max(0, nursery.breeding.finishAt - Date.now());
		if (timeRemaining > 0 && globalConfig.isProduction) {
			return `Your breeding centre is creating a mutated hybrid tame. It has ${formatDuration(
				timeRemaining
			)} remaining.`;
		}

		const res = await createHybridTame(
			user,
			nursery.breeding.parentTameIDs,
			nursery.breeding.parentSpeciesIDs as TameSpeciesID[]
		);
		const newNursery: NonNullable<Nursery> = {
			...nursery,
			breeding: null
		};
		await user.update({
			nursery: newNursery
		});

		if ('error' in res) return res.error;
		if (res.isShiny) {
			globalClient.emit(
				Events.ServerNotification,
				`**${user}** just bred a shiny ${res.speciesName} hybrid tame!`
			);
		}
		const deathStr =
			res.deaths.length === 0
				? 'Both parents survived the exhaustion.'
				: `${res.deaths[0]} (${res.deaths[0].id}) died from exhaustion.`;
		return `Your breeding process finished! You now have a mutated ${res.speciesName} hybrid baby tame. ${deathStr}`;
	}
	if (!egg) {
		return 'You have no egg in your nursery.';
	}

	const specie = tameSpecies.find(i => i.id === egg.species)!;

	let diff = Date.now() - egg.insertedAt;
	const constructionMaster = user.hasEquippedOrInBank('Construction master cape');
	const masterString = constructionMaster
		? '\n\nYour minion has constructed a very high quality nursery that hatches eggs twice as fast.'
		: '';
	if (constructionMaster) {
		diff += specie.hatchTime / 2;
	}
	const timeRemaining = Math.max(0, specie.hatchTime - diff);
	if (diff >= specie.hatchTime || !globalConfig.isProduction) {
		const newNursery: NonNullable<Nursery> = {
			egg: null,
			eggsHatched: nursery.eggsHatched + 1,
			hasFuel: false
		};
		await user.update({
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

async function fuelCommand(interaction: MInteraction, user: MUser) {
	const nursery = user.user.nursery as Nursery;
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

	await interaction.confirmation(
		`Are you sure you want to use ${cost} to fuel your nursery? You need to provide fuel once per egg.`
	);
	await user.removeItemsFromBank(cost);
	await ClientSettings.updateBankSetting('construction_cost_bank', cost);
	const newNursery: NonNullable<Nursery> = {
		...nursery,
		hasFuel: true
	};
	await user.update({
		nursery: newNursery
	});
	return `You fueled your nursery, it's now ready to keep an egg warm! Removed ${cost} from your bank.`;
}

async function buildCommand(user: MUser) {
	const nursery = user.user.nursery as Nursery;
	if (nursery) {
		return 'You already have a nursery built.';
	}
	if (user.skillLevel('construction') < 105) {
		return 'You need level 105 Construction to build a nursery.';
	}
	const cost = new Bank().add('Elder plank', 200).add('Marble block', 10).add('Feather', 500);
	if (!user.owns(cost)) {
		return `You need ${cost} to build a nursery.`;
	}
	await user.removeItemsFromBank(cost);
	await ClientSettings.updateBankSetting('construction_cost_bank', cost);
	const newNursery: Nursery = {
		egg: null,
		eggsHatched: 0,
		hasFuel: false
	};
	await user.update({
		nursery: newNursery
	});
	const constructionMaster = user.hasEquippedOrInBank('Construction master cape');
	return `You built a nursery! Removed ${cost} from your bank.${
		constructionMaster
			? '\n\nYour minion has constructed a very high quality nursery that hatches eggs twice as fast.'
			: ''
	}`;
}

async function addCommand(interaction: MInteraction, user: MUser, itemName: string) {
	const nursery = user.user.nursery as Nursery | null;
	if (!nursery) {
		return "You don't have a nursery built yet, so you can't add an egg to it.";
	}

	if (nursery.egg) {
		return 'Your nursery is already holding an egg.';
	}

	if (!nursery.hasFuel) {
		return 'Your nursery has no fuel for a fire to keep the egg warm, add fuel for the egg using `/nursery fuel`.';
	}
	const item = Items.getItem(itemName);
	if (!item) return "That's not a valid item.";

	const { bank } = user;
	const specie = tameSpecies.find(s => s.egg === item && bank.has(s.egg.id));
	if (!specie) {
		return "That's not an valid egg, or you don't own it.";
	}

	await interaction.confirmation(`Are you sure you want to add '${item.name}' to your nursery?`);

	await user.removeItemsFromBank(new Bank().add(specie.egg.id));

	const newNursery: Nursery = {
		egg: {
			insertedAt: Date.now(),
			species: specie.id
		},
		eggsHatched: nursery.eggsHatched,
		hasFuel: false
	};
	await user.update({
		nursery: newNursery
	});

	return `You put a ${specie.name} Egg in your nursery.`;
}

async function breedAutocomplete({ value, user }: StringAutoComplete) {
	const tames = await user.fetchTames();
	return tames
		.filter(tame => tame.growthStage === tame_growth.adult)
		.map(tame => ({
			name: `${tame} (${tame.hybridSpeciesName()}, Tame ${tame.id})`,
			value: tame.id.toString()
		}))
		.filter(tame => (!value ? true : tame.name.toLowerCase().includes(value.toLowerCase())));
}

async function breedCommand(
	interaction: MInteraction,
	user: MUser,
	parentOneID: number,
	parentTwoID: number,
	overrideCooldown: boolean
): Promise<string> {
	const nursery = user.user.nursery as Nursery | null;
	if (!nursery) {
		return "You don't have a nursery built yet! You can build one using `/nursery build`";
	}
	if (nursery.egg) {
		return "Your nursery is already holding an egg. You can't use the breeding centre while an egg is incubating.";
	}
	if (nursery.breeding) {
		return `Your breeding centre is already in use. It has ${formatDuration(
			Math.max(0, nursery.breeding.finishAt - Date.now())
		)} remaining.`;
	}
	const cooldownUntil = nursery.breedingCooldownUntil ?? 0;
	if (cooldownUntil > Date.now()) {
		const cost = new Bank().add('Coins', getBreedingCooldownCost(cooldownUntil));
		if (!overrideCooldown) {
			return `Your breeding centre is on cooldown for ${formatDuration(
				cooldownUntil - Date.now()
			)}. You can override it now for ${toKMB(cost.amount('Coins'))} GP.`;
		}
		if (!user.owns(cost)) {
			return `You need ${cost} to override your breeding centre cooldown.`;
		}
		await interaction.confirmation(
			`Are you sure you want to pay ${toKMB(cost.amount('Coins'))} GP to override your breeding centre cooldown?`
		);
		await user.removeItemsFromBank(cost);
		await ClientSettings.updateBankSetting('tame_merging_cost', cost);
	}

	if (parentOneID === parentTwoID) {
		return "You can't breed a tame with itself.";
	}
	const tames = await user.fetchTames();
	const parentOne = tames.find(tame => tame.id === parentOneID);
	const parentTwo = tames.find(tame => tame.id === parentTwoID);
	if (!parentOne || !parentTwo) {
		return "Couldn't find both parent tames.";
	}
	if (parentOne.growthStage !== tame_growth.adult || parentTwo.growthStage !== tame_growth.adult) {
		return 'Both parent tames need to be adults.';
	}
	const busyParents = await prisma.tameActivity.count({
		where: {
			tame_id: {
				in: [parentOne.id, parentTwo.id]
			},
			completed: false
		}
	});
	if (busyParents > 0) {
		return 'Both parent tames need to be idle before breeding.';
	}
	if (parentOne.equippedArmor || parentOne.equippedPrimary || parentTwo.equippedArmor || parentTwo.equippedPrimary) {
		return 'Both parent tames must have all gear unequipped before breeding.';
	}
	const parentSpeciesIDs = [...new Set([...parentOne.parentSpeciesIDs, ...parentTwo.parentSpeciesIDs])];
	if (parentSpeciesIDs.length < 2) {
		return 'You need to breed two different tame species to create a mutated hybrid.';
	}
	if (parentSpeciesIDs.length > 2) {
		return 'You can only breed two species into a hybrid.';
	}

	await interaction.confirmation(
		`Are you sure you want to breed **${parentOne}** (Tame ${parentOne.id}) with **${parentTwo}** (Tame ${parentTwo.id})?\n\nThe process takes ${formatDuration(
			breedingDuration
		)}. When it finishes, there is a 75% chance one parent dies from exhaustion.`
	);

	const newNursery: NonNullable<Nursery> = {
		...nursery,
		breeding: {
			parentTameIDs: [parentOne.id, parentTwo.id],
			parentSpeciesIDs,
			startedAt: Date.now(),
			finishAt: Date.now() + breedingDuration
		},
		breedingCooldownUntil: Date.now() + breedingCooldown
	};
	await user.update({
		nursery: newNursery
	});

	return `Your breeding centre is now breeding ${parentOne} with ${parentTwo}. Check back in ${formatDuration(
		breedingDuration
	)} to receive the mutated hybrid tame.`;
}

export const nurseryCommand = defineCommand({
	name: 'nursery',
	description: 'Manage your tame nursery.',
	options: [
		{
			type: 'Subcommand',
			name: 'build',
			description: "Build your nursery, if you don't have one."
		},
		{
			type: 'Subcommand',
			name: 'fuel',
			description: 'Add fuel to your nursery.'
		},
		{
			type: 'Subcommand',
			name: 'add_egg',
			description: 'Add an egg to your nursery.',
			options: [
				{
					type: 'String',
					name: 'item',
					description: 'The egg you want to add to your nursery.',
					choices: tameSpecies.map(i => i.egg).map(i => ({ name: i.name, value: i.name })),
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'check',
			description: 'Check your nursery, and to see if your egg has hatched.'
		},
		{
			type: 'Subcommand',
			name: 'breed',
			description: 'Breed two different adult tame species into a mutated hybrid tame.',
			options: [
				{
					type: 'String',
					name: 'parent_one',
					description: 'The first adult tame parent.',
					required: true,
					autocomplete: breedAutocomplete
				},
				{
					type: 'String',
					name: 'parent_two',
					description: 'The second adult tame parent.',
					required: true,
					autocomplete: breedAutocomplete
				},
				{
					type: 'Boolean',
					name: 'override_cooldown',
					description: 'Pay GP to override the breeding centre cooldown.',
					required: false
				}
			]
		}
	],
	run: async ({ user, options, interaction }) => {
		if (options.build) return buildCommand(user);
		if (options.fuel) return fuelCommand(interaction, user);
		if (options.add_egg) return addCommand(interaction, user, options.add_egg.item);
		if (options.breed) {
			return breedCommand(
				interaction,
				user,
				Number(options.breed.parent_one),
				Number(options.breed.parent_two),
				options.breed.override_cooldown ?? false
			);
		}
		return view(user);
	}
});
