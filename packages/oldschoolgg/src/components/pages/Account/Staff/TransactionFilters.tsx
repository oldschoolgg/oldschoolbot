import type { IBotType, IEconomyTransactionsQuery, IEconomyTransactionType } from '@oldschoolgg/schemas';

import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Select } from '@/components/ui/Select.js';

interface TransactionFiltersProps {
	query: IEconomyTransactionsQuery;
	loading: boolean;
	setQuery: (query: Partial<IEconomyTransactionsQuery>) => void;
	onSearch: () => void;
	onReset: () => void;
}

function isoDateInputValue(d: Date | null): string {
	if (!d) return '';
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${yyyy}-${mm}-${dd}`;
}

function parseDateInputValue(v: string): Date | null {
	if (!v) return null;
	const [y, m, d] = v.split('-').map(x => Number(x));
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function TransactionFilters({ query, setQuery, loading, onSearch, onReset }: TransactionFiltersProps) {
	return (
		<div>
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<label className="block">
					<div className="mb-1 text-sm font-medium ">Bot</div>

					<Select
						options={[
							{ label: 'OSB', value: 'osb' },
							{ label: 'BSO', value: 'bso' }
						]}
						value={query.bot}
						onChange={_t => setQuery({ bot: _t as IBotType })}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Transaction Type</div>
					<Select
						options={['All', 'Trade', 'Giveaway', 'Duel', 'GRI', 'Gift'].map(t => ({
							label: t,
							value: t === 'All' ? '' : (t.toLowerCase() as IEconomyTransactionType)
						}))}
						value={query.type || ''}
						onChange={e => setQuery({ type: e as IEconomyTransactionType })}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Sender ID(s)</div>
					<Input
						placeholder="Discord ID (comma-separated)"
						value={query.sender}
						onChange={e => setQuery({ sender: e.currentTarget.value })}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Recipient ID</div>
					<Input
						placeholder="Discord ID"
						value={query.recipient}
						onChange={e => setQuery({ recipient: e.currentTarget.value })}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Guild ID</div>
					<Input
						placeholder="Discord Server ID"
						value={query.guild_id}
						onChange={e => setQuery({ guild_id: e.currentTarget.value })}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Date From</div>
					<Input
						type="date"
						value={isoDateInputValue(query.date_from ? new Date(query.date_from) : null)}
						onChange={e =>
							setQuery({ date_from: parseDateInputValue(e.currentTarget.value)?.toISOString() })
						}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Date To</div>
					<Input
						type="date"
						value={isoDateInputValue(query.date_to ? new Date(query.date_to) : null)}
						onChange={e => setQuery({ date_to: parseDateInputValue(e.currentTarget.value)?.toISOString() })}
						disabled={loading}
					/>
				</label>
			</div>

			<div className="flex flex-wrap items-center gap-2 mt-4">
				<Button onClick={onSearch} disabled={loading}>
					{loading ? 'Searching…' : 'Search'}
				</Button>

				<Button onClick={onReset} disabled={loading}>
					Reset Filters
				</Button>
			</div>
		</div>
	);
}
