import { writeFileSync } from 'node:fs';
import wtf from 'wtf_wikipedia';

const QUEST_CATEGORY = 'Category:Quests';
const WIKI_API = 'https://oldschool.runescape.wiki/api.php';

async function fetchQuestList(): Promise<string[]> {
	const url = `${WIKI_API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(
		QUEST_CATEGORY
	)}&cmlimit=500&format=json`;
	const res = await fetch(url);
	const data = await res.json();
	return data.query.categorymembers.map((m: any) => m.title);
}

async function fetchQuestDetailsSection(title: string) {
	const url = `https://oldschool.runescape.wiki/api.php?action=parse&page=${encodeURIComponent(
		title
	)}&prop=wikitext&format=json`;
	const res = await fetch(url);
	const text = await res.text();

	if (text.trim().startsWith('<')) {
		console.error(`HTML error for quest: ${title}`);
		return null;
	}

	let data: { parse: { wikitext: { [x: string]: any } } };
	try {
		data = JSON.parse(text);
	} catch {
		console.error(`JSON parse error for quest: ${title}`);
		return null;
	}
	const wikitext = data.parse?.wikitext?.['*'];
	if (!wikitext) {
		console.error(`No wikitext found for quest: ${title}`);
		return null;
	}

	const doc = wtf(wikitext);
	const sections = doc.sections();
	const detailsSection =
		sections.find(s => s.title()?.toLowerCase().includes('detail')) ||
		sections.find(s => s.title()?.toLowerCase().includes('requirement'));

	let details: any = null;

	if (detailsSection) {
		const tables = detailsSection.tables();
		if (tables.length > 0) {
			details = tables[0].json();
		} else {
			details = detailsSection.text();
		}
	}

	if (!details || typeof details === 'string') {
		const detailsTemplate = extractQuestDetailsTemplate(wikitext);
		if (detailsTemplate) {
			details = parseTemplateFields(detailsTemplate);
			if (details.requirements) {
				details.requirements = parseRequirementsField(details.requirements);
			}
		} else {
			console.error(`No quest details template found for ${title}`);
			return null;
		}
	}

	if (details.skills && typeof details.skills === 'string' && details.requirements) {
		details.requirements.skills = [
			...details.requirements.skills,
			...details.skills
				.split('\n')
				.map(s => s.trim())
				.filter(Boolean)
		];
	}

	if (details.items && typeof details.items === 'string') {
		const lines = details.items.split('\n');
		const items: string[] = [];
		let currentItem = '';

		for (const line of lines) {
			const trimmed = line.replace(/<br\s*\/?>/gi, '').trim();
			if (!trimmed || trimmed.toLowerCase() === 'none') continue;

			if (/^\*\*/.test(trimmed)) {
				if (currentItem) {
					currentItem += ` ${trimmed
						.replace(/^\*\*/, '')
						.replace(/\[\[|\]\]/g, '')
						.trim()}`;
				}
			} else if (/^\*/.test(trimmed)) {
				if (currentItem) items.push(currentItem);
				currentItem = trimmed
					.replace(/^\*/, '')
					.replace(/\[\[|\]\]/g, '')
					.trim();
			} else {
				if (currentItem) {
					items.push(currentItem);
					currentItem = '';
				}
			}
		}
		if (currentItem) items.push(currentItem);

		details.items = items;
	}

	if (details.kills && typeof details.kills === 'string') {
		const lines = details.kills.split('\n');
		const kills: string[] = [];
		for (const line of lines) {
			const trimmed = line.replace(/<br\s*\/?>/gi, '').trim();
			if (!trimmed || trimmed.toLowerCase() === 'none') continue;
			if (/^\*/.test(trimmed)) {
				const match = trimmed.match(/\[\[([^\]|#]+).*?\]\]/);
				if (match) {
					kills.push(match[1].trim());
				} else {
					kills.push(trimmed.replace(/^\*/, '').split('(')[0].trim());
				}
			}
		}
		details.kills = kills;
	}

	// Extract rewards from the full wikitext
	const rewardsResult = extractRewardsFromWikitext(wikitext);

	// Extract qp from |qp= in the rewards template
	let qp: number | undefined = undefined;
	const qpMatch = wikitext.match(/\|qp\s*=\s*([0-9]+)/i);
	if (qpMatch) {
		qp = Number(qpMatch[1]);
	}

	// Remove only unwanted meta fields, but keep length and difficulty
	details.start = undefined;
	details.startmap = undefined;
	details.description = undefined;
	details.recommended = undefined;
	details.ironman = undefined;
	details.leagueRegion = undefined;

	// Final check for empty or invalid details
	if (!details || typeof details !== 'object' || Array.isArray(details)) {
		console.error(`No valid details for quest: ${title}`);
		return null;
	}

	return {
		title,
		details,
		rewards: rewardsResult && rewardsResult.rewards.length > 0 ? rewardsResult.rewards : undefined,
		qp,
		kudos: rewardsResult ? rewardsResult.kudos : undefined
	};
}

function extractQuestDetailsTemplate(wikitext: string): string | null {
	const startIdx = wikitext.indexOf('{{Quest details');
	if (startIdx === -1) {
		return null;
	}
	let braceCount = 2;
	let i = startIdx + 2;
	while (i < wikitext.length) {
		if (wikitext[i] === '{' && wikitext[i + 1] === '{') {
			braceCount += 2;
			i++;
		} else if (wikitext[i] === '}' && wikitext[i + 1] === '}') {
			braceCount -= 2;
			i++;
			if (braceCount === 0) {
				const template = wikitext.slice(startIdx, i + 1);
				return template;
			}
		}
		i++;
	}
	console.log('Failed to extract full quest details template.');
	return null;
}

function parseTemplateFields(template: string): Record<string, string> {
	const lines = template.split('\n').slice(1, -1);
	const result: Record<string, string> = {};
	let currentKey: string | null = null;
	let currentValue: string[] = [];
	for (const line of lines) {
		const match = line.match(/^\|\s*([^=]+?)\s*=\s*(.*)$/);
		if (match) {
			if (currentKey) {
				result[currentKey] = currentValue.join('\n').trim();
			}
			currentKey = match[1].trim();
			currentValue = [match[2].trim()];
		} else if (currentKey) {
			currentValue.push(line.trim());
		}
	}
	if (currentKey) {
		result[currentKey] = currentValue.join('\n').trim();
	}
	return result;
}

function parseRequirementsField(req: string): { quests: string[]; skills: string[]; other: string[] } {
	const quests: string[] = [];
	const skills: string[] = [];
	const other: string[] = [];
	let inQuestBlock = false;

	const lines = req.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const clean = line.replace(/\[\[|\]\]/g, '').trim();

		if (!clean) continue;

		if (/^(-|\*)\s*either:/i.test(line)) {
			let j = i + 1;
			while (j < lines.length) {
				const subLine = lines[j];
				const subClean = subLine
					.replace(/\[\[|\]\]/g, '')
					.replace(/^\*+|-/, '')
					.trim();
				if (/^(\*{2,}|-)/.test(subLine)) {
					if (subClean) {
						other.push(subClean);
					}
					break;
				}
				if (!/^(\*{2,}|-)/.test(subLine)) break;
				j++;
			}
			continue;
		}

		if (/the following quest(s)?/i.test(clean)) {
			inQuestBlock = true;
			continue;
		}
		const singleQuestMatch = clean.match(/(?:completion of|completed)\s+(.+)/i);
		if (singleQuestMatch) {
			quests.push(singleQuestMatch[1].trim().toLowerCase());
			continue;
		}
		if (inQuestBlock && /^\*[^\*]/.test(line)) {
			inQuestBlock = false;
		}

		if (inQuestBlock && /^\*\*/.test(line)) {
			quests.push(
				clean
					.replace(/^[\*\-]+/, '')
					.replace(/''/g, '')
					.replace(/\[\[|\]\]/g, '')
					.trim()
					.toLowerCase()
			);
			continue;
		}

		if (!inQuestBlock && /^\*/.test(line)) {
			const scpMatches = [...clean.matchAll(/\{\{SCP\|([A-Za-z ]+)\|(\d+)/gi)];
			if (scpMatches.length > 0) {
				for (const m of scpMatches) {
					skills.push(`${m[2]} ${m[1].toLowerCase()}`);
				}
				continue;
			}
			const skillMatch = clean.match(/^(\d+)\s+([A-Za-z ]+)$/);
			if (skillMatch) {
				skills.push(`${skillMatch[1]} ${skillMatch[2].toLowerCase()}`);
				continue;
			}
			other.push(clean.replace(/^\*/, '').trim());
		}
	}
	return { quests, skills, other };
}

function removeEmpty(obj: any): any {
	if (Array.isArray(obj)) {
		const arr = obj
			.map(removeEmpty)
			.filter(
				v =>
					v !== undefined &&
					v !== null &&
					!(Array.isArray(v) && v.length === 0) &&
					!(typeof v === 'object' && Object.keys(v).length === 0)
			);
		return arr.length > 0 ? arr : undefined;
	} else if (typeof obj === 'object' && obj !== null) {
		const out: any = {};
		for (const [k, v] of Object.entries(obj)) {
			if (k === 'id') {
				out[k] = v;
				continue;
			}
			const cleaned = removeEmpty(v);
			if (
				cleaned !== undefined &&
				cleaned !== null &&
				!(Array.isArray(cleaned) && cleaned.length === 0) &&
				!(typeof cleaned === 'object' && Object.keys(cleaned).length === 0) &&
				cleaned !== ''
			) {
				out[k] = cleaned;
			}
		}
		return Object.keys(out).length > 0 ? out : undefined;
	}
	return obj;
}

function stripWikiTemplates(str: string): string {
	return str
		.replace(/\{\{[^}]+\}\}/g, '')
		.replace(/\s{2,}/g, ' ')
		.trim();
}

function dedupe<T>(arr: T[]): T[] {
	return Array.from(new Set(arr));
}

function filterKills(arr: string[]): string[] {
	return arr.filter(
		s =>
			s &&
			!/^you will/i.test(s) &&
			!/^summoned by/i.test(s) &&
			!/^'''/i.test(s) &&
			!/'''/.test(s) &&
			!/greegree|obtain|tank|throughout|to obtain|see below|see note|see tips|see strategy|note:|^$|^–|^or /i.test(
				s
			)
	);
}

function expandSCP(line: string): string {
	return line.replace(/\{\{SCP\|([A-Za-z ]+)\|([\d,]+(?:\.\d+)?)((?:\|[^}]*)?)\}\}/g, (_, skill, amount) => {
		const num = Number.parseFloat(amount.replace(/,/g, ''));
		const formatted =
			num % 1 === 0
				? num.toLocaleString()
				: num.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
		return `${formatted} ${skill} experience`;
	});
}

function extractRewardsFromWikitext(wikitext: string): { rewards: string[]; kudos?: number } | null {
	const match = wikitext.match(/==\s*Rewards?\s*==([\s\S]*?)(\n==|$)/i);
	if (!match) return null;
	const section = match[1];

	const qpReward: string | null = null;
	let qp: number | undefined = undefined;
	const qpMatch = section.match(/\|qp\s*=\s*([0-9]+)/i);
	if (qpMatch) {
		qp = Number(qpMatch[1]);
	}

	const rewardsFieldMatch = section.match(/\|rewards\s*=\s*([\s\S]*?)(\n\||\n\}\}|$)/i);
	let lines: string[];
	if (rewardsFieldMatch) {
		lines = rewardsFieldMatch[1]
			.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0 && line !== '}}');
	} else {
		lines = section
			.split('\n')
			.map(line => line.trim())
			.filter(line => line.length > 0 && line !== '}}');
	}

	const rewards: string[] = [];
	let skipSubBullets = false;
	for (const line of lines) {
		const trimmed = line.trim();
		if (/access to/i.test(trimmed)) {
			skipSubBullets = true;
			continue;
		}
		if (/lamp/i.test(trimmed) && !/kudos/i.test(trimmed)) {
			skipSubBullets = true;
			continue;
		}
		if (skipSubBullets && /^(\*{2,}|-)/.test(trimmed)) {
			continue;
		}
		if (!/^(\*{2,}|-)/.test(trimmed)) {
			skipSubBullets = false;
		}
		rewards.push(trimmed);
	}

	const cleanedRewards = rewards
		.map(line => expandSCP(line))
		.map(line => line.replace(/^Optional;\s*/i, ''))
		.map(line => line.replace(/^An additional\s*/i, ''))
		.map(line => line.replace(/\b(?:experience|exp|XP)\b/gi, ''))
		.map(line => line.replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, a, b) => b || a))
		.map(line => line.replace(/\{\{plink\|([^\}|]+)(?:\|[^\}]+)?\}\}/gi, '$1'))
		.map(line => line.replace(/\{\{.*?\}\}/g, '').trim())
		.map(line =>
			line
				.replace(/^\*+/, '')
				.replace(/\}\}+$/, '')
				.trim()
		)
		.map(line => line.replace(/&nbsp;|&amp;|&quot;|&#39;|&lt;|&gt;/g, ' '))
		.map(line => line.replace(/\b(\w+)(?:\s+\1\b)+/gi, '$1'))
		.map(line =>
			line
				.replace(/\[\[\]\]/g, '')
				.replace(/\s{2,}/g, ' ')
				.trim()
		)
		.map(line => line.replace(/\s+\.$/, '').trim())
		.filter(line => !/^Unlocks:?$/i.test(line))
		.filter(line => line.length > 0);

	let kudos: number | undefined = undefined;
	const kudosIdx = cleanedRewards.findIndex(r => /(\d+)\s*kudos/i.test(r));
	if (kudosIdx !== -1) {
		const match = cleanedRewards[kudosIdx].match(/(\d+)\s*kudos/i);
		if (match) {
			kudos = Number(match[1]);
		}
		cleanedRewards.splice(kudosIdx, 1);
	}

	return { rewards: cleanedRewards, kudos };
}

async function fetchQuestIdMap(): Promise<Record<string, string>> {
	const QUEST_RELEASE_DATES_PAGE = 'Quests/Release dates';
	const url = `https://oldschool.runescape.wiki/api.php?action=parse&page=${encodeURIComponent(
		QUEST_RELEASE_DATES_PAGE
	)}&prop=wikitext&format=json`;
	const res = await fetch(url);
	const data = await res.json();
	const wikitext = data.parse?.wikitext?.['*'];
	if (!wikitext) throw new Error('Failed to fetch quest release dates wikitext');

	const questReleases = [...wikitext.matchAll(/\{\{QuestRelease([\s\S]+?)\}\}/g)];
	const questIdMap: Record<string, string> = {};

	for (const match of questReleases) {
		const block = match[1];
		const nrMatch = block.match(/\|\s*nr\s*=\s*([^\|\n]+)/i);
		const nameMatch = block.match(/\|\s*name\s*=\s*([^\|\n]+)/i);
		if (!nrMatch || !nameMatch) continue;
		const number = nrMatch[1].replace(/[^0-9]/g, '').trim();
		const name = nameMatch[1]
			.replace(/\[\[|\]\]/g, '')
			.replace(/<.*?>/g, '')
			.trim();

		if (number && name) {
			questIdMap[name] = number;
		}
	}
	return questIdMap;
}

function filterQuestItems(items: string[]): string[] {
	const skipItemPatterns = [
		/during\s+(?:the\s+)?quest/i,
		/obtainable/i,
		/^[Aa]\s+\w*\s*weapon$/i,
		/weapons and armour/i,
		/weaponry/i,
		/inventory spaces/i,
		/inventory slots/i,
		/spellbook/i,
		/can be purchased/i,
		/ability to/i,
		/telekinetic grab/i,
		/to cast/i,
		/charge orb/i
	];
	return items
		.map(stripWikiTemplates)
		.map(item =>
			item
				.replace(/^at least\s+/i, '')
				.replace(/^some amount of\s+/i, '')
				.replace(/^a few\s+/i, '')
				.replace(/^about\s+/i, '')
				.replace(/^around\s+/i, '')
				.replace(/^either\s+/i, '')
				.replace(/^[\w\s]+:\s*/i, '')
				.replace(/woodcutting axe/gi, 'axe')
				.split('|')[0]
				.replace(/^\*+/, '')
				.replace(/\}\}+$/, '')
				.trim()
		)
		.filter(entry => {
			const lower = entry.trim().toLowerCase();
			const style = /(range|melee|magic|combat|deal)/i.test(lower);
			const type = /(armour|gear|weapon|equipment|damage|method)/i.test(lower);
			if (skipItemPatterns.some(pattern => pattern.test(entry))) return false;
			if (style && type) return false;
			return true;
		});
}

function filterQuestRewards(rewards: string[]): string[] {
	const skipRewardPatterns = [
		/access to/i,
		/use of/i,
		/ability to/i,
		/nightmare zone/i,
		/agility shortcut/i,
		/a page for kharedst's memoirs/i,
		/music track/i,
		/Note:/,
		/fremennik name/i,
		/dark beasts teleport/i
	];
	return rewards
		.map(stripWikiTemplates)
		.map(line =>
			line
				.replace(/file:coins 250\.png/gi, '')
				.replace(/^a fremennik royal helm known as the/i, '')
				.replace(/^silverlight turns into/i, '')
				.replace(/^elf\s+/i, '')
				.replace(/^\*+/, '')
				.replace(/\}\}+$/, '')
				.trim()
		)
		.filter(entry => !skipRewardPatterns.some(pattern => pattern.test(entry)));
}

export default async function prepareQuests() {
	const quests = await fetchQuestList();
	const questIdMap = await fetchQuestIdMap();
	const questData: any[] = [];
	for (const quest of quests) {
		try {
			const data = await fetchQuestDetailsSection(quest);
			if (data?.details) {
				const questId = questIdMap[quest] ?? null;
				if (questId === null) {
					console.error(`Quest "${quest}" has null id, skipping`);
					continue;
				}

				questData.push({
					id: questId,
					...data
				});
				console.log(`Parsed quest: ${data.title} (id: ${questId})`);
				await new Promise(res => setTimeout(res, 100));
			}
		} catch (error) {
			console.error(`Error fetching ${quest}:`, error);
		}
	}

	for (const quest of questData) {
		if (!quest.details) continue;

		if (Array.isArray(quest.details.kills)) {
			quest.details.kills = filterKills(quest.details.kills);
		}

		if (Array.isArray(quest.details.items)) {
			quest.details.items = filterQuestItems(quest.details.items);
		}

		if (Array.isArray(quest.rewards)) {
			quest.rewards = filterQuestRewards(quest.rewards);
		}

		if (quest.details.requirements) {
			if (Array.isArray(quest.details.requirements.quests)) {
				quest.details.requirements.quests = dedupe(
					quest.details.requirements.quests.map(q =>
						q
							.replace(/\{\{scp\|quest\}\}/gi, '')
							.replace(/\{\{questreqstart\|yes\}\}/gi, '')
							.replace(/\{\{questreqstart\|no\}\}/gi, '')
							.trim()
							.toLowerCase()
					)
				);
			}
			if (Array.isArray(quest.details.requirements.skills)) {
				quest.details.requirements.skills = dedupe(quest.details.requirements.skills);

				const qpSkillIndexes: number[] = [];
				for (let i = 0; i < quest.details.requirements.skills.length; i++) {
					const s = quest.details.requirements.skills[i];
					const match = s.match(/^(\d+)\s+quest?$/i);
					if (match) {
						const qp = Number(match[1]);
						quest.details.requirements.qp = qp;
						qpSkillIndexes.push(i);
					}
				}
				for (const idx of qpSkillIndexes.reverse()) {
					quest.details.requirements.skills.splice(idx, 1);
				}
			}
			if (Array.isArray(quest.details.requirements.other)) {
				const kudosReqIndexes: number[] = [];
				for (let i = 0; i < quest.details.requirements.other.length; i++) {
					const s = quest.details.requirements.other[i];
					const match = s.match(/^(\d+)\s*kudos\b/i);
					if (match) {
						quest.details.requirements.kudos = Number(match[1]);
						kudosReqIndexes.push(i);
					}
				}
				for (const idx of kudosReqIndexes.reverse()) {
					quest.details.requirements.other.splice(idx, 1);
				}
				quest.details.requirements.other = dedupe(quest.details.requirements.other);
			}
		}
	}
	const cleanedQuestData = removeEmpty(questData);
	writeFileSync('./src/data/quest_data.json', JSON.stringify(cleanedQuestData, null, 4));
	console.log('Quest data written to quest_data.json');
}
