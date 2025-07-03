import { collapseWhiteSpace } from 'collapse-white-space';
import { Items } from 'oldschooljs';
import { visitParents } from 'unist-util-visit-parents';

import bsoItemsJson from '../../../data/bso/bso_items.json';
import commandsJson from '../../../data/osb/commands.json';
import { authors, authorsMap } from '../../../scripts/wiki/authors.js';
import { SkillsArray } from '../../../src/lib/skilling/types.js';
import { toTitleCase } from '../docs-util.js';

const bsoItems = Object.entries(bsoItemsJson);
const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

export function remarkItems(_options: any) {
	return (tree: any) => {
		visitParents(tree, 'text', (node, parents) => {
			const parent = parents[parents.length - 1];
			if (!parent || !Array.isArray(parent.children)) return;

			const value = collapseWhiteSpace(node.value, { style: 'html', trim: true });
			const matches = [...value.matchAll(/\[\[([\s\S]*?)\]\]/g)];
			if (matches.length === 0) return;

			const newChildren = [];
			let lastIndex = 0;

			for (const match of matches) {
				const raw = match[0];
				const content = match[1];
				const startIndex = match.index!;
				const endIndex = startIndex + raw.length;

				if (startIndex > lastIndex) {
					newChildren.push({
						type: 'text',
						value: value.slice(lastIndex, startIndex)
					});
				}

				let html = null;

				if (content.startsWith('#')) {
					const [channelName, messageID] = content.split(':');
					html = `<a class="discord_channel" href="discord://discord.com/channels/342983479501389826/${messageID}" target="_blank">${channelName}</a>`;
				} else if (imageExtensions.some(ext => content.endsWith(ext))) {
					html = `<img src="/images/${content}" alt="${content}" />`;
				} else if (authors.some(author => author.gitIDs.some(_g => content.startsWith(_g)))) {
					const author = authorsMap.get(content.includes('#') ? content.split('#')[0] : content);
					html = `<div class="contributor ${content.includes('#small') ? 'contributor_small' : ''}">
${author?.avatar ? `<img class="contributor_avatar" src="${author.avatar}" />` : ''}
<p class="contributor_name">${author!.displayName}</p>
</div>`;
				} else if (
					[...SkillsArray, 'divination', 'dungeoneering', 'invention', 'qp'].some(
						s => content.includes(`${s}`) && !content.includes('/') && !content.includes('.') // some commands contain names of skills
					)
				) {
					const [skillName, level] = content.split(':');
					const imageURL =
						skillName === 'qp'
							? 'https://oldschool.runescape.wiki/images/Quest_point_icon.png'
							: `https://cdn.oldschool.gg/icons/skills/${skillName}.png`;
					const imgEl = `<img class="osrs_item_image" src="${imageURL}" alt="${content}" />`;
					html =
						typeof level !== 'undefined'
							? `<span class="osrs_item">${imgEl}<span class="osrs_item_name">${level}</span></span>`
							: `<span class="osrs_item">${imgEl}${toTitleCase(skillName)}</span>`;
				} else if (content.includes('embed.')) {
					html = '';
				} else if (content.startsWith('/')) {
					const cmd = commandsJson.data.find(c => c.name === content.slice(1).split(' ')[0]);
					if (!cmd) {
						console.warn(`Could not find command with name: ${match.slice(1)}`);
					}
					html = `<button class="discord_command_copy" data-command="${content}" type="button" aria-label="Copy command">${content}</button>`;
				} else if (content.includes('...')) {
					const githubIcon = `<svg aria-hidden="true" class="github_icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3Z"></path></svg>`;
					html = `<div class="github_link">${githubIcon}<a target="_blank" href="https://github.com/oldschoolgg/oldschoolbot/compare/${content}">Commits</a></div>`;
				} else {
					let imageURL = null;
					let itemName = content;
					const bsoItem = bsoItems.find(
						([id, name]) =>
							name.toLowerCase() === content.toLowerCase() || id.toLowerCase() === content.toLowerCase()
					);
					const osbItem = Items.get(content) ?? Items.get(Number(content));
					if (bsoItem) {
						imageURL = `https://raw.githubusercontent.com/oldschoolgg/oldschoolbot/refs/heads/master/src/lib/resources/images/bso_icons/${bsoItem[0]}.png`;
					} else if (osbItem) {
						imageURL = `https://cdn.oldschool.gg/icons/items/${osbItem.id}.png`;
						itemName = osbItem.name;
					} else {
						console.warn(`Could not find item: ${content}`);
						html = `<span class="unknown_item">${content}</span>`;
					}
					if (imageURL) {
						html = `<span class="osrs_item">
									<img class="osrs_item_image" src="${imageURL}" alt="${itemName}" />
									<span class="osrs_item_name">${itemName}</span>
								</span>`;
					}
				}

				if (html) {
					newChildren.push({
						type: 'html',
						value: html
					});
				}

				lastIndex = endIndex;
			}

			if (lastIndex < value.length) {
				newChildren.push({
					type: 'text',
					value: value.slice(lastIndex)
				});
			}

			const index = parent.children.indexOf(node);
			parent.children.splice(index, 1, ...newChildren);
		});
	};
}
