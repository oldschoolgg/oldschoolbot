import { GITBOOK_SPACE_ID, GITBOOK_TOKEN } from '../config';
import { logError } from '../lib/util/logError';

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
}
interface docArticle {
	name: string;
	value: string;
}
export let docArticles: docArticle[] = [
	{ name: 'moktang', value: 'bosses/moktang' },
	{ name: 'kalphite king', value: 'bosses/kalphite king' }
];

export async function syncDocs() {
	console.log(docArticles);
	try {
		const results = await fetch(`https://api.gitbook.com/v1/spaces/${GITBOOK_SPACE_ID}/search`, {
			headers: {
				Authorization: `Bearer ${GITBOOK_TOKEN}`
			}
		});
		const resultJson = await results.json();
		const { items } = resultJson as DocsResponse;
		let articlesToUpdate: { name: string; value: string }[] = [];
		for (let item of items) {
			articlesToUpdate.push({ name: item.title, value: item.path });
			for (let section of item.sections) {
				if (section.title === '') continue;
				articlesToUpdate.push({
					name: `${item.title} - ${section.title}`.toString(),
					value: section.path
				});
			}
		}
		docArticles = articlesToUpdate;
		console.log(docArticles);
		return 'Docs updated';
	} catch (err: any) {
		logError(err);
		return 'Failed to run sync docs task';
	}
}
