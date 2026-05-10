import type { IEconomyTransactionsQuery } from '@oldschoolgg/schemas';
import { deepMerge } from '@oldschoolgg/toolkit';
import { useCallback, useEffect, useState } from 'react';

import type { EconomyTransaction } from '@/components/pages/Account/Staff/types.js';
import { api } from '@/lib/api.js';
import { TransactionFilters } from './TransactionFilters.js';
import { TransactionTable, type TransactionTableSortStatus } from './TransactionTable.js';

const PAGE_SIZE = 50;

export function EconomyTransactions() {
	const [transactions, setTransactions] = useState<EconomyTransaction[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);

	const [query, setQuery] = useState<IEconomyTransactionsQuery>({
		bot: 'osb',
		limit: PAGE_SIZE,
		offset: 0,
		sort_by: 'date',
		sort_order: 'desc',
		page: 1
	});

	const [sortStatus, setSortStatus] = useState<TransactionTableSortStatus<EconomyTransaction>>({
		columnAccessor: 'date',
		direction: 'desc'
	});

	const loadTransactions = useCallback(async () => {
		setLoading(true);
		try {
			const response = await api.staff.fetchEconomyTransactions(query);
			setTransactions(response.data);
			setTotal(response.pagination.total);
		} catch (err) {
			console.error('Error loading economy transactions:', err);
		} finally {
			setLoading(false);
		}
	}, [sortStatus, query]);

	useEffect(() => {
		void loadTransactions();
	}, [loadTransactions, sortStatus, query]);

	const handleSearch = () => {
		loadTransactions();
	};

	const handleReset = () => {
		setQuery({
			bot: 'osb',
			limit: PAGE_SIZE,
			offset: 0,
			sort_by: 'date',
			sort_order: 'desc',
			page: 1
		});
	};

	return (
		<div className="min-h-[calc(100vh-60px)]">
			<div className="mx-auto max-w-6xl px-4 py-8">
				<div className="flex flex-col gap-6">
					<div>
						<h1 className="text-2xl font-bold">Economy Transactions</h1>
						<p className="mt-1 text-sm">Search and filter economy transactions across bots</p>
					</div>

					<TransactionFilters
						query={query}
						setQuery={partialQuery => {
							if ('bot' in partialQuery) {
								partialQuery.page = 1;
							}
							return setQuery(prev => deepMerge(prev, partialQuery));
						}}
						loading={loading}
						onSearch={handleSearch}
						onReset={handleReset}
					/>

					<TransactionTable
						transactions={transactions}
						loading={loading}
						total={total}
						page={query.page}
						pageSize={PAGE_SIZE}
						sortStatus={sortStatus}
						onPageChange={p => setQuery(prev => ({ ...prev, page: p }))}
						onSortStatusChange={s => {
							setSortStatus(s);
							setQuery(prev => ({ ...prev, page: 1 }));
						}}
					/>
				</div>
			</div>
		</div>
	);
}
