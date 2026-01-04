import type { IEconomyTransactionType } from '@oldschoolgg/schemas';

export type SortField = 'date' | 'sender' | 'recipient' | 'type' | 'guild_id';
export type SortOrder = 'asc' | 'desc';

export interface EconomyTransaction {
	id: string;
	sender: string;
	recipient: string;
	guild_id: string | null;
	type: IEconomyTransactionType;
	date: string;
	items_sent: any;
	items_received: any;
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
