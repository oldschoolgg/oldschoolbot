import { User } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient, KlasaUser, SettingsFolder } from 'klasa';
import Monster from 'oldschooljs/dist/structures/Monster';

import { production } from '../../config';
import { Activity, Channel, Emoji, Events, MAX_QP, PerkTier, Time } from '../../lib/constants';
import ClueTiers from '../../lib/minions/data/clueTiers';
import killableMonsters from '../../lib/minions/data/killableMonsters';
import { MinigameIDsEnum } from '../../lib/minions/data/minigames';
import { Planks } from '../../lib/minions/data/planks';
import { GroupMonsterActivityTaskOptions } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import Skills from '../../lib/skilling/skills';
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
	FishingTrawlerActivityTaskOptions,
	FletchingActivityTaskOptions,
	MiningActivityTaskOptions,
	MonsterActivityTaskOptions,
	OfferingActivityTaskOptions,
	SawmillActivityTaskOptions,
	SmeltingActivityTaskOptions,
	SmithingActivityTaskOptions,
	WoodcuttingActivityTaskOptions,
	ZalcanoActivityTaskOptions
} from '../../lib/types/minions';
import {
	addItemToBank,
	convertXPtoLVL,
	formatDuration,
	itemNameFromID,
	toTitleCase,
	Util
} from '../../lib/util';
import { channelIsSendable } from '../../lib/util/channelIsSendable';
import { formatOrdinal } from '../../lib/util/formatOrdinal';
import getActivityOfUser from '../../lib/util/getActivityOfUser';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { NightmareActivityTaskOptions } from './../../lib/types/minions';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	public get minionStatus(this: User) {
		const currentTask = getActivityOfUser(this.client, this.id);

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

			case Activity.Sawmill: {
				const data = currentTask as SawmillActivityTaskOptions;
				const plank = Planks.find(_plank => _plank.outputItem === data.plankID);
				return `${this.minionName} is currently creating ${
					data.plankQuantity
				}x ${itemNameFromID(plank!.outputItem)}s. ${formattedDuration}`;
			}

			case Activity.Nightmare: {
				const data = currentTask as NightmareActivityTaskOptions;

				return `${this.minionName} is currently killing The Nightmare, with a party of ${data.users.length}. ${formattedDuration}`;
			}

			case Activity.Sepulchre: {
				const data = currentTask as NightmareActivityTaskOptions;

				return `${this.minionName} is currently doing ${data.quantity}x laps of the Hallowed Sepulchre. ${formattedDuration}`;
			}

			case Activity.FishingTrawler: {
				const data = currentTask as FishingTrawlerActivityTaskOptions;
				return `${this.minionName} is currently aboard the Fishing Trawler, doing ${data.quantity}x trips. ${formattedDuration}`;
			}

			case Activity.Zalcano: {
				const data = currentTask as ZalcanoActivityTaskOptions;
				return `${this.minionName} is currently killing Zalcano ${data.quantity}x times. ${formattedDuration}`;
			}
		}
	}

	getKC(this: KlasaUser, monster: Monster) {
		return this.settings.get(UserSettings.MonsterScores)[monster.id] ?? 0;
	}

	getMinigameScore(this: KlasaUser, id: MinigameIDsEnum) {
		return this.settings.get(UserSettings.MinigameScores)[id] ?? 0;
	}

	// @ts-ignore 2784
	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	// @ts-ignore 2784
	public get maxTripLength(this: User) {
		const perkTier = getUsersPerkTier(this);
		if (perkTier === PerkTier.Two) return Time.Minute * 33;
		if (perkTier === PerkTier.Three) return Time.Minute * 36;
		if (perkTier >= PerkTier.Four) return Time.Minute * 40;

		return Time.Minute * 30;
	}

	// @ts-ignore 2784
	public get minionIsBusy(this: User): boolean {
		const usersTask = getActivityOfUser(this.client, this.id);
		return Boolean(usersTask);
	}

	// @ts-ignore 2784
	public get minionName(this: User): string {
		const name = this.settings.get(UserSettings.Minion.Name);
		const prefix = this.settings.get(UserSettings.Minion.Ironman) ? Emoji.Ironman : '';

		const icon = this.settings.get(UserSettings.Minion.Icon) ?? Emoji.Minion;

		return name
			? `${prefix} ${icon} **${Util.escapeMarkdown(name)}**`
			: `${prefix} ${icon} Your minion`;
	}

	public async incrementMinionDailyDuration(this: User, duration: number) {
		await this.settings.sync(true);

		const currentDuration = this.settings.get(UserSettings.Minion.DailyDuration);
		const newDuration = currentDuration + duration;
		if (newDuration > Time.Hour * 18) {
			const log = `[MOU] Minion has been active for ${formatDuration(newDuration)}.`;

			this.log(log);
			if (production) {
				const channel = this.client.channels.get(Channel.ErrorLogs);
				if (channelIsSendable(channel)) {
					channel.send(`${this.sanitizedName} ${log}`);
				}
			}
		}

		return this.settings.update(UserSettings.Minion.DailyDuration, newDuration);
	}

	public async addXP(this: User, skillName: SkillsEnum, amount: number) {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${skillName}`) as number;
		if (currentXP >= 200_000_000) return;

		const skill = Object.values(Skills).find(skill => skill.id === skillName);
		if (!skill) return;

		const newXP = Math.min(200_000_000, currentXP + amount);

		// If they reached a XP milestone, send a server notification.
		for (const XPMilestone of [50_000_000, 100_000_000, 150_000_000, 200_000_000]) {
			if (newXP < XPMilestone) break;

			if (currentXP < XPMilestone && newXP >= XPMilestone) {
				this.client.emit(
					Events.ServerNotification,
					`${skill.emoji} **${this.username}'s** minion, ${
						this.minionName
					}, just achieved ${newXP.toLocaleString()} XP in ${toTitleCase(skillName)}!`
				);
				break;
			}
		}

		// If they just reached 99, send a server notification.
		if (convertXPtoLVL(currentXP) < 99 && convertXPtoLVL(newXP) >= 99) {
			const skillNameCased = toTitleCase(skillName);
			const [usersWith] = await this.client.query<
				{
					count: string;
				}[]
			>(`SELECT COUNT(*) FROM users WHERE "skills.${skillName}" > 13034430;`);

			this.client.emit(
				Events.ServerNotification,
				`${skill.emoji} **${this.username}'s** minion, ${
					this.minionName
				}, just achieved level 99 in ${skillNameCased}! They are the ${formatOrdinal(
					parseInt(usersWith.count) + 1
				)} to get 99 ${skillNameCased}.`
			);
		}

		return this.settings.update(`skills.${skillName}`, Math.floor(newXP));
	}

	public skillLevel(this: User, skillName: SkillsEnum) {
		return convertXPtoLVL(this.settings.get(`skills.${skillName}`) as number);
	}

	public totalLevel(this: User, returnXP = false) {
		const userXPs = Object.values(
			(this.settings.get('skills') as SettingsFolder).toJSON() as Record<string, number>
		);
		let totalLevel = 0;
		for (const xp of userXPs) {
			totalLevel += returnXP ? xp : convertXPtoLVL(xp);
		}
		return totalLevel;
	}

	// @ts-ignore 2784
	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return (
			client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id)
		);
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

	public async incrementClueScore(this: User, clueID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentClueScores = this.settings.get(UserSettings.ClueScores);

		this.log(`had Quantity[${amountToAdd}] KC added to Clue[${clueID}]`);

		return this.settings.update(
			UserSettings.ClueScores,
			addItemToBank(currentClueScores, clueID, amountToAdd)
		);
	}

	public async incrementMinigameScore(this: User, minigameID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentMinigameScores = this.settings.get(UserSettings.MinigameScores);

		this.log(`had Quantity[${amountToAdd}] Score added to Minigame[${minigameID}]`);

		return this.settings.update(
			UserSettings.MinigameScores,
			addItemToBank(currentMinigameScores, minigameID, amountToAdd)
		);
	}
}
