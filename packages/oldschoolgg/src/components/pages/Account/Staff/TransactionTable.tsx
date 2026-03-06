import { toTitleCase } from '@oldschoolgg/util';
import { type ColumnDef, flexRender, getCoreRowModel, type SortingState, useReactTable } from '@tanstack/react-table';
import { useMemo } from 'react';

import { BankImage } from '@/components/BankImage/BankImage.js';
import { UserIndentity } from '@/components/UserIdentity.js';
import { Modal } from '@/components/ui/Modal/Modal.js';
import { timeAgo } from '@/lib/utils.js';
import type { EconomyTransaction } from './types.js';

export type TransactionTableSortStatus<T> = {
	columnAccessor: keyof T | string;
	direction: 'asc' | 'desc';
};

interface TransactionTableProps {
	transactions: EconomyTransaction[];
	loading: boolean;
	total: number;
	page: number;
	pageSize: number;
	sortStatus: TransactionTableSortStatus<EconomyTransaction>;
	onPageChange: (page: number) => void;
	onSortStatusChange: (status: TransactionTableSortStatus<EconomyTransaction>) => void;
}

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

function toSortingState<T>(sortStatus: TransactionTableSortStatus<T>): SortingState {
	const id = String(sortStatus.columnAccessor);
	return [{ id, desc: sortStatus.direction === 'desc' }];
}

function fromSortingState<T>(
	sorting: SortingState,
	fallback: TransactionTableSortStatus<T>
): TransactionTableSortStatus<T> {
	const first = sorting[0];
	if (!first) return fallback;
	return { columnAccessor: first.id, direction: first.desc ? 'desc' : 'asc' };
}

export function TransactionTable({
	transactions,
	loading,
	total,
	page,
	pageSize,
	sortStatus,
	onPageChange,
	onSortStatusChange
}: TransactionTableProps) {
	const BUTTONS_CLASS =
		'rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
	const columns = useMemo<ColumnDef<EconomyTransaction>[]>(
		() => [
			{
				accessorKey: 'date',
				header: 'Date',
				cell: ({ row }) => (
					<div className="flex items-center flex-col">
						{new Date(row.original.date).toLocaleString()}
						<p className="text-xs">{timeAgo(new Date(row.original.date))}</p>
					</div>
				),
				enableSorting: true
			},
			{
				accessorKey: 'type',
				header: 'Type',
				cell: ({ row }) => {
					const t = row.original.type;
					return <span className="">{toTitleCase(t)}</span>;
				},
				enableSorting: true
			},
			{
				accessorKey: 'guild_id',
				header: 'Guild ID',
				cell: ({ row }) =>
					row.original.guild_id ? (
						<span className="font-mono text-sm">{String(row.original.guild_id)}</span>
					) : (
						<span className="text-slate-400">-</span>
					),
				enableSorting: true
			},
			{
				accessorKey: 'sender',
				header: 'Sender',
				cell: ({ row }) => {
					const userId = row.original.sender;
					return <UserIndentity userId={userId} />;
				},
				enableSorting: true
			},
			{
				accessorKey: 'recipient',
				header: 'Recipient',
				cell: ({ row }) => {
					const userId = row.original.recipient;
					return <UserIndentity userId={userId} />;
				},
				enableSorting: true
			},
			{
				accessorKey: 'items_sent',
				header: 'Items Traded',
				cell: ({ row }) => {
					const itemsSent = row.original.items_sent;
					const itemsReceived = row.original.items_received;
					return (
						<div>
							<Modal buttonText="View Items Traded" title="Items">
								<div className="flex flex-col w-full min-w-[600px] gap-8 text-center">
									{Object.keys(itemsSent).length > 0 && (
										<div className="w-full flex items-center flex-col justify-center">
											<h2 className="mb-2 text-gray-300 flex items-center gap-2">
												<UserIndentity userId={row.original.sender} /> sent these items to{' '}
												<UserIndentity userId={row.original.recipient} />
											</h2>
											<BankImage sort="name" title="" bank={itemsSent} />
										</div>
									)}
									{Object.keys(itemsReceived).length > 0 && (
										<div className="w-full flex items-center flex-col">
											<h2 className="mb-2 text-gray-300 flex items-center gap-2">
												<UserIndentity userId={row.original.recipient} /> sent these items to{' '}
												<UserIndentity userId={row.original.sender} />
											</h2>
											<BankImage sort="name" title="" bank={itemsReceived} />
										</div>
									)}
								</div>
							</Modal>
						</div>
					);
				},
				enableSorting: true
			}
		],
		[]
	);

	const sorting = useMemo(() => toSortingState(sortStatus), [sortStatus]);

	const table = useReactTable({
		data: transactions,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: { sorting },
		manualSorting: true,
		enableMultiSort: false,
		enableSortingRemoval: false,
		onSortingChange: updater => {
			const next = typeof updater === 'function' ? updater(sorting) : updater;
			onSortStatusChange(fromSortingState<EconomyTransaction>(next, sortStatus));
		}
	});

	const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
	const safePage = clamp(page, 1, totalPages);

	const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
	const endIdx = Math.min(total, safePage * pageSize);

	return (
		<div className="rounded-xl border border-[var(--color-border)] shadow-sm">
			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-0">
					<thead className="text-gray-200">
						{table.getHeaderGroups().map(hg => (
							<tr key={hg.id}>
								{hg.headers.map((header, i) => {
									const col = header.column;
									const canSort = col.getCanSort();
									const isSorted = col.getIsSorted();
									const isLast = i === hg.headers.length - 1;

									return (
										<th
											key={header.id}
											scope="col"
											className={[
												'sticky top-0 z-10 px-4 py-4 text-left text-xs font-semibold',
												'border-b border-[var(--color-border)]',
												!isLast ? 'border-r border-[var(--color-border)]' : '',
												col.id === 'date' ? 'w-50' : '',
												col.id === 'type' ? 'w-24' : ''
											].join(' ')}
										>
											<button
												type="button"
												onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
												className={[
													'inline-flex items-center gap-2',
													canSort ? 'cursor-pointer select-none' : 'cursor-default'
												].join(' ')}
												disabled={!canSort}
											>
												<span>
													{flexRender(header.column.columnDef.header, header.getContext())}
												</span>
												{canSort ? (
													<span className="text-[10px]">
														{isSorted === 'asc' ? '▲' : isSorted === 'desc' ? '▼' : '↕'}
													</span>
												) : null}
											</button>
										</th>
									);
								})}
							</tr>
						))}
					</thead>

					<tbody className="divide-y divide-slate-200">
						{loading ? (
							<tr>
								<td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
									<span className="inline-flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
										Loading…
									</span>
								</td>
							</tr>
						) : transactions.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
									No transactions found
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map(row => (
								<tr
									key={row.original.id}
									className="odd:bg-gray-900/50 bg-gray-900 hover:bg-blue-500/30"
								>
									{row.getVisibleCells().map((cell, i) => {
										const isLast = i === row.getVisibleCells().length - 1;
										return (
											<td
												key={cell.id}
												className={[
													'px-3 py-3 align-middle text-sm',
													!isLast ? 'border-r border-[var(--color-border)]' : ''
												].join(' ')}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex flex-col gap-2 border-t border-[var(--color-border)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-xs text-slate-600">
					{total === 0 ? '0' : `${startIdx}-${endIdx}`} of {total}
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						className={BUTTONS_CLASS}
						onClick={() => onPageChange(1)}
						disabled={safePage <= 1 || loading}
					>
						First
					</button>
					<button
						type="button"
						className={BUTTONS_CLASS}
						onClick={() => onPageChange(safePage - 1)}
						disabled={safePage <= 1 || loading}
					>
						Prev
					</button>

					<div className="px-1 text-xs text-slate-400">
						Page {safePage} / {totalPages}
					</div>

					<button
						type="button"
						className={BUTTONS_CLASS}
						onClick={() => onPageChange(safePage + 1)}
						disabled={safePage >= totalPages || loading}
					>
						Next
					</button>
					<button
						type="button"
						className={BUTTONS_CLASS}
						onClick={() => onPageChange(totalPages)}
						disabled={safePage >= totalPages || loading}
					>
						Last
					</button>
				</div>
			</div>
		</div>
	);
}
