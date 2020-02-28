import { Extendable, KlasaClient, ExtendableStore } from 'klasa';
import { User, Util, TextChannel } from 'discord.js';

import { Events, Activity, Emoji, Channel, Time } from '../lib/constants';
import { Bank, SkillsEnum } from '../lib/types';
import {
	addBankToBank,
	removeItemFromBank,
	addItemToBank,
	activityTaskFilter,
	formatDuration,
	convertXPtoLVL
} from '../lib/util';
import clueTiers from '../lib/clueTiers';
import killableMonsters from '../lib/killableMonsters';
import Mining from '../lib/skills/mining';
import { UserSettings } from '../lib/UserSettings';
import {
	MonsterActivityTaskOptions,
	ClueActivityTaskOptions,
	MiningActivityTaskOptions,
	TickerTaskData,
	MinionActivityTaskData
} from '../lib/types/minions';
import getActivityOfUser from '../lib/util/getActivityOfUser';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	get sanitizedName(this: User) {
		return `(${this.username.replace(/[()]/g, '')})[${this.id}]`;
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

	public skillLevel(this: User, skillName: SkillsEnum) {
		return convertXPtoLVL(this.settings.get(`skills.${skillName}`) as number);
	}

	public async addXP(this: User, skillName: SkillsEnum, amount: number) {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${skillName}`) as number;
		if (currentXP >= 200_000_000) return;
		const newXP = Math.min(200_000_000, currentXP + amount);
		return this.settings.update(`skills.${skillName}`, newXP);
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
					(subTask: MinionActivityTaskData) => subTask.userID === this.id
				)
			);
	}

	public get minionName(this: User): string {
		const name = this.settings.get(UserSettings.Minion.Name);
		return name
			? `${Emoji.Minion} **${Util.escapeMarkdown(name)}**`
			: `${Emoji.Minion} Your minion`;
	}

	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	public get minionStatus(this: User) {
		const currentTask = getActivityOfUser(this.client, this);

		if (!currentTask) {
			return `${this.minionName} is currently doing nothing.

- Use \`+minion setname [name]\` to change your minions' name.
- You can assign ${this.minionName} to kill monsters for loot using \`+minion kill\`.
- Do clue scrolls with \`+minion clue 1 easy\` (complete 1 easy clue)
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

			case Activity.Mining: {
				const data = currentTask as MiningActivityTaskOptions;

				const ore = Mining.Ores.find(ore => ore.id === data.oreID);

				return `${this.minionName} is currently mining ${data.quantity}x ${
					ore!.name
				}. Approximately ${formattedDuration} remaining. Your ${
					Emoji.Mining
				} Mining level is ${this.skillLevel(SkillsEnum.Mining)}`;
			}
		}
	}

	public async incrementMinionDailyDuration(this: User, duration: number) {
		await this.settings.sync(true);

		const currentDuration = this.settings.get(UserSettings.Minion.DailyDuration);
		const newDuration = currentDuration + duration;
		if (newDuration > Time.Hour * 17) {
			const log = `[MOU] Minion has been active for ${formatDuration(newDuration)}.`;

			this.log(log);
			(this.client.channels.get(Channel.ErrorLogs) as TextChannel).send(
				`${this.sanitizedName} ${log}`
			);
		}

		return this.settings.update(UserSettings.Minion.DailyDuration, newDuration);
	}
}
