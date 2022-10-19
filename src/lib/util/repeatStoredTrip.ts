import { activity_type_enum, Prisma } from '@prisma/client';
import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';
import { Time } from 'e';

import { autocompleteMonsters } from '../../mahoji/commands/k';
import { PvMMethod } from '../constants';
import { SlayerActivityConstants } from '../minions/data/combatConstants';
import { darkAltarRunes } from '../minions/functions/darkAltarCommand';
import { prisma } from '../settings/prisma';
import { runCommand } from '../settings/settings';
import {
	ActivityTaskOptionsWithQuantity,
	AgilityActivityTaskOptions,
	AlchingActivityTaskOptions,
	AnimatedArmourActivityTaskOptions,
	BuryingActivityTaskOptions,
	CastingActivityTaskOptions,
	CollectingOptions,
	ConstructionActivityTaskOptions,
	CookingActivityTaskOptions,
	CraftingActivityTaskOptions,
	DarkAltarOptions,
	EnchantingActivityTaskOptions,
	FarmingActivityTaskOptions,
	FiremakingActivityTaskOptions,
	FishingActivityTaskOptions,
	FletchingActivityTaskOptions,
	GauntletOptions,
	GroupMonsterActivityTaskOptions,
	HerbloreActivityTaskOptions,
	HunterActivityTaskOptions,
	KourendFavourActivityTaskOptions,
	MiningActivityTaskOptions,
	MonsterActivityTaskOptions,
	NexTaskOptions,
	NightmareActivityTaskOptions,
	OfferingActivityTaskOptions,
	PickpocketActivityTaskOptions,
	PuroPuroActivityTaskOptions,
	RaidsOptions,
	RevenantOptions,
	RunecraftActivityTaskOptions,
	SawmillActivityTaskOptions,
	ScatteringActivityTaskOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	TempleTrekkingActivityTaskOptions,
	TheatreOfBloodTaskOptions,
	WoodcuttingActivityTaskOptions
} from '../types/minions';
import { itemNameFromID } from '../util';

export const taskCanBeRepeated = (type: activity_type_enum) =>
	!(
		[
			activity_type_enum.TearsOfGuthix,
			activity_type_enum.ShootingStars,
			activity_type_enum.BirthdayEvent,
			activity_type_enum.BlastFurnace,
			activity_type_enum.Easter,
			activity_type_enum.TokkulShop,
			activity_type_enum.Birdhouse,
			activity_type_enum.ClueCompletion
		] as activity_type_enum[]
	).includes(type);

export const tripHandlers = {
	[activity_type_enum.ClueCompletion]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.Birdhouse]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.TearsOfGuthix]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.TokkulShop]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.ShootingStars]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.BirthdayEvent]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.BlastFurnace]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.Easter]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.AerialFishing]: {
		commandName: 'activities',
		args: () => ({ aerial_fishing: {} })
	},
	[activity_type_enum.Agility]: {
		commandName: 'laps',
		args: (data: AgilityActivityTaskOptions) => ({
			name: data.courseID,
			quantity: data.quantity,
			alch: Boolean(data.alch)
		})
	},
	[activity_type_enum.AgilityArena]: {
		commandName: 'minigames',
		args: () => ({ agility_arena: { start: {} } })
	},
	[activity_type_enum.AgilityArena]: {
		commandName: 'minigames',
		args: () => ({ agility_arena: { start: {} } })
	},
	[activity_type_enum.Alching]: {
		commandName: 'activities',
		args: (data: AlchingActivityTaskOptions) => ({
			alch: { quantity: data.quantity, item: itemNameFromID(data.itemID) }
		})
	},
	[activity_type_enum.AnimatedArmour]: {
		commandName: 'activities',
		args: (data: AnimatedArmourActivityTaskOptions) => ({
			warriors_guild: { action: 'tokens', quantity: data.quantity }
		})
	},
	[activity_type_enum.BarbarianAssault]: {
		commandName: 'minigames',
		args: () => ({ barb_assault: { start: {} } })
	},
	[activity_type_enum.BigChompyBirdHunting]: {
		commandName: 'activities',
		args: () => ({ chompy_hunt: { action: 'start' } })
	},
	[activity_type_enum.Smelting]: {
		commandName: 'smelt',
		args: (data: SmeltingActivityTaskOptions) => ({
			name: itemNameFromID(data.barID),
			quantity: data.quantity,
			blast_furnace: data.blastf
		})
	},
	[activity_type_enum.Burying]: {
		commandName: 'activities',
		args: (data: BuryingActivityTaskOptions) => ({
			bury: { quantity: data.quantity, name: itemNameFromID(data.boneID) }
		})
	},
	[activity_type_enum.Scattering]: {
		commandName: 'activities',
		args: (data: ScatteringActivityTaskOptions) => ({
			scatter: { quantity: data.quantity, name: itemNameFromID(data.ashID) }
		})
	},
	[activity_type_enum.Casting]: {
		commandName: 'activities',
		args: (data: CastingActivityTaskOptions) => ({ cast: { spell: data.spellID, quantity: data.quantity } })
	},
	[activity_type_enum.CastleWars]: {
		commandName: 'minigames',
		args: () => ({ castle_wars: { start: {} } })
	},
	[activity_type_enum.ChampionsChallenge]: {
		commandName: 'activities',
		args: () => ({ champions_challenge: {} })
	},
	[activity_type_enum.Collecting]: {
		commandName: 'activities',
		args: (data: CollectingOptions) => ({
			collect: { item: itemNameFromID(data.collectableID), no_stams: data.noStaminas, quantity: data.quantity }
		})
	},
	[activity_type_enum.Construction]: {
		commandName: 'build',
		args: (data: ConstructionActivityTaskOptions) => ({ name: data.objectID, quantity: data.quantity })
	},
	[activity_type_enum.Cooking]: {
		commandName: 'cook',
		args: (data: CookingActivityTaskOptions) => ({ name: itemNameFromID(data.cookableID), quantity: data.quantity })
	},
	[activity_type_enum.Crafting]: {
		commandName: 'craft',
		args: (data: CraftingActivityTaskOptions) => ({
			name: itemNameFromID(data.craftableID),
			quantity: data.quantity
		})
	},
	[activity_type_enum.Cyclops]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			warriors_guild: { action: 'cyclops', quantity: data.quantity }
		})
	},
	[activity_type_enum.DarkAltar]: {
		commandName: 'runecraft',
		args: (data: DarkAltarOptions) => ({ rune: darkAltarRunes[data.rune].item.name })
	},
	[activity_type_enum.Runecraft]: {
		commandName: 'runecraft',
		args: (data: RunecraftActivityTaskOptions) => ({
			rune: itemNameFromID(data.runeID),
			quantity: data.essenceQuantity,
			daeyalt_essence: data.daeyaltEssence,
			usestams: data.useStaminas
		})
	},
	[activity_type_enum.DriftNet]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			driftnet_fishing: { minutes: Math.floor(data.duration / Time.Minute) }
		})
	},
	[activity_type_enum.Enchanting]: {
		commandName: 'activities',
		args: (data: EnchantingActivityTaskOptions) => ({
			enchant: { quantity: data.quantity, name: itemNameFromID(data.itemID) }
		})
	},
	[activity_type_enum.Farming]: {
		commandName: 'farming',
		args: (data: FarmingActivityTaskOptions) =>
			data.autoFarmed
				? {
						auto_farm: {}
				  }
				: {}
	},
	[activity_type_enum.FightCaves]: {
		commandName: 'activities',
		args: () => ({ fight_caves: {} })
	},
	[activity_type_enum.Firemaking]: {
		commandName: 'light',
		args: (data: FiremakingActivityTaskOptions) => ({
			name: itemNameFromID(data.burnableID),
			quantity: data.quantity
		})
	},
	[activity_type_enum.Fishing]: {
		commandName: 'fish',
		args: (data: FishingActivityTaskOptions) => ({ name: data.fishID, quantity: data.quantity })
	},
	[activity_type_enum.FishingTrawler]: {
		commandName: 'minigames',
		args: () => ({ fishing_trawler: { start: {} } })
	},
	[activity_type_enum.Fletching]: {
		commandName: 'fletch',
		args: (data: FletchingActivityTaskOptions) => ({ name: data.fletchableName, quantity: data.quantity })
	},
	[activity_type_enum.Gauntlet]: {
		commandName: 'minigames',
		args: (data: GauntletOptions) => ({ gauntlet: { start: { corrupted: data.corrupted } } })
	},
	[activity_type_enum.GloryCharging]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({ charge: { item: 'glory', quantity: data.quantity } })
	},
	[activity_type_enum.GnomeRestaurant]: {
		commandName: 'minigames',
		args: () => ({ gnome_restaurant: { start: {} } })
	},
	[activity_type_enum.GroupMonsterKilling]: {
		commandName: 'mass',
		args: (data: GroupMonsterActivityTaskOptions) => ({
			monster: autocompleteMonsters.find(i => i.id === data.monsterID)?.name ?? data.monsterID.toString()
		})
	},
	[activity_type_enum.Herblore]: {
		commandName: 'mix',
		args: (data: HerbloreActivityTaskOptions) => ({
			name: itemNameFromID(data.mixableID),
			quantity: data.quantity,
			zahur: data.zahur
		})
	},
	[activity_type_enum.Hunter]: {
		commandName: 'hunt',
		args: (data: HunterActivityTaskOptions) => ({
			name: data.creatureName,
			quantity: data.quantity,
			hunter_potion: data.usingHuntPotion,
			stamina_potions: data.usingStaminaPotion
		})
	},
	[activity_type_enum.Inferno]: {
		commandName: 'activities',
		args: () => ({ inferno: { action: 'start' } })
	},
	[activity_type_enum.KourendFavour]: {
		commandName: 'activities',
		args: (data: KourendFavourActivityTaskOptions) => ({ favour: { name: data.favour } })
	},
	[activity_type_enum.LastManStanding]: {
		commandName: 'minigames',
		args: () => ({ lms: { start: {} } })
	},
	[activity_type_enum.MageArena]: {
		commandName: 'minigames',
		args: () => ({ mage_arena: { start: {} } })
	},
	[activity_type_enum.MageArena2]: {
		commandName: 'minigames',
		args: () => ({ mage_arena_2: { start: {} } })
	},
	[activity_type_enum.MageTrainingArena]: {
		commandName: 'minigames',
		args: () => ({ mage_training_arena: { start: {} } })
	},
	[activity_type_enum.MahoganyHomes]: {
		commandName: 'minigames',
		args: () => ({ mahogany_homes: { start: {} } })
	},
	[activity_type_enum.Mining]: {
		commandName: 'mine',
		args: (data: MiningActivityTaskOptions) => ({
			name: data.oreID,
			quantity: data.quantity,
			powermine: data.powermine
		})
	},
	[activity_type_enum.MonsterKilling]: {
		commandName: 'k',
		args: (data: MonsterActivityTaskOptions) => {
			let method: PvMMethod = 'none';
			if (data.usingCannon) method = 'cannon';
			else if (data.burstOrBarrage === SlayerActivityConstants.IceBarrage) method = 'barrage';
			else if (data.burstOrBarrage === SlayerActivityConstants.IceBurst) method = 'burst';
			return {
				name: autocompleteMonsters.find(i => i.id === data.monsterID)?.name ?? data.monsterID.toString(),
				quantity: data.quantity,
				method
			};
		}
	},
	[activity_type_enum.Nex]: {
		commandName: 'k',
		args: (data: NexTaskOptions) => {
			return {
				name: 'nex',
				quantity: data.quantity
			};
		}
	},
	[activity_type_enum.Zalcano]: {
		commandName: 'k',
		args: () => ({
			name: 'zalcano'
		})
	},
	[activity_type_enum.Tempoross]: {
		commandName: 'k',
		args: () => ({
			name: 'tempoross'
		})
	},
	[activity_type_enum.Wintertodt]: {
		commandName: 'k',
		args: () => ({
			name: 'wintertodt'
		})
	},
	[activity_type_enum.Nightmare]: {
		commandName: 'k',
		args: (data: NightmareActivityTaskOptions) => ({
			name: data.isPhosani ? 'phosani nightmare' : data.method === 'mass' ? 'mass nightmare' : 'solo nightmare'
		})
	},
	[activity_type_enum.Offering]: {
		commandName: 'offer',
		args: (data: OfferingActivityTaskOptions) => ({ quantity: data.quantity, name: itemNameFromID(data.boneID) })
	},
	[activity_type_enum.PestControl]: {
		commandName: 'minigames',
		args: () => ({ pest_control: { start: {} } })
	},
	[activity_type_enum.Pickpocket]: {
		commandName: 'steal',
		args: (data: PickpocketActivityTaskOptions) => ({ name: data.monsterID, quantity: data.quantity })
	},
	[activity_type_enum.Plunder]: {
		commandName: 'minigames',
		args: () => ({ pyramid_plunder: {} })
	},
	[activity_type_enum.PuroPuro]: {
		commandName: 'activities',
		args: (data: PuroPuroActivityTaskOptions) => ({
			puro_puro: { impling: data.implingID || '', dark_lure: data.darkLure }
		})
	},
	[activity_type_enum.Questing]: {
		commandName: 'activities',
		args: () => ({
			quest: {}
		})
	},
	[activity_type_enum.Raids]: {
		commandName: 'raid',
		args: (data: RaidsOptions) => ({
			cox: {
				start: {
					challenge_mode: data.challengeMode,
					type: data.users.length === 1 ? 'solo' : 'mass'
				}
			}
		})
	},
	[activity_type_enum.Revenants]: {
		commandName: 'k',
		args: (data: RevenantOptions) => ({
			name: autocompleteMonsters.find(i => i.id === data.monsterID)?.name ?? data.monsterID.toString()
		})
	},
	[activity_type_enum.RoguesDenMaze]: {
		commandName: 'minigames',
		args: () => ({
			rogues_den: {}
		})
	},
	[activity_type_enum.Sawmill]: {
		commandName: 'activities',
		args: (data: SawmillActivityTaskOptions) => ({
			sawmill: { quantity: data.plankQuantity, type: data.plankID }
		})
	},
	[activity_type_enum.Sepulchre]: {
		commandName: 'minigames',
		args: () => ({ sepulchre: { start: {} } })
	},
	[activity_type_enum.Smithing]: {
		commandName: 'smith',
		args: (data: SmithingActivityTaskOptions) => ({
			name: itemNameFromID(data.smithedBarID),
			quantity: data.quantity
		})
	},
	[activity_type_enum.SoulWars]: {
		commandName: 'minigames',
		args: () => ({ soul_wars: { start: {} } })
	},
	[activity_type_enum.TheatreOfBlood]: {
		commandName: 'raid',
		args: (data: TheatreOfBloodTaskOptions) => ({
			tob: {
				start: {
					hard_mode: data.hardMode,
					max_team_size: data.users.length
				}
			}
		})
	},
	[activity_type_enum.TitheFarm]: {
		commandName: 'farming',
		args: () => ({ tithe_farm: {} })
	},
	[activity_type_enum.Trekking]: {
		commandName: 'minigames',
		args: (data: TempleTrekkingActivityTaskOptions) => ({
			temple_trek: { start: { difficulty: data.difficulty, quantity: data.quantity } }
		})
	},
	[activity_type_enum.TroubleBrewing]: {
		commandName: 'minigames',
		args: () => ({ trouble_brewing: { start: {} } })
	},
	[activity_type_enum.VolcanicMine]: {
		commandName: 'minigames',
		args: (data: ActivityTaskOptionsWithQuantity) => ({ volcanic_mine: { start: { quantity: data.quantity } } })
	},
	[activity_type_enum.WealthCharging]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({ charge: { item: 'wealth', quantity: data.quantity } })
	},
	[activity_type_enum.Woodcutting]: {
		commandName: 'chop',
		args: (data: WoodcuttingActivityTaskOptions) => ({
			name: itemNameFromID(data.logID),
			quantity: data.quantity,
			powerchop: data.powerchopping
		})
	}
} as const;

for (const type of Object.values(activity_type_enum)) {
	if (!tripHandlers[type]) {
		throw new Error(`Missing trip handler for ${type}`);
	}
}

export async function fetchRepeatTrips(userID: string) {
	const res = await prisma.activity.findMany({
		where: {
			user_id: BigInt(userID),
			finish_date: {
				gt: new Date(Date.now() - Time.Day * 7)
			}
		},
		orderBy: {
			id: 'desc'
		},
		take: 20,
		select: {
			data: true,
			type: true
		}
	});
	const filtered: {
		type: activity_type_enum;
		data: Prisma.JsonValue;
	}[] = [];
	for (const trip of res) {
		if (!taskCanBeRepeated(trip.type)) continue;
		if (trip.type === activity_type_enum.Farming && !(trip.data as any as FarmingActivityTaskOptions).autoFarmed) {
			continue;
		}
		if (!filtered.some(i => i.type === trip.type)) {
			filtered.push(trip);
		}
	}
	return filtered;
}

export async function makeRepeatTripButtons(user: MUser) {
	const trips = await fetchRepeatTrips(user.id);
	const buttons: ButtonBuilder[] = [];
	const limit = Math.min(user.perkTier + 1, 5);
	for (const trip of trips.slice(0, limit)) {
		buttons.push(
			new ButtonBuilder()
				.setLabel(`Repeat ${trip.type}`)
				.setCustomId(`REPEAT_TRIP_${trip.type}`)
				.setStyle(ButtonStyle.Secondary)
		);
	}
	return buttons;
}

export async function repeatTrip(
	interaction: ButtonInteraction,
	data: { data: Prisma.JsonValue; type: activity_type_enum }
) {
	const handler = tripHandlers[data.type];
	return runCommand({
		commandName: handler.commandName,
		isContinue: true,
		args: handler.args(data.data as any),
		interaction,
		guildID: interaction.guildId,
		member: interaction.member,
		channelID: interaction.channelId,
		user: interaction.user
	});
}
