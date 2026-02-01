import type { IMaterialBank } from '@/lib/bso/skills/invention/index.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';

import { escapeMarkdown, userMention } from '@oldschoolgg/discord';
import { defaultGearSetup, type GearSetup } from '@oldschoolgg/gear';
import { type ECombatOption, type IBlowpipeData, ZBlowpipeData } from '@oldschoolgg/schemas';
import { cleanUsername, Emoji, sumArr, Time } from '@oldschoolgg/toolkit';
import { Bank, convertXPtoLVL, type Item, type ItemBank, Items, resolveItems } from 'oldschooljs';
import { clone } from 'remeda';

import type { User, xp_gains_skill_enum } from '@/prisma/main.js';
import { modifyUserBusy } from '@/lib/cache.js';
import type { IconPackID } from '@/lib/canvas/iconPacks.js';
import { type CATier, CombatAchievements } from '@/lib/combat_achievements/combatAchievements.js';
import { BitField, globalConfig, MAX_LEVEL } from '@/lib/constants.js';
import { allPetIDs } from '@/lib/data/CollectionsExport.js';
import { degradeableItems } from '@/lib/degradeableItems.js';
import type { UserFullGearSetup } from '@/lib/gear/types.js';
import type { AttackStyles } from '@/lib/minions/functions/index.js';
import type { BankSortMethod } from '@/lib/sorts.js';
import { ChargeBank } from '@/lib/structures/Bank.js';
import { Gear } from '@/lib/structures/Gear.js';
import { GearBank } from '@/lib/structures/GearBank.js';
import type { SkillRequirements, Skills } from '@/lib/types/index.js';
import { makeBadgeString } from '@/lib/util/makeBadgeString.js';
import { timePerAlch, timePerAlchAgility } from '@/mahoji/lib/abstracted_commands/alchCommand.js';

const USER_DEFAULTS = {
	slayer_unlocks: [],
	slayer_blocked_ids: [],
	badges: [],
	bitfield: [],
	temp_cl: {},
	favoriteItems: [],
	favorite_alchables: [],
	favorite_food: [],
	favorite_bh_seeds: [],
	attack_style: [],
	combat_options: [],
	slayer_autoslay_options: [],
	completed_ca_task_ids: [],
	store_bitfield: [],
	cl_array: [],
	completed_achievement_diaries: [],
	finished_quest_ids: [],
	monkeys_fought: [],
	unlocked_gear_templates: [],
	unlocked_blueprints: [],
	disabled_inventions: [],
	disabled_portent_ids: []
} satisfies Partial<User>;

function alchPrice(bank: Bank, item: Item, tripLength: number, agility?: boolean) {
	const maxCasts = Math.min(
		Math.floor(tripLength / (agility ? timePerAlchAgility : timePerAlch)),
		bank.amount(item.id)
	);
	return maxCasts * (item.highalch ?? 0);
}

export class BaseUser {
	user!: Readonly<User>;
	id: string;

	skillsAsXP!: Required<Skills>;
	skillsAsLevels!: Required<Skills>;
	badgesString!: string;
	bitfield!: readonly BitField[];
	iconPackId!: IconPackID | null;

	private _bankLazy: Bank | null = null;
	private _clLazy: Bank | null = null;
	private _gearLazy: UserFullGearSetup | null = null;

	paintedItems!: Map<number, number>;

	constructor(user: User) {
		this.id = user.id;
		this._updateRawUser(user);
	}

	public get gearBank() {
		return new GearBank({
			gear: this.gear,
			bank: this.bank,
			chargeBank: this.ownedChargeBank(),
			skillsAsXP: this.skillsAsXP,
			minionName: this.minionName,

			materials: this.ownedMaterials(),
			pet: this.user.minion_equippedPet
		});
	}

	public get bank(): Bank {
		if (this._bankLazy) return this._bankLazy;
		this._bankLazy = new Bank(this.user.bank as ItemBank);
		this._bankLazy.freeze();
		return this._bankLazy;
	}

	public get cl(): Bank {
		if (this._clLazy) return this._clLazy;
		this._clLazy = new Bank(this.user.collectionLogBank as ItemBank);
		this._clLazy.freeze();
		return this._clLazy;
	}

	public get gear(): UserFullGearSetup {
		if (this._gearLazy) return this._gearLazy;
		this._gearLazy = {
			melee: new Gear((this.user.gear_melee as GearSetup | null) ?? { ...defaultGearSetup }),
			mage: new Gear((this.user.gear_mage as GearSetup | null) ?? { ...defaultGearSetup }),
			range: new Gear((this.user.gear_range as GearSetup | null) ?? { ...defaultGearSetup }),
			misc: new Gear((this.user.gear_misc as GearSetup | null) ?? { ...defaultGearSetup }),
			skilling: new Gear((this.user.gear_skilling as GearSetup | null) ?? { ...defaultGearSetup }),
			wildy: new Gear((this.user.gear_wildy as GearSetup | null) ?? { ...defaultGearSetup }),
			fashion: new Gear((this.user.gear_fashion as GearSetup | null) ?? { ...defaultGearSetup }),
			other: new Gear((this.user.gear_other as GearSetup | null) ?? { ...defaultGearSetup })
		};
		return this._gearLazy;
	}

	public get bankWithGP(): Bank {
		return new Bank(this.user.bank as ItemBank).add('Coins', this.GP).freeze();
	}

	public updateProperties() {
		this._bankLazy = null;
		this._clLazy = null;
		this._gearLazy = null;
		this.skillsAsXP = this.getSkills(false);
		this.skillsAsLevels = this.getSkills(true);

		this.paintedItems = new Map((this.user.painted_items_tuple as [number, number][]) ?? []);
		this.badgesString = makeBadgeString(this.user.badges, this.isIronman);

		this.bitfield = this.user.bitfield as readonly BitField[];
		this.iconPackId = (this.user.icon_pack_id as IconPackID) ?? null;
	}

	get combatLevel() {
		const { defence, ranged, hitpoints, magic, prayer, attack, strength } = this.skillsAsLevels;

		const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
		const melee = 0.325 * (attack + strength);
		const range = 0.325 * (Math.floor(ranged / 2) + ranged);
		const mage = 0.325 * (Math.floor(magic / 2) + magic);
		return Math.floor(base + Math.max(melee, range, mage));
	}

	get skillsAsRequirements(): Required<SkillRequirements> {
		return { ...this.skillsAsLevels, combat: this.combatLevel };
	}

	favAlchs(duration: number, agility?: boolean) {
		const { bank } = this;
		return this.user.favorite_alchables
			.filter(id => bank.has(id))
			.map(id => Items.getItem(id))
			.filter(i => i !== null && i?.highalch !== undefined && i.highalch > 0 && i.tradeable)
			.sort((a, b) => alchPrice(bank, b!, duration, agility) - alchPrice(bank, a!, duration, agility)) as Item[];
	}

	async getIsLocked(): Promise<boolean> {
		const lockStatus = await Cache.getUserLockStatus(this.id);
		return lockStatus === 'locked';
	}

	get totalLevel() {
		return sumArr(Object.values(this.skillsAsLevels));
	}

	get bankSortMethod() {
		return this.user.bank_sort_method as BankSortMethod | null;
	}

	get combatOptions() {
		return this.user.combat_options as readonly ECombatOption[];
	}

	get isIronman() {
		return this.user.minion_ironman;
	}

	get GP() {
		return Number(this.user.GP);
	}

	skillLevel(skill: xp_gains_skill_enum) {
		return this.skillsAsLevels[skill];
	}

	get minionName() {
		const prefix = this.isIronman ? Emoji.Ironman : '';
		const icon = this.user.minion_icon ?? Emoji.Minion;

		const strPrefix = prefix ? `${prefix} ` : '';

		return this.user.minion_name
			? `${strPrefix}${icon} **${escapeMarkdown(this.user.minion_name)}**`
			: `${strPrefix}${icon} Your minion`;
	}

	get mention() {
		return userMention(this.id);
	}

	get username() {
		return cleanUsername(this.user.username ?? 'Unknown');
	}

	get usernameOrMention() {
		return this.username;
	}

	get badgedUsername() {
		return `${this.badgesString} ${this.usernameOrMention}`.trim();
	}

	toString() {
		return this.mention;
	}

	get QP() {
		return this.user.QP;
	}

	get autoFarmFilter() {
		return this.user.auto_farm_filter;
	}

	attackClass(): 'range' | 'mage' | 'melee' {
		const styles = this.getAttackStyles();
		if (styles.includes('ranged')) return 'range';
		if (styles.includes('magic')) return 'mage';
		return 'melee';
	}

	getAttackStyles(): AttackStyles[] {
		const styles = this.user.attack_style;
		if (styles.length === 0) {
			return ['attack', 'strength', 'defence'];
		}
		return styles as AttackStyles[];
	}

	public _updateRawUser(rawUser: User) {
		this.user = { ...USER_DEFAULTS, ...rawUser };
		this.updateProperties();
	}

	hasEquipped(_item: number | string | string[] | number[], every = false) {
		const items = resolveItems(_item);
		if (items.length === 1 && allPetIDs.includes(items[0])) {
			const pet = this.user.minion_equippedPet;
			return pet === items[0];
		}

		for (const gear of Object.values(this.gear)) {
			if (gear.hasEquipped(items, every)) {
				return true;
			}
		}
		return false;
	}

	public get allItemsOwned(): Bank {
		const bank = this.bank.clone();

		bank.add('Coins', Number(this.user.GP));
		if (this.user.minion_equippedPet) {
			bank.add(this.user.minion_equippedPet);
		}

		for (const setup of Object.values(this.gear)) {
			bank.add(setup.toBank());
		}

		return bank;
	}

	getSkills(levels: boolean) {
		const skills: Required<Skills> = {
			agility: Number(this.user.skills_agility),
			cooking: Number(this.user.skills_cooking),
			fishing: Number(this.user.skills_fishing),
			mining: Number(this.user.skills_mining),
			smithing: Number(this.user.skills_smithing),
			woodcutting: Number(this.user.skills_woodcutting),
			firemaking: Number(this.user.skills_firemaking),
			runecraft: Number(this.user.skills_runecraft),
			crafting: Number(this.user.skills_crafting),
			prayer: Number(this.user.skills_prayer),
			fletching: Number(this.user.skills_fletching),
			farming: Number(this.user.skills_farming),
			herblore: Number(this.user.skills_herblore),
			thieving: Number(this.user.skills_thieving),
			hunter: Number(this.user.skills_hunter),
			construction: Number(this.user.skills_construction),
			magic: Number(this.user.skills_magic),
			attack: Number(this.user.skills_attack),
			strength: Number(this.user.skills_strength),
			defence: Number(this.user.skills_defence),
			ranged: Number(this.user.skills_ranged),
			hitpoints: Number(this.user.skills_hitpoints),
			slayer: Number(this.user.skills_slayer),

			dungeoneering: Number(this.user.skills_dungeoneering),
			invention: Number(this.user.skills_invention),
			divination: Number(this.user.skills_divination)
		};
		if (levels) {
			for (const [key, val] of Object.entries(skills) as [keyof Skills, number][]) {
				skills[key] = convertXPtoLVL(val, MAX_LEVEL);
			}
		}
		return skills;
	}

	getBlowpipe(): IBlowpipeData {
		return clone(ZBlowpipeData.parse(this.user.blowpipe));
	}

	allEquippedGearBank() {
		const bank = new Bank();
		for (const gear of Object.values(this.gear).flat()) {
			bank.add(gear.allItemsBank());
		}
		return bank;
	}

	async sync() {
		const newUser = await prisma.user.findUnique({ where: { id: this.id } });
		if (!newUser) throw new Error(`Failed to sync user ${this.id}, no record was found`);
		this._updateRawUser(newUser);
	}

	get logName() {
		return `${this.username}[${this.id}]`;
	}

	get hasMinion() {
		return Boolean(this.user.minion_hasBought);
	}

	ownedChargeBank() {
		const chargeBank = new ChargeBank();
		for (const degradeableItem of degradeableItems) {
			const charges = this.user[degradeableItem.settingsKey];
			if (charges) {
				chargeBank.add(degradeableItem.settingsKey, charges);
			}
		}
		return chargeBank;
	}

	caPoints(): number {
		const keys = Object.keys(CombatAchievements) as CATier[];
		return keys
			.map(
				t =>
					CombatAchievements[t].tasks.filter(task => this.user.completed_ca_task_ids.includes(task.id))
						.length * CombatAchievements[t].taskPoints
			)
			.reduce((total, value) => total + value, 0);
	}

	modifyBusy(type: 'lock' | 'unlock', reason: string): void {
		modifyUserBusy({ type, reason, userID: this.id });
	}

	isMod(): boolean {
		return this.bitfield.includes(BitField.isModerator);
	}

	isAdmin(): boolean {
		return globalConfig.adminUserIDs.includes(this.id);
	}

	isModOrAdmin(): boolean {
		return this.isAdmin() || this.isMod();
	}

	/**
	 * BSO Only
	 */

	ownedMaterials() {
		const materialsOwnedBank = new MaterialBank(this.user.materials_owned as IMaterialBank);
		return materialsOwnedBank;
	}

	accountAgeInDays(): null | number {
		const createdAt = this.user.minion_bought_date;
		if (!createdAt) return null;
		return (Date.now() - createdAt.getTime()) / Time.Day;
	}
}
