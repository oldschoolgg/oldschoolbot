import '../base.js';

import { Markdown, toTitleCase } from '@oldschoolgg/toolkit';

import { COXMaxMageGear, COXMaxMeleeGear, COXMaxRangeGear, itemBoosts } from '@/lib/data/cox.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

export function renderCoxMarkdown() {
	const markdown = new Markdown();

	markdown.addLine('## Gear');
	markdown.addLine('This is the best-in-slot gear you should use for CoX, substitute the next best items you have. ');
	for (const gear of [
		['mage', 'Magic Damage', COXMaxMageGear],
		['range', 'Ranged Strength', COXMaxRangeGear],
		['melee', 'Melee Strength', COXMaxMeleeGear]
	] as const) {
		markdown.addLine(`### ${toTitleCase(gear[0])}`);
		markdown.addLine(`For ${gear[0]}, use these items, or the next best '${gear[1]}' gear you have:`);
		markdown.addLine(
			`- ${gear[2]
				.allItems(false)
				.map(id => `[[${id}]]`)
				.join(' ')}`
		);
	}

	markdown.addLine('## Boosts');
	markdown.addLine(`Higher Kc makes raids faster. Here is the maximum kc that will give a boost:

| Difficulty | Solo Kc | Mass Kc |
| ---------- | ------- | ------- |
| Normal     | 250     | 400     |
| Challenge  | 75      | 100     |

`);
	for (const boostSet of itemBoosts) {
		markdown.addLine(
			`- ${boostSet
				.map(boost => {
					const messages: string[] = [];
					if (!boost.mustBeEquipped) {
						messages.push('Works from bank');
					}
					if (boost.mustBeCharged) {
						messages.push('Must be charged');
					}
					const msgStr = messages.length > 0 ? ` (${messages.join(', ')})` : '';
					return `${boost.boost}% boost for [[${boost.item.name}]]${msgStr}`;
				})
				.join(' or ')}`
		);
	}

	handleMarkdownEmbed('cox', 'osb/Raids/cox.mdx', markdown.toString());
}
