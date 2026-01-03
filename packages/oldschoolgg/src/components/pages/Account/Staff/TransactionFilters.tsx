import { Button } from '@/components/ui/button.js';
import { Input } from '@/components/ui/input.js';
import { Select } from '@/components/ui/Select.js';
import type { Bot, TransactionType } from './types.js';

interface TransactionFiltersProps {
	bot: Bot;
	sender: string;
	recipient: string;
	guildId: string;
	type: TransactionType | '';
	dateFrom: Date | null;
	dateTo: Date | null;
	loading: boolean;
	onBotChange: (bot: Bot) => void;
	onSenderChange: (sender: string) => void;
	onRecipientChange: (recipient: string) => void;
	onGuildIdChange: (guildId: string) => void;
	onTypeChange: (type: TransactionType | '') => void;
	onDateFromChange: (date: Date | null) => void;
	onDateToChange: (date: Date | null) => void;
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

export function TransactionFilters({
	bot,
	sender,
	recipient,
	guildId,
	type,
	dateFrom,
	dateTo,
	loading,
	onBotChange,
	onSenderChange,
	onRecipientChange,
	onGuildIdChange,
	onTypeChange,
	onDateFromChange,
	onDateToChange,
	onSearch,
	onReset
}: TransactionFiltersProps) {
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
						value={bot}
						onChange={_t => onBotChange(_t as Bot)}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Transaction Type</div>
					<select
						className="w-full rounded-md border border-main  px-3 py-2 text-sm  shadow-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
						value={type}
						onChange={e => onTypeChange(e.currentTarget.value as TransactionType | '')}
						disabled={loading}
					>
						<option value="">All types</option>
						<option value="trade">Trade</option>
						<option value="giveaway">Giveaway</option>
						<option value="duel">Duel</option>
						<option value="gri">GRI</option>
						<option value="gift">Gift</option>
					</select>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Sender ID(s)</div>
					<Input
						placeholder="Discord ID (comma-separated)"
						value={sender}
						onChange={e => onSenderChange(e.currentTarget.value)}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Recipient ID</div>
					<Input
						placeholder="Discord ID"
						value={recipient}
						onChange={e => onRecipientChange(e.currentTarget.value)}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Guild ID</div>
					<Input
						placeholder="Discord Server ID"
						value={guildId}
						onChange={e => onGuildIdChange(e.currentTarget.value)}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Date From</div>
					<Input
						type="date"
						value={isoDateInputValue(dateFrom)}
						onChange={e => onDateFromChange(parseDateInputValue(e.currentTarget.value))}
						disabled={loading}
					/>
				</label>

				<label className="block">
					<div className="mb-1 text-sm font-medium ">Date To</div>
					<Input
						type="date"
						value={isoDateInputValue(dateTo)}
						onChange={e => onDateToChange(parseDateInputValue(e.currentTarget.value))}
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
