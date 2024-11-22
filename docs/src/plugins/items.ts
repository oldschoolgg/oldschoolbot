import { collapseWhiteSpace } from 'collapse-white-space';
import { Items } from 'oldschooljs';
import { visitParents } from 'unist-util-visit-parents';

import bsoItemsJson from '../../../data/bso_items.json';
import commandsJson from '../../../data/osb.commands.json';
import { SkillsArray } from '../../../src/lib/skilling/types';
import { authorsMap } from './authors';

const bsoItems = Object.entries(bsoItemsJson);

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

export function remarkItems(options: any) {
	return (tree: any) => {
		visitParents(tree, 'text', (node, parents) => {
			const value = collapseWhiteSpace(node.value, { style: 'html', trim: true });
			const matches = [...value.matchAll(/\[\[([\s\S]*?)\]\]/g)].map(i => i[1]);
			if (matches.length === 0) return;

			for (const match of matches) {
				if (match.startsWith('#')) {
					const [channelName, messageID] = match.split(':');
					const html = `<a class="discord_channel" href="discord://discord.com/channels/342983479501389826/${messageID}" target="_blank">${channelName}</a>`;
					node.value = node.value.replace(`[[${match}]]`, html);
					node.type = 'html';
					continue;
				} else if (imageExtensions.some(ext => match.endsWith(ext))) {
					node.type = 'html';
					const html = `<img src="/images/${match}" alt="${match}" />`;
					node.value = node.value.replace(`[[${match}]]`, html);
					continue;
				} else if ([...SkillsArray, 'qp'].some(s => match.includes(`${s}:`))) {
					const [skillName, level] = match.split(':');
					node.type = 'html';
					const imageURL =
						skillName === 'qp'
							? 'https://oldschool.runescape.wiki/images/Quest_point_icon.png'
							: `https://raw.githubusercontent.com/runelite/runelite.net/refs/heads/master/public/img/skillicons/${skillName}.png`;
					const html = `<div class="osrs_item">
<img class="osrs_item_image" src="${imageURL}" alt="${match}" />
<p class="osrs_item_name">${level}</p>
</div>`;
					node.value = node.value.replace(`[[${match}]]`, html);
					continue;
				} else if (match.includes('embed.')) {
					node.type = 'html';
					node.value = '';
					continue;
				} else if (authorsMap.has(match)) {
					const author = authorsMap.get(match);
					const customHtml = `<div class="contributor">
											${author?.avatar ? `<img class="contributor_avatar" src="/${author?.avatar}" />` : ''}
											<p class="contributor_name">${author!.displayName}</p>
										</div>`;
					node.type = 'html';
					node.value = node.value.replace(`[[${match}]]`, customHtml);
					continue;
				} else if (match.startsWith('/')) {
					const cmd = commandsJson.find(command => command.name === match.slice(1).split(' ')[0]);
					if (!cmd) {
						console.warn(`Could not find command with name: ${match.slice(1)}`);
					}
					const customHtml = `<div class="discord_command">
											<p class="discord_command_name">${match}</p>
										</div>`;
					node.type = 'html';
					node.value = node.value.replace(`[[${match}]]`, customHtml);
					continue;
				} else if (match.includes('...')) {
					const test = `<svg aria-hidden="true" class="astro-wy4te6ga astro-c6vsoqas" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="--sl-icon-size: 1em;"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3Z"></path></svg>`;
					const customHtml = `<a style="display: inline-block;" target="_blank" class="git_hash" href="https://github.com/oldschoolgg/oldschoolbot/compare/${match}">${test}</a>`;
					node.type = 'html';
					node.value = node.value.replace(`[[${match}]]`, customHtml);
					continue;
				}

				let imageURL = null;
				let itemName = match;
				const bsoItem = bsoItems.find(
					([id, name]) =>
						name.toLowerCase() === match.toLowerCase() || id.toLowerCase() === match.toLowerCase()
				);
				const osbItem = Items.get(match) ?? Items.get(Number(match));
				if (bsoItem) {
					imageURL = `https://raw.githubusercontent.com/oldschoolgg/oldschoolbot/refs/heads/master/src/lib/resources/images/bso_icons/${bsoItem[0]}.png`;
				} else if (osbItem) {
					imageURL = `https://chisel.weirdgloop.org/static/img/osrs-sprite/${osbItem.id}.png`;
					itemName = osbItem.name;
				} else {
					throw new Error(`Invalid embed code: ${match}`);
				}

				if (imageURL === null) {
					console.warn(`Could not find item with name: ${match}`);
					continue;
				}

				const customHtml = `<div class="osrs_item">
        <img class="osrs_item_image" src="${imageURL}" alt="${itemName}" />
        <p class="osrs_item_name">${itemName}</p>
        </div>`;

				node.type = 'html';
				node.value = node.value.replace(`[[${match}]]`, customHtml);
			}

			node.value = collapseWhiteSpace(`<div class="injected">${node.value}</div>`);
		});
	};
}
