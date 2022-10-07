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
