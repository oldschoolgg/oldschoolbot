import { User } from 'discord.js';
import { calcPercentOfNum, calcWhatPercent, Time, uniqueArr } from 'e';
import { Extendable, ExtendableStore, KlasaClient, KlasaUser } from 'klasa';
import { Bank, Monsters } from 'oldschooljs';
import Monster from 'oldschooljs/dist/structures/Monster';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { collectables } from '../../commands/Minion/collect';
import {
	Activity,
	Emoji,
	Events,
	LEVEL_99_XP,
	MAX_QP,
	MAX_TOTAL_LEVEL,
	PerkTier,
	skillEmoji,
	ZALCANO_ID
} from '../../lib/constants';
import { onMax } from '../../lib/events';
import { hasGracefulEquipped } from '../../lib/gear';
import { availableQueues } from '../../lib/lfg/LfgUtils';
import ClueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters, { NightmareMonster } from '../../lib/minions/data/killableMonsters';
import { Planks } from '../../lib/minions/data/planks';
import { AttackStyles } from '../../lib/minions/functions';
import { AddXpParams, KillableMonster } from '../../lib/minions/types';
import { getActivityOfUser } from '../../lib/settings/settings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
import Agility from '../../lib/skilling/skills/agility';
import Cooking from '../../lib/skilling/skills/cooking';
import Crafting from '../../lib/skilling/skills/crafting';
import Farming from '../../lib/skilling/skills/farming';
import Firemaking from '../../lib/skilling/skills/firemaking';
import Fishing from '../../lib/skilling/skills/fishing';
import Herblore from '../../lib/skilling/skills/herblore/herblore';
import Creatures from '../../lib/skilling/skills/hunter/creatures';
import Hunter from '../../lib/skilling/skills/hunter/hunter';
import { Castables } from '../../lib/skilling/skills/magic/castables';
import { Enchantables } from '../../lib/skilling/skills/magic/enchantables';
import Mining from '../../lib/skilling/skills/mining';
import Prayer from '../../lib/skilling/skills/prayer';
import Runecraft from '../../lib/skilling/skills/runecraft';
import Smithing from '../../lib/skilling/skills/smithing';
import { Pickpocketables } from '../../lib/skilling/skills/thieving/stealables';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { Creature, SkillsEnum } from '../../lib/skilling/types';
import { XPGainsTable } from '../../lib/typeorm/XPGainsTable.entity';
import { Skills as TSkills } from '../../lib/types';
import {
	AgilityActivityTaskOptions,
	AlchingActivityTaskOptions,
	BarbarianAssaultActivityTaskOptions,
	BlastFurnaceActivityTaskOptions,
	BuryingActivityTaskOptions,
	CastingActivityTaskOptions,
	ClueActivityTaskOptions,
	CollectingOptions,
	ConstructionActivityTaskOptions,
	CookingActivityTaskOptions,
	CraftingActivityTaskOptions,
	DarkAltarOptions,
	EnchantingActivityTaskOptions,
	FarmingActivityTaskOptions,
	FiremakingActivityTaskOptions,
	FishingActivityTaskOptions,
	FishingTrawlerActivityTaskOptions,
	FletchingActivityTaskOptions,
	GauntletOptions,
	GloryChargingActivityTaskOptions,
	GroupMonsterActivityTaskOptions,
	HerbloreActivityTaskOptions,
	HunterActivityTaskOptions,
	LfgActivityTaskOptions,
	MinigameActivityTaskOptions,
	MiningActivityTaskOptions,
	MonsterActivityTaskOptions,
	NightmareActivityTaskOptions,
	OfferingActivityTaskOptions,
	PickpocketActivityTaskOptions,
	PlunderActivityTaskOptions,
	RaidsTaskOptions,
	RunecraftActivityTaskOptions,
	SawmillActivityTaskOptions,
	SepulchreActivityTaskOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	SoulWarsOptions,
	WealthChargingActivityTaskOptions,
	WoodcuttingActivityTaskOptions,
	ZalcanoActivityTaskOptions
} from '../../lib/types/minions';
import {
	addItemToBank,
	convertXPtoLVL,
	formatDuration,
	formatSkillRequirements,
	itemNameFromID,
	skillsMeetRequirements,
	stringMatches,
	toKMB,
	toTitleCase,
	Util
} from '../../lib/util';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Minigames } from './Minigame';

const suffixes = new SimpleTable<string>()
	.add('🎉', 200)
	.add('🎆', 10)
	.add('🙌', 10)
	.add('🎇', 10)
	.add('🥳', 10)
	.add('🍻', 10)
	.add('🎊', 10)
	.add(Emoji.PeepoNoob, 1)
	.add(Emoji.PeepoRanger, 1)
	.add(Emoji.PeepoSlayer);

const { TzTokJad } = Monsters;

function levelUpSuffix() {
	return suffixes.roll().item;
}

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get minionStatus(this: User) {
		const currentTask = getActivityOfUser(this.id);

		if (!currentTask) {
			return `${this.minionName} is currently doing nothing.

- Visit <https://www.oldschool.gg/oldschoolbot/minions> for extensive information on minions.
- Use \`+minion setname [name]\` to change your minions' name.
- You can assign ${this.minionName} to kill monsters for loot using \`+minion kill\`.
- Do clue scrolls with \`+minion clue easy\` (complete 1 easy clue)
- Train mining with \`+mine\`
- Train smithing with \`+smelt\` or \`+smith\`
- Train prayer with \`+bury\` or \`+offer\`
- Train woodcutting with \`+chop\`
- Train firemaking with \`+light\`
- Train crafting with \`+craft\`
- Train fletching with \`+fletch\`
- Train farming with \`+farm\` or \`+harvest\`
- Train herblore with \`+mix\`
- Gain quest points with \`+quest\`
- Pat your minion with \`+minion pat\``;
		}

		const durationRemaining = currentTask.finishDate - Date.now();
		const formattedDuration = `${formatDuration(durationRemaining)} remaining.`;

		switch (currentTask.type) {
			case Activity.MonsterKilling: {
				const data = currentTask as MonsterActivityTaskOptions;
				const monster = killableMonsters.find(mon => mon.id === data.monsterID);

				return `${this.minionName} is currently killing ${data.quantity}x ${
					monster!.name
				}. ${formattedDuration}`;
			}

			case Activity.GroupMonsterKilling: {
				const data = currentTask as GroupMonsterActivityTaskOptions;
				const monster = killableMonsters.find(mon => mon.id === data.monsterID);

				return `${this.minionName} is currently killing ${data.quantity}x ${monster!.name} with a party of ${
					data.users.length
				}. ${formattedDuration}`;
			}

			case Activity.ClueCompletion: {
				const data = currentTask as ClueActivityTaskOptions;

				const clueTier = ClueTiers.find(tier => tier.id === data.clueID);

				return `${this.minionName} is currently completing ${data.quantity}x ${
					clueTier!.name
				} clues. ${formattedDuration}`;
			}

			case Activity.Crafting: {
				const data = currentTask as CraftingActivityTaskOptions;
				const craftable = Crafting.Craftables.find(item => item.id === data.craftableID);

				return `${this.minionName} is currently crafting ${data.quantity}x ${
					craftable!.name
				}. ${formattedDuration} Your ${Emoji.Crafting} Crafting level is ${this.skillLevel(
					SkillsEnum.Crafting
				)}`;
			}

			case Activity.Agility: {
				const data = currentTask as AgilityActivityTaskOptions;

				const course = Agility.Courses.find(course => course.name === data.courseID);

				return `${this.minionName} is currently running ${data.quantity}x ${
					course!.name
				} laps. ${formattedDuration} Your ${Emoji.Agility} Agility level is ${this.skillLevel(
					SkillsEnum.Agility
				)}`;
			}

			case Activity.Cooking: {
				const data = currentTask as CookingActivityTaskOptions;

				const cookable = Cooking.Cookables.find(cookable => cookable.id === data.cookableID);

				return `${this.minionName} is currently cooking ${data.quantity}x ${
					cookable!.name
				}. ${formattedDuration} Your ${Emoji.Cooking} Cooking level is ${this.skillLevel(SkillsEnum.Cooking)}`;
			}

			case Activity.Fishing: {
				const data = currentTask as FishingActivityTaskOptions;

				const fish = Fishing.Fishes.find(fish => fish.id === data.fishID);

				return `${this.minionName} is currently fishing ${data.quantity}x ${
					fish!.name
				}. ${formattedDuration} Your ${Emoji.Fishing} Fishing level is ${this.skillLevel(SkillsEnum.Fishing)}`;
			}

			case Activity.Mining: {
				const data = currentTask as MiningActivityTaskOptions;

				const ore = Mining.Ores.find(ore => ore.id === data.oreID);

				return `${this.minionName} is currently mining ${data.quantity}x ${
					ore!.name
				}. ${formattedDuration} Your ${Emoji.Mining} Mining level is ${this.skillLevel(SkillsEnum.Mining)}`;
			}

			case Activity.Smelting: {
				const data = currentTask as SmeltingActivityTaskOptions;

				const bar = Smithing.Bars.find(bar => bar.id === data.barID);

				return `${this.minionName} is currently smelting ${data.quantity}x ${
					bar!.name
				}. ${formattedDuration} Your ${Emoji.Smithing} Smithing level is ${this.skillLevel(
					SkillsEnum.Smithing
				)}`;
			}

			case Activity.Smithing: {
				const data = currentTask as SmithingActivityTaskOptions;

				const SmithableItem = Smithing.SmithableItems.find(item => item.id === data.smithedBarID);

				return `${this.minionName} is currently smithing ${data.quantity}x ${
					SmithableItem!.name
				}. ${formattedDuration} Your ${Emoji.Smithing} Smithing level is ${this.skillLevel(
					SkillsEnum.Smithing
				)}`;
			}

			case Activity.Offering: {
				const data = currentTask as OfferingActivityTaskOptions;

				const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

				return `${this.minionName} is currently offering ${data.quantity}x ${
					bones!.name
				}. ${formattedDuration} Your ${Emoji.Prayer} Prayer level is ${this.skillLevel(SkillsEnum.Prayer)}`;
			}

			case Activity.Burying: {
				const data = currentTask as BuryingActivityTaskOptions;

				const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

				return `${this.minionName} is currently burying ${data.quantity}x ${
					bones!.name
				}. ${formattedDuration} Your ${Emoji.Prayer} Prayer level is ${this.skillLevel(SkillsEnum.Prayer)}`;
			}

			case Activity.Firemaking: {
				const data = currentTask as FiremakingActivityTaskOptions;

				const burn = Firemaking.Burnables.find(burn => burn.inputLogs === data.burnableID);

				return `${this.minionName} is currently lighting ${data.quantity}x ${
					burn!.name
				}. ${formattedDuration} Your ${Emoji.Firemaking} Firemaking level is ${this.skillLevel(
					SkillsEnum.Firemaking
				)}`;
			}

			case Activity.Questing: {
				return `${
					this.minionName
				} is currently Questing. ${formattedDuration} Your current Quest Point count is: ${this.settings.get(
					UserSettings.QP
				)}.`;
			}

			case Activity.Woodcutting: {
				const data = currentTask as WoodcuttingActivityTaskOptions;

				const log = Woodcutting.Logs.find(log => log.id === data.logID);

				return `${this.minionName} is currently chopping ${data.quantity}x ${
					log!.name
				}. ${formattedDuration} Your ${Emoji.Woodcutting} Woodcutting level is ${this.skillLevel(
					SkillsEnum.Woodcutting
				)}`;
			}
			case Activity.Runecraft: {
				const data = currentTask as RunecraftActivityTaskOptions;

				const rune = Runecraft.Runes.find(_rune => _rune.id === data.runeID);

				return `${this.minionName} is currently turning ${data.essenceQuantity}x Essence into ${
					rune!.name
				}. ${formattedDuration} Your ${Emoji.Runecraft} Runecraft level is ${this.skillLevel(
					SkillsEnum.Runecraft
				)}`;
			}

			case Activity.FightCaves: {
				return `${this.minionName} is currently attempting the ${Emoji.AnimatedFireCape} **Fight caves** ${Emoji.TzRekJad}.`;
			}
			case Activity.TitheFarm: {
				return `${this.minionName} is currently farming at the **Tithe Farm**. ${formattedDuration}`;
			}

			case Activity.Fletching: {
				const data = currentTask as FletchingActivityTaskOptions;

				return `${this.minionName} is currently fletching ${data.quantity}x ${
					data.fletchableName
				}. ${formattedDuration} Your ${Emoji.Fletching} Fletching level is ${this.skillLevel(
					SkillsEnum.Fletching
				)}`;
			}
			case Activity.Herblore: {
				const data = currentTask as HerbloreActivityTaskOptions;
				const mixable = Herblore.Mixables.find(item => item.id === data.mixableID);

				return `${this.minionName} is currently mixing ${data.quantity}x ${
					mixable!.name
				}. ${formattedDuration} Your ${Emoji.Herblore} Herblore level is ${this.skillLevel(
					SkillsEnum.Herblore
				)}`;
			}
			case Activity.Wintertodt: {
				return `${this.minionName} is currently fighting the Wintertodt. ${formattedDuration}`;
			}

			case Activity.Alching: {
				const data = currentTask as AlchingActivityTaskOptions;

				return `${this.minionName} is currently alching ${data.quantity}x ${itemNameFromID(
					data.itemID
				)}. ${formattedDuration}`;
			}

			case Activity.Farming: {
				const data = currentTask as FarmingActivityTaskOptions;

				const plants = Farming.Plants.find(plants => plants.name === data.plantsName);

				return `${this.minionName} is currently farming ${data.quantity}x ${
					plants!.name
				}. ${formattedDuration} Your ${Emoji.Farming} Farming level is ${this.skillLevel(SkillsEnum.Farming)}.`;
			}

			case Activity.Sawmill: {
				const data = currentTask as SawmillActivityTaskOptions;
				const plank = Planks.find(_plank => _plank.outputItem === data.plankID);
				return `${this.minionName} is currently creating ${data.plankQuantity}x ${itemNameFromID(
					plank!.outputItem
				)}s. ${formattedDuration}`;
			}

			case Activity.Nightmare: {
				const data = currentTask as NightmareActivityTaskOptions;

				return `${this.minionName} is currently killing The Nightmare, with a party of ${data.users.length}. ${formattedDuration}`;
			}

			case Activity.AnimatedArmour: {
				return `${this.minionName} is currently fighting animated armour in the Warriors' Guild. ${formattedDuration}`;
			}

			case Activity.Cyclops: {
				return `${this.minionName} is currently fighting cyclopes in the Warriors' Guild. ${formattedDuration}`;
			}

			case Activity.Sepulchre: {
				const data = currentTask as SepulchreActivityTaskOptions;

				return `${this.minionName} is currently doing ${data.quantity}x laps of the Hallowed Sepulchre. ${formattedDuration}`;
			}

			case Activity.Plunder: {
				const data = currentTask as PlunderActivityTaskOptions;

				return `${this.minionName} is currently doing Pyramid Plunder x ${data.quantity}x times. ${formattedDuration}`;
			}

			case Activity.FishingTrawler: {
				const data = currentTask as FishingTrawlerActivityTaskOptions;
				return `${this.minionName} is currently aboard the Fishing Trawler, doing ${data.quantity}x trips. ${formattedDuration}`;
			}

			case Activity.Zalcano: {
				const data = currentTask as ZalcanoActivityTaskOptions;
				return `${this.minionName} is currently killing Zalcano ${data.quantity}x times. ${formattedDuration}`;
			}

			case Activity.Pickpocket: {
				const data = currentTask as PickpocketActivityTaskOptions;
				const npc = Pickpocketables.find(_npc => _npc.id === data.monsterID)!;
				return `${this.minionName} is currently pickpocketing a ${npc.name} ${data.quantity}x times. ${formattedDuration}`;
			}

			case Activity.BarbarianAssault: {
				const data = currentTask as BarbarianAssaultActivityTaskOptions;

				return `${this.minionName} is currently doing ${data.quantity} waves of Barbarian Assault, with a party of ${data.users.length}. ${formattedDuration}`;
			}

			case Activity.AgilityArena: {
				return `${this.minionName} is currently doing the Brimhaven Agility Arena. ${formattedDuration}`;
			}

			case Activity.ChampionsChallenge: {
				return `${this.minionName} is currently doing the **Champion's Challenge**. ${formattedDuration}`;
			}

			case Activity.Hunter: {
				const data = currentTask as HunterActivityTaskOptions;

				const creature = Hunter.Creatures.find(creature =>
					creature.aliases.some(
						alias =>
							stringMatches(alias, data.creatureName) ||
							stringMatches(alias.split(' ')[0], data.creatureName)
					)
				);
				return `${this.minionName} is currently hunting ${data.quantity}x ${
					creature!.name
				}. ${formattedDuration}`;
			}

			case Activity.Birdhouse: {
				return `${this.minionName} is currently doing a bird house run. ${formattedDuration}`;
			}

			case Activity.AerialFishing: {
				return `${this.minionName} is currently aerial fishing. ${formattedDuration}`;
			}

			case Activity.Construction: {
				const data = currentTask as ConstructionActivityTaskOptions;
				return `${this.minionName} is currently building ${data.quantity}x ${itemNameFromID(
					data.objectID
				)}. ${formattedDuration}`;
			}

			case Activity.MahoganyHomes: {
				return `${this.minionName} is currently doing Mahogany Homes. ${formattedDuration}`;
			}

			case Activity.Enchanting: {
				const data = currentTask as EnchantingActivityTaskOptions;
				const enchantable = Enchantables.find(i => i.id === data.itemID);
				return `${this.minionName} is currently enchanting ${data.quantity}x ${
					enchantable!.name
				}. ${formattedDuration}`;
			}

			case Activity.Casting: {
				const data = currentTask as CastingActivityTaskOptions;
				const spell = Castables.find(i => i.id === data.spellID);
				return `${this.minionName} is currently casting ${data.quantity}x ${spell!.name}. ${formattedDuration}`;
			}

			case Activity.GloryCharging: {
				const data = currentTask as GloryChargingActivityTaskOptions;
				return `${this.minionName} is currently charging ${data.quantity}x inventories of glories at the Fountain of Rune. ${formattedDuration}`;
			}

			case Activity.WealthCharging: {
				const data = currentTask as WealthChargingActivityTaskOptions;
				return `${this.minionName} is currently charging ${data.quantity}x inventories of rings of wealth at the Fountain of Rune. ${formattedDuration}`;
			}

			case Activity.GnomeRestaurant: {
				return `${this.minionName} is currently doing Gnome Restaurant deliveries. ${formattedDuration}`;
			}

			case Activity.SoulWars: {
				const data = currentTask as SoulWarsOptions;
				return `${this.minionName} is currently doing ${data.quantity}x games of Soul Wars. ${formattedDuration}`;
			}

			case Activity.RoguesDenMaze: {
				return `${this.minionName} is currently attempting the Rogues' Den maze. ${formattedDuration}`;
			}

			case Activity.Gauntlet: {
				const data = currentTask as GauntletOptions;
				return `${this.minionName} is currently doing ${data.quantity}x ${
					data.corrupted ? 'Corrupted' : 'Normal'
				} Gauntlet. ${formattedDuration}`;
			}

			case Activity.CastleWars: {
				const data = currentTask as MinigameActivityTaskOptions;
				return `${this.minionName} is currently doing ${data.quantity}x Castle Wars games. ${formattedDuration}`;
			}

			case Activity.MageArena: {
				return `${this.minionName} is currently doing the Mage Arena. ${formattedDuration}`;
			}

			case Activity.Raids: {
				const data = currentTask as RaidsTaskOptions;
				return `${this.minionName} is currently doing the Chamber's of Xeric${
					data.challengeMode ? ' in Challenge Mode' : ''
				}, ${
					data.users.length === 1 ? 'as a solo.' : `with a team of ${data.users.length} minions.`
				} ${formattedDuration}`;
			}

			case Activity.Collecting: {
				const data = currentTask as CollectingOptions;
				const collectable = collectables.find(c => c.item.id === data.collectableID)!;
				return `${this.minionName} is currently collecting ${data.quantity * collectable.quantity}x ${
					collectable.item.name
				}. ${formattedDuration}`;
			}

			case Activity.MageTrainingArena: {
				return `${this.minionName} is currently training at the Mage Training Arena. ${formattedDuration}`;
			}

			case Activity.BlastFurnace: {
				const data = currentTask as BlastFurnaceActivityTaskOptions;

				const bar = Smithing.BlastableBars.find(bar => bar.id === data.barID);

				return `${this.minionName} is currently smelting ${data.quantity}x ${
					bar!.name
				} at the Blast Furnace. ${formattedDuration} Your ${Emoji.Smithing} Smithing level is ${this.skillLevel(
					SkillsEnum.Smithing
				)}`;
			}

			case Activity.MageArena2: {
				return `${this.minionName} is currently attempting the Mage Arena II. ${formattedDuration}`;
			}

			case Activity.BigChompyBirdHunting: {
				return `${this.minionName} is currently hunting Chompy Birds! ${formattedDuration}`;
			}

			case Activity.DarkAltar: {
				const data = currentTask as DarkAltarOptions;
				return `${this.minionName} is currently runecrafting ${toTitleCase(
					data.rune
				)} runes at the Dark Altar. ${formattedDuration}`;
			}
			case Activity.Trekking: {
				return `${this.minionName} is currently Temple Trekking. ${formattedDuration}`;
			}
			case Activity.Lfg: {
				const data = currentTask as LfgActivityTaskOptions;
				const queue = availableQueues.find(q => q.uniqueID === data.queueId);
				const lfgType = queue!.monster ? 'killing' : 'playing';
				return `${this.minionName} is currently on a LFG group ${lfgType} **${queue!.name}** with a party of ${
					data.users.length
				}.  ${formattedDuration}`;
			}
		}
	}

	getKC(this: KlasaUser, id: number) {
		return this.settings.get(UserSettings.MonsterScores)[id] ?? 0;
	}

	getOpenableScore(this: KlasaUser, id: number) {
		return this.settings.get(UserSettings.OpenableScores)[id] ?? 0;
	}

	public async getKCByName(this: KlasaUser, kcName: string) {
		const mon = [
			...killableMonsters,
			NightmareMonster,
			{ name: 'Zalcano', aliases: ['zalcano'], id: ZALCANO_ID },
			{ name: 'TzTokJad', aliases: ['jad', 'fightcaves'], id: TzTokJad.id }
		].find(mon => stringMatches(mon.name, kcName) || mon.aliases.some(alias => stringMatches(alias, kcName)));
		const minigame = Minigames.find(game => stringMatches(game.name, kcName));
		const creature = Creatures.find(c => c.aliases.some(alias => stringMatches(alias, kcName)));

		if (!mon && !minigame && !creature) {
			return [null, 0];
		}

		const kc = mon
			? this.getKC((mon as unknown as Monster).id)
			: minigame
			? await this.getMinigameScore(minigame!.key)
			: this.getCreatureScore(creature!);

		const name = minigame ? minigame.name : mon ? mon!.name : creature?.name;
		return [name, kc];
	}

	getCreatureScore(this: KlasaUser, creature: Creature) {
		return this.settings.get(UserSettings.CreatureScores)[creature.id] ?? 0;
	}

	// @ts-ignore 2784
	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	// @ts-ignore 2784
	public maxTripLength(this: User, activity?: Activity) {
		let max = Time.Minute * 30;

		if (activity === Activity.Alching) {
			return Time.Hour;
		}

		const perkTier = getUsersPerkTier(this);
		if (perkTier === PerkTier.Two) max += Time.Minute * 3;
		else if (perkTier === PerkTier.Three) max += Time.Minute * 6;
		else if (perkTier >= PerkTier.Four) max += Time.Minute * 10;

		const sac = this.settings.get(UserSettings.SacrificedValue);
		const sacPercent = Math.min(100, calcWhatPercent(sac, this.isIronman ? 5_000_000_000 : 10_000_000_000));
		max += calcPercentOfNum(sacPercent, Number(Time.Minute));

		if (!activity) return max;
		switch (activity) {
			case Activity.Nightmare:
			case Activity.GroupMonsterKilling:
			case Activity.MonsterKilling:
			case Activity.Wintertodt:
			case Activity.Zalcano:
			case Activity.BarbarianAssault:
			case Activity.AnimatedArmour:
			case Activity.Sepulchre:
			case Activity.Pickpocket:
			case Activity.SoulWars:
			case Activity.Cyclops: {
				const hpLevel = this.skillLevel(SkillsEnum.Hitpoints);
				const hpPercent = calcWhatPercent(hpLevel - 10, 99 - 10);
				max += calcPercentOfNum(hpPercent, Time.Minute * 5);
				break;
			}

			default: {
				break;
			}
		}

		return max;
	}

	// @ts-ignore 2784
	public get minionIsBusy(this: User): boolean {
		const usersTask = getActivityOfUser(this.id);
		return Boolean(usersTask);
	}

	public hasGracefulEquipped(this: User) {
		const rawGear = this.rawGear();
		for (const i of Object.values(rawGear)) {
			if (hasGracefulEquipped(i)) return true;
		}
		return false;
	}

	// @ts-ignore 2784
	public get minionName(this: User): string {
		const name = this.settings.get(UserSettings.Minion.Name);
		const prefix = this.settings.get(UserSettings.Minion.Ironman) ? Emoji.Ironman : '';

		const icon = this.settings.get(UserSettings.Minion.Icon) ?? Emoji.Minion;

		return name ? `${prefix} ${icon} **${Util.escapeMarkdown(name)}**` : `${prefix} ${icon} Your minion`;
	}

	public async addXP(this: User, params: AddXpParams): Promise<string> {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${params.skillName}`) as number;
		const currentLevel = this.skillLevel(params.skillName);
		const currentTotalLevel = this.totalLevel();

		const name = toTitleCase(params.skillName);

		if (currentXP >= 200_000_000) {
			return `You received no XP because you have 200m ${name} XP already.`;
		}

		const skill = Object.values(Skills).find(skill => skill.id === params.skillName)!;

		const newXP = Math.min(200_000_000, currentXP + params.amount);
		const totalXPAdded = newXP - currentXP;
		const newLevel = convertXPtoLVL(Math.floor(newXP));

		if (totalXPAdded > 0) {
			XPGainsTable.insert({
				userID: this.id,
				skill: params.skillName,
				xp: Math.floor(params.amount)
			});
		}

		// If they reached a XP milestone, send a server notification.
		for (const XPMilestone of [50_000_000, 100_000_000, 150_000_000, 200_000_000]) {
			if (newXP < XPMilestone) break;

			if (currentXP < XPMilestone && newXP >= XPMilestone) {
				this.client.emit(
					Events.ServerNotification,
					`${skill.emoji} **${this.username}'s** minion, ${
						this.minionName
					}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(params.skillName)}!`
				);
				break;
			}
		}

		// If they just reached 99, send a server notification.
		if (currentLevel < 99 && newLevel >= 99) {
			const skillNameCased = toTitleCase(params.skillName);
			const [usersWith] = await this.client.query<
				{
					count: string;
				}[]
			>(`SELECT COUNT(*) FROM users WHERE "skills.${params.skillName}" >= ${LEVEL_99_XP};`);

			let str = `${skill.emoji} **${this.username}'s** minion, ${
				this.minionName
			}, just achieved level 99 in ${skillNameCased}! They are the ${formatOrdinal(
				parseInt(usersWith.count) + 1
			)} to get 99 ${skillNameCased}.`;

			if (this.isIronman) {
				const [ironmenWith] = await this.client.query<
					{
						count: string;
					}[]
				>(
					`SELECT COUNT(*) FROM users WHERE "minion.ironman" = true AND "skills.${params.skillName}" >= ${LEVEL_99_XP};`
				);
				str += ` They are the ${formatOrdinal(parseInt(ironmenWith.count) + 1)} Ironman to get 99.`;
			}
			this.client.emit(Events.ServerNotification, str);
		}

		await this.settings.update(`skills.${params.skillName}`, Math.floor(newXP));

		let str = params.minimal
			? `+${Math.ceil(params.amount).toLocaleString()} ${skillEmoji[params.skillName]}`
			: `You received ${Math.ceil(params.amount).toLocaleString()} ${skillEmoji[params.skillName]} XP`;
		if (params.duration && !params.minimal) {
			let rawXPHr = (params.amount / (params.duration / Time.Minute)) * 60;
			rawXPHr = Math.floor(rawXPHr / 1000) * 1000;
			str += ` (${toKMB(rawXPHr)}/Hr)`;
		}

		if (currentTotalLevel < MAX_TOTAL_LEVEL && this.totalLevel() >= MAX_TOTAL_LEVEL) {
			str += '\n\n**Congratulations, your minion has reached the maximum total level!**\n\n';
			onMax(this);
		} else if (currentLevel !== newLevel) {
			str += params.minimal
				? `(Levelled up to ${newLevel})`
				: `\n**Congratulations! Your ${name} level is now ${newLevel}** ${levelUpSuffix()}`;
		}
		return str;
	}

	public skillLevel(this: User, skillName: SkillsEnum) {
		return convertXPtoLVL(this.settings.get(`skills.${skillName}`) as number);
	}

	public totalLevel(this: User, returnXP = false) {
		const userXPs = Object.values(this.rawSkills) as number[];
		let totalLevel = 0;
		for (const xp of userXPs) {
			totalLevel += returnXP ? xp : convertXPtoLVL(xp);
		}
		return totalLevel;
	}

	// @ts-ignore 2784
	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id);
	}

	/**
	 * Toggle whether this user is busy or not, this adds another layer of locking the user
	 * from economy actions.
	 *
	 * @param busy boolean Whether the new toggled state will be busy or not busy.
	 */
	public toggleBusy(this: User, busy: boolean) {
		const client = this.client as KlasaClient;

		if (busy) {
			client.secondaryUserBusyCache.add(this.id);
		} else {
			client.secondaryUserBusyCache.delete(this.id);
		}
	}

	public async addQP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentQP = this.settings.get(UserSettings.QP);
		const newQP = Math.min(MAX_QP, currentQP + amount);

		if (currentQP < MAX_QP && newQP === MAX_QP) {
			this.client.emit(
				Events.ServerNotification,
				`${Emoji.QuestIcon} **${this.username}'s** minion, ${this.minionName}, just achieved the maximum amount of Quest Points!`
			);
		}

		this.log(`had ${newQP} QP added. Before[${currentQP}] New[${newQP}]`);
		return this.settings.update(UserSettings.QP, newQP);
	}

	// @ts-ignore 2784
	public get isIronman(this: User) {
		return this.settings.get(UserSettings.Minion.Ironman);
	}

	public async incrementMonsterScore(this: User, monsterID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentMonsterScores = this.settings.get(UserSettings.MonsterScores);

		this.log(`had Quantity[${amountToAdd}] KC added to Monster[${monsterID}]`);

		return this.settings.update(
			UserSettings.MonsterScores,
			addItemToBank(currentMonsterScores, monsterID, amountToAdd)
		);
	}

	public async incrementOpenableScore(this: User, openableID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const scores = this.settings.get(UserSettings.OpenableScores);

		return this.settings.update(UserSettings.OpenableScores, addItemToBank(scores, openableID, amountToAdd));
	}

	public async incrementClueScore(this: User, clueID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentClueScores = this.settings.get(UserSettings.ClueScores);

		this.log(`had Quantity[${amountToAdd}] KC added to Clue[${clueID}]`);

		return this.settings.update(UserSettings.ClueScores, addItemToBank(currentClueScores, clueID, amountToAdd));
	}

	public async incrementCreatureScore(this: User, creatureID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentCreatureScores = this.settings.get(UserSettings.CreatureScores);

		this.log(`had Quantity[${amountToAdd}] Score added to Creature[${creatureID}]`);

		return this.settings.update(
			UserSettings.CreatureScores,
			addItemToBank(currentCreatureScores, creatureID, amountToAdd)
		);
	}

	public async setAttackStyle(this: User, newStyles: AttackStyles[]) {
		await this.settings.update(UserSettings.AttackStyle, uniqueArr(newStyles), {
			arrayAction: 'overwrite'
		});
	}

	public getAttackStyles(this: User) {
		const styles = this.settings.get(UserSettings.AttackStyle);
		if (styles.length === 0) {
			return [SkillsEnum.Attack, SkillsEnum.Strength, SkillsEnum.Defence];
		}
		return styles;
	}

	public resolveAvailableItemBoosts(this: User, monster: KillableMonster) {
		const boosts = new Bank();
		if (monster.itemInBankBoosts) {
			for (const boostSet of monster.itemInBankBoosts) {
				let highestBoostAmount = 0;
				let highestBoostItem = 0;

				// find the highest boost that the player has
				for (const [itemID, boostAmount] of Object.entries(boostSet)) {
					const parsedId = parseInt(itemID);
					if (!this.hasItemEquippedOrInBank(parsedId)) continue;
					if (boostAmount > highestBoostAmount) {
						highestBoostAmount = boostAmount;
						highestBoostItem = parsedId;
					}
				}

				if (highestBoostAmount && highestBoostItem) {
					boosts.add(highestBoostItem, highestBoostAmount);
				}
			}
		}
		return boosts.bank;
	}

	public hasSkillReqs(this: User, reqs: TSkills): [boolean, string | null] {
		const hasReqs = skillsMeetRequirements(this.rawSkills, reqs);
		if (!hasReqs) {
			return [false, formatSkillRequirements(reqs)];
		}
		return [true, null];
	}

	// @ts-ignore 2784
	public get combatLevel(this: User): number {
		const defence = this.skillLevel(SkillsEnum.Defence);
		const ranged = this.skillLevel(SkillsEnum.Ranged);
		const hitpoints = this.skillLevel(SkillsEnum.Hitpoints);
		const magic = this.skillLevel(SkillsEnum.Magic);
		const prayer = this.skillLevel(SkillsEnum.Prayer);
		const attack = this.skillLevel(SkillsEnum.Attack);
		const strength = this.skillLevel(SkillsEnum.Strength);

		const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
		const melee = 0.325 * (attack + strength);
		const range = 0.325 * (Math.floor(ranged / 2) + ranged);
		const mage = 0.325 * (Math.floor(magic / 2) + magic);
		return Math.floor(base + Math.max(melee, range, mage));
	}
}
