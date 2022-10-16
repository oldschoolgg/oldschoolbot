import { WikiDocs } from '@prisma/client';
import fetch from 'node-fetch';

import { GITBOOK_SPACE_ID, GITBOOK_TOKEN } from '../config';
import { prisma } from './settings/prisma';
import { logError } from './util/logError';

export interface DocsSection {
	id: string;
	title: string;
	body: string;
	path: string;
}

export interface DocsArticle {
	id: string;
	title: string;
	path: string;
	sections: DocsSection[];
}

export interface DocsResponse {
	items: DocsArticle[];
	next: JSON;
}

export interface DocsDefaultResults {
	name: string;
	value: string;
}

export const osbDefaultDocsResults: DocsDefaultResults[] = [
	{
		name: 'Home',
		value: ''
	},
	{
		name: 'FAQ',
		value: 'getting-started/faq'
	},
	{
		name: 'Rules',
		value: 'getting-started/rules'
	},
	{
		name: 'Beginner Guide',
		value: 'getting-started/beginner-guide'
	}
];

export const DefaultDocsResults: DocsDefaultResults[] = [
	{
		name: 'Home',
		value: ''
	},
	{
		name: 'Getting Started',
		value: 'getting-started'
	},
	{
		name: 'Rules',
		value: 'rules'
	},
	{
		name: 'Leagues',
		value: 'leagues'
	}
];

export async function syncDocs() {
	let page = 0;
	let next = [];
	do {
		try {
			const results = await fetch(
				`https://api.gitbook.com/v1/spaces/${GITBOOK_SPACE_ID}/search?query=*&limit=1000&page=${page}`,
				{
					headers: {
						Authorization: `Bearer ${GITBOOK_TOKEN}`
					}
				}
			);

			const resultJson = await results.json();
			let articlesToUpdate: { id: string; name: string; value: string; body: string }[] = [];
			next = resultJson.next;
			const { items } = resultJson as DocsResponse;
			for (let item of items) {
				if (typeof item.sections === 'string') continue;
				for (let section of item.sections) {
					if (section.title === '')
						articlesToUpdate.push({
							id: section.id,
							name: item.title,
							value: item.path,
							body: section.body.substring(0, 497)
						});
					console.log(`id: ${section.id} \n name: ${item.title} - ${section.title}\n value: ${section.path}`);
					articlesToUpdate.push({
						id: section.id,
						name: `${item.title} - ${section.title}`.toString(),
						value: section.path,
						body: section.body.substring(0, 497)
					});
				}
			}

			await prisma.$transaction(
				articlesToUpdate.map(a =>
					prisma.wikiDocs.upsert({
						where: { path: a.value },
						update: {},
						create: {
							id: a.id,
							name: a.name,
							path: a.value,
							body: a.body.substring(0, 497)
						}
					})
				)
			);
			page++;
		} catch (err: any) {
			logError(err);
		}
	} while (typeof next !== 'undefined');

	return 'Updating Docs';
}

export async function getDocsResults(SearchString: string) {
	const articleResults: WikiDocs[] = await prisma.$queryRawUnsafe(`
	SELECT *,
length(name) as namelen,
case 
	when path like '%#%' then '2'
	else '1'
end as mainpageprio, 
case 
	when REPLACE(replace(name, ' - ', ' '),'''','') ~ '(?i)(?<= |^)${SearchString}(?= |$)' then '1'
	when REPLACE(replace(name, ' - ', ' '),'''','') ilike '%${SearchString}%' then '2'
	when body ilike '%${SearchString}%' then '3'
	else '4'
end as prio
FROM wiki_docs
WHERE REPLACE(replace(name, ' - ', ' '),'''','') ilike '%${SearchString}%' or body ilike '%${SearchString}%' 
order by mainpageprio asc,prio asc,namelen asc
limit 12;`);
	return articleResults;
}

export async function getAllDocsResults() {
	const articleResults: WikiDocs[] = await prisma.$queryRawUnsafe(`SELECT *
FROM wiki_docs;`);
	return articleResults;
}
