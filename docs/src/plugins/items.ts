import { collapseWhiteSpace } from 'collapse-white-space';
import { visitParents } from 'unist-util-visit-parents';

import bsoItemsJson from '../../../data/bso_items.json';
import commandsJson from '../../../data/osb.commands.json';
import { Items } from '../../../node_modules/oldschooljs';

const bsoItems = Object.entries(bsoItemsJson);

export function remarkItems(options: any) {
	return (tree: any) => {
		visitParents(tree, 'text', (node, parents) => {
			const value = collapseWhiteSpace(node.value, { style: 'html', trim: true });
			const matches = [...value.matchAll(/\[\[([\s\S]*?)\]\]/g)].map(i => i[1]);
			if (matches.length === 0) return;

			for (const match of matches) {
				if (match.includes('embed.')) {
					node.type = 'html';
					node.value = '';
					continue;
				}
				if (match.startsWith('/')) {
					const cmd = commandsJson.find(command => command.name === match.slice(1).split(' ')[0]);
					if (!cmd) throw new Error(`Could not find command with name: ${match.slice(1)}`);
					const customHtml = `<div class="discord_command">
											<p class="discord_command_name">${match}</p>
										</div>`;
					node.type = 'html';
					node.value = node.value.replace(`[[${match}]]`, customHtml);
					continue;
				}

				let imageURL = null;
				const bsoItem = bsoItems.find(([id, name]) => name.toLowerCase() === match.toLowerCase());
				if (bsoItem) {
					imageURL = `https://raw.githubusercontent.com/oldschoolgg/oldschoolbot/refs/heads/bso/src/lib/resources/images/bso_icons/${bsoItem[0]}.png`;
				} else {
					const item = Items.get(match);
					imageURL = `https://chisel.weirdgloop.org/static/img/osrs-sprite/${item.id}.png`;
				}

				if (imageURL === null) {
					throw new Error(`Could not find item with name: ${match}`);
				}

				const customHtml = `<div class="osrs_item">
        <img class="osrs_item_image" src="${imageURL}" alt="${match}" />
        <p class="osrs_item_name">${match}</p>
        </div>`;

				node.type = 'html';
				node.value = node.value.replace(`[[${match}]]`, customHtml);
			}
		});
	};
}
