import { Emoji, formatDuration, increaseNumByPercent, reduceNumByPercent, toTitleCase } from '@oldschoolgg/toolkit';
import { MathRNG } from 'node-rng';
import { Items } from 'oldschooljs';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { findTripBuyable } from '@/lib/data/buyables/tripBuyables.js';
import killableMonsters from '@/lib/minions/data/killableMonsters/index.js';
import { Planks } from '@/lib/minions/data/planks.js';
import { quests } from '@/lib/minions/data/quests.js';
import Agility from '@/lib/skilling/skills/agility.js';
import Constructables from '@/lib/skilling/skills/construction/constructables.js';
import Cooking from '@/lib/skilling/skills/cooking/cooking.js';
import ForestryRations from '@/lib/skilling/skills/cooking/forestersRations.js';
import { LeapingFish } from '@/lib/skilling/skills/cooking/leapingFish.js';
import Crafting from '@/lib/skilling/skills/crafting/index.js';
import { Farming } from '@/lib/skilling/skills/farming/index.js';
import Firemaking from '@/lib/skilling/skills/firemaking.js';
import { Fishing } from '@/lib/skilling/skills/fishing/fishing.js';
import { zeroTimeFletchables } from '@/lib/skilling/skills/fletching/fletchables/index.js';
import Herblore from '@/lib/skilling/skills/herblore/herblore.js';
import Hunter from '@/lib/skilling/skills/hunter/hunter.js';
import { Castables } from '@/lib/skilling/skills/magic/castables.js';
import { Enchantables } from '@/lib/skilling/skills/magic/enchantables.js';
import Mining from '@/lib/skilling/skills/mining.js';
import Prayer from '@/lib/skilling/skills/prayer.js';
import Runecraft from '@/lib/skilling/skills/runecraft.js';
import { SailingActivityById } from '@/lib/skilling/skills/sailing/activities.js';
import Smithing from '@/lib/skilling/skills/smithing/index.js';
import { stealables } from '@/lib/skilling/skills/thieving/stealables.js';
import Woodcutting from '@/lib/skilling/skills/woodcutting/woodcutting.js';
import type {
	ActivityTaskData,
	ActivityTaskOptionsWithQuantity,
	AgilityActivityTaskOptions,
	AlchingActivityTaskOptions,
	BuryingActivityTaskOptions,
	ButlerActivityTaskOptions,
	BuyActivityTaskOptions,
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
	SailingActivityTaskOptions,
	SawmillActivityTaskOptions,
	ScatteringActivityTaskOptions,
	SepulchreActivityTaskOptions,
	ShadesOfMortonOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	SpecificQuestOptions,
	TheatreOfBloodTaskOptions,
	TiaraRunecraftActivityTaskOptions,
	TOAOptions,
	WoodcuttingActivityTaskOptions,
	ZalcanoActivityTaskOptions
} from '@/lib/types/minions.js';
import { shades, shadesLogs } from '@/mahoji/lib/abstracted_commands/shadesOfMortonCommand.js';
import { collectables } from '@/mahoji/lib/collectables.js';

export function minionStatus(user: MUser, currentTask: ActivityTaskData | null, rng = MathRNG) {
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
			} Crafting level is ${user.skillsAsLevels.crafting}`;
		}

		case 'Agility': {
			const data = currentTask as AgilityActivityTaskOptions;

			const course = Agility.Courses.find(course => course.id === data.courseID);

			return `${name} is currently running ${data.quantity}x ${course?.name} laps. ${formattedDuration} Your ${
				Emoji.Agility
			} Agility level is ${user.skillsAsLevels.agility}`;
		}

		case 'Cooking': {
			const data = currentTask as CookingActivityTaskOptions;

			const cookable = Cooking.Cookables.find(cookable => cookable.id === data.cookableID);

			return `${name} is currently cooking ${data.quantity}x ${cookable?.name}. ${formattedDuration} Your ${
				Emoji.Cooking
			} Cooking level is ${user.skillsAsLevels.cooking}`;
		}

		case 'Fishing': {
			const data = currentTask as FishingActivityTaskOptions;

			const fish = Fishing.Fishes.find(fish => fish.id === data.fishID);

			return `${name} is currently fishing ${data.quantity}x ${fish?.name}. ${formattedDuration} Your ${
				Emoji.Fishing
			} Fishing level is ${user.skillsAsLevels.fishing}`;
		}
		case 'Sailing': {
			const data = currentTask as SailingActivityTaskOptions;
			const activity = SailingActivityById.get(data.activity);
			return `${name} is currently doing ${activity?.name ?? 'Sailing'} (${data.quantity} actions) in ${data.region} on ${data.difficulty}. ${formattedDuration}`;
		}

		case 'Mining': {
			const data = currentTask as MiningActivityTaskOptions;

			const ore = Mining.Ores.find(ore => ore.id === data.oreID);

			return `${name} is currently mining ${ore?.name}. ${
				data.fakeDurationMax === data.fakeDurationMin
					? formattedDuration
					: `approximately ${formatDuration(
							rng.randomVariation(reduceNumByPercent(durationRemaining, 25), 20)
						)} **to** ${formatDuration(
							rng.randomVariation(increaseNumByPercent(durationRemaining, 25), 20)
						)} remaining.`
			} Your ${Emoji.Mining} Mining level is ${user.skillsAsLevels.mining}`;
		}

		case 'MotherlodeMining': {
			const data = currentTask as MotherlodeMiningActivityTaskOptions;

			return `${name} is currently mining at the Motherlode Mine. ${
				data.fakeDurationMax === data.fakeDurationMin
					? formattedDuration
					: `approximately ${formatDuration(
							rng.randomVariation(reduceNumByPercent(durationRemaining, 25), 20)
						)} **to** ${formatDuration(
							rng.randomVariation(increaseNumByPercent(durationRemaining, 25), 20)
						)} remaining.`
			} Your ${Emoji.Mining} Mining level is ${user.skillsAsLevels.mining}`;
		}

		case 'Smelting': {
			const data = currentTask as SmeltingActivityTaskOptions;

			const bar = Smithing.Bars.find(bar => bar.id === data.barID);

			return `${name} is currently smelting ${data.quantity}x ${bar?.name}. ${formattedDuration} Your ${
				Emoji.Smithing
			} Smithing level is ${user.skillsAsLevels.smithing}`;
		}

		case 'Smithing': {
			const data = currentTask as SmithingActivityTaskOptions;

			const SmithableItem = Smithing.SmithableItems.find(item => item.id === data.smithedBarID);

			return `${name} is currently smithing ${data.quantity}x ${SmithableItem?.name}. ${formattedDuration} Your ${
				Emoji.Smithing
			} Smithing level is ${user.skillsAsLevels.smithing}`;
		}

		case 'Offering': {
			const data = currentTask as OfferingActivityTaskOptions;

			const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

			return `${name} is currently offering ${data.quantity}x ${bones?.name}. ${formattedDuration} Your ${
				Emoji.Prayer
			} Prayer level is ${user.skillsAsLevels.prayer}`;
		}

		case 'Burying': {
			const data = currentTask as BuryingActivityTaskOptions;

			const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

			return `${name} is currently burying ${data.quantity}x ${bones?.name}. ${formattedDuration} Your ${
				Emoji.Prayer
			} Prayer level is ${user.skillsAsLevels.prayer}`;
		}

		case 'Scattering': {
			const data = currentTask as ScatteringActivityTaskOptions;

			const ashes = Prayer.Ashes.find(ashes => ashes.inputId === data.ashID);

			return `${name} is currently scattering ${data.quantity}x ${ashes?.name}. ${formattedDuration} Your ${
				Emoji.Prayer
			} Prayer level is ${user.skillsAsLevels.prayer}`;
		}

		case 'Firemaking': {
			const data = currentTask as FiremakingActivityTaskOptions;

			const burn = Firemaking.Burnables.find(burn => burn.inputLogs === data.burnableID);

			return `${name} is currently lighting ${data.quantity}x ${burn?.name}. ${formattedDuration} Your ${
				Emoji.Firemaking
			} Firemaking level is ${user.skillsAsLevels.firemaking}`;
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
							rng.randomVariation(reduceNumByPercent(durationRemaining, 25), 20)
						)} **to** ${formatDuration(
							rng.randomVariation(increaseNumByPercent(durationRemaining, 25), 20)
						)} remaining.`
			} Your ${Emoji.Woodcutting} Woodcutting level is ${user.skillsAsLevels.woodcutting}`;
		}
		case 'Runecraft': {
			const data = currentTask as RunecraftActivityTaskOptions;

			const rune = Runecraft.Runes.find(_rune => _rune.id === data.runeID);

			return `${name} is currently turning ${data.essenceQuantity}x Essence into ${
				rune?.name
			}. ${formattedDuration} Your ${Emoji.Runecraft} Runecraft level is ${user.skillsAsLevels.runecraft}`;
		}

		case 'TiaraRunecraft': {
			const data = currentTask as TiaraRunecraftActivityTaskOptions;
			const tiara = Runecraft.Tiaras.find(_tiara => _tiara.id === data.tiaraID);

			return `${name} is currently crafting ${data.tiaraQuantity} ${tiara?.name}. ${formattedDuration} Your ${
				Emoji.Runecraft
			} Runecraft level is ${user.skillsAsLevels.runecraft}`;
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
			}. ${formattedDuration} Your ${Emoji.Fletching} Fletching level is ${user.skillsAsLevels.fletching}`;
		}
		case 'Herblore': {
			const data = currentTask as HerbloreActivityTaskOptions;
			const mixable = Herblore.Mixables.find(i => i.item.id === data.mixableID);

			return `${name} is currently mixing ${data.quantity}x ${mixable?.item.name}. ${formattedDuration} Your ${
				Emoji.Herblore
			} Herblore level is ${user.skillsAsLevels.herblore}`;
		}
		case 'CutLeapingFish': {
			const data = currentTask as CutLeapingFishActivityTaskOptions;
			const barbarianFish = LeapingFish.find(item => item.item.id === data.id);

			return `${name} is currently cutting ${data.quantity}x ${
				barbarianFish?.item.name
			}. ${formattedDuration} Your ${Emoji.Cooking} Cooking level is ${user.skillsAsLevels.cooking}`;
		}
		case 'CreateForestersRations': {
			const data = currentTask as CreateForestersRationsActivityTaskOptions;
			const ration = ForestryRations.find(ration => ration.name === data.rationName)!;

			return `${name} is currently creating ${data.quantity}x ${
				ration.name
			}. ${formattedDuration} Your ${Emoji.Cooking} Cooking level is ${user.skillsAsLevels.cooking}`;
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

			return `${name} is currently alching ${data.quantity}x ${Items.itemNameFromId(
				data.itemID
			)}. ${formattedDuration}`;
		}

		case 'Farming': {
			const data = currentTask as FarmingActivityTaskOptions;

			const plants = Farming.Plants.find(plants => plants.name === data.plantsName);

			return `${name} is currently farming ${data.quantity}x ${plants?.name}. ${formattedDuration} Your ${
				Emoji.Farming
			} Farming level is ${user.skillsAsLevels.farming}.`;
		}

		case 'Sawmill': {
			const data = currentTask as SawmillActivityTaskOptions;
			const plank = Planks.find(_plank => _plank.outputItem === data.plankID)!;
			return `${name} is currently creating ${data.plankQuantity}x ${Items.itemNameFromId(
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

			const fletchable = data.fletch ? zeroTimeFletchables.find(i => i.id === data.fletch!.id) : null;

			const fletchingPart = fletchable ? `They are also fletching ${data.fletch!.qty}x ${fletchable.name}. ` : '';

			return `${name} is currently doing ${data.quantity}x laps of the Hallowed Sepulchre. ${fletchingPart}${formattedDuration}`;
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

			const creature = Hunter.Creatures.find(c => c.id === data.creatureID);
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
			return `${name} is currently creating ${data.plankQuantity}x ${Items.itemNameFromId(
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
			return `${name} is currently runecrafting ${toTitleCase(data.rune)} runes at the Dark Altar${
				data.useExtracts ? ' with extracts' : ''
			}. ${formattedDuration}`;
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
		case 'Buy': {
			const data = currentTask as BuyActivityTaskOptions;
			const tripBuyable = findTripBuyable(data.itemID, data.quantity);
			const itemName = tripBuyable?.displayName ?? Items.get(data.itemID)?.name ?? `Item[${data.itemID}]`;
			const quantity =
				tripBuyable?.quantity && tripBuyable.quantity > 0
					? data.quantity / tripBuyable.quantity
					: data.quantity;
			return `${name} is currently buying ${quantity}x ${itemName}. The trip should take ${formatDuration(durationRemaining)}.`;
		}
		case 'Nex': {
			const data = currentTask as NexTaskOptions;
			const durationRemaining = data.finishDate - data.duration + data.fakeDuration - Date.now();
			return `${name} is currently killing Nex ${data.quantity} times with a team of ${
				data.teamDetails.length
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
			return `${name} is currently creating ${
				currentTask.quantity
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
		case 'BlastFurnace':
		case 'Revenants': {
			throw new Error(`Removed`);
		}
	}
}
