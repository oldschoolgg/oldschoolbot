import { Extendable, KlasaClient, ExtendableStore } from 'klasa';
import { User, Util, TextChannel } from 'discord.js';

import { Events, Activity, Emoji, Channel, Time, MAX_QP, PerkTier } from '../lib/constants';
import { Bank } from '../lib/types';
import {
	addBankToBank,
	removeItemFromBank,
	addItemToBank,
	activityTaskFilter,
	formatDuration,
	convertXPtoLVL,
	toTitleCase
} from '../lib/util';
import clueTiers from '../lib/minions/data/clueTiers';
import killableMonsters from '../lib/killableMonsters';
import Mining from '../lib/skilling/skills/mining';
import { UserSettings } from '../lib/UserSettings';
import {
	MonsterActivityTaskOptions,
	ClueActivityTaskOptions,
	MiningActivityTaskOptions,
	TickerTaskData,
	ActivityTaskOptions,
	SmithingActivityTaskOptions,
	WoodcuttingActivityTaskOptions,
	FiremakingActivityTaskOptions,
	FishingActivityTaskOptions,
	AgilityActivityTaskOptions
} from '../lib/types/minions';
import getActivityOfUser from '../lib/util/getActivityOfUser';
import Smithing from '../lib/skilling/skills/smithing';
import Firemaking from '../lib/skilling/skills/firemaking';
import Woodcutting from '../lib/skilling/skills/woodcutting';
import Skills from '../lib/skilling/skills';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';
import Fishing from '../lib/skilling/skills/fishing';
import Agility from '../lib/skilling/skills/agility';
import { SkillsEnum } from '../lib/skilling/types';
import Runecraft, { RunecraftActivityTaskOptions } from '../lib/skilling/skills/runecraft';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	get sanitizedName(this: User) {
		return `(${this.username.replace(/[()]/g, '')})[${this.id}]`;
	}

	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return (
			client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id)
		);
	}

	public get isIronman(this: User) {
		return this.settings.get(UserSettings.Minion.Ironman);
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

	public log(this: User, stringLog: string) {
		this.client.emit(Events.Log, `${this.sanitizedName} ${stringLog}`);
	}

	public async removeGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		if (currentGP < amount) throw `${this.sanitizedName} doesn't have enough GP.`;
		this.log(
			`had ${amount} GP removed. BeforeBalance[${currentGP}] NewBalance[${currentGP -
				amount}]`
		);
		return this.settings.update(UserSettings.GP, currentGP - amount);
	}

	public async addGP(this: User, amount: number) {
		await this.settings.sync(true);
		const currentGP = this.settings.get(UserSettings.GP);
		this.log(
			`had ${amount} GP added. BeforeBalance[${currentGP}] NewBalance[${currentGP + amount}]`
		);
		return this.settings.update(UserSettings.GP, currentGP + amount);
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

	public async addItemsToBank(this: User, _items: Bank, collectionLog = false) {
		await this.settings.sync(true);
		for (const { scrollID } of clueTiers) {
			// If they didnt get any of this clue scroll in their loot, continue to next clue tier.
			if (!_items[scrollID]) continue;
			const alreadyHasThisScroll = await this.hasItem(scrollID);
			if (alreadyHasThisScroll) {
				// If they already have this scroll in their bank, delete it from the loot.
				delete _items[scrollID];
			} else {
				// If they dont have it in their bank, reset the amount to 1 incase they got more than 1 of the clue.
				_items[scrollID] = 1;
			}
		}

		const items = {
			..._items
		};

		if (collectionLog) this.addItemsToCollectionLog(items);

		if (items[995]) {
			await this.addGP(items[995]);
			delete items[995];
		}

		this.log(`Had items added to bank - ${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.Bank,
			addBankToBank(items, {
				...this.settings.get(UserSettings.Bank)
			})
		);
	}

	public async removeItemFromBank(this: User, itemID: number, amountToRemove = 1) {
		await this.settings.sync(true);
		const bank = { ...this.settings.get(UserSettings.Bank) };
		if (typeof bank[itemID] === 'undefined' || bank[itemID] < amountToRemove) {
			this.client.emit(
				Events.Wtf,
				`${this.username}[${this.id}] [NEI] ${itemID} ${amountToRemove}`
			);

			throw `${this.username}[${this.id}] doesn't have enough of item[${itemID}] to remove ${amountToRemove}.`;
		}

		this.log(`had Quantity[${amountToRemove}] of ItemID[${itemID}] removed from bank.`);

		return this.settings.update(
			UserSettings.Bank,
			removeItemFromBank(bank, itemID, amountToRemove)
		);
	}

	public async addItemsToCollectionLog(this: User, items: Bank) {
		await this.settings.sync(true);
		this.log(`had following items added to collection log: [${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.CollectionLogBank,
			addBankToBank(items, {
				...this.settings.get(UserSettings.CollectionLogBank)
			})
		);
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

	public async hasItem(this: User, itemID: number, amount = 1, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' && bank[itemID] >= amount;
	}

	public async numberOfItemInBank(this: User, itemID: number, sync = true) {
		if (sync) await this.settings.sync(true);

		const bank = this.settings.get(UserSettings.Bank);
		return typeof bank[itemID] !== 'undefined' ? bank[itemID] : 0;
	}

	public skillLevel(this: User, skillName: SkillsEnum) {
		return convertXPtoLVL(this.settings.get(`skills.${skillName}`) as number);
	}

	public async addXP(this: User, skillName: SkillsEnum, amount: number) {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${skillName}`) as number;
		if (currentXP >= 200_000_000) return;

		const skill = Skills.find(skill => skill.id === skillName);
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
			this.client.emit(
				Events.ServerNotification,
				`${skill.emoji} **${this.username}'s** minion, ${
					this.minionName
				}, just achieved level 99 in ${toTitleCase(skillName)}!`
			);
		}

		return this.settings.update(`skills.${skillName}`, Math.floor(newXP));
	}

	public get badges(this: User) {
		const username = this.settings.get(UserSettings.RSN);
		if (!username) return '';
		return (this.client as KlasaClient)._badgeCache.get(username.toLowerCase()) || '';
	}

	public get minionIsBusy(this: User): boolean {
		return this.client.schedule.tasks
			.filter(activityTaskFilter)
			.some(task =>
				(task.data as TickerTaskData).subTasks.some(
					(subTask: ActivityTaskOptions) => subTask.userID === this.id
				)
			);
	}

	public get minionName(this: User): string {
		const name = this.settings.get(UserSettings.Minion.Name);
		const prefix = this.settings.get(UserSettings.Minion.Ironman) ? Emoji.Ironman : '';
		return name
			? `${prefix} ${Emoji.Minion} **${Util.escapeMarkdown(name)}**`
			: `${prefix} ${Emoji.Minion} Your minion`;
	}

	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	public get maxTripLength(this: User) {
		const perkTier = getUsersPerkTier(this);
		if (perkTier === PerkTier.Two) return Time.Minute * 33;
		if (perkTier === PerkTier.Three) return Time.Minute * 36;
		if (perkTier >= PerkTier.Four) return Time.Minute * 40;

		return Time.Minute * 30;
	}

	public get minionStatus(this: User) {
		const currentTask = getActivityOfUser(this.client, this);

		if (!currentTask) {
			return `${this.minionName} is currently doing nothing.

- Visit <https://www.oldschool.gg/oldschoolbot/minions> for extensive information on minions.
- Use \`+minion setname [name]\` to change your minions' name.
- You can assign ${this.minionName} to kill monsters for loot using \`+minion kill\`.
- Do clue scrolls with \`+minion clue easy\` (complete 1 easy clue)
- Train mining with \`+mine\`
- Train smithing with \`+smith\`
- Train woodcutting with \`+chop\`
- Train firemaking with \`+light\`
- Gain quest points with \`+quest\`
- Pat your minion with \`+minion pat\``;
		}

		const durationRemaining = currentTask.finishDate - Date.now();
		const formattedDuration =
			durationRemaining < 0 ? 'less than a minute' : formatDuration(durationRemaining);

		switch (currentTask.type) {
			case Activity.MonsterKilling: {
				const data = currentTask as MonsterActivityTaskOptions;
				const monster = killableMonsters.find(mon => mon.id === data.monsterID);

				return `${this.minionName} is currently killing ${data.quantity}x ${
					monster!.name
				}. Approximately ${formattedDuration} remaining.`;
			}

			case Activity.ClueCompletion: {
				const data = currentTask as ClueActivityTaskOptions;

				const clueTier = clueTiers.find(tier => tier.id === data.clueID);

				return `${this.minionName} is currently completing ${data.quantity}x ${
					clueTier!.name
				} clues. Approximately ${formattedDuration} remaining.`;
			}

			case Activity.Agility: {
				const data = currentTask as AgilityActivityTaskOptions;

				const course = Agility.Courses.find(course => course.name === data.courseID);

				return `${this.minionName} is currently running ${data.quantity}x ${
					course!.name
				} laps. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Agility
				} Agility level is ${this.skillLevel(SkillsEnum.Agility)}`;
			}

			case Activity.Fishing: {
				const data = currentTask as FishingActivityTaskOptions;

				const fish = Fishing.Fishes.find(fish => fish.id === data.fishID);

				return `${this.minionName} is currently fishing ${data.quantity}x ${
					fish!.name
				}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Fishing
				} Fishing level is ${this.skillLevel(SkillsEnum.Fishing)}`;
			}

			case Activity.Mining: {
				const data = currentTask as MiningActivityTaskOptions;

				const ore = Mining.Ores.find(ore => ore.id === data.oreID);

				return `${this.minionName} is currently mining ${data.quantity}x ${
					ore!.name
				}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Mining
				} Mining level is ${this.skillLevel(SkillsEnum.Mining)}`;
			}

			case Activity.Smithing: {
				const data = currentTask as SmithingActivityTaskOptions;

				const bar = Smithing.Bars.find(bar => bar.id === data.barID);

				return `${this.minionName} is currently smithing ${data.quantity}x ${
					bar!.name
				}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Smithing
				} Smithing level is ${this.skillLevel(SkillsEnum.Smithing)}`;
			}

			case Activity.Firemaking: {
				const data = currentTask as FiremakingActivityTaskOptions;

				const burn = Firemaking.Burnables.find(burn => burn.inputLogs === data.burnableID);

				return `${this.minionName} is currently lighting ${data.quantity}x ${
					burn!.name
				}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Firemaking
				} Firemaking level is ${this.skillLevel(SkillsEnum.Firemaking)}`;
			}

			case Activity.Questing: {
				return `${
					this.minionName
				} is currently Questing. Approximately ${formattedDuration} remaining. Your current Quest Point count is: ${this.settings.get(
					UserSettings.QP
				)}.`;
			}
			case Activity.Woodcutting: {
				const data = currentTask as WoodcuttingActivityTaskOptions;

				const log = Woodcutting.Logs.find(log => log.id === data.logID);

				return `${this.minionName} is currently chopping ${data.quantity}x ${
					log!.name
				}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Woodcutting
				} Woodcutting level is ${this.skillLevel(SkillsEnum.Woodcutting)}`;
			}
			case Activity.Runecraft: {
				const data = currentTask as RunecraftActivityTaskOptions;

				const rune = Runecraft.Runes.find(_rune => _rune.id === data.runeID);

				return `${this.minionName} is currently turning ${
					data.essenceQuantity
				}x Essence into ${rune!.name}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Runecraft
				} Runecraft level is ${this.skillLevel(SkillsEnum.Runecraft)}`;
			}
		}
	}

	public async incrementMinionDailyDuration(this: User, duration: number) {
		await this.settings.sync(true);

		const currentDuration = this.settings.get(UserSettings.Minion.DailyDuration);
		const newDuration = currentDuration + duration;
		if (newDuration > Time.Hour * 16) {
			const log = `[MOU] Minion has been active for ${formatDuration(newDuration)}.`;

			this.log(log);
			(this.client.channels.get(Channel.ErrorLogs) as TextChannel).send(
				`${this.sanitizedName} ${log}`
			);
		}

		return this.settings.update(UserSettings.Minion.DailyDuration, newDuration);
	}
}
