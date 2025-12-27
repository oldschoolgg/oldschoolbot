export type RawWikiResponse = {
	batchcomplete: boolean;
	warnings: {
		main: {
			warnings: string;
		};
		revisions: {
			warnings: string;
		};
	};
	query: {
		pages: Array<{
			pageid: number;
			ns: number;
			title: string;
			revisions: Array<{
				revid: number;
				parentid: number;
				user: string;
				timestamp: string;
				contentformat: string;
				contentmodel: string;
				content: string;
				comment: string;
			}>;
			contentmodel: string;
			pagelanguage: string;
			pagelanguagehtmlcode: string;
			pagelanguagedir: string;
			touched: string;
			lastrevid: number;
			length: number;
			talkid: number;
			fullurl: string;
			editurl: string;
			canonicalurl: string;
			categories: Array<{
				ns: number;
				title: string;
			}>;
			thumbnail: {
				source: string;
				width: number;
				height: number;
			};
			pageimage: string;
			extract: string;
		}>;
	};
	limits: {
		categories: number;
	};
};
