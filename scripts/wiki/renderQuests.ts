import { Markdown } from '@oldschoolgg/toolkit';

import { quests } from '@/lib/minions/data/quests.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

export function renderQuestsMarkdown() {
	const markdown = new Markdown();

	for (const quest of quests.sort((a, b) => a.name.localeCompare(b.name))) {
		const questMarkdown = new Markdown();
		questMarkdown.addLine(`## ${quest.name}`);
		questMarkdown.addLine(
			`You can send your minion to do this quest using [[/activities quest name:${quest.name}]]`
		);

		if (quest.skillReqs) {
			questMarkdown.addLine('### Skill Requirements');
			questMarkdown.addLine(
				`- Skills: ${Object.entries(quest.skillReqs)
					.map(([skill, lvl]) => `[[${skill}:${lvl}]]`)
					.join(' ')}`
			);
		}
		if (quest.ironmanSkillReqs) {
			questMarkdown.addLine('### Ironman Skill Requirements');
			questMarkdown.addLine(
				`${Object.entries(quest.ironmanSkillReqs)
					.map(([skill, lvl]) => `[[${skill}:${lvl}]]`)
					.join(' ')}`
			);
		}

		if (quest.prerequisitesQuests) {
			questMarkdown.addLine('### Required Quests');
			for (const req of quest.prerequisitesQuests) {
				questMarkdown.addLine(`- Must have finished ${quests.find(q => q.id === req)!.name}`);
			}
		}

		if (quest.combatLevelReq || quest.qpReq) {
			questMarkdown.addLine('### Other requirements');
			if (quest.combatLevelReq) {
				questMarkdown.addLine(`- Combat Level requirement: ${quest.combatLevelReq}`);
			}
			if (quest.qpReq) {
				questMarkdown.addLine(`- Quest Points requirement: [[qp:${quest.qpReq}]]`);
			}
		}

		if (quest.rewards) {
			questMarkdown.addLine('### Item Rewards');
			questMarkdown.addLine(
				quest.rewards
					.items()
					.map(([item]) => `[[${item.id}]]`)
					.join(' ')
			);
		}
		if (quest.skillsRewards) {
			questMarkdown.addLine('### XP Rewards');
			questMarkdown.addLine(
				Object.entries(quest.skillsRewards)
					.map(([skill, xp]) => `[[${skill}:${xp.toLocaleString()}]]`)
					.join(' ')
			);
		}

		markdown.add(questMarkdown);
	}

	handleMarkdownEmbed('quests', 'osb/quests.mdx', markdown.toString());
}
