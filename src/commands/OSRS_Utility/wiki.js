const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const { cleanString } = require('../../util');

const cache = new Map();
const ignoredCategories = ['Slang dictionary', 'Disambiguation'].map(i => `Category:${i}`);

function getURL(query) {
	const wikiSearchURL = new URL('https://oldschool.runescape.wiki/api.php');
	wikiSearchURL.search = new URLSearchParams([
		['action', `query`],
		['format', 'json'],
		['prop', ['extracts', 'pageimages', 'info', 'categories'].join('|')],
		['iwurl', '1'],
		['generator', 'search'],
		['formatversion', '2'],
		['exsentences', '5'],
		['exintro', '1'],
		['explaintext', '1'],
		['piprop', 'original'],
		['clprop', ''],
		['clshow', ''],
		['cllimit', 'max'],
		['inprop', 'url'],
		['gsrsearch', query],
		['gsrlimit', '5']
	]);
	return wikiSearchURL.toString();
}

module.exports = class extends Command {
	constructor(...args) {
		super(...args, {
			cooldown: 3,
			aliases: ['w'],
			description: 'Search the OSRS Wikipedia for an article.',
			usage: '[query:str]',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg, [query]) {
		if (!query) {
			return msg.send('https://oldschool.runescape.wiki');
		}

		let article = cache.get(cleanString(query));

		if (!article) {
			const [headArticle, ...tailArticles] = await fetch(getURL(query))
				.then(res => res.json())
				// Sort the pages by index (best match?)
				.then(res => res.query.pages.sort((a, b) => a.index - b.index))
				// Filter out disambiguation pages
				.then(pages => {
					return pages.filter(page => {
						if (!page.categories || page.categories.length === 0) {
							return true;
						}

						return page.categories.every(
							category => !ignoredCategories.includes(category.title)
						);
					});
				})
				// Add utm source
				.then(pages => pages.map(page => ({ ...page, url: page.fullurl })))
				.catch(() => {
					throw "I couldn't find anything with that query!";
				});

			article = headArticle;
			article.related = tailArticles;

			cache.set(cleanString(query), article);
		}

		const { title, extract, original, url, related } = article;

		const relatedLinks =
			related.length > 0
				? `
Related:
${related.map(a => `[${a.title}](${a.url})`).join(', ')}`
				: '';

		const embed = new MessageEmbed()
			.setColor(52224)
			.setThumbnail(original && original.source)
			.setURL(url)
			.setTitle(title)
			.setDescription(
				`${extract}

${relatedLinks}
`
			)
			.setFooter('Old School RuneScape Wiki');

		return msg.send({ embed });
	}
};
