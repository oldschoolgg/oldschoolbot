export type Bot = 'osb' | 'bso';
export type TransactionType = 'trade' | 'giveaway' | 'duel' | 'gri' | 'gift';
export type SortField = 'date' | 'sender' | 'recipient' | 'type' | 'guild_id';
export type SortOrder = 'asc' | 'desc';

export interface EconomyTransaction {
	id: string;
	sender: string;
	recipient: string;
	guild_id: string | null;
	type: TransactionType;
	date: string;
	items_sent: any;
	items_received: any;
}

export interface EconomyTransactionsQuery {
	bot: Bot;
	sender?: string;
	recipient?: string;
	guild_id?: string;
	type?: TransactionType;
	date_from?: string;
	date_to?: string;
	sort_by?: SortField;
	sort_order?: SortOrder;
	limit?: number;
	offset?: number;
}

export interface EconomyTransactionsResponse {
	data: EconomyTransaction[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		has_more: boolean;
	};
}
