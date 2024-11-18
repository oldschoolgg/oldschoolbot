import { toTitleCase } from '@oldschoolgg/toolkit/util';
import { increaseNumByPercent, reduceNumByPercent } from 'e';
import { SkillsEnum } from 'oldschooljs/dist/constants';

import { shades, shadesLogs } from '../../mahoji/lib/abstracted_commands/shadesOfMortonCommand';
import { collectables } from '../../mahoji/lib/collectables';
import { ClueTiers } from '../clues/clueTiers';
import { Emoji } from '../constants';
import killableMonsters from '../minions/data/killableMonsters';
import { Planks } from '../minions/data/planks';
import { quests } from '../minions/data/quests';
import Agility from '../skilling/skills/agility';
import Constructables from '../skilling/skills/construction/constructables';
import Cooking from '../skilling/skills/cooking/cooking';
import ForestryRations from '../skilling/skills/cooking/forestersRations';
import LeapingFish from '../skilling/skills/cooking/leapingFish';
import Crafting from '../skilling/skills/crafting';
import Farming from '../skilling/skills/farming';
import Firemaking from '../skilling/skills/firemaking';
import Fishing from '../skilling/skills/fishing';
import Herblore from '../skilling/skills/herblore/herblore';
import Hunter from '../skilling/skills/hunter/hunter';
import { Castables } from '../skilling/skills/magic/castables';
import { Enchantables } from '../skilling/skills/magic/enchantables';
import Mining from '../skilling/skills/mining';
import Prayer from '../skilling/skills/prayer';
import Runecraft from '../skilling/skills/runecraft';
import Smithing from '../skilling/skills/smithing';
import { stealables } from '../skilling/skills/thieving/stealables';
import Woodcutting from '../skilling/skills/woodcutting/woodcutting';
import type {
	ActivityTaskOptionsWithQuantity,
	AgilityActivityTaskOptions,
	AlchingActivityTaskOptions,
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
	DarkAltarOptions,
	EnchantingActivityTaskOptions,
	FarmingActivityTaskOptions,
	FightCavesActivityTaskOptions,
	FiremakingActivityTaskOptions,
	FishingActivityTaskOptions,
	FletchingActivityTaskOptions,
	GauntletOptions,
	GroupMonsterActivityTaskOptions,
	HerbloreActivityTaskOptions,
	HunterActivityTaskOptions,
	InfernoOptions,
	KourendFavourActivityTaskOptions,
	MinigameActivityTaskOptionsWithNoChanges,
	MiningActivityTaskOptions,
	MonsterActivityTaskOptions,
	MotherlodeMiningActivityTaskOptions,
	NexTaskOptions,
	NightmareActivityTaskOptions,
	OfferingActivityTaskOptions,
	PickpocketActivityTaskOptions,
	PlunderActivityTaskOptions,
	RaidsOptions,
	RunecraftActivityTaskOptions,
	SawmillActivityTaskOptions,
	ScatteringActivityTaskOptions,
	SepulchreActivityTaskOptions,
	ShadesOfMortonOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	SpecificQuestOptions,
	TOAOptions,
	TheatreOfBloodTaskOptions,
	TiaraRunecraftActivityTaskOptions,
	WoodcuttingActivityTaskOptions,
	ZalcanoActivityTaskOptions
} from '../types/minions';
import { formatDuration, itemNameFromID, randomVariation, stringMatches } from '../util';
import { getActivityOfUser } from './minionIsBusy';

export function minionStatus(user: MUser) {
	const currentTask = getActivityOfUser(user.id);
	const name = user.minionName;
	if (!currentTask) {
		return `${name} is currently doing nothing.`;
	}

	const durationRemaining = currentTask.finishDate - Date.now();
	const formattedDuration = `${formatDuration(durationRemaining)} remaining.`;

	switch (currentTask.type) {
		case 'MonsterKilling': {
			const data = currentTask as MonsterActivityTaskOptions;
			const monster = killableMonsters.find(mon => mon.id === data.mi);

			return `${name} is currently killing ${data.q}x ${monster?.name}. ${formattedDuration}`;
		}

		case 'GroupMonsterKilling': {
			const data = currentTask as GroupMonsterActivityTaskOptions;
			const monster = killableMonsters.find(mon => mon.id === data.mi);

			return `${name} is currently killing ${data.q}x ${monster?.name} with a party of ${
				data.users.length
			}. ${formattedDuration}`;
		}

		case 'ClueCompletion': {
			const data = currentTask as ClueActivityTaskOptions;

			const clueTier = ClueTiers.find(tier => tier.id === data.ci);

			return `${name} is currently completing ${data.q}x ${clueTier?.name} clues. ${formattedDuration}`;
		}

		case 'Crafting': {
			const data = currentTask as CraftingActivityTaskOptions;
			const craftable = Crafting.Craftables.find(item => item.id === data.craftableID);

			return `${name} is currently crafting ${data.quantity}x ${craftable?.name}. ${formattedDuration} Your ${
				Emoji.Crafting
			} Crafting level is ${user.skillLevel(SkillsEnum.Crafting)}`;
		}

		case 'Agility': {
			const data = currentTask as AgilityActivityTaskOptions;

			const course = Agility.Courses.find(course => course.name === data.courseID);

			return `${name} is currently running ${data.quantity}x ${course?.name} laps. ${formattedDuration} Your ${
				Emoji.Agility
			} Agility level is ${user.skillLevel(SkillsEnum.Agility)}`;
		}

		case 'Cooking': {
			const data = currentTask as CookingActivityTaskOptions;

			const cookable = Cooking.Cookables.find(cookable => cookable.id === data.cookableID);

			return `${name} is currently cooking ${data.quantity}x ${cookable?.name}. ${formattedDuration} Your ${
				Emoji.Cooking
			} Cooking level is ${user.skillLevel(SkillsEnum.Cooking)}`;
		}

		case 'Fishing': {
			const data = currentTask as FishingActivityTaskOptions;

			const fish = Fishing.Fishes.find(fish => fish.id === data.fishID);

			return `${name} is currently fishing ${data.quantity}x ${fish?.name}. ${formattedDuration} Your ${
				Emoji.Fishing
			} Fishing level is ${user.skillLevel(SkillsEnum.Fishing)}`;
		}

		case 'Mining': {
			const data = currentTask as MiningActivityTaskOptions;

			const ore = Mining.Ores.find(ore => ore.id === data.oreID);

			return `${name} is currently mining ${ore?.name}. ${
				data.fakeDurationMax === data.fakeDurationMin
					? formattedDuration
					: `approximately ${formatDuration(
							randomVariation(reduceNumByPercent(durationRemaining, 25), 20)
						)} **to** ${formatDuration(
							randomVariation(increaseNumByPercent(durationRemaining, 25), 20)
						)} remaining.`
			} Your ${Emoji.Mining} Mining level is ${user.skillLevel(SkillsEnum.Mining)}`;
		}

		case 'MotherlodeMining': {
			const data = currentTask as MotherlodeMiningActivityTaskOptions;

			return `${name} is currently mining at the Motherlode Mine. ${
				data.fakeDurationMax === data.fakeDurationMin
					? formattedDuration
					: `approximately ${formatDuration(
							randomVariation(reduceNumByPercent(durationRemaining, 25), 20)
						)} **to** ${formatDuration(
							randomVariation(increaseNumByPercent(durationRemaining, 25), 20)
						)} remaining.`
			} Your ${Emoji.Mining} Mining level is ${user.skillLevel(SkillsEnum.Mining)}`;
		}

		case 'Smelting': {
			const data = currentTask as SmeltingActivityTaskOptions;

			const bar = Smithing.Bars.find(bar => bar.id === data.barID);

			return `${name} is currently smelting ${data.quantity}x ${bar?.name}. ${formattedDuration} Your ${
				Emoji.Smithing
			} Smithing level is ${user.skillLevel(SkillsEnum.Smithing)}`;
		}

		case 'Smithing': {
			const data = currentTask as SmithingActivityTaskOptions;

			const SmithableItem = Smithing.SmithableItems.find(item => item.id === data.smithedBarID);

			return `${name} is currently smithing ${data.quantity}x ${SmithableItem?.name}. ${formattedDuration} Your ${
				Emoji.Smithing
			} Smithing level is ${user.skillLevel(SkillsEnum.Smithing)}`;
		}

		case 'Offering': {
			const data = currentTask as OfferingActivityTaskOptions;

			const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

			return `${name} is currently offering ${data.quantity}x ${bones?.name}. ${formattedDuration} Your ${
				Emoji.Prayer
			} Prayer level is ${user.skillLevel(SkillsEnum.Prayer)}`;
		}

		case 'Burying': {
			const data = currentTask as BuryingActivityTaskOptions;

			const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

			return `${name} is currently burying ${data.quantity}x ${bones?.name}. ${formattedDuration} Your ${
				Emoji.Prayer
			} Prayer level is ${user.skillLevel(SkillsEnum.Prayer)}`;
		}

		case 'Scattering': {
			const data = currentTask as ScatteringActivityTaskOptions;

			const ashes = Prayer.Ashes.find(ashes => ashes.inputId === data.ashID);

			return `${name} is currently scattering ${data.quantity}x ${ashes?.name}. ${formattedDuration} Your ${
				Emoji.Prayer
			} Prayer level is ${user.skillLevel(SkillsEnum.Prayer)}`;
		}

		case 'Firemaking': {
			const data = currentTask as FiremakingActivityTaskOptions;

			const burn = Firemaking.Burnables.find(burn => burn.inputLogs === data.burnableID);

			return `${name} is currently lighting ${data.quantity}x ${burn?.name}. ${formattedDuration} Your ${
				Emoji.Firemaking
			} Firemaking level is ${user.skillLevel(SkillsEnum.Firemaking)}`;
		}

		case 'Questing': {
			return `${name} is currently Questing. ${formattedDuration} Your current Quest Point count is: ${user.QP}.`;
		}

		case 'Woodcutting': {
			const data = currentTask as WoodcuttingActivityTaskOptions;

			const log = Woodcutting.Logs.find(log => log.id === data.logID);

			return `${name} is currently chopping ${log?.name}. ${
				data.fakeDurationMax === data.fakeDurationMin
					? formattedDuration
					: `approximately ${formatDuration(
							randomVariation(reduceNumByPercent(durationRemaining, 25), 20)
						)} **to** ${formatDuration(
							randomVariation(increaseNumByPercent(durationRemaining, 25), 20)
						)} remaining.`
			} Your ${Emoji.Woodcutting} Woodcutting level is ${user.skillLevel(SkillsEnum.Woodcutting)}`;
		}
		case 'Runecraft': {
			const data = currentTask as RunecraftActivityTaskOptions;

			const rune = Runecraft.Runes.find(_rune => _rune.id === data.runeID);

			return `${name} is currently turning ${data.essenceQuantity}x Essence into ${
				rune?.name
			}. ${formattedDuration} Your ${Emoji.Runecraft} Runecraft level is ${user.skillLevel(
				SkillsEnum.Runecraft
			)}`;
		}

		case 'TiaraRunecraft': {
			const data = currentTask as TiaraRunecraftActivityTaskOptions;
			const tiara = Runecraft.Tiaras.find(_tiara => _tiara.id === data.tiaraID);

			return `${name} is currently crafting ${data.tiaraQuantity} ${tiara?.name}. ${formattedDuration} Your ${
				Emoji.Runecraft
			} Runecraft level is ${user.skillLevel(SkillsEnum.Runecraft)}`;
		}

		case 'FightCaves': {
			const data = currentTask as FightCavesActivityTaskOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `${name} is currently attempting the ${Emoji.AnimatedFireCape} **Fight caves** ${
				Emoji.TzRekJad
			}. If they're successful and don't die, the trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'TitheFarm': {
			return `${name} is currently farming at the **Tithe Farm**. ${formattedDuration}`;
		}

		case 'Fletching': {
			const data = currentTask as FletchingActivityTaskOptions;

			return `${name} is currently fletching ${data.quantity}x ${
				data.fletchableName
			}. ${formattedDuration} Your ${Emoji.Fletching} Fletching level is ${user.skillLevel(
				SkillsEnum.Fletching
			)}`;
		}
		case 'Herblore': {
			const data = currentTask as HerbloreActivityTaskOptions;
			const mixable = Herblore.Mixables.find(i => i.item.id === data.mixableID);

			return `${name} is currently mixing ${data.quantity}x ${mixable?.item.name}. ${formattedDuration} Your ${
				Emoji.Herblore
			} Herblore level is ${user.skillLevel(SkillsEnum.Herblore)}`;
		}
		case 'CutLeapingFish': {
			const data = currentTask as CutLeapingFishActivityTaskOptions;
			const barbarianFish = LeapingFish.find(item => item.item.id === data.id);

			return `${name} is currently cutting ${data.quantity}x ${
				barbarianFish?.item.name
			}. ${formattedDuration} Your ${Emoji.Cooking} Cooking level is ${user.skillLevel(SkillsEnum.Cooking)}`;
		}
		case 'CreateForestersRations': {
			const data = currentTask as CreateForestersRationsActivityTaskOptions;
			const ration = ForestryRations.find(ration => ration.name === data.rationName)!;

			return `${name} is currently creating ${data.quantity}x ${
				ration.name
			}. ${formattedDuration} Your ${Emoji.Cooking} Cooking level is ${user.skillLevel(SkillsEnum.Cooking)}`;
		}
		case 'Wintertodt': {
			const data = currentTask as ActivityTaskOptionsWithQuantity;
			return `${name} is currently fighting Wintertodt ${data.quantity}x times. ${formattedDuration}`;
		}
		case 'Tempoross': {
			return `${name} is currently fighting Tempoross. ${formattedDuration}`;
		}

		case 'Alching': {
			const data = currentTask as AlchingActivityTaskOptions;

			return `${name} is currently alching ${data.quantity}x ${itemNameFromID(
				data.itemID
			)}. ${formattedDuration}`;
		}

		case 'Farming': {
			const data = currentTask as FarmingActivityTaskOptions;

			const plants = Farming.Plants.find(plants => plants.name === data.plantsName);

			return `${name} is currently farming ${data.quantity}x ${plants?.name}. ${formattedDuration} Your ${
				Emoji.Farming
			} Farming level is ${user.skillLevel(SkillsEnum.Farming)}.`;
		}

		case 'Sawmill': {
			const data = currentTask as SawmillActivityTaskOptions;
			const plank = Planks.find(_plank => _plank.outputItem === data.plankID)!;
			return `${name} is currently creating ${data.plankQuantity}x ${itemNameFromID(
				plank.outputItem
			)}s. ${formattedDuration}`;
		}

		case 'Nightmare': {
			const data = currentTask as NightmareActivityTaskOptions;
			return `${name} is currently killing The Nightmare ${
				data.method === 'solo' ? 'solo' : 'in a team'
			}. ${formattedDuration}`;
		}

		case 'AnimatedArmour': {
			return `${name} is currently fighting animated armour in the Warriors' Guild. ${formattedDuration}`;
		}

		case 'Cyclops': {
			return `${name} is currently fighting cyclopes in the Warriors' Guild. ${formattedDuration}`;
		}

		case 'CamdozaalFishing': {
			return `${name} is currently Fishing in the Ruins of Camdozaal. ${formattedDuration}`;
		}

		case 'CamdozaalMining': {
			return `${name} is currently Mining in the Ruins of Camdozaal. ${formattedDuration}`;
		}

		case 'CamdozaalSmithing': {
			return `${name} is currently Smithing in the Ruins of Camdozaal. ${formattedDuration}`;
		}

		case 'Sepulchre': {
			const data = currentTask as SepulchreActivityTaskOptions;

			return `${name} is currently doing ${data.quantity}x laps of the Hallowed Sepulchre. ${formattedDuration}`;
		}

		case 'Plunder': {
			const data = currentTask as PlunderActivityTaskOptions;

			return `${name} is currently doing Pyramid Plunder x ${data.quantity}x times. ${formattedDuration}`;
		}

		case 'FishingTrawler': {
			const data = currentTask as ActivityTaskOptionsWithQuantity;
			return `${name} is currently aboard the Fishing Trawler, doing ${data.quantity}x trips. ${formattedDuration}`;
		}

		case 'Zalcano': {
			const data = currentTask as ZalcanoActivityTaskOptions;
			return `${name} is currently killing Zalcano ${data.quantity}x times. ${formattedDuration}`;
		}

		case 'Pickpocket': {
			const data = currentTask as PickpocketActivityTaskOptions;
			const obj = stealables.find(_obj => _obj.id === data.monsterID);
			return `${name} is currently ${obj?.type === 'pickpockable' ? 'pickpocketing' : 'stealing'} from ${
				obj?.name
			} ${data.quantity}x times. ${formattedDuration}`;
		}

		case 'BarbarianAssault': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;
			return `${name} is currently doing ${data.quantity} waves of Barbarian Assault. ${formattedDuration}`;
		}

		case 'AgilityArena': {
			return `${name} is currently doing the Brimhaven Agility Arena. ${formattedDuration}`;
		}

		case 'ChampionsChallenge': {
			return `${name} is currently doing the **Champion's Challenge**. ${formattedDuration}`;
		}

		case 'MyNotes': {
			return `${name} is currently rummaging skeletons for Ancient pages. ${formattedDuration}`;
		}

		case 'Hunter': {
			const data = currentTask as HunterActivityTaskOptions;

			const creature = Hunter.Creatures.find(creature =>
				creature.aliases.some(
					alias =>
						stringMatches(alias, data.creatureName) || stringMatches(alias.split(' ')[0], data.creatureName)
				)
			);
			const crystalImpling = creature?.name === 'Crystal impling';
			return `${name} is currently hunting ${
				crystalImpling ? creature?.name : `${data.quantity}x ${creature?.name}`
			}. ${formattedDuration}`;
		}

		case 'Birdhouse': {
			return `${name} is currently doing a bird house run. ${formattedDuration}`;
		}

		case 'AerialFishing': {
			return `${name} is currently aerial fishing. ${formattedDuration}`;
		}

		case 'DriftNet': {
			return `${name} is currently drift net fishing. ${formattedDuration}`;
		}

		case 'Construction': {
			const data = currentTask as ConstructionActivityTaskOptions;
			const pohObject = Constructables.find(i => i.id === data.objectID);
			if (!pohObject) throw new Error(`No POH object found with ID ${data.objectID}.`);
			return `${name} is currently building ${data.quantity}x ${pohObject.name}. ${formattedDuration}`;
		}

		case 'Butler': {
			const data = currentTask as ButlerActivityTaskOptions;
			const plank = Planks.find(_plank => _plank.outputItem === data.plankID)!;
			return `${name} is currently creating ${data.plankQuantity}x ${itemNameFromID(
				plank.outputItem
			)}s. ${formattedDuration}`;
		}

		case 'MahoganyHomes': {
			return `${name} is currently doing Mahogany Homes. ${formattedDuration}`;
		}

		case 'Enchanting': {
			const data = currentTask as EnchantingActivityTaskOptions;
			const enchantable = Enchantables.find(i => i.id === data.itemID);
			return `${name} is currently enchanting ${data.quantity}x ${enchantable?.name}. ${formattedDuration}`;
		}

		case 'Casting': {
			const data = currentTask as CastingActivityTaskOptions;
			const spell = Castables.find(i => i.id === data.spellID);
			return `${name} is currently casting ${data.quantity}x ${spell?.name}. ${formattedDuration}`;
		}

		case 'GloryCharging': {
			const data = currentTask as ActivityTaskOptionsWithQuantity;
			return `${name} is currently charging ${data.quantity}x inventories of glories at the Fountain of Rune. ${formattedDuration}`;
		}

		case 'WealthCharging': {
			const data = currentTask as ActivityTaskOptionsWithQuantity;
			return `${name} is currently charging ${data.quantity}x inventories of rings of wealth at the Fountain of Rune. ${formattedDuration}`;
		}

		case 'GnomeRestaurant': {
			return `${name} is currently doing Gnome Restaurant deliveries. ${formattedDuration}`;
		}

		case 'SoulWars': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;
			return `${name} is currently doing ${data.quantity}x games of Soul Wars. ${formattedDuration}`;
		}

		case 'RoguesDenMaze': {
			return `${name} is currently attempting the Rogues' Den maze. ${formattedDuration}`;
		}

		case 'Gauntlet': {
			const data = currentTask as GauntletOptions;
			return `${name} is currently doing ${data.quantity}x ${
				data.corrupted ? 'Corrupted' : 'Normal'
			} Gauntlet. ${formattedDuration}`;
		}

		case 'CastleWars': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;
			return `${name} is currently doing ${data.quantity}x Castle Wars games. ${formattedDuration}`;
		}

		case 'MageArena': {
			return `${name} is currently doing the Mage Arena. ${formattedDuration}`;
		}

		case 'Raids': {
			const data = currentTask as RaidsOptions;
			return `${name} is currently doing the Chambers of Xeric${
				data.challengeMode ? ' in Challenge Mode' : ''
			}, ${
				data.users.length === 1 ? 'as a solo.' : `with a team of ${data.users.length} minions.`
			} ${formattedDuration}`;
		}

		case 'Collecting': {
			const data = currentTask as CollectingOptions;
			const collectable = collectables.find(c => c.item.id === data.collectableID)!;
			return `${name} is currently collecting ${data.quantity * collectable.quantity}x ${
				collectable.item.name
			}. ${formattedDuration}`;
		}

		case 'MageTrainingArena': {
			return `${name} is currently training at the Mage Training Arena. ${formattedDuration}`;
		}

		case 'MageArena2': {
			return `${name} is currently attempting the Mage Arena II. ${formattedDuration}`;
		}

		case 'BigChompyBirdHunting': {
			return `${name} is currently hunting Chompy Birds! ${formattedDuration}`;
		}

		case 'DarkAltar': {
			const data = currentTask as DarkAltarOptions;
			return `${name} is currently runecrafting ${toTitleCase(
				data.rune
			)} runes at the Dark Altar. ${formattedDuration}`;
		}
		case 'OuraniaAltar': {
			return `${name} is currently runecrafting at the Ourania Altar. ${formattedDuration}`;
		}

		case 'Trekking': {
			return `${name} is currently Temple Trekking. ${formattedDuration}`;
		}
		case 'PestControl': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;
			return `${name} is currently doing ${data.quantity} games of Pest Control. ${formattedDuration}`;
		}
		case 'VolcanicMine': {
			const data = currentTask as ActivityTaskOptionsWithQuantity;
			return `${name} is currently doing ${data.quantity} games of Volcanic Mine. ${formattedDuration}`;
		}
		case 'TearsOfGuthix': {
			return `${name} is currently doing Tears Of Guthix. ${formattedDuration}`;
		}
		case 'KourendFavour': {
			const data = currentTask as KourendFavourActivityTaskOptions;
			return `${name} is currently doing ${data.favour} Favour tasks. ${formattedDuration}`;
		}
		case 'Inferno': {
			const data = currentTask as InfernoOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `${name} is currently attempting the Inferno, if they're successful and don't die, the trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'TheatreOfBlood': {
			const data = currentTask as TheatreOfBloodTaskOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();

			return `${name} is currently attempting the Theatre of Blood, if your team is successful and doesn't die, the trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'LastManStanding': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;

			return `${name} is currently doing ${
				data.quantity
			} Last Man Standing matches, the trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'BirthdayEvent': {
			return `${name} is currently doing the Birthday Event! The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'TokkulShop': {
			return `${name} is currently shopping at Tzhaar stores. The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'Nex': {
			const data = currentTask as NexTaskOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `${name} is currently killing Nex ${data.quantity} times with a team of ${
				data.users.length
			}. The trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'TroubleBrewing': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;
			return `${name} is currently doing ${
				data.quantity
			}x games of Trouble Brewing. The trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'PuroPuro': {
			return `${name} is currently hunting in Puro-Puro. The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'ShootingStars': {
			return `${name} is currently mining a Crashed Star. The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'GiantsFoundry': {
			const data = currentTask as MinigameActivityTaskOptionsWithNoChanges;
			return `${name} is currently creating ${
				data.quantity
			}x giant weapons for Kovac in the Giants' Foundry minigame. The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'GuardiansOfTheRift': {
			return `${name} is currently helping the Great Guardian to close the rift. The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'NightmareZone': {
			return `${name} is currently killing Monsters in the Nightmare Zone. The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'ShadesOfMorton': {
			const data = currentTask as ShadesOfMortonOptions;
			const log = shadesLogs.find(i => i.normalLog.id === data.logID)!;
			const shade = shades.find(i => i.shadeName === data.shadeID)!;
			return `${name} is currently doing ${data.quantity} trips of Shades of Mort'ton, cremating ${
				shade.shadeName
			} remains with ${log.oiledLog.name}! The trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'TombsOfAmascut': {
			const data = currentTask as TOAOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();

			return `${name} is currently attempting the Tombs of Amascut, if your team is successful and doesn't die, the trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'UnderwaterAgilityThieving': {
			return `${name} is currently doing Underwater Agility and Thieving. ${formattedDuration}`;
		}
		case 'StrongholdOfSecurity': {
			return `${name} is currently doing the Stronghold of Security! The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'CombatRing': {
			return `${name} is currently fighting in the Combat Ring! The trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'SpecificQuest': {
			const data = currentTask as SpecificQuestOptions;
			return `${name} is currently doing the ${
				quests.find(i => i.id === data.questID)?.name
			}! The trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'Colosseum': {
			const data = currentTask as ColoTaskOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();

			return `${name} is currently attempting the Colosseum, if they are successful, the trip should take ${formatDuration(
				durationRemaining
			)}.`;
		}
		case 'HalloweenEvent': {
			return `${name} is doing the Halloween event! The trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'Easter':
		case 'BlastFurnace': {
			throw new Error('Removed');
		}
	}
}
