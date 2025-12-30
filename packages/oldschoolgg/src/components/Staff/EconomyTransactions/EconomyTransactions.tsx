import { useCallback, useEffect, useState } from 'react';

import { api } from '../../../lib/api.js';
import { StaffPage } from '../StaffPage.js';
import type {
	Bot,
	EconomyTransaction,
	EconomyTransactionsQuery,
	SortField,
	TransactionType
} from './economyTransactions.js';
import { TransactionFilters } from './TransactionFilters.js';
import { TransactionTable, type TransactionTableSortStatus } from './TransactionTable.js';

const PAGE_SIZE = 50;

export function EconomyTransactionsPage() {
	const [transactions, setTransactions] = useState<EconomyTransaction[]>([]);
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);

	const [bot, setBot] = useState<Bot>('osb');
	const [sender, setSender] = useState('');
	const [recipient, setRecipient] = useState('');
	const [guildId, setGuildId] = useState('');
	const [type, setType] = useState<TransactionType | ''>('');
	const [dateFrom, setDateFrom] = useState<Date | null>(null);
	const [dateTo, setDateTo] = useState<Date | null>(null);

	const [sortStatus, setSortStatus] = useState<TransactionTableSortStatus<EconomyTransaction>>({
		columnAccessor: 'date',
		direction: 'desc'
	});

	const loadTransactions = useCallback(async () => {
		setLoading(true);
		try {
			const query: EconomyTransactionsQuery = {
				bot,
				limit: PAGE_SIZE,
				offset: (page - 1) * PAGE_SIZE,
				sort_by: sortStatus.columnAccessor as SortField,
				sort_order: sortStatus.direction
			};

			if (sender.trim()) query.sender = sender.trim();
			if (recipient.trim()) query.recipient = recipient.trim();
			if (guildId.trim()) query.guild_id = guildId.trim();
			if (type) query.type = type;
			if (dateFrom) query.date_from = dateFrom.toISOString();
			if (dateTo) query.date_to = dateTo.toISOString();

			const response = await api.staff.fetchEconomyTransactions(query);
			setTransactions(response.data);
			setTotal(response.pagination.total);
		} catch (err) {
			console.error('Error loading economy transactions:', err);
		} finally {
			setLoading(false);
		}
	}, [bot, dateFrom, dateTo, guildId, page, recipient, sender, sortStatus, type]);

	useEffect(() => {
		void loadTransactions();
	}, [loadTransactions, page, sortStatus, bot]);

	const handleSearch = () => {
		setPage(1);
		loadTransactions();
	};

	const handleReset = () => {
		setSender('');
		setRecipient('');
		setGuildId('');
		setType('');
		setDateFrom(null);
		setDateTo(null);
		setPage(1);
	};

	return (
		<StaffPage>
			<div className="min-h-[calc(100vh-60px)] ">
				<div className="mx-auto max-w-6xl px-4 py-8">
					<div className="flex flex-col gap-6">
						<div>
							<h1 className="text-2xl font-bold ">Economy Transactions</h1>
							<p className="mt-1 text-sm ">Search and filter economy transactions across bots</p>
						</div>

						<TransactionFilters
							bot={bot}
							sender={sender}
							recipient={recipient}
							guildId={guildId}
							type={type}
							dateFrom={dateFrom}
							dateTo={dateTo}
							loading={loading}
							onBotChange={b => {
								setBot(b);
								setPage(1);
							}}
							onSenderChange={setSender}
							onRecipientChange={setRecipient}
							onGuildIdChange={setGuildId}
							onTypeChange={setType}
							onDateFromChange={setDateFrom}
							onDateToChange={setDateTo}
							onSearch={handleSearch}
							onReset={handleReset}
						/>

						<TransactionTable
							transactions={transactions}
							loading={loading}
							total={total}
							page={page}
							pageSize={PAGE_SIZE}
							sortStatus={sortStatus}
							onPageChange={setPage}
							onSortStatusChange={s => {
								setSortStatus(s);
								setPage(1);
							}}
						/>
					</div>
				</div>
			</div>
		</StaffPage>
	);
}
