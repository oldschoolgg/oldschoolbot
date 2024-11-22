import fetch from 'node-fetch';

import type { WikiPage } from '../meta/types';

class Wiki {
	private URL = 'https://oldschool.runescape.wiki/api.php';
	private searchOptions: { [index: string]: string } = {
		'-incategory': ['Slang_dictionary', 'Disambiguation'].join('|')
	};

	private commonPageAPIOptions = {
		action: 'query',
		format: 'json',
		prop: ['extracts', 'pageimages', 'info', 'categories'].join('|'),
		formatversion: '2',
		piprop: 'original',
		inprop: 'url',
		exsentences: '5',
		exintro: '1',
		explaintext: '1',
		cllimit: 'max'
	};

	public async fetchPage(pageID: number): Promise<WikiPage | undefined> {
		const results = await this.fetchAPI({
			iwurl: '1',
			pageids: pageID
		});

		if (!results || !results.query) return undefined;
		return this.parseRawPage(results.query.pages[0]);
	}

	public async random(amount = 20): Promise<WikiPage[]> {
		const results = await this.fetchAPI({
			generator: 'random',
			grnnamespace: '0',
			grnlimit: amount
		});

		if (!results || !results.query) return [];
		return results.query.pages.map((r: any) => this.parseRawPage(r));
	}

	public async search(query: string): Promise<WikiPage[]> {
		const parsedSearchOptions = Object.keys(this.searchOptions)
			.map((prop): string => `${prop}:${this.searchOptions[prop]}`)
			.join(' ');

		const results = await this.fetchAPI({
			iwurl: '1',
			generator: 'search',
			gsrlimit: '20',
			gsrsearch: `${query} ${parsedSearchOptions}`
		});

		if (!results || !results.query || !results.query.pages) return [];

		return results.query.pages.sort((a: any, b: any) => a.index - b.index).map((r: any) => this.parseRawPage(r));
	}

	private parseRawPage(rawPage: any): WikiPage {
		return {
			title: rawPage.title,
			extract: rawPage.extract,
			image: rawPage.original?.source,
			url: rawPage.fullurl,
			lastRevisionID: rawPage.lastrevid,
			pageID: rawPage.pageid,
			categories: rawPage.categories
		};
	}

	public fetchAPI(query: any): Promise<any> {
		const apiURL = new URL(this.URL);
		apiURL.search = new URLSearchParams({ ...this.commonPageAPIOptions, ...query }).toString();
		return fetch(apiURL.toString()).then((res): Promise<any> => res.json());
	}
}

export default new Wiki();
