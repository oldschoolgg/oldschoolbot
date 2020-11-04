import { User, Util } from 'discord.js';
import { Extendable, ExtendableStore, KlasaClient } from 'klasa';

import { Emoji, Events, MAX_QP, PerkTier, Time } from '../lib/constants';
import { UserSettings } from '../lib/settings/types/UserSettings';
import Skills from '../lib/skilling/skills';
import { SkillsEnum } from '../lib/skilling/types';
import {
	addBanks,
	addItemToBank,
	convertXPtoLVL,
	itemID,
	removeItemFromBank,
	toTitleCase
} from '../lib/util';
import { formatOrdinal } from '../lib/util/formatOrdinal';
import getActivityOfUser from '../lib/util/getActivityOfUser';
import getUsersPerkTier from '../lib/util/getUsersPerkTier';
import { ItemBank } from './../lib/types/index';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [User] });
	}

	// @ts-ignore 2784
	get sanitizedName(this: User) {
		return `(${this.username.replace(/[()]/g, '')})[${this.id}]`;
	}

	// @ts-ignore 2784
	get isBusy(this: User) {
		const client = this.client as KlasaClient;
		return (
			client.oneCommandAtATimeCache.has(this.id) || client.secondaryUserBusyCache.has(this.id)
		);
	}

	// @ts-ignore 2784
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

	public async addItemsToBank(this: User, _items: ItemBank, collectionLog = false) {
		await this.settings.sync(true);

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
			addBanks([
				items,
				{
					...this.settings.get(UserSettings.Bank)
				}
			])
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

	public async addItemsToCollectionLog(this: User, items: ItemBank) {
		await this.settings.sync(true);
		this.log(`had following items added to collection log: [${JSON.stringify(items)}`);

		return this.settings.update(
			UserSettings.CollectionLogBank,
			addBanks([
				items,
				{
					...this.settings.get(UserSettings.CollectionLogBank)
				}
			])
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

	public async incrementMinigameScore(this: User, minigameID: number, amountToAdd = 1) {
		await this.settings.sync(true);
		const currentMinigameScores = this.settings.get(UserSettings.MinigameScores);

		this.log(`had Quantity[${amountToAdd}] Score added to Minigame[${minigameID}]`);

		return this.settings.update(
			UserSettings.MinigameScores,
			addItemToBank(currentMinigameScores, minigameID, amountToAdd)
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

	public totalLevel(this: User, returnXP = false) {
		const userXPs = Object.values(
			// @ts-ignore
			this.settings.get('skills').toJSON() as Skills
		) as number[];
		let totalLevel = 0;
		for (const xp of userXPs) {
			totalLevel += returnXP ? xp : convertXPtoLVL(xp);
		}
		return totalLevel;
	}

	public async addXP(this: User, skillName: SkillsEnum, amount: number) {
		await this.settings.sync(true);
		const currentXP = this.settings.get(`skills.${skillName}`) as number;

		const skill = Object.values(Skills).find(skill => skill.id === skillName);
		if (!skill) return;

		const newXP = currentXP + amount * 5;

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

	// @ts-ignore 2784
	public get badges(this: User) {
		const username = this.settings.get(UserSettings.RSN);
		if (!username) return '';
		return (this.client as KlasaClient)._badgeCache.get(username.toLowerCase()) || '';
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

	// @ts-ignore 2784
	public get hasMinion(this: User) {
		return this.settings.get(UserSettings.Minion.HasBought);
	}

	// @ts-ignore 2784
	public get maxTripLength(this: User) {
		let timeMultiplier = 1;
		if (this.equippedPet() === itemID('Zak')) {
			timeMultiplier = 1.4;
		}

		const perkTier = getUsersPerkTier(this);
		if (perkTier === PerkTier.Two) return Time.Minute * 33 * timeMultiplier;
		if (perkTier === PerkTier.Three) return Time.Minute * 36 * timeMultiplier;
		if (perkTier >= PerkTier.Four) return Time.Minute * 40 * timeMultiplier;

		return Time.Minute * 30 * timeMultiplier;
	}

	// @ts-ignore
	// eslint-disable-next-line
	public async incrementMinionDailyDuration(this: User, duration: number) {}
}
