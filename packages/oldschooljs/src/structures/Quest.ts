import rawQuestData from '../data/quest_data.json';

interface QuestOptions {
	id: string;
	title: string;
	details: any;
	rewards?: any;
	qp: number;
	kudos: number;
	prerequisiteQuestIDs?: number[];
	skillReqs?: Record<string, number>;
}

const questData = rawQuestData as QuestOptions[];

const skillNames = [
	'attack',
	'defence',
	'strength',
	'hitpoints',
	'ranged',
	'prayer',
	'magic',
	'cooking',
	'woodcutting',
	'fletching',
	'fishing',
	'firemaking',
	'crafting',
	'smithing',
	'mining',
	'herblore',
	'agility',
	'thieving',
	'slayer',
	'farming',
	'runecraft',
	'hunter',
	'construction'
];

function parseXPReward(line: string): { skill: string; xp: number } | null {
	const match = line.match(/^([\d,]+(?:\.\d+)?)\s*([A-Za-z ]+)$/i);
	if (match) {
		const xp = Math.floor(Number(match[1].replace(/,/g, '')));
		const skill = (match[2] ?? '').trim().toLowerCase();
		if (skillNames.includes(skill)) {
			return { skill, xp };
		}
	}
	return null;
}

function capitalizeFirstWord(str: string): string {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function parseItemRecord(entries: string[]): Record<string, number> {
	const result: Record<string, number> = {};
	for (const entry of entries) {
		const match = entry.match(/^~?([\d,]+)(?:-\d+)?\+?\s+(.+)$/);
		let quantity = 1;
		let itemName = entry;
		if (match) {
			quantity = Number(match[1].replace(/,/g, ''));
			itemName = match[2];
		}
		if (itemName.includes('|')) {
			itemName = itemName.split('|')[0].trim();
		}
		const parenIndex = itemName.indexOf('(');
		if (parenIndex !== -1 && !itemName.toLowerCase().includes('(unf')) {
			itemName = itemName.slice(0, parenIndex).trim();
		}
		itemName = itemName.split("''")[0].split(' or ')[0].split(' OR ')[0].trim();
		itemName = itemName.replace(/[.,:]$/, '').trim();
		itemName = capitalizeFirstWord(itemName);
		result[itemName] = (result[itemName] ?? 0) + quantity;
	}
	return result;
}

export class Quest {
	public id: number;
	public name: string;
	public details: any;
	public qp?: number;
	public prerequisiteQuests?: string[];
	public skillReqs?: Record<string, number>;
	public itemsRequired?: Record<string, number>;
	public itemRewards?: Record<string, number>;
	public skillsRewards?: Record<string, number>;
	public qpReq?: number;
	public kudos?: number;
	public kudosReq?: number;

	constructor(options: QuestOptions) {
		this.id = Number(options.id);
		this.name = options.title;
		this.details = options.details;
		this.qp = options.qp;
		this.kudos = options.kudos;
		this.prerequisiteQuests = options.details?.requirements?.quests;
		this.qpReq = options.details?.requirements?.qp;
		this.kudosReq = options.details?.requirements?.kudos;

		// Parse skill requirements from details.requirements.skills
		this.skillReqs = undefined;
		const skillArr: string[] | undefined = options.details?.requirements?.skills;
		if (skillArr && skillArr.length > 0) {
			const skillReqs: Record<string, number> = {};
			for (const skillLine of skillArr) {
				const match = skillLine.match(/^(\d+)\s+([a-zA-Z ]+)$/);
				if (match) {
					const level = Number(match[1]);
					const skill = match[2].trim().toLowerCase();
					skillReqs[skill] = level;
				}
			}
			this.skillReqs = Object.keys(skillReqs).length > 0 ? skillReqs : undefined;
		}

		// Items Required
		const items: string[] | undefined = this.details?.items;
		if (items) {
			this.itemsRequired = parseItemRecord(items);
		} else {
			this.itemsRequired = undefined;
		}

		// Item Rewards & Skill Rewards
		this.itemRewards = undefined;
		this.skillsRewards = undefined;
		const rewards: string[] | undefined = options.rewards;
		if (rewards) {
			const itemRewardEntries: string[] = [];
			const skillsRewards: Record<string, number> = {};
			for (const entry of rewards) {
				if (/ability to/i.test(entry)) continue;
				if (/nightmare zone/i.test(entry)) continue;
				if (/agility shortcut/i.test(entry)) continue;
				const xp = parseXPReward(entry);
				if (xp) {
					skillsRewards[xp.skill as string] = xp.xp;
					continue;
				}
				itemRewardEntries.push(entry);
			}
			this.itemRewards = itemRewardEntries.length > 0 ? parseItemRecord(itemRewardEntries) : undefined;
			this.skillsRewards = Object.keys(skillsRewards).length > 0 ? skillsRewards : undefined;
		}
	}

	static fromID(id: string): Quest | null {
		const data = questData.find(q => q.id === id);
		return data ? new Quest(data) : null;
	}

	static fromTitle(title: string): Quest | null {
		const data = questData.find(q => q.title.toLowerCase() === title.toLowerCase());
		return data ? new Quest(data) : null;
	}
}

export const Quests = questData.map(q => new Quest(q));
