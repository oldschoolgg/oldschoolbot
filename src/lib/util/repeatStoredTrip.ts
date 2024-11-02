import type { Activity, Prisma } from '@prisma/client';
import { activity_type_enum } from '@prisma/client';
import type { ButtonInteraction } from 'discord.js';
import { ButtonBuilder, ButtonStyle } from 'discord.js';
import { Time } from 'e';

import { autocompleteMonsters } from '../../mahoji/commands/k';
import { divinationEnergies, memoryHarvestTypes } from '../bso/divination';
import type { PvMMethod } from '../constants';
import { kibbles } from '../data/kibble';
import { SlayerActivityConstants } from '../minions/data/combatConstants';
import { darkAltarRunes } from '../minions/functions/darkAltarCommand';
import { runCommand } from '../settings/settings';
import type {
	ActivityTaskOptionsWithQuantity,
	AgilityActivityTaskOptions,
	AlchingActivityTaskOptions,
	AnimatedArmourActivityTaskOptions,
	BathhouseTaskOptions,
	BuryingActivityTaskOptions,
	ButlerActivityTaskOptions,
	CastingActivityTaskOptions,
	ClueActivityTaskOptions,
	CollectingOptions,
	ColoTaskOptions,
	ConstructionActivityTaskOptions,
	CookingActivityTaskOptions,
	CraftingActivityTaskOptions,
	CreateForestersRationsActivityTaskOptions,
	CutLeapingFishActivityTaskOptions,
	DOAOptions,
	DarkAltarOptions,
	DisassembleTaskOptions,
	DungeoneeringOptions,
	EnchantingActivityTaskOptions,
	FarmingActivityTaskOptions,
	FiremakingActivityTaskOptions,
	FishingActivityTaskOptions,
	FletchingActivityTaskOptions,
	GauntletOptions,
	GiantsFoundryActivityTaskOptions,
	GroupMonsterActivityTaskOptions,
	GuardiansOfTheRiftActivityTaskOptions,
	HerbloreActivityTaskOptions,
	HunterActivityTaskOptions,
	InfernoOptions,
	KibbleOptions,
	MahoganyHomesActivityTaskOptions,
	MemoryHarvestOptions,
	MiningActivityTaskOptions,
	MonsterActivityTaskOptions,
	MotherlodeMiningActivityTaskOptions,
	NewBossOptions,
	NexTaskOptions,
	NightmareActivityTaskOptions,
	OfferingActivityTaskOptions,
	OuraniaAltarOptions,
	PickpocketActivityTaskOptions,
	PuroPuroActivityTaskOptions,
	RaidsOptions,
	ResearchTaskOptions,
	RunecraftActivityTaskOptions,
	SawmillActivityTaskOptions,
	ScatteringActivityTaskOptions,
	ShadesOfMortonOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	TOAOptions,
	TempleTrekkingActivityTaskOptions,
	TheatreOfBloodTaskOptions,
	TiaraRunecraftActivityTaskOptions,
	TinkeringWorkshopOptions,
	TuraelsTrialsOptions,
	UndoneChangesMonsterOptions,
	WoodcuttingActivityTaskOptions,
	ZalcanoActivityTaskOptions
} from '../types/minions';
import { itemNameFromID } from '../util';
import { giantsFoundryAlloys } from './../../mahoji/lib/abstracted_commands/giantsFoundryCommand';
import type { NightmareZoneActivityTaskOptions, UnderwaterAgilityThievingTaskOptions } from './../types/minions';
import { interactionReply } from './interactionReply';

export const taskCanBeRepeated = (activity: Activity) => {
	return !(
		[
			activity_type_enum.TearsOfGuthix,
			activity_type_enum.ShootingStars,
			activity_type_enum.BirthdayEvent,
			activity_type_enum.BlastFurnace,
			activity_type_enum.Easter,
			activity_type_enum.TokkulShop,
			activity_type_enum.FishingContest,
			activity_type_enum.BossEvent,
			activity_type_enum.Birdhouse,
			activity_type_enum.HalloweenMiniMinigame,
			activity_type_enum.BalthazarsBigBonanza,
			activity_type_enum.GuthixianCache,
			activity_type_enum.Birdhouse,
			activity_type_enum.StrongholdOfSecurity,
			activity_type_enum.CombatRing
		] as activity_type_enum[]
	).includes(activity.type);
};

export const tripHandlers = {
	[activity_type_enum.HalloweenMiniMinigame]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.TrickOrTreat]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.BossEvent]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.GuthixianCache]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.FishingContest]: { commandName: 'm', args: () => ({}) },
	[activity_type_enum.SpecificQuest]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.HalloweenEvent]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.BirthdayCollectIngredients]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.Birdhouse]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.StrongholdOfSecurity]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.CombatRing]: {
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
	[activity_type_enum.Mortimer]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.Easter]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.Revenants]: {
		commandName: 'm',
		args: () => ({})
	},
	[activity_type_enum.KourendFavour]: {
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
		args: (data: ActivityTaskOptionsWithQuantity) => ({ agility_arena: { start: { quantity: data.quantity } } })
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
	[activity_type_enum.CamdozaalMining]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			camdozaal: { action: 'mining', quantity: data.iQty }
		})
	},
	[activity_type_enum.CamdozaalSmithing]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			camdozaal: { action: 'smithing', quantity: data.quantity }
		})
	},
	[activity_type_enum.CamdozaalFishing]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			camdozaal: { action: 'fishing', quantity: data.iQty }
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
	[activity_type_enum.MyNotes]: {
		commandName: 'activities',
		args: () => ({ my_notes: {} })
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
		args: (data: CookingActivityTaskOptions) => ({
			name: itemNameFromID(data.cookableID),
			quantity: data.quantity
		})
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
		args: (data: DarkAltarOptions) => ({ rune: `${darkAltarRunes[data.rune].item.name} (zeah)` })
	},
	[activity_type_enum.OuraniaAltar]: {
		commandName: 'runecraft',
		args: (data: OuraniaAltarOptions) => ({
			rune: 'ourania altar',
			usestams: data.stamina,
			daeyalt_essence: data.daeyalt,
			quantity: data.quantity
		})
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
	[activity_type_enum.TiaraRunecraft]: {
		commandName: 'runecraft',
		args: (data: TiaraRunecraftActivityTaskOptions) => ({
			rune: itemNameFromID(data.tiaraID),
			quantity: data.tiaraQuantity
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
		args: (data: FishingActivityTaskOptions) => ({
			name: data.fishID,
			quantity: data.iQty,
			flakes: data.flakesQuantity !== undefined
		})
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
			monster: autocompleteMonsters.find(i => i.id === data.mi)?.name ?? data.mi.toString()
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
	[activity_type_enum.CutLeapingFish]: {
		commandName: 'cook',
		args: (data: CutLeapingFishActivityTaskOptions) => ({
			name: itemNameFromID(data.fishID),
			quantity: data.quantity
		})
	},
	[activity_type_enum.CreateForestersRations]: {
		commandName: 'cook',
		args: (data: CreateForestersRationsActivityTaskOptions) => ({
			name: data.rationName,
			quantity: data.quantity
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
		args: (data: InfernoOptions) => ({ inferno: { action: 'start', emerged: data.isEmergedZuk } })
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
		args: (data: MahoganyHomesActivityTaskOptions) => ({ mahogany_homes: { start: { tier: data.tier } } })
	},
	[activity_type_enum.Mining]: {
		commandName: 'mine',
		args: (data: MiningActivityTaskOptions) => ({
			name: data.oreID,
			quantity: data.iQty,
			powermine: data.powermine
		})
	},
	[activity_type_enum.MotherlodeMining]: {
		commandName: 'mine',
		args: (data: MotherlodeMiningActivityTaskOptions) => ({
			name: 'Motherlode mine',
			quantity: data.iQty
		})
	},
	[activity_type_enum.MonsterKilling]: {
		commandName: 'k',
		args: (data: MonsterActivityTaskOptions) => {
			let method: PvMMethod = 'none';
			if (data.usingCannon) method = 'cannon';
			if (data.chinning) (method as string) = 'chinning';
			else if (data.bob === SlayerActivityConstants.IceBarrage) method = 'barrage';
			else if (data.bob === SlayerActivityConstants.IceBurst) method = 'burst';
			return {
				name: autocompleteMonsters.find(i => i.id === data.mi)?.name ?? data.mi?.toString(),
				quantity: data.iQty,
				method,
				wilderness: data.isInWilderness
			};
		}
	},
	[activity_type_enum.Nex]: {
		commandName: 'k',
		args: (data: NexTaskOptions) => {
			return {
				name: `nex ${data.users.length === 1 ? 'solo' : 'mass'}`,
				quantity: data.users.length === 1 ? data.quantity : undefined
			};
		}
	},
	[activity_type_enum.Zalcano]: {
		commandName: 'k',
		args: (data: ZalcanoActivityTaskOptions) => ({
			name: 'zalcano',
			quantity: data.quantity
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
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			name: 'wintertodt',
			quantity: data.quantity
		})
	},
	[activity_type_enum.Nightmare]: {
		commandName: 'k',
		args: (data: NightmareActivityTaskOptions) => ({
			name: data.isPhosani ? 'phosani nightmare' : data.method === 'mass' ? 'mass nightmare' : 'solo nightmare',
			quantity: data.quantity
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
			puro_puro: { implingTier: data.implingTier || '', dark_lure: data.darkLure }
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
		args: (data: RaidsOptions) => {
			return {
				cox: {
					start: {
						challenge_mode: data.challengeMode,
						type: data.users.length === 1 ? 'solo' : 'mass',
						quantity: data.quantity
					}
				}
			};
		}
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
			plank_make: { action: 'sawmill', quantity: data.plankQuantity, type: itemNameFromID(data.plankID) }
		})
	},
	[activity_type_enum.Butler]: {
		commandName: 'activities',
		args: (data: ButlerActivityTaskOptions) => ({
			plank_make: { action: 'butler', quantity: data.plankQuantity, type: itemNameFromID(data.plankID) }
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
					solo: data.solo,
					quantity: data.quantity
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
			name: data.logID === 323_424 ? 'Ivy' : itemNameFromID(data.logID),
			quantity: data.iQty,
			powerchop: data.powerchopping,
			forestry_events: data.forestry,
			twitchers_gloves: data.twitchers
		})
	},
	[activity_type_enum.VasaMagus]: {
		commandName: 'k',
		args: (data: UndoneChangesMonsterOptions) => ({
			name: 'vasa',
			quantity: data.quantity
		})
	},
	[activity_type_enum.OuraniaDeliveryService]: {
		commandName: 'bsominigames',
		args: () => ({
			ourania_delivery_service: {
				start: {}
			}
		})
	},
	[activity_type_enum.MonkeyRumble]: {
		commandName: 'bsominigames',
		args: () => ({
			monkey_rumble: {
				start: {}
			}
		})
	},
	[activity_type_enum.BaxtorianBathhouses]: {
		commandName: 'bsominigames',
		args: (data: BathhouseTaskOptions) => ({
			baxtorian_bathhouses: {
				start: { tier: data.tier, heating: data.ore, water_mixture: data.mixture }
			}
		})
	},
	[activity_type_enum.Naxxus]: {
		commandName: 'k',
		args: () => ({
			name: 'Naxxus'
		})
	},
	[activity_type_enum.Moktang]: {
		commandName: 'k',
		args: () => ({
			name: 'Moktang'
		})
	},
	[activity_type_enum.KingGoldemar]: {
		commandName: 'k',
		args: (data: NewBossOptions) => ({
			name: `King Goldemar ${data.users.length === 1 ? 'solo' : 'mass'}`
		})
	},
	[activity_type_enum.KalphiteKing]: {
		commandName: 'k',
		args: (data: NewBossOptions) => ({
			name: `Kalphite King ${data.users.length === 1 ? 'solo' : 'mass'}`,
			quantity: data.users.length === 1 ? data.quantity : undefined
		})
	},
	[activity_type_enum.Ignecarus]: {
		commandName: 'k',
		args: (data: NewBossOptions) => ({
			name: `Ignecarus ${data.users.length === 1 ? 'solo' : 'mass'}`
		})
	},
	[activity_type_enum.KibbleMaking]: {
		commandName: 'kibble',
		args: (data: KibbleOptions) => ({
			kibble: kibbles.find(i => i.type === data.kibbleType)?.item.name,
			quantity: data.quantity
		})
	},
	[activity_type_enum.Dungeoneering]: {
		commandName: 'dg',
		args: (data: DungeoneeringOptions) => ({
			start: {
				floor: data.floor,
				solo: data.users.length === 1
			}
		})
	},
	[activity_type_enum.Disassembling]: {
		commandName: 'invention',
		args: (data: DisassembleTaskOptions) => ({
			disassemble: {
				name: itemNameFromID(data.i),
				quantity: data.qty
			}
		})
	},
	[activity_type_enum.Research]: {
		commandName: 'invention',
		args: (data: ResearchTaskOptions) => ({
			research: {
				material: data.material,
				quantity: data.quantity
			}
		})
	},
	[activity_type_enum.ClueCompletion]: {
		commandName: 'clue',
		args: (data: ClueActivityTaskOptions) => ({ tier: data.ci, quantity: data.q })
	},
	[activity_type_enum.FistOfGuthix]: {
		commandName: 'bsominigames',
		args: () => ({
			fist_of_guthix: {
				start: {}
			}
		})
	},
	[activity_type_enum.StealingCreation]: {
		commandName: 'bsominigames',
		args: () => ({
			stealing_creation: {
				start: {}
			}
		})
	},
	[activity_type_enum.GiantsFoundry]: {
		commandName: 'minigames',
		args: (data: GiantsFoundryActivityTaskOptions) => ({
			giants_foundry: {
				start: { name: giantsFoundryAlloys.find(i => i.id === data.alloyID)?.name, quantity: data.quantity }
			}
		})
	},
	[activity_type_enum.GuardiansOfTheRift]: {
		commandName: 'minigames',
		args: (data: GuardiansOfTheRiftActivityTaskOptions) => ({
			gotr: {
				start: { combination_runes: data.combinationRunes }
			}
		})
	},
	[activity_type_enum.TinkeringWorkshop]: {
		commandName: 'bsominigames',
		args: (data: TinkeringWorkshopOptions) => ({
			tinkering_workshop: {
				start: {
					material: data.material
				}
			}
		})
	},
	[activity_type_enum.NightmareZone]: {
		commandName: 'minigames',
		args: (data: NightmareZoneActivityTaskOptions) => ({
			nmz: {
				start: { strategy: data.strategy }
			}
		})
	},
	[activity_type_enum.ShadesOfMorton]: {
		commandName: 'minigames',
		args: (data: ShadesOfMortonOptions) => ({
			shades_of_morton: {
				start: { shade: data.shadeID, logs: itemNameFromID(data.logID) }
			}
		})
	},
	[activity_type_enum.TombsOfAmascut]: {
		commandName: 'raid',
		args: (data: TOAOptions) => ({
			toa: {
				start: {
					raid_level: data.raidLevel,
					max_team_size: data.users.length,
					solo: data.users.length === 1,
					quantity: data.quantity
				}
			}
		})
	},
	[activity_type_enum.BalthazarsBigBonanza]: {
		commandName: 'bsominigames',
		args: () => ({
			balthazars_big_bonanza: {
				start: {}
			}
		})
	},
	[activity_type_enum.UnderwaterAgilityThieving]: {
		commandName: 'activities',
		args: (data: UnderwaterAgilityThievingTaskOptions) => ({
			underwater: {
				agility_thieving: {
					training_skill: data.trainingSkill,
					minutes: Math.floor(data.duration / Time.Minute),
					no_stams: data.noStams
				}
			}
		})
	},
	[activity_type_enum.DriftNet]: {
		commandName: 'activities',
		args: (data: ActivityTaskOptionsWithQuantity) => ({
			underwater: {
				drift_net_fishing: { minutes: Math.floor(data.duration / Time.Minute) }
			}
		})
	},
	[activity_type_enum.DepthsOfAtlantis]: {
		commandName: 'raid',
		args: (data: DOAOptions) => ({
			doa: {
				start: {
					challenge_mode: data.cm,
					solo: data.users.length === 1 ? true : undefined,
					quantity: data.quantity
				}
			}
		})
	},
	[activity_type_enum.MemoryHarvest]: {
		commandName: 'divination',
		args: (data: MemoryHarvestOptions) => ({
			harvest_memories: {
				energy: divinationEnergies.find(i => i.item.id === data.e)!.type,
				type: memoryHarvestTypes[data.t].id
			}
		})
	},
	[activity_type_enum.TuraelsTrials]: {
		commandName: 'bsominigames',
		args: (_data: TuraelsTrialsOptions) => ({
			turaels_trials: {
				start: {
					method: _data.m
				}
			}
		})
	},
	[activity_type_enum.Colosseum]: {
		commandName: 'k',
		args: (data: ColoTaskOptions) => ({
			name: 'colosseum',
			quantity: data.quantity
		})
	}
} as const;

for (const type of Object.values(activity_type_enum)) {
	if (!tripHandlers[type]) {
		throw new Error(`Missing trip handler for ${type}`);
	}
}

export async function fetchRepeatTrips(userID: string) {
	const res: Activity[] = await prisma.activity.findMany({
		where: {
			user_id: BigInt(userID),
			finish_date: {
				gt: new Date(Date.now() - Time.Day * 7)
			}
		},
		orderBy: {
			id: 'desc'
		},
		take: 20
	});
	const filtered: {
		type: activity_type_enum;
		data: Prisma.JsonValue;
	}[] = [];
	for (const trip of res) {
		if (!taskCanBeRepeated(trip)) continue;
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
	const limit = Math.min(user.perkTier() + 1, 5);
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
	if (!data || !data.data || !data.type) {
		return interactionReply(interaction, { content: "Couldn't find any trip to repeat.", ephemeral: true });
	}
	const handler = tripHandlers[data.type];
	return runCommand({
		commandName: handler.commandName,
		isContinue: true,
		args: handler.args(data.data as any),
		interaction,
		guildID: interaction.guildId,
		member: interaction.member,
		channelID: interaction.channelId,
		user: interaction.user,
		continueDeltaMillis: interaction.createdAt.getTime() - interaction.message.createdTimestamp
	});
}
