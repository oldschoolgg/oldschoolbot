import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaUser } from 'klasa';
import Monster from 'oldschooljs/dist/structures/Monster';

import { Activity, Emoji, Time } from '../../lib/constants';
import ClueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Agility from '../../lib/skilling/skills/agility';
import Cooking from '../../lib/skilling/skills/cooking';
import Crafting from '../../lib/skilling/skills/crafting';
import Firemaking from '../../lib/skilling/skills/firemaking';
import Fishing from '../../lib/skilling/skills/fishing';
import Mining from '../../lib/skilling/skills/mining';
import Prayer from '../../lib/skilling/skills/prayer';
import Runecraft, { RunecraftActivityTaskOptions } from '../../lib/skilling/skills/runecraft';
import Smithing from '../../lib/skilling/skills/smithing';
import Woodcutting from '../../lib/skilling/skills/woodcutting';
import { SkillsEnum } from '../../lib/skilling/types';
import {
	AgilityActivityTaskOptions,
	AlchingActivityTaskOptions,
	BuryingActivityTaskOptions,
	ClueActivityTaskOptions,
	CookingActivityTaskOptions,
	CraftingActivityTaskOptions,
	FiremakingActivityTaskOptions,
	FishingActivityTaskOptions,
	FletchingActivityTaskOptions,
	MiningActivityTaskOptions,
	MonsterActivityTaskOptions,
	OfferingActivityTaskOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	WoodcuttingActivityTaskOptions
} from '../../lib/types/minions';
import { itemNameFromID } from '../../lib/util';
import getActivityOfUser from '../../lib/util/getActivityOfUser';
import { formatDuration } from '../../util';
import { NightmareActivityTaskOptions } from './../../lib/types/minions';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2784
	public get minionStatus(this: User) {
		const currentTask = getActivityOfUser(this.client, this);

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
- Gain quest points with \`+quest\`
- Pat your minion with \`+minion pat\``;
		}

		const durationRemaining = currentTask.finishDate - Date.now();
		const formattedDuration =
			durationRemaining < Time.Minute
				? `They're on their way back now!`
				: `Approximately ${formatDuration(durationRemaining)} remaining.`;

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

				return `${this.minionName} is currently killing ${data.quantity}x ${
					monster!.name
				} with a party of ${data.users.length}. ${formattedDuration}`;
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
				} laps. ${formattedDuration} Your ${
					Emoji.Agility
				} Agility level is ${this.skillLevel(SkillsEnum.Agility)}`;
			}

			case Activity.Cooking: {
				const data = currentTask as CookingActivityTaskOptions;

				const cookable = Cooking.Cookables.find(
					cookable => cookable.id === data.cookableID
				);

				return `${this.minionName} is currently cooking ${data.quantity}x ${
					cookable!.name
				}. ${formattedDuration} Your ${Emoji.Cooking} Cooking level is ${this.skillLevel(
					SkillsEnum.Cooking
				)}`;
			}

			case Activity.Fishing: {
				const data = currentTask as FishingActivityTaskOptions;

				const fish = Fishing.Fishes.find(fish => fish.id === data.fishID);

				return `${this.minionName} is currently fishing ${data.quantity}x ${
					fish!.name
				}. ${formattedDuration} Your ${Emoji.Fishing} Fishing level is ${this.skillLevel(
					SkillsEnum.Fishing
				)}`;
			}

			case Activity.Mining: {
				const data = currentTask as MiningActivityTaskOptions;

				const ore = Mining.Ores.find(ore => ore.id === data.oreID);

				return `${this.minionName} is currently mining ${data.quantity}x ${
					ore!.name
				}. ${formattedDuration} Your ${Emoji.Mining} Mining level is ${this.skillLevel(
					SkillsEnum.Mining
				)}`;
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

				const SmithableItem = Smithing.SmithableItems.find(
					item => item.id === data.smithedBarID
				);

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
				}. ${formattedDuration} Your ${Emoji.Prayer} Prayer level is ${this.skillLevel(
					SkillsEnum.Prayer
				)}`;
			}

			case Activity.Burying: {
				const data = currentTask as BuryingActivityTaskOptions;

				const bones = Prayer.Bones.find(bones => bones.inputId === data.boneID);

				return `${this.minionName} is currently burying ${data.quantity}x ${
					bones!.name
				}. ${formattedDuration} Your ${Emoji.Prayer} Prayer level is ${this.skillLevel(
					SkillsEnum.Prayer
				)}`;
			}

			case Activity.Firemaking: {
				const data = currentTask as FiremakingActivityTaskOptions;

				const burn = Firemaking.Burnables.find(burn => burn.inputLogs === data.burnableID);

				return `${this.minionName} is currently lighting ${data.quantity}x ${
					burn!.name
				}. ${formattedDuration} Your ${
					Emoji.Firemaking
				} Firemaking level is ${this.skillLevel(SkillsEnum.Firemaking)}`;
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
				}. ${formattedDuration} Your ${
					Emoji.Woodcutting
				} Woodcutting level is ${this.skillLevel(SkillsEnum.Woodcutting)}`;
			}
			case Activity.Runecraft: {
				const data = currentTask as RunecraftActivityTaskOptions;

				const rune = Runecraft.Runes.find(_rune => _rune.id === data.runeID);

				return `${this.minionName} is currently turning ${
					data.essenceQuantity
				}x Essence into ${rune!.name}. ${formattedDuration} Your ${
					Emoji.Runecraft
				} Runecraft level is ${this.skillLevel(SkillsEnum.Runecraft)}`;
			}

			case Activity.FightCaves: {
				return `${this.minionName} is currently attempting the ${Emoji.AnimatedFireCape} **Fight caves** ${Emoji.TzRekJad}.`;
			}
			case Activity.Fletching: {
				const data = currentTask as FletchingActivityTaskOptions;

				return `${this.minionName} is currently fletching ${data.quantity}x ${
					data.fletchableName
				}. ${formattedDuration} Your ${
					Emoji.Fletching
				} Fletching level is ${this.skillLevel(SkillsEnum.Fletching)}`;
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

			case Activity.Nightmare: {
				const data = currentTask as NightmareActivityTaskOptions;

				return `${this.minionName} is currently killing The Nightmare, with a party of ${data.users.length}. ${formattedDuration}`;
			}

			case Activity.Sepulchre: {
				const data = currentTask as NightmareActivityTaskOptions;

				return `${this.minionName} is currently doing ${data.quantity}x laps of the Hallowed Sepulchre. ${formattedDuration}`;
			}
		}
	}

	getKC(this: KlasaUser, monster: Monster) {
		return this.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0;
	}

	getCL(this: KlasaUser, itemID: number) {
		return this.settings.get(UserSettings.CollectionLogBank)[itemID] ?? 0;
	}

	getMinigameScore(this: KlasaUser, id: MinigameIDsEnum) {
		return this.settings.get(UserSettings.MinigameScores)[id] ?? 0;
	}
}
