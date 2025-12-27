import wretch from 'wretch';
import QueryStringAddon from 'wretch/addons/queryString';
import { retry, throttlingCache } from 'wretch/middlewares';

import { ItemBucket } from './bucket.js';
import { PagesAPI } from './pages.js';

type QueryParams = Record<string, string | number | boolean | undefined>;

export interface OSRSWikiAPIOptions {
	userAgent: string;
	throttleMs?: number;
	maxRetries?: number;
}

export class WikiClient {
	private readonly client = wretch('https://oldschool.runescape.wiki/api.php').addon(QueryStringAddon);

	constructor(opts: Required<OSRSWikiAPIOptions>) {
		this.client = this.client
			.headers({
				'User-Agent': opts.userAgent,
				Accept: 'application/json'
			})
			.middlewares([
				throttlingCache({
					throttle: opts.throttleMs,
					skip: (_url, o) => o.method !== 'GET'
				}),
				retry({
					maxAttempts: opts.maxRetries,
					retryOnNetworkError: true,
					until: r => !!r && r.ok
				})
			]);
	}

	request<T>(params: QueryParams): Promise<T> {
		return this.client
			.query({ format: 'json', ...params })
			.get()
			.json<T>();
	}
}

export class OSRSWikiAPI {
	readonly buckets: {
		item: ItemBucket;
	};

	public readonly wiki: WikiClient;
	pages: PagesAPI;

	constructor(options: OSRSWikiAPIOptions) {
		this.wiki = new WikiClient({
			userAgent: options.userAgent,
			throttleMs: options.throttleMs ?? 500,
			maxRetries: options.maxRetries ?? 5
		});

		this.buckets = {
			item: new ItemBucket(this.wiki)
		};

		this.pages = new PagesAPI(this);
	}
}
