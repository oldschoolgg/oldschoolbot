export interface GithubSponsorsWebhookData {
	action: 'created' | 'cancelled' | 'edited' | 'tier_changed' | 'pending_cancellation' | 'pending_tier_change';
	sponsorship: Sponsorship;
	sender: GithubUser;
	changes?: Changes;
	effective_date?: string;
}

interface Sponsorship {
	node_id: string;
	created_at: string;
	sponsorable: Sponsorable;
	sponsor: Sponsor;
	privacy_level: string;
	tier: Tier;
}

interface Sponsorable {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

interface Sponsor {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

interface Tier {
	node_id: string;
	created_at: string;
	description: string;
	monthly_price_in_cents: number;
	monthly_price_in_dollars: number;
	name: string;
}

interface GithubUser {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

interface Changes {
	tier: Tier2;
}

interface Tier2 {
	from: From;
}

interface From {
	node_id: string;
	created_at: string;
	description: string;
	monthly_price_in_cents: number;
	monthly_price_in_dollars: number;
	name: string;
}
