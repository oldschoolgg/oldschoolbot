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
			let articlesToUpdate: { id: string; name: string; value: string }[] = [];
			next = resultJson.next;
			const { items } = resultJson as DocsResponse;
			for (let item of items) {
				if (item.path === '') continue;
				articlesToUpdate.push({ id: item.id, name: item.title, value: item.path });
				for (let section of item.sections) {
					if (section.title === '') continue;
					articlesToUpdate.push({
						id: section.id,
						name: `${item.title} - ${section.title}`.toString(),
						value: section.path
					});
				}
			}

			await prisma.$transaction(
				articlesToUpdate.map(a =>
					prisma.wikiDocs.upsert({
						where: { id: a.id },
						update: {},
						create: {
							id: a.id,
							name: a.name,
							path: a.value
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
	const articleResults: WikiDocs[] = await prisma.$queryRawUnsafe(`SELECT *
FROM wiki_docs
WHERE replace(name, ' - ', ' ') ilike replace('%${SearchString}%', ' - ', ' ') limit 10;`);
	return articleResults;
}

export async function getAllDocsResults() {
	const articleResults: WikiDocs[] = await prisma.$queryRawUnsafe(`SELECT *
FROM wiki_docs;`);
	return articleResults;
}
