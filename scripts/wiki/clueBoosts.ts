import { Markdown } from '@oldschoolgg/toolkit';

import { ClueTiers } from '@/lib/clues/clueTiers.js';
import { clueGlobalBoosts, clueTierBoosts } from '@/mahoji/commands/clue.js';
import { handleMarkdownEmbed } from './wikiScriptUtil.js';

export function clueBoosts() {
	const markdown = new Markdown();

	markdown.addLine('### Global Boosts');
	markdown.add('These boosts apply to all clues.');
	for (const x of clueGlobalBoosts) {
		markdown.addLine(`- ${x.boost}`);
	}
	markdown.addLine('- You get a boost for having relevant stash units filled');
	markdown.addLine('- For Hard/Elite/Master, you get a boost for your attack/strength/ranged levels being higher');

	const clueTierBoostsEntries = Object.entries(clueTierBoosts);
	for (const clueTier of ClueTiers) {
		markdown.addLine(`### ${clueTier.name} Clues Boosts`);
		const entry = clueTierBoostsEntries.find(([key]) => key === clueTier.name)!;
		for (const boost of entry[1]) {
			markdown.addLine(`- ${boost.boost}`);
		}
	}

	handleMarkdownEmbed('clueboosts', 'osb/clues.mdx', markdown.toString());
}
